"use client";

import { useState } from "react";
import { experimental_useObject as useObject } from "ai/react";
import { ProductInfoSchema } from "@/components/scraper/schemas";
import ProductInfo, {
  ProductInfoSkeleton,
} from "@/components/scraper/ProductInfo";
import type { ProductInfo as ProductInfoType } from "@/components/scraper/schemas";
import UrlForm from "@/components/scraper/UrlForm";
import EnergyRequirements, {
  EnergyRequirementsSkeleton,
} from "@/components/scraper/EnergyRequirements";
import { scrapeUrls } from "./actions";

export default function ScraperPage() {
  const [urls, setUrls] = useState<string[]>([]);
  const [results, setResults] = useState<ProductInfoType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (submittedUrls: string[]) => {
    setUrls(submittedUrls);
    setIsLoading(true);
    setError(null);
    setResults([]);

    try {
      const results = await scrapeUrls(submittedUrls);
      console.log("results", results);
      setResults(results);
    } catch (err) {
      setError(
        "An error occurred while processing the URLs. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen flex flex-col pt-24 items-center">
      <h1 className="text-2xl md:text-4xl font-medium mb-8 text-center">
        Product{" "}
        <span className="bg-primary text-white font-semibold px-2">Energy</span>{" "}
        Calculator
      </h1>
      <p className="text-center text-sm text-gray-500 mb-4">
        Enter the URLs of the products you want to analyze.
      </p>
      <UrlForm onSubmit={handleSubmit} isLoading={isLoading} />
      {error && <div className="text-red-500 mt-4 text-center">{error}</div>}
      {isLoading
        ? urls.map((_, index) => (
            <div key={index} className="w-full md:w-[60%] mb-6">
              <ProductInfoSkeleton isLoading={isLoading} />
              <EnergyRequirementsSkeleton isLoading={isLoading} />
            </div>
          ))
        : results.map((result, index) => (
            <div key={index} className="w-full md:w-[60%] mb-6">
              <ProductInfo info={result} />
              {result && <EnergyRequirements watts={result.watts} />}
            </div>
          ))}
    </div>
  );
}
