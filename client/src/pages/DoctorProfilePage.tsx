import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, MapPin, Building, Star, RefreshCw, ArrowLeft, Phone, Mail, FileText, Award } from "lucide-react";
import { getInitials } from "@/lib/utils";

export default function DoctorProfilePage() {
  const [_, params] = useRoute("/doctor/:id");
  const doctorId = params?.id ? parseInt(params.id) : undefined;
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: doctorData, isLoading } = useQuery({
    queryKey: ["/api/doctors", doctorId],
    queryFn: async () => {
      if (!doctorId) return null;
      const response = await fetch(`/api/doctors/${doctorId}`);
      if (!response.ok) throw new Error("Failed to fetch doctor profile");
      return response.json();
    },
    refetchInterval: 10000, // Refresh every 10 seconds
    enabled: !!doctorId,
  });

  // Function to manually refresh doctor availability data
  const refreshDoctor = () => {
    if (!doctorId) return;
    
    setIsRefreshing(true);
    queryClient.invalidateQueries({ queryKey: ["/api/doctors", doctorId] })
      .then(() => {
        setTimeout(() => setIsRefreshing(false), 500); // Short timeout for UI feedback
      });
  };

  // Automatically refresh every 10 seconds
  useEffect(() => {
    if (!doctorId) return;
    
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ["/api/doctors", doctorId] });
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, [queryClient, doctorId]);

  const doctor = doctorData?.doctor;

  if (!doctorId) {
    return (
      <Layout title="Doctor Not Found">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-red-600">Invalid Doctor ID</h1>
          <p className="mt-4">The requested doctor profile could not be found.</p>
          <Button className="mt-6" variant="outline" asChild>
            <Link href="/doctors">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Doctors List
            </Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Doctor Profile">
      <div className="mb-4">
        <Button variant="outline" asChild className="mb-6">
          <Link href="/doctors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Doctors
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <Card>
          <CardHeader className="flex flex-row items-start space-x-4">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-1/4" />
            </div>
            <Skeleton className="h-8 w-28" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </CardContent>
        </Card>
      ) : doctor ? (
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-start space-x-6 md:space-x-8">
              <div className="h-24 w-24 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-primary-700 text-2xl font-bold">
                  {getInitials(doctor.user.fullName)}
                </span>
              </div>

              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <h1 className="text-2xl font-bold">{doctor.user.fullName}</h1>
                    <p className="text-gray-600">{doctor.specialization}</p>
                    <div className="flex items-center mt-1">
                      <Star className="h-4 w-4 text-yellow-400 mr-1" />
                      <span className="text-gray-700">
                        {(doctor.rating / 10).toFixed(1)} ({doctor.reviewCount}+ reviews)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`${
                        doctor.isAvailable
                          ? "bg-success/10 text-success hover:bg-success/10"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {doctor.isAvailable ? "Available Now" : "Currently Unavailable"}
                    </Badge>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={refreshDoctor}
                      disabled={isRefreshing}
                      className={isRefreshing ? "animate-spin" : ""}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4">
                  <div className="flex items-center">
                    <Building className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-800">{doctor.hospital}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-800">{doctor.location || "Delhi"}</span>
                  </div>
                  <div className="flex items-center">
                    <Award className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-800">{doctor.qualification}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-800">{doctor.experience}+ Years Experience</span>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-2">
              <div className="mt-4 bg-gray-50 p-4 rounded">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">Consultation Fee</h3>
                  <p className="font-bold text-lg">₹{doctor.consultationFee}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                  <Button variant="outline" asChild>
                    <Link href={`/consultations?chat=${doctor.userId}`}>
                      Message
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href={`/consultations?video=${doctor.userId}`}>
                      Video Call
                    </Link>
                  </Button>
                  <Button
                    variant="default"
                    disabled={!doctor.isAvailable}
                    asChild
                  >
                    <Link href={`/consultations?appointment=${doctor.id}`}>
                      Book Appointment
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="about">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>
            <TabsContent value="about" className="p-4 border rounded-md mt-2">
              <h3 className="font-semibold text-lg mb-2">About Dr. {doctor.user.fullName.split(' ')[0]}</h3>
              <p className="text-gray-700 leading-relaxed">
                Dr. {doctor.user.fullName} is a {doctor.specialization} with over {doctor.experience} years 
                of experience. {doctor.qualification && `They hold a ${doctor.qualification} degree.`} They
                currently practice at {doctor.hospital} in {doctor.location || "Delhi"}.
              </p>
              <h4 className="font-semibold mt-4 mb-2">Contact Information</h4>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Phone className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-800">{doctor.user.phone || "Not available"}</span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-800">{doctor.user.email}</span>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="schedule" className="p-4 border rounded-md mt-2">
              <h3 className="font-semibold text-lg mb-2">Schedule &amp; Availability</h3>
              <p className="text-gray-700 mb-4">
                Below are the typical working hours for Dr. {doctor.user.fullName.split(' ')[0]}.
                Please note that availability may change and it's recommended to book an appointment.
              </p>
              <div className="space-y-2">
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span className="font-medium">Monday - Friday</span>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-gray-400 mr-2" />
                    <span>10:00 AM - 7:00 PM</span>
                  </div>
                </div>
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span className="font-medium">Saturday</span>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-gray-400 mr-2" />
                    <span>10:00 AM - 5:00 PM</span>
                  </div>
                </div>
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span className="font-medium">Sunday</span>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-gray-400 mr-2" />
                    <span>Closed</span>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <p className="text-sm text-gray-500">
                  <span className="font-medium">Current Status: </span>
                  <span className={doctor.isAvailable ? "text-success" : "text-gray-700"}>
                    {doctor.isAvailable ? "Available for consultations" : "Currently unavailable"}
                  </span>
                </p>
              </div>
            </TabsContent>
            <TabsContent value="reviews" className="p-4 border rounded-md mt-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">Patient Reviews</h3>
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-400 mr-1" />
                  <span className="font-bold text-lg">{(doctor.rating / 10).toFixed(1)}</span>
                  <span className="text-gray-500 ml-1">({doctor.reviewCount})</span>
                </div>
              </div>
              
              <div className="space-y-4">
                {/* We could replace this with actual reviews if available */}
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border-b pb-3">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">Patient {i}</span>
                      <div className="flex">
                        {Array(5).fill(0).map((_, idx) => (
                          <Star 
                            key={idx} 
                            className={`h-4 w-4 ${idx < 5-(i*0.5) ? "text-yellow-400" : "text-gray-200"}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm">
                      {i === 1 && "Very knowledgeable doctor. Takes time to understand the issue and explains the treatment well."}
                      {i === 2 && "Good experience but had to wait a bit longer than expected for my turn."}
                      {i === 3 && "Excellent doctor! Very patient and thorough in their examination."}
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      {i === 1 && "3 weeks ago"}
                      {i === 2 && "2 months ago"}
                      {i === 3 && "5 months ago"}
                    </p>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        <div className="text-center p-8 border rounded-lg">
          <h2 className="text-xl font-semibold">Doctor Not Found</h2>
          <p className="mt-2 text-gray-600">
            The doctor profile you are looking for does not exist or has been removed.
          </p>
          <Button className="mt-6" variant="outline" asChild>
            <Link href="/doctors">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Doctors List
            </Link>
          </Button>
        </div>
      )}
    </Layout>
  );
}