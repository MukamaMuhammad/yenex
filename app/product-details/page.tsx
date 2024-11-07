import React from "react";
import { UrlSearch } from "@components/url-search";

const page = () => {
  return (
    <div className="container w-full mx-auto px-4 py-8 min-h-screen flex flex-col pt-24 items-center">
      <h1 className="text-2xl md:text-4xl font-medium mb-8 text-center">
        Product{" "}
        <span className="bg-primary text-white font-semibold px-2">
          Details
        </span>{" "}
        Scraper
      </h1>
      <p className="text-center text-sm text-gray-500 mb-4">
        Enter the URLs of the products you want to scrape.
      </p>
      <UrlSearch />
    </div>
  );
};

export default page;
