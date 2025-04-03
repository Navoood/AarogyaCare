import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { calculateHealthScore } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatTime } from "@/lib/utils";
import { Clock, Calendar, Check } from "lucide-react";

export default function HealthSummary() {
  const { user } = useAuth();

  // Health metrics query
  const { data: healthMetricsData, isLoading: isLoadingMetrics } = useQuery({
    queryKey: ["/api/health-metrics"],
    enabled: !!user,
  });

  // Appointments query
  const { data: appointmentsData, isLoading: isLoadingAppointments } = useQuery({
    queryKey: ["/api/appointments"],
    enabled: !!user,
  });

  // Medications query
  const { data: medicationsData, isLoading: isLoadingMedications } = useQuery({
    queryKey: ["/api/medications"],
    enabled: !!user,
  });

  // Calculate health score based on metrics
  const healthScore = calculateHealthScore(healthMetricsData?.metrics || []);
  
  // Get upcoming appointment (first one that's scheduled)
  const upcomingAppointment = appointmentsData?.appointments?.find(
    (appointment: any) => appointment.status === "scheduled"
  );

  // Get today's medications
  const todayMedications = medicationsData?.medications
    ?.filter((medication: any) => {
      const today = new Date().toISOString().split("T")[0];
      const startDate = new Date(medication.startDate).toISOString().split("T")[0];
      const endDate = medication.endDate 
        ? new Date(medication.endDate).toISOString().split("T")[0] 
        : null;
      
      return startDate <= today && (!endDate || endDate >= today);
    })
    .slice(0, 3); // Limit to 3 items

  // Health score color based on value
  const getHealthScoreColor = (score: number) => {
    if (score >= 85) return "text-success";
    if (score >= 70) return "text-primary-600";
    if (score >= 50) return "text-warning";
    return "text-danger";
  };

  // Health score label based on value
  const getHealthScoreLabel = (score: number) => {
    if (score >= 85) return "Excellent";
    if (score >= 70) return "Good";
    if (score >= 50) return "Fair";
    return "Poor";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Health Score Card */}
      <Card>
        <CardHeader>
          <CardTitle>Health Score</CardTitle>
          <CardDescription>Based on your latest check-up</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center">
          {isLoadingMetrics ? (
            <Skeleton className="h-32 w-32 rounded-full" />
          ) : (
            <div className="relative h-32 w-32">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-4xl font-bold ${getHealthScoreColor(healthScore)}`}>
                  {healthScore}
                </span>
              </div>
              <svg className="h-full w-full" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#eee"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#0891b2"
                  strokeWidth="3"
                  strokeDasharray={`${healthScore}, 100`}
                />
              </svg>
            </div>
          )}
        </CardContent>
        <CardFooter className="justify-center">
          <span className={`text-sm font-medium ${getHealthScoreColor(healthScore)}`}>
            {getHealthScoreLabel(healthScore)}
          </span>
        </CardFooter>
      </Card>

      {/* Upcoming Appointments */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Appointment</CardTitle>
          <CardDescription>Your next scheduled visit</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingAppointments ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : upcomingAppointment ? (
            <div className="flex items-start space-x-4">
              <div className="bg-primary-100 text-primary-700 rounded-md p-2">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-sm">
                  {upcomingAppointment.doctor?.user?.fullName || "Doctor"}
                </p>
                <p className="text-slate-500 text-xs">
                  {upcomingAppointment.doctor?.specialization || "Specialist"}
                </p>
                <p className="text-primary-600 text-sm mt-2">
                  {formatDate(upcomingAppointment.date)}, {formatTime(upcomingAppointment.time)}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-20 text-center">
              <p className="text-sm text-slate-500">No upcoming appointments</p>
              <Button variant="link" size="sm" className="mt-1">
                Book an appointment
              </Button>
            </div>
          )}
        </CardContent>
        {upcomingAppointment && (
          <CardFooter>
            <Button variant="outline" size="sm" className="w-full">
              Reschedule
            </Button>
          </CardFooter>
        )}
      </Card>

      {/* Medication Reminder */}
      <Card>
        <CardHeader>
          <CardTitle>Medication Reminder</CardTitle>
          <CardDescription>Today's schedule</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingMedications ? (
            <div className="space-y-2">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </div>
          ) : todayMedications && todayMedications.length > 0 ? (
            <ul className="space-y-3">
              {todayMedications.map((medication: any) => (
                <li key={medication.id} className="flex items-center justify-between text-sm border-b pb-2">
                  <div className="flex items-center">
                    <span className="h-2 w-2 rounded-full bg-primary-500 mr-2"></span>
                    <span>
                      {medication.name} {medication.dosage}
                    </span>
                  </div>
                  <span className="text-slate-500">
                    {medication.time[0]}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center h-20 text-center">
              <p className="text-sm text-slate-500">No medications for today</p>
              <Button variant="link" size="sm" className="mt-1">
                Add medication
              </Button>
            </div>
          )}
        </CardContent>
        {todayMedications && todayMedications.length > 0 && (
          <CardFooter>
            <Button variant="outline" size="sm" className="w-full">
              View All
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
