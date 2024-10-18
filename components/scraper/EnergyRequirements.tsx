import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Skeleton } from "@components/ui/skeleton";

interface EnergyRequirementsProps {
  powerRating: number;
}

export default function EnergyRequirements({
  powerRating,
}: EnergyRequirementsProps) {
  // This is a placeholder. You'll need to implement the actual calculations
  // or API call to get the energy requirements.
  return (
    <Card className="md:w-[60%] w-full px-4">
      <CardHeader>
        <CardTitle>Required Solar System</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Calculating energy requirements for {powerRating} watts...</p>
      </CardContent>
    </Card>
  );
}

interface EnergyRequirementsSkeletonProps {
  isLoading: boolean;
}

export function EnergyRequirementsSkeleton({
  isLoading,
}: EnergyRequirementsSkeletonProps) {
  if (!isLoading) return null;

  return (
    <Card className="md:w-[60%] w-full px-4">
      <CardHeader>
        <CardTitle>
          <Skeleton className="h-6 w-1/2" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      </CardContent>
    </Card>
  );
}