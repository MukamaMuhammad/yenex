import { NextRequest } from "next/server";
import { openai } from "@ai-sdk/openai";
import { streamObject } from "ai";
import { ProductInfoSchema } from "@/components/scraper/schemas";
import chromium from "@sparticuz/chromium-min";
import puppeteer from "puppeteer-core";
import axios from "axios";
// import * as cheerio from "cheerio";

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
      () => new Promise((resolve) => setTimeout(resolve, 5000))
    );

    const content = await page.content();
    await browser.close();
    console.log("Content length:", content.length);

    const result = await streamObject({
      model: openai("gpt-4o-mini"),
      schema: ProductInfoSchema,
      prompt: `
        Analyze the following HTML content from a product page and extract the product name and power rating (in watts).
        If the power rating is not explicitly stated, make an educated guess based on similar products.
        HTML Content:
        ${content}

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
