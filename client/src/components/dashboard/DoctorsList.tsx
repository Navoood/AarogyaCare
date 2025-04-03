import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/lib/utils";
import { Building, Calendar, Star, MapPin, RefreshCw, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";

type Specialization = "All" | "Cardiologist" | "Neurologist" | "Pediatrics" | "Orthopedic" | "General Medicine";

type DoctorsListProps = {
  homepageMode?: boolean;
};

export default function DoctorsList({ homepageMode = false }: DoctorsListProps) {
  const [selectedSpecialization, setSelectedSpecialization] = useState<Specialization>("All");
  const queryClient = useQueryClient();

  // Fetch available doctors (limited to top 5)
  const { data: doctorsData, isLoading } = useQuery({
    queryKey: ["/api/doctors/available"],
    refetchInterval: 10000 // Refresh every 10 seconds
  });

  // Automatically refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ["/api/doctors/available"] });
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, [queryClient]);

  const specializations: Specialization[] = [
    "All",
    "Cardiologist",
    "Neurologist",
    "Pediatrics",
    "Orthopedic",
    "General Medicine",
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`${homepageMode ? "text-xl" : "text-lg"} font-medium text-slate-900`}>
          {homepageMode ? "Top Available Doctors" : "Available Doctors"}
        </h3>
        <Link href="/doctors" className="text-sm text-primary-600 hover:underline flex items-center">
          View All
          {homepageMode && <ArrowRight className="h-4 w-4 ml-1" />}
        </Link>
      </div>

      {/* Filter Options - Only show if not in homepage mode */}
      {!homepageMode && (
        <div className="flex flex-wrap gap-2 mb-4">
          {specializations.map((specialization) => (
            <Button
              key={specialization}
              variant={selectedSpecialization === specialization ? "secondary" : "outline"}
              size="sm"
              className={
                selectedSpecialization === specialization
                  ? "bg-primary-50 text-primary-600 hover:bg-primary-100"
                  : ""
              }
              onClick={() => setSelectedSpecialization(specialization)}
            >
              {specialization}
            </Button>
          ))}
        </div>
      )}

      {/* Doctors List */}
      {isLoading ? (
        <div className={`grid grid-cols-1 ${homepageMode ? "md:grid-cols-2 xl:grid-cols-5" : "md:grid-cols-2 lg:grid-cols-3"} gap-4`}>
          {[1, 2, 3, 4, 5].slice(0, homepageMode ? 5 : 3).map((i) => (
            <Card key={i} className={homepageMode ? "h-full" : ""}>
              <CardHeader className="flex flex-row items-start space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-6 w-20 ml-auto" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  {!homepageMode && <Skeleton className="h-4 w-full" />}
                </div>
              </CardContent>
              <CardFooter className="justify-between">
                {homepageMode ? (
                  <Skeleton className="h-9 w-full" />
                ) : (
                  <>
                    <Skeleton className="h-9 w-16" />
                    <Skeleton className="h-9 w-36" />
                  </>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className={`grid grid-cols-1 ${homepageMode ? "md:grid-cols-2 xl:grid-cols-5" : "md:grid-cols-2 lg:grid-cols-3"} gap-4`}>
          {doctorsData?.doctors
            ?.filter((doctor: any) => 
              selectedSpecialization === "All" || doctor.specialization === selectedSpecialization
            )
            ?.slice(0, homepageMode ? 5 : 3)
            .map((doctor: any) => (
              <Card key={doctor.id} className={homepageMode ? "h-full" : ""}>
                <CardHeader className="flex flex-row items-start space-x-4">
                  <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-primary-700 font-medium">
                      {getInitials(doctor.user.fullName)}
                    </span>
                  </div>
                  <div>
                    <Link href={`/doctor/${doctor.id}`}>
                      <h4 className="font-medium text-primary-700 hover:underline">{doctor.user.fullName}</h4>
                    </Link>
                    <p className="text-sm text-slate-500">{doctor.specialization}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`ml-auto ${
                      doctor.isAvailable
                        ? "bg-success/10 text-success hover:bg-success/10"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {doctor.isAvailable ? "Available" : "Away"}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <Building className="h-4 w-4 text-slate-400 mr-2" />
                      <span>{doctor.hospital}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-slate-400 mr-2" />
                      <span>{doctor.location || "Delhi"}</span>
                    </div>
                    {!homepageMode && (
                      <>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-slate-400 mr-2" />
                          <span>{doctor.experience}+ Years Experience</span>
                        </div>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-slate-400 mr-2" />
                          <span>
                            {(doctor.rating / 10).toFixed(1)} ({doctor.reviewCount}+ reviews)
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="justify-between">
                  {homepageMode ? (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      asChild
                    >
                      <Link href={`/doctor/${doctor.id}`}>View Profile</Link>
                    </Button>
                  ) : (
                    <>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/consultations?chat=${doctor.userId}`}>Chat</Link>
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        disabled={!doctor.isAvailable}
                        asChild
                      >
                        <Link href={`/consultations?appointment=${doctor.id}`}>
                          Book Appointment
                        </Link>
                      </Button>
                    </>
                  )}
                </CardFooter>
              </Card>
            ))}
        </div>
      )}
    </div>
  );
}
