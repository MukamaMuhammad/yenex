import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Skeleton } from "@components/ui/skeleton";

// interface EnergyRequirementsProps {
//   powerRating: {
//     watts: number | "unknown";
//     volts: number | "unknown";
//     amps: number | "unknown";
//   };
// }

interface EnergyRequirementsProps {
  watts: number;
}

export default function EnergyRequirements({ watts }: EnergyRequirementsProps) {
  return (
    <Card className=" w-full px-4">
      <CardHeader>
        <CardTitle className="text-xl">Required Solar System</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Calculating energy requirements for {watts} watts...</p>
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
    <Card className=" w-full ">
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
