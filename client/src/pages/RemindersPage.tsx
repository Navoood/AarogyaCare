import Layout from "@/components/layout/Layout";
import MedicationReminders from "@/components/reminders/MedicationReminders";
import { useLanguage } from "@/context/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, Bell, Calendar, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function RemindersPage() {
  const { t } = useLanguage();

  // Fetch appointments
  const { data: appointmentsData, isLoading: isLoadingAppointments } = useQuery({
    queryKey: ["/api/appointments"],
  });

  // Filter upcoming appointments
  const upcomingAppointments = appointmentsData?.appointments?.filter(
    (appointment: any) => appointment.status === "scheduled"
  ).slice(0, 5);

  return (
    <Layout title={t("reminders")}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Health Reminders</h1>
          <p className="text-gray-500">
            Manage your medication schedules and stay updated with appointment reminders
          </p>
        </div>

        <Tabs defaultValue="medications">
          <TabsList className="mb-4">
            <TabsTrigger value="medications">Medication Reminders</TabsTrigger>
            <TabsTrigger value="appointments">Appointment Reminders</TabsTrigger>
            <TabsTrigger value="health">Health Check Reminders</TabsTrigger>
          </TabsList>
          
          <TabsContent value="medications">
            <MedicationReminders />
          </TabsContent>
          
          <TabsContent value="appointments">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Appointments</CardTitle>
                  <CardDescription>Your scheduled medical appointments</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingAppointments ? (
                    <div className="space-y-4">
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-20 w-full" />
                    </div>
                  ) : upcomingAppointments?.length > 0 ? (
                    <div className="space-y-4">
                      {upcomingAppointments.map((appointment: any) => (
                        <div key={appointment.id} className="flex items-start border-b pb-4 last:border-b-0 last:pb-0">
                          <div className="bg-primary-100 p-2 rounded-md mr-3">
                            <Calendar className="h-4 w-4 text-primary-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">{appointment.doctor.user.fullName}</p>
                                <p className="text-sm text-gray-500">{appointment.doctor.specialization}</p>
                              </div>
                              <div className="text-sm text-primary-600 font-medium">
                                {formatDate(appointment.date)}
                              </div>
                            </div>
                            <div className="flex items-center mt-1">
                              <Clock className="h-3 w-3 text-gray-400 mr-1" />
                              <span className="text-xs text-gray-500">{appointment.time}</span>
                            </div>
                            {appointment.notes && (
                              <p className="text-xs text-gray-500 mt-1">
                                Notes: {appointment.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Bell className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">No upcoming appointments</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Appointment Notification Settings</CardTitle>
                    <CardDescription>Customize how you receive appointment reminders</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="bg-primary-100 p-2 rounded-md mr-3">
                            <Bell className="h-4 w-4 text-primary-600" />
                          </div>
                          <span>Day before reminder</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="bg-primary-100 p-2 rounded-md mr-3">
                            <Bell className="h-4 w-4 text-primary-600" />
                          </div>
                          <span>3 hours before reminder</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="bg-primary-100 p-2 rounded-md mr-3">
                            <Bell className="h-4 w-4 text-primary-600" />
                          </div>
                          <span>Email notifications</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Pre-Appointment Tips</CardTitle>
                    <CardDescription>Get the most out of your medical appointments</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <div className="bg-primary-100 text-primary-700 rounded-full p-1 mr-2 mt-0.5">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-sm">Prepare a list of your current medications</span>
                      </li>
                      <li className="flex items-start">
                        <div className="bg-primary-100 text-primary-700 rounded-full p-1 mr-2 mt-0.5">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-sm">Write down any symptoms you've been experiencing</span>
                      </li>
                      <li className="flex items-start">
                        <div className="bg-primary-100 text-primary-700 rounded-full p-1 mr-2 mt-0.5">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-sm">For video consultations, test your camera and microphone beforehand</span>
                      </li>
                      <li className="flex items-start">
                        <div className="bg-primary-100 text-primary-700 rounded-full p-1 mr-2 mt-0.5">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-sm">Find a quiet place with good internet connection for telemedicine</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="health">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Annual Check-up</CardTitle>
                  <CardDescription>Routine health examination</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Status</span>
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Due in 2 months</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Last Check-up</span>
                      <span className="text-sm">Oct 15, 2023</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Recommended</span>
                      <span className="text-sm">Once a year</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-start">
                      <Activity className="h-5 w-5 text-primary-600 mr-2" />
                      <p className="text-sm text-gray-600">
                        Regular check-ups help detect health issues early and ensure your wellbeing
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Blood Pressure Check</CardTitle>
                  <CardDescription>Regular monitoring</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Status</span>
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Overdue</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Last Check</span>
                      <span className="text-sm">Aug 3, 2023</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Recommended</span>
                      <span className="text-sm">Monthly</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-start">
                      <Activity className="h-5 w-5 text-primary-600 mr-2" />
                      <p className="text-sm text-gray-600">
                        Regular blood pressure monitoring is important for cardiovascular health
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Blood Glucose Test</CardTitle>
                  <CardDescription>Diabetes screening</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Status</span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Up to date</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Last Check</span>
                      <span className="text-sm">Nov 10, 2023</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Recommended</span>
                      <span className="text-sm">Every 3 months</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-start">
                      <Activity className="h-5 w-5 text-primary-600 mr-2" />
                      <p className="text-sm text-gray-600">
                        Regular monitoring helps manage diabetes and prevent complications
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Eye Examination</CardTitle>
                  <CardDescription>Vision and eye health</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Status</span>
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Due in 3 months</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Last Check</span>
                      <span className="text-sm">June 22, 2023</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Recommended</span>
                      <span className="text-sm">Once a year</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-start">
                      <Activity className="h-5 w-5 text-primary-600 mr-2" />
                      <p className="text-sm text-gray-600">
                        Regular eye exams can detect vision problems and eye diseases early
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Dental Check-up</CardTitle>
                  <CardDescription>Oral health examination</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Status</span>
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Overdue</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Last Check</span>
                      <span className="text-sm">March 5, 2023</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Recommended</span>
                      <span className="text-sm">Every 6 months</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-start">
                      <Activity className="h-5 w-5 text-primary-600 mr-2" />
                      <p className="text-sm text-gray-600">
                        Regular dental check-ups help maintain good oral health and prevent dental issues
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Vaccination</CardTitle>
                  <CardDescription>Immunization status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Status</span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Up to date</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Last Vaccination</span>
                      <span className="text-sm">Sep 8, 2023</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Next Due</span>
                      <span className="text-sm">Sep 2024</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-start">
                      <Activity className="h-5 w-5 text-primary-600 mr-2" />
                      <p className="text-sm text-gray-600">
                        Stay protected with timely vaccinations as per recommended schedules
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
