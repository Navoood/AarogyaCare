import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Shield, ZapIcon } from "lucide-react";
import { Link } from "wouter";

export default function GovernmentSchemes() {
  const { data: schemesData, isLoading } = useQuery({
    queryKey: ["/api/health-schemes"],
  });

  return (
    <div>
      <h3 className="text-lg font-medium text-slate-900 mb-4">Government Healthcare Programs</h3>
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {schemesData?.schemes?.slice(0, 2).map((scheme: any) => (
            <Card key={scheme.id} className="overflow-hidden">
              <div className="p-6 flex space-x-4">
                <div className="bg-primary-100 h-12 w-12 rounded-lg flex items-center justify-center flex-shrink-0">
                  {scheme.name.includes("Ayushman") ? (
                    <Shield className="h-6 w-6 text-primary-600" />
                  ) : (
                    <ZapIcon className="h-6 w-6 text-primary-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium mb-1">{scheme.name}</h4>
                  <p className="text-sm text-slate-500 mb-3">{scheme.description}</p>
                  <div className="flex items-center space-x-4 text-xs">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                      {scheme.status.charAt(0).toUpperCase() + scheme.status.slice(1)}
                    </span>
                    <span>{scheme.coverageAmount ? `Covers up to ${scheme.coverageAmount}` : "Coverage varies"}</span>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                <Button variant="outline" size="sm">
                  Check Eligibility
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
      
      <div className="mt-4 text-center">
        <Button variant="outline" size="sm" asChild>
          <Link href="/government-schemes">View All Government Schemes</Link>
        </Button>
      </div>
    </div>
  );
}
