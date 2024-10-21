import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Skeleton } from "@components/ui/skeleton";
import type { ProductInfo } from "./schemas";

interface ProductInfoProps {
  info: ProductInfo;
}

export default function ProductInfo({ info }: ProductInfoProps) {
  return (
    <Card className="mb-6 w-full ">
      <CardHeader>
        <CardTitle className="text-xl">Product Information</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-1">
          <strong>Name:</strong> {info.productName}
        </p>
        <p className="mb-1">
          <strong>Watts:</strong> {info.powerRating.watts}{" "}
          {info.powerRating.watts !== "unknown" && "watts"}
        </p>
        <p className="mb-1">
          <strong>Volts:</strong> {info.powerRating.volts}{" "}
          {info.powerRating.volts !== "unknown" && "volts"}
        </p>
        <p className="mb-1">
          <strong>Amps:</strong> {info.powerRating.amps}{" "}
          {info.powerRating.amps !== "unknown" && "amps"}
        </p>
        <p className="mb-1">
          <strong>URL:</strong>{" "}
          <a
            href={info.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline break-words"
          >
            {info.url.length > 50
              ? `${info.url.substring(0, 50)}...`
              : info.url}
          </a>
        </p>
      </CardContent>
    </Card>
  );
}

interface ProductInfoSkeletonProps {
  isLoading: boolean;
}

export function ProductInfoSkeleton({ isLoading }: ProductInfoSkeletonProps) {
  if (!isLoading) return null;

  return (
    <Card className="mb-6 w-full ">
      <CardHeader>
        <CardTitle>
          <Skeleton className="h-6 w-48" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-8" />
          <Skeleton className="h-4 w-48" />
        </div>
      </CardContent>
    </Card>
  );
}
