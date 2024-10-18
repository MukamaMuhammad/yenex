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

export default function ScraperPage() {
  const [url, setUrl] = useState("");

  const dummyProductInfo: ProductInfoType = {
    productName: "Dummy Product",
    powerRating: 100,
    url: "https://example.com/dummy-product",
  };

  const {
    object: productInfo,
    error,
    isLoading,
    submit,
  } = useObject({
    api: "/api/scrape",
    schema: ProductInfoSchema,
  });

  const handleSubmit = (submittedUrl: string) => {
    setUrl(submittedUrl);
    submit({ url: submittedUrl });
  };

  return (
    <div className="container mx-auto px-4 py-8 h-[90vh] flex flex-col pt-32 items-center">
      <h1 className="text-2xl md:text-4xl font-medium mb-8 text-center">
        Product{" "}
        <span className="bg-primary text-white font-semibold px-2">Energy</span>{" "}
        Calculator
      </h1>
      <UrlForm onSubmit={handleSubmit} isLoading={isLoading} />
      {error && (
        <div className="text-red-500 mt-4 text-center">
          An error occurred. Please try again.
        </div>
      )}
      {isLoading ? (
        <>
          <ProductInfoSkeleton isLoading={isLoading} />
          <EnergyRequirementsSkeleton isLoading={isLoading} />
        </>
      ) : productInfo ? (
        <>
          <ProductInfo info={productInfo as ProductInfoType} />
          {productInfo.powerRating && (
            <EnergyRequirements powerRating={productInfo.powerRating} />
          )}
        </>
      ) : null}
    </div>
  );
}
