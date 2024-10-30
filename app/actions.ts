"use server";

interface ScrapeResult {
  // Add your result type here based on ProductInfoType
  productName: string;
  watts: number;
  volts: number;
  amps: number;
  url: string;
  // ... other fields
}

export async function scrapeUrls(urls: string[]): Promise<ScrapeResult[]> {
  const promises = urls.map((url) =>
    fetch(`${process.env.SCRAPER_API_URL}/api/scrape`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": process.env.SCRAPER_API_KEY || "",
      },
      body: JSON.stringify({ url }),
    }).then((res) => res.json())
  );

  return Promise.all(promises);
}
