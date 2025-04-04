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

interface Doctor {
  id: number;
  userId: number;
  specialization: string;
  experience: number;
  hospital: string;
  qualification: string;
  location: string;
  isAvailable: boolean;
  rating: number;
  reviewCount: number;
  consultationFee: number;
  user: {
    id: number;
    fullName: string;
    email: string;
    username: string;
    role: string;
    phone: string;
    address: string;
  };
}

interface DoctorsResponse {
  doctors: Doctor[];
}

type DoctorsListProps = {
  homepageMode?: boolean;
};

export default function DoctorsList({ homepageMode = false }: DoctorsListProps) {
  const [selectedSpecialization, setSelectedSpecialization] = useState<Specialization>("All");
  const queryClient = useQueryClient();

  // Fetch available doctors (limited to top 5)
  const { 
    data: doctorsData, 
    isLoading, 
    isError, 
    error,
    refetch
  } = useQuery<DoctorsResponse | undefined>({
    queryKey: ["/api/doctors/available"],
    refetchInterval: 10000, // Refresh every 10 seconds
    retry: 3, // Retry 3 times on failure
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000), // Exponential backoff
  });

  // Handle errors with retry
  useEffect(() => {
    if (isError) {
      console.error("Error fetching doctors:", error);
      // Attempt to seed the database if we suspect it's empty
      fetch("/api/seed")
        .then(response => {
          if (response.ok) {
            console.log("Database seeded successfully");
            // Wait a moment for the seeding to complete before refetching
            setTimeout(() => {
              refetch();
            }, 1000);
          }
        })
        .catch(err => {
          console.error("Error seeding database:", err);
        });
    }
  }, [isError, error, refetch]);

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
      ) : isError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 my-4 text-center">
          <div className="flex flex-col items-center space-y-4">
            <RefreshCw className="h-8 w-8 text-red-500 animate-spin" />
            <div>
              <h4 className="text-lg font-medium text-red-700">Loading Doctor Information</h4>
              <p className="text-sm text-red-600 mt-1">
                We're preparing the doctor data for you. This may take a moment...
              </p>
              <Button 
                className="mt-4" 
                variant="outline" 
                onClick={() => {
                  fetch("/api/seed")
                    .then(() => refetch())
                    .catch(err => console.error("Error reloading doctors:", err));
                }}
              >
                Retry Loading
              </Button>
            </div>
          </div>
        </div>
      ) : (!doctorsData?.doctors || doctorsData.doctors.length === 0) ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 my-4 text-center">
          <div className="flex flex-col items-center space-y-4">
            <RefreshCw className="h-8 w-8 text-amber-500 animate-spin" />
            <div>
              <h4 className="text-lg font-medium text-amber-700">Initializing Doctor Information</h4>
              <p className="text-sm text-amber-600 mt-1">
                We're setting up the doctor database for you. This should only happen once.
              </p>
              <Button 
                className="mt-4" 
                variant="outline" 
                onClick={() => {
                  fetch("/api/seed")
                    .then(() => refetch())
                    .catch(err => console.error("Error loading doctors:", err));
                }}
              >
                Load Doctors
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Check if filtered results are empty */}
          {selectedSpecialization !== "All" && 
            (doctorsData?.doctors || []).filter(
              (doctor: Doctor) => doctor.specialization === selectedSpecialization
            ).length === 0 && (
            <div className="rounded-lg border border-primary-100 bg-primary-50 p-4 my-4 text-center">
              <p className="text-sm text-primary-700">
                No {selectedSpecialization} doctors are available. Try selecting a different specialization.
              </p>
              <Button 
                className="mt-2" 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedSpecialization("All")}
              >
                Show All Doctors
              </Button>
            </div>
          )}
          
          <div className={`grid grid-cols-1 ${homepageMode ? "md:grid-cols-2 xl:grid-cols-5" : "md:grid-cols-2 lg:grid-cols-3"} gap-4`}>
            {(doctorsData?.doctors || [])
              .filter((doctor: Doctor) => 
                selectedSpecialization === "All" || doctor.specialization === selectedSpecialization
              )
              .slice(0, homepageMode ? 5 : 3)
              .map((doctor: Doctor) => (
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
        </>
      )}
    </div>
  );
}
