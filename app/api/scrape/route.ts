import { NextRequest } from "next/server";
import { openai } from "@ai-sdk/openai";
import { streamObject } from "ai";
import { ProductInfoSchema } from "@/components/scraper/schemas";
import chromium from "@sparticuz/chromium-min";
import puppeteer from "puppeteer-core";
import { JSDOM } from "jsdom";
import type { ConstructorOptions } from "jsdom";

// Types and Interfaces
interface PowerRating {
  watts: number | null;
  volts: number | null;
  amps: number | null;
  rawText: PowerTextContext[];
}

interface PowerTextContext {
  context: string;
  original: string;
}

interface PowerElement {
  text: string;
  originalText: string;
  element: Element;
}

export const maxDuration = 60;
export async function POST(req: NextRequest) {
  const { url } = await req.json();
  const isLocal = !!process.env.CHROME_EXECUTABLE_PATH;

  try {
    // Launch puppeteer
    const browser = await puppeteer.launch({
      args: isLocal ? puppeteer.defaultArgs() : chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath:
        process.env.CHROME_EXECUTABLE_PATH ||
        (await chromium.executablePath(
          "https://lolentistorage.blob.core.windows.net/chromium/chromium-v130.0.0-pack.tar"
        )),
      headless: chromium.headless,
    });

    const page = await browser.newPage();

    // Set some additional page properties to avoid detection
    await page.setExtraHTTPHeaders({
      "Accept-Language": "en-US,en;q=0.9",
    });

    await page.setViewport({
      width: 1920,
      height: 1080,
    });

    // Increase the navigation timeout to 60 seconds
    // await page.goto(url, { waitUntil: "networkidle0", timeout: 60000 });
    await page.goto(url, { timeout: 60000 });

    // Add a delay after navigation to allow for any dynamic content to load
    await page.evaluate(
      () => new Promise((resolve) => setTimeout(resolve, 3000))
    );

    const content = await page.content();
    await browser.close();
    console.log("content length", content.length);

    // Use JSDOM for more advanced DOM manipulation
    let dom;
    try {
      dom = new JSDOM(content);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("Could not parse CSS stylesheet")
      ) {
        console.warn(
          "CSS parsing error encountered, continuing without styles:",
          error.message
        );
        dom = new JSDOM(content, {
          features: { css: false },
        } as ConstructorOptions);
      } else {
        throw error;
      }
    }
    const document = dom.window.document;

    // Remove unnecessary elements
    const elementsToRemove = [
      "script",
      "style",
      "noscript",
      "iframe",
      "img",
      "video",
      "audio",
      "svg",
      "canvas",
      "map",
      "figure",
      "input",
      "textarea",
      "select",
      "button",
      "form",
      "footer",
      "nav",
      "aside",
    ];
    elementsToRemove.forEach((tag) => {
      document.querySelectorAll(tag).forEach((el) => el.remove());
    });

    // Remove comments
    const removeComments = (node: Node) => {
      for (let i = node.childNodes.length - 1; i >= 0; i--) {
        const child = node.childNodes[i];
        if (child.nodeType === 8) {
          node.removeChild(child);
        } else if (child.nodeType === 1) {
          removeComments(child);
        }
      }
    };
    removeComments(document.body);

    // Remove all attributes except 'class'
    document.querySelectorAll("*").forEach((el) => {
      Array.from(el.attributes).forEach((attr) => {
        if (attr.name !== "class") {
          el.removeAttribute(attr.name);
        }
      });
    });

    // Remove empty elements
    const removeEmptyElements = (node: Node) => {
      for (let i = node.childNodes.length - 1; i >= 0; i--) {
        const child = node.childNodes[i];
        if (child.nodeType === 1) {
          removeEmptyElements(child);
          if (
            (child as Element).innerHTML.trim() === "" &&
            !["br", "hr"].includes((child as Element).tagName.toLowerCase())
          ) {
            node.removeChild(child);
          }
        }
      }
    };
    removeEmptyElements(document.body);

    // Find elements containing power-related terms
    const powerTerms: string[] = [
      "watts",
      "w",
      "kwh",
      "kwhr",
      "kwhrs",
      "watt",
      "volt",
      "volts",
      "v",
      "amp",
      "amps",
      "a",
      "mA",
    ];
    const powerElements: PowerElement[] = [];

    // Function to get nth parent element
    const getNthParent = (
      element: Element | null,
      n: number
    ): Element | null => {
      let parent: Element | null = element;
      for (let i = 0; i < n && parent; i++) {
        parent = parent.parentElement;
      }
      return parent;
    };

    // Function to extract text from an element and its children
    const extractText = (element: Element | null): string => {
      return element
        ? element.textContent?.trim().replace(/\s+/g, " ") || ""
        : "";
    };

    // Function to check if there's a number near the power term
    const hasNumberNearTerm = (text: string, term: string): boolean => {
      // Look for numbers within 10 characters before or after the term
      const windowSize = 30;
      const termIndex = text.toLowerCase().indexOf(term);
      if (termIndex === -1) return false;

      const start = Math.max(0, termIndex - windowSize);
      const end = Math.min(text.length, termIndex + term.length + windowSize);
      const textWindow = text.slice(start, end);

      // Regular expression to match numbers (including decimals)
      const numberPattern = /\d+(?:\.\d+)?/;
      return numberPattern.test(textWindow);
    };

    // Function to validate power-related content
    const isValidPowerContent = (text: string): boolean => {
      const lowercaseText = text.toLowerCase();
      return powerTerms.some((term) => {
        const hasTerm = lowercaseText.includes(term);
        return hasTerm && hasNumberNearTerm(lowercaseText, term);
      });
    };

    // Search through all text nodes
    const walker = document.createTreeWalker(
      document.body,
      dom.window.NodeFilter.SHOW_TEXT
    );

    let node: Node | null = walker.currentNode;
    while ((node = walker.nextNode())) {
      const text = node.textContent || "";

      // Check if the text contains any power-related terms with nearby numbers
      if (isValidPowerContent(text)) {
        const parentElement = node.parentElement;
        if (parentElement) {
          const fifthParent = getNthParent(parentElement, 5);
          if (fifthParent) {
            const contextText = extractText(fifthParent);
            // Double-check the full context still contains valid power information
            if (isValidPowerContent(contextText)) {
              powerElements.push({
                text: contextText,
                originalText: text.trim(),
                element: fifthParent,
              });
            }
          }
        }
      }
    }

    // If no power ratings found, return an empty response instead of null
    if (powerElements.length === 0) {
      return new Response(JSON.stringify({ error: "No power ratings found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Remove duplicates based on text content
    const uniquePowerElements = powerElements.filter(
      (element, index, self) =>
        index === self.findIndex((e) => e.text === element.text)
    );
    console.log("uniquePowerElements", uniquePowerElements);
    const uniquePowerElementsText = uniquePowerElements
      .map((e) => e.text)
      .join("\n");
    console.log("Cleaned content length:", uniquePowerElementsText.length);

    const result = await streamObject({
      model: openai("gpt-4o-mini"),
      schema: ProductInfoSchema,
      prompt: `
        Analyze the following HTML text content from a product page and extract the product name and power rating information (watts, volts, amps). Please read all power ratings in the provided text (e.g. kwh, kwhr, kwhrs,v, kv, a, amps, kamps etc.) before converting them to watts, volts, and amps accordingly.
        If the power ratings are not explicitly stated, make an educated guess based on similar products
        HTML text Content:
        ${uniquePowerElementsText}

        Provide the result in the following format:
        {
        "productName": "Name of the product",
        "powerRating": {
          "watts": Power rating in watts,
          "volts": Power rating in volts,
          "amps": Power rating in amps
        },
        "url": "${url}"
      }
      `,
    });
    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Error scraping page:", error);
    return new Response(
      JSON.stringify({ error: "Failed to scrape page", details: error }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
