import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Star } from "lucide-react";
import Image from "next/image";

interface ProductInfo {
  name: string;
  description: string;
  image: {
    url: string;
    alt: string;
  } | null;
  ratings: number;
  reviews: {
    rating: number;
    comment: string;
    author: string;
  }[];
  whereToBuy: {
    retailer: string;
    country: string;
    price: string;
    url: string;
  }[];
  specifications: {
    label: string;
    value: string;
  }[];
  faqs: {
    question: string;
    answer: string;
  }[];
}

interface ProductDisplayProps {
  productInfo: ProductInfo;
}

export function ProductDisplay({ productInfo }: ProductDisplayProps) {
  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 p-4">
      {/* Product Header */}
      <Card>
        <CardHeader>
          <CardTitle>{productInfo.name}</CardTitle>
          {productInfo.image && (
            <div className="relative aspect-square w-full max-w-md mx-auto mt-4">
              <Image
                src={productInfo.image.url}
                alt={productInfo.image.alt || productInfo.name}
                fill
                className="object-contain rounded-md"
                sizes="(max-width: 768px) 100vw, 400px"
                priority
              />
            </div>
          )}
          <CardDescription className="mt-4">
            {productInfo.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${
                  i < productInfo.ratings
                    ? "fill-primary text-primary"
                    : "fill-muted text-muted"
                }`}
              />
            ))}
            <span className="text-sm text-muted-foreground">
              ({productInfo.ratings} out of 5)
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Specifications */}
      <Card>
        <CardHeader>
          <CardTitle>Specifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {productInfo.specifications.map((spec, index) => (
              <div key={index} className="flex flex-col">
                <span className="text-sm font-medium text-muted-foreground">
                  {spec.label}
                </span>
                <span className="text-base">{spec.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Where to Buy */}
      <Card>
        <CardHeader>
          <CardTitle>Where to Buy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {productInfo.whereToBuy.map((retailer, index) => (
              <div
                key={index}
                className="flex items-center justify-between border-b last:border-0 pb-2"
              >
                <span className="font-medium">{retailer.retailer}</span>
                <span className="text-primary font-bold">
                  {retailer.country}
                </span>
                <span className="text-primary font-bold">{retailer.price}</span>
                <a
                  href={retailer.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Visit Store
                </a>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reviews */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {productInfo.reviews.map((review, index) => (
              <div key={index} className="border-b last:border-0 pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating
                            ? "fill-primary text-primary"
                            : "fill-muted text-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium">{review.author}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {review.comment}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* FAQs */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {productInfo.faqs.map((faq, index) => (
              <AccordionItem key={index} value={`faq-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
