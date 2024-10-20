import { NextRequest } from "next/server";
import { openai } from "@ai-sdk/openai";
import { streamObject } from "ai";
import { ProductInfoSchema } from "@/components/scraper/schemas";
import chromium from "@sparticuz/chromium-min";
import puppeteer from "puppeteer-core";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const { url } = await req.json();
  const isLocal = !!process.env.CHROME_EXECUTABLE_PATH;

  try {
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
    await page.setExtraHTTPHeaders({ "Accept-Language": "en-US,en;q=0.9" });
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto(url, { waitUntil: "networkidle0", timeout: 60000 });

    const powerInfo: {
      watts: number | null;
      volts: number | null;
      amps: number | null;
    } = { watts: null, volts: null, amps: null };
    const powerRegex = /(\d+(?:\.\d+)?)\s*(W|Watts?|V|Volts?|A|Amps?)/gi;

    // Extract text using Puppeteer
    const text = await page.evaluate(() => document.body.innerText);
    console.log("Extracted text:", text);
    console.log("Extracted text length:", text.length);

    let match: RegExpExecArray | null;
    while ((match = powerRegex.exec(text)) !== null) {
      const value = parseFloat(match[1]);
      const unit = match[2].toLowerCase();

      if (unit.startsWith("w")) powerInfo.watts = value;
      else if (unit.startsWith("v")) powerInfo.volts = value;
      else if (unit.startsWith("a")) powerInfo.amps = value;
    }

    if (!powerInfo.watts && powerInfo.volts && powerInfo.amps) {
      powerInfo.watts = powerInfo.volts * powerInfo.amps;
    }

    await browser.close();

    console.log("Extracted power info:", powerInfo);

    const result = await streamObject({
      model: openai("gpt-4o-mini"),
      schema: ProductInfoSchema,
      prompt: `
        Analyze the following power information extracted from a product page:
        ${JSON.stringify(powerInfo)}

        Product URL: ${url}

        Based on this information, provide the product name and power rating.
        If the power rating in watts is not available, make an educated guess based on the available information.

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
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
