"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search } from "lucide-react";
import { ProductDisplay } from "@/components/product-display";

interface ProductInfo {
  name: string;
  description: string;
  ratings: number;
  image: {
    url: string;
    alt: string;
  } | null;
  reviews: Array<{
    rating: number;
    comment: string;
    author: string;
  }>;
  whereToBuy: Array<{
    retailer: string;
    country: string;
    price: string;
    url: string;
  }>;
  specifications: Array<{
    value: string;
    label: string;
  }>;
  faqs: Array<{
    question: string;
    answer: string;
  }>;
}

export function UrlSearch() {
  const [url, setUrl] = useState("");
  const [searching, setSearching] = useState(false);
  const [productInfo, setProductInfo] = useState<ProductInfo | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearching(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SCRAPER_API_URL}/api/product-scraper`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": process.env.NEXT_PUBLIC_SCRAPER_API_KEY || "", // If you're using API key auth
          },
          body: JSON.stringify({ url }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setProductInfo(result);
    } catch (error) {
      console.error("Error fetching product info:", error);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full md:w-[60%]">
      <div className="w-full max-w-3xl px-4 pt-10">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-4 mb-8"
        >
          <Input
            type="url"
            placeholder="Enter Product URL to search"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-grow text-lg py-6"
            disabled={searching}
          />
          <Button
            type="submit"
            size="lg"
            className="w-full sm:w-auto"
            disabled={searching}
          >
            {searching ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="mr-2 h-5 w-5" />
                Search
              </>
            )}
          </Button>
        </form>
      </div>

      {productInfo && <ProductDisplay productInfo={productInfo} />}
    </div>
  );
}
