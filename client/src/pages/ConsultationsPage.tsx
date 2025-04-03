import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Layout from "@/components/layout/Layout";
import { useLanguage } from "@/context/LanguageContext";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Video, MessageSquare, Calendar as CalendarIcon2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { formatDate, cn } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Chat from "@/components/telemedicine/Chat";
import VideoCall from "@/components/telemedicine/VideoCall";

// Form schema for booking appointment
const appointmentSchema = z.object({
  doctorId: z.number(),
  date: z.date(),
  time: z.string(),
  type: z.string(),
  notes: z.string().optional(),
});

type AppointmentFormValues = z.infer<typeof appointmentSchema>;

export default function ConsultationsPage() {
  const { t } = useLanguage();
  const [location, navigate] = useLocation();
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(null);
  const [selectedTab, setSelectedTab] = useState("upcoming");
  const [isBookingAppointment, setIsBookingAppointment] = useState(false);
  const [isInVideoCall, setIsInVideoCall] = useState(false);
  const [videoCallDoctorId, setVideoCallDoctorId] = useState<number | null>(null);
  const [chatDoctorId, setChatDoctorId] = useState<number | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Parse URL parameters if any
  useEffect(() => {
    const params = new URLSearchParams(location.split("?")[1]);
    const appointmentDoctor = params.get("appointment");
    const chatDoctor = params.get("chat");
    const videoDoctor = params.get("video");
    
    if (appointmentDoctor) {
      setSelectedDoctorId(Number(appointmentDoctor));
      setIsBookingAppointment(true);
    }
    
    if (chatDoctor) {
      setChatDoctorId(Number(chatDoctor));
      setSelectedTab("chat");
    }

    if (videoDoctor === "true") {
      // For initial landing, default to first available doctor
      setSelectedTab("upcoming");
      // If we have doctors data, find first available doctor
      if (doctorsData?.doctors?.length > 0) {
        const availableDoctor = doctorsData.doctors.find((doc: any) => doc.isAvailable);
        if (availableDoctor) {
          startVideoCall(availableDoctor.id);
        }
      }
    }
  }, [location, doctorsData?.doctors]);

  // Fetch appointments
  const { data: appointmentsData, isLoading: isLoadingAppointments } = useQuery({
    queryKey: ["/api/appointments"],
    enabled: !!user,
  });

  // Fetch doctors for appointment booking
  const { data: doctorsData, isLoading: isLoadingDoctors } = useQuery({
    queryKey: ["/api/doctors"],
  });

  // Initialize form for booking appointment
  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      doctorId: selectedDoctorId || 0,
      date: new Date(),
      time: "10:00",
      type: "video",
      notes: "",
    },
  });

  // Update form when selectedDoctorId changes
  useEffect(() => {
    if (selectedDoctorId) {
      form.setValue("doctorId", selectedDoctorId);
    }
  }, [selectedDoctorId, form]);

  // Create appointment mutation
  const createAppointmentMutation = useMutation({
    mutationFn: async (values: AppointmentFormValues) => {
      return await apiRequest("POST", "/api/appointments", values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      toast({
        title: "Appointment booked",
        description: "Your appointment has been scheduled successfully.",
      });
      setIsBookingAppointment(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error booking appointment",
        description: String(error),
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: AppointmentFormValues) => {
    createAppointmentMutation.mutate(values);
  };

  const startVideoCall = (doctorId: number) => {
    setVideoCallDoctorId(doctorId);
    setIsInVideoCall(true);
  };

  const endVideoCall = () => {
    setIsInVideoCall(false);
    setVideoCallDoctorId(null);
  };

  const startChat = (doctorId: number) => {
    setChatDoctorId(doctorId);
    setSelectedTab("chat");
  };

  // Filter appointments
  const upcomingAppointments = appointmentsData?.appointments?.filter(
    (appointment: any) => appointment.status === "scheduled"
  );
  
  const pastAppointments = appointmentsData?.appointments?.filter(
    (appointment: any) => appointment.status !== "scheduled"
  );

  return (
    <Layout title={t("consultations")}>
      {isInVideoCall ? (
        <div className="h-[calc(100vh-180px)]">
          <VideoCall doctorId={videoCallDoctorId || undefined} onEndCall={endVideoCall} />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Consultations</h1>
              <p className="text-gray-500">Manage your telemedicine appointments and chats</p>
            </div>
            
            <Dialog open={isBookingAppointment} onOpenChange={setIsBookingAppointment}>
              <DialogTrigger asChild>
                <Button>Book New Appointment</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Book an Appointment</DialogTitle>
                  <DialogDescription>
                    Select a doctor, date, and time for your telemedicine consultation.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="doctorId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Doctor</FormLabel>
                          <Select 
                            onValueChange={(value) => field.onChange(parseInt(value))} 
                            defaultValue={field.value.toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a doctor" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {isLoadingDoctors ? (
                                <div className="p-2">Loading doctors...</div>
                              ) : doctorsData?.doctors ? (
                                doctorsData.doctors.map((doctor: any) => (
                                  <SelectItem 
                                    key={doctor.id} 
                                    value={doctor.id.toString()}
                                    disabled={!doctor.isAvailable}
                                  >
                                    {doctor.user.fullName} ({doctor.specialization})
                                    {!doctor.isAvailable && " - Unavailable"}
                                  </SelectItem>
                                ))
                              ) : (
                                <div className="p-2">No doctors available</div>
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      formatDate(field.value)
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  initialFocus
                                  disabled={(date) => date < new Date()}
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="time"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Time</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Consultation Type</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="video">Video Call</SelectItem>
                              <SelectItem value="chat">Chat</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Brief description of your issue"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsBookingAppointment(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createAppointmentMutation.isPending}>
                        {createAppointmentMutation.isPending ? "Booking..." : "Book Appointment"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="past">Past Consultations</TabsTrigger>
              <TabsTrigger value="chat">Chat</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upcoming">
              {isLoadingAppointments ? (
                <div className="space-y-4">
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-32 w-full" />
                </div>
              ) : upcomingAppointments?.length > 0 ? (
                <div className="space-y-4">
                  {upcomingAppointments.map((appointment: any) => (
                    <Card key={appointment.id}>
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-start space-x-4">
                            <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                              <span className="text-primary-700 font-medium">
                                {appointment.doctor.user.fullName.split(' ').map((n: string) => n[0]).join('')}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-medium">{appointment.doctor.user.fullName}</h3>
                              <p className="text-sm text-gray-500">{appointment.doctor.specialization}</p>
                              <div className="flex items-center mt-1">
                                <CalendarIcon2 className="h-4 w-4 text-gray-400 mr-1" />
                                <span className="text-sm text-primary-600">
                                  {formatDate(appointment.date)} at {appointment.time}
                                </span>
                              </div>
                              {appointment.notes && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Notes: {appointment.notes}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-2">
                            {appointment.type === "video" ? (
                              <Button 
                                onClick={() => startVideoCall(appointment.doctor.userId)}
                                className="flex items-center"
                              >
                                <Video className="mr-2 h-4 w-4" />
                                Start Video Call
                              </Button>
                            ) : (
                              <Button 
                                onClick={() => startChat(appointment.doctor.userId)}
                                className="flex items-center"
                              >
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Start Chat
                              </Button>
                            )}
                            <Button variant="outline">Reschedule</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 border rounded-lg border-dashed">
                  <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                    <CalendarIcon2 className="h-12 w-12 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium">No upcoming appointments</h3>
                  <p className="text-gray-500 max-w-md mx-auto mt-2">
                    You don't have any scheduled consultations. Book an appointment to get started.
                  </p>
                  <Button 
                    onClick={() => setIsBookingAppointment(true)} 
                    className="mt-4"
                  >
                    Book Appointment
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="past">
              {isLoadingAppointments ? (
                <div className="space-y-4">
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-32 w-full" />
                </div>
              ) : pastAppointments?.length > 0 ? (
                <div className="space-y-4">
                  {pastAppointments.map((appointment: any) => (
                    <Card key={appointment.id}>
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-start space-x-4">
                            <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                              <span className="text-gray-700 font-medium">
                                {appointment.doctor.user.fullName.split(' ').map((n: string) => n[0]).join('')}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-medium">{appointment.doctor.user.fullName}</h3>
                              <p className="text-sm text-gray-500">{appointment.doctor.specialization}</p>
                              <div className="flex items-center mt-1">
                                <CalendarIcon2 className="h-4 w-4 text-gray-400 mr-1" />
                                <span className="text-sm text-gray-600">
                                  {formatDate(appointment.date)} at {appointment.time}
                                </span>
                              </div>
                              <div className="mt-1">
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  appointment.status === "completed" 
                                    ? "bg-green-100 text-green-800" 
                                    : "bg-red-100 text-red-800"
                                }`}>
                                  {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setIsBookingAppointment(true)}>
                              Book Again
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 border rounded-lg border-dashed">
                  <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                    <CalendarIcon2 className="h-12 w-12 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium">No past consultations</h3>
                  <p className="text-gray-500 max-w-md mx-auto mt-2">
                    You haven't had any consultations yet. Book your first appointment.
                  </p>
                  <Button 
                    onClick={() => setIsBookingAppointment(true)} 
                    className="mt-4"
                  >
                    Book Appointment
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="chat">
              <Card className="h-[600px] flex flex-col">
                {chatDoctorId ? (
                  <Chat receiverId={chatDoctorId} />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full">
                    <MessageSquare className="h-12 w-12 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium">No active chat</h3>
                    <p className="text-gray-500 text-center max-w-md mt-2">
                      Select a doctor to start chatting or book an appointment for a consultation.
                    </p>
                    <Button 
                      onClick={() => setIsBookingAppointment(true)} 
                      className="mt-4"
                    >
                      Book Appointment
                    </Button>
                  </div>
                )}
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </Layout>
  );
}
