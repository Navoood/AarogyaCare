import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getInitials } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import { Link } from "wouter";
import { Building, Calendar, Star, Search, Filter } from "lucide-react";

type Specialization = "All" | "Cardiologist" | "Neurologist" | "Pediatrics" | "Orthopedic" | "General Medicine";
type Availability = "all" | "available" | "unavailable";

export default function DoctorsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState<Specialization>("All");
  const [availability, setAvailability] = useState<Availability>("all");
  const { t } = useLanguage();

  const specializations: Specialization[] = [
    "All",
    "Cardiologist",
    "Neurologist",
    "Pediatrics",
    "Orthopedic",
    "General Medicine",
  ];

  // Fetch doctors
  const { data: doctorsData, isLoading } = useQuery({
    queryKey: ["/api/doctors", selectedSpecialization !== "All" ? selectedSpecialization : undefined],
  });

  // Filter doctors based on search and availability
  const filteredDoctors = doctorsData?.doctors?.filter((doctor: any) => {
    const matchesSearch = 
      doctor.user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.hospital.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesAvailability = 
      availability === "all" ||
      (availability === "available" && doctor.isAvailable) ||
      (availability === "unavailable" && !doctor.isAvailable);
    
    return matchesSearch && matchesAvailability;
  });

  return (
    <Layout title={t("doctors")}>
      <div className="space-y-6">
        {/* Search and filters */}
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-y-0 md:space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, specialty, or hospital..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex space-x-2">
            <div className="relative">
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span>Availability</span>
              </Button>
              <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-md shadow-lg z-10 border overflow-hidden">
                <div 
                  className={`px-4 py-2 cursor-pointer hover:bg-gray-50 ${availability === 'all' ? 'bg-primary-50 text-primary-600' : ''}`}
                  onClick={() => setAvailability('all')}
                >
                  All
                </div>
                <div 
                  className={`px-4 py-2 cursor-pointer hover:bg-gray-50 ${availability === 'available' ? 'bg-primary-50 text-primary-600' : ''}`}
                  onClick={() => setAvailability('available')}
                >
                  Available Now
                </div>
                <div 
                  className={`px-4 py-2 cursor-pointer hover:bg-gray-50 ${availability === 'unavailable' ? 'bg-primary-50 text-primary-600' : ''}`}
                  onClick={() => setAvailability('unavailable')}
                >
                  Unavailable
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Specializations filter */}
        <div className="flex flex-wrap gap-2">
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

        {/* Doctors grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
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
                    <Skeleton className="h-4 w-full" />
                  </div>
                </CardContent>
                <CardFooter className="justify-between">
                  <Skeleton className="h-9 w-16" />
                  <Skeleton className="h-9 w-36" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : filteredDoctors?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doctor: any) => (
              <Card key={doctor.id}>
                <CardHeader className="flex flex-row items-start space-x-4">
                  <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-primary-700 font-medium">
                      {getInitials(doctor.user.fullName)}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium">{doctor.user.fullName}</h4>
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
                      <Calendar className="h-4 w-4 text-slate-400 mr-2" />
                      <span>{doctor.experience}+ Years Experience</span>
                    </div>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-slate-400 mr-2" />
                      <span>
                        {(doctor.rating / 10).toFixed(1)} ({doctor.reviewCount}+ reviews)
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Consultation Fee: ₹{doctor.consultationFee}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="justify-between">
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
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center p-8 border rounded-lg border-dashed">
            <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
              <User className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium">No doctors found</h3>
            <p className="text-gray-500 max-w-md mx-auto mt-2">
              {searchQuery 
                ? `No doctors match your search "${searchQuery}"`
                : selectedSpecialization !== "All"
                ? `No ${selectedSpecialization} doctors available`
                : "No doctors are available at the moment"}
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}

// Need to define User icon as it's not imported
function User(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
