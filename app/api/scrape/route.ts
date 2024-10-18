import { NextRequest } from "next/server";
import { openai } from "@ai-sdk/openai";
import { streamObject } from "ai";
import { ProductInfoSchema } from "@/components/scraper/schemas";
import chromium from "@sparticuz/chromium-min";
import puppeteer from "puppeteer-core";
import { JSDOM } from "jsdom";

export const maxDuration = 60; // Allow up to 60 seconds for the API route

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
    await page.goto(url, { waitUntil: "networkidle0", timeout: 60000 });

    // Add a delay after navigation to allow for any dynamic content to load
    await page.evaluate(
      () => new Promise((resolve) => setTimeout(resolve, 3000))
    );

    const content = await page.content();
    await browser.close();
    console.log("content length", content.length);
    // Use JSDOM for more advanced DOM manipulation
    const dom = new JSDOM(content);
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
      document.querySelectorAll(tag).forEach((el: Element) => el.remove());
    });

    // Remove comments
    const removeComments = (node: any) => {
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
    document.querySelectorAll("*").forEach((el: Element) => {
      Array.from(el.attributes).forEach((attr) => {
        if (attr.name !== "class") {
          el.removeAttribute(attr.name);
        }
      });
    });

    // Remove empty elements
    const removeEmptyElements = (node: any) => {
      for (let i = node.childNodes.length - 1; i >= 0; i--) {
        const child = node.childNodes[i];
        if (child.nodeType === 1) {
          removeEmptyElements(child);
          if (
            child.innerHTML.trim() === "" &&
            !["br", "hr"].includes(child.tagName.toLowerCase())
          ) {
            child.parentNode.removeChild(child);
          }
        }
      }
    };
    removeEmptyElements(document.body);

    // Convert to plain text, keeping only relevant content
    const plainText = document.body.textContent || "";
    // const cleanedContent = plainText.replace(/\s+/g, " ").trim().slice(0, 4000); // Limit to 4000 characters

    console.log("Cleaned content length:", plainText.length);

    const result = await streamObject({
      model: openai("gpt-4o-mini"),
      schema: ProductInfoSchema,
      prompt: `
        Analyze the following HTML content from a product page and extract the product name and power rating (in watts).
        If the power rating is not explicitly stated, make an educated guess based on similar products.
        HTML Content:
        ${plainText}

        Provide the result in the following format:
        {
          "productName": "Name of the product",
          "powerRating": Power rating in watts (as a number),
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
  } finally {
    // if (browser) {
    //   await browser.close();
    // }
  }
}
