import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Skeleton } from "@components/ui/skeleton";
import type { ProductInfo } from "./schemas";

interface ProductInfoProps {
  info: ProductInfo;
}

export default function ProductInfo({ info }: ProductInfoProps) {
  return (
    <Card className="mb-6 md:w-[60%] w-full px-4">
      <CardHeader>
        <CardTitle>Product Information</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-1">
          <strong>Name:</strong> {info.productName}
        </p>
        <p className="mb-1">
          <strong>Power Rating:</strong> {info.powerRating} watts
        </p>
        <p className="mb-1">
          <strong>URL:</strong>{" "}
          <a
            href={info.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
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
    <Card className="mb-6 md:w-[60%] w-full px-4">
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
