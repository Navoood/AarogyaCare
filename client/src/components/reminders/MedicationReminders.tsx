import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/context/AuthContext";
import { CalendarIcon, PlusCircle, Pill, Clock, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Form schema for adding medication
const medicationSchema = z.object({
  name: z.string().min(1, { message: "Medication name is required" }),
  dosage: z.string().min(1, { message: "Dosage is required" }),
  frequency: z.string().min(1, { message: "Frequency is required" }),
  time: z.array(z.string()).min(1, { message: "At least one time is required" }),
  startDate: z.date({ required_error: "Start date is required" }),
  endDate: z.date().optional().nullable(),
  notes: z.string().optional(),
});

type MedicationFormValues = z.infer<typeof medicationSchema>;

export default function MedicationReminders() {
  const [isAddingMedication, setIsAddingMedication] = useState(false);
  const [times, setTimes] = useState<string[]>(["08:00"]);
  const [newTime, setNewTime] = useState("08:00");
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch medications
  const { data: medicationsData, isLoading } = useQuery({
    queryKey: ["/api/medications"],
    enabled: !!user,
  });

  // Form for adding new medication
  const form = useForm<MedicationFormValues>({
    resolver: zodResolver(medicationSchema),
    defaultValues: {
      name: "",
      dosage: "",
      frequency: "daily",
      time: ["08:00"],
      startDate: new Date(),
      endDate: null,
      notes: "",
    },
  });

  // Add time to the times array
  const addTime = () => {
    if (newTime && !times.includes(newTime)) {
      const newTimes = [...times, newTime];
      setTimes(newTimes);
      form.setValue("time", newTimes);
    }
  };

  // Remove time from the times array
  const removeTime = (timeToRemove: string) => {
    const newTimes = times.filter((t) => t !== timeToRemove);
    setTimes(newTimes);
    form.setValue("time", newTimes);
  };

  // Add medication mutation
  const addMedicationMutation = useMutation({
    mutationFn: async (values: MedicationFormValues) => {
      return await apiRequest("POST", "/api/medications", values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/medications"] });
      toast({
        title: "Medication added",
        description: "Your medication reminder has been set up.",
      });
      setIsAddingMedication(false);
      form.reset();
      setTimes(["08:00"]);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: String(error),
        variant: "destructive",
      });
    },
  });

  // Delete medication mutation
  const deleteMedicationMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/medications/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/medications"] });
      toast({
        title: "Medication deleted",
        description: "The medication reminder has been removed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: String(error),
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: MedicationFormValues) => {
    addMedicationMutation.mutate(values);
  };

  const handleDeleteMedication = (id: number) => {
    if (confirm("Are you sure you want to delete this medication reminder?")) {
      deleteMedicationMutation.mutate(id);
    }
  };

  // Get today's medications
  const todayMedications = medicationsData?.medications?.filter((med: any) => {
    const today = new Date().toISOString().split("T")[0];
    const startDate = new Date(med.startDate).toISOString().split("T")[0];
    const endDate = med.endDate
      ? new Date(med.endDate).toISOString().split("T")[0]
      : null;

    return startDate <= today && (!endDate || endDate >= today);
  });

  // Get upcoming medications (not started yet)
  const upcomingMedications = medicationsData?.medications?.filter((med: any) => {
    const today = new Date().toISOString().split("T")[0];
    const startDate = new Date(med.startDate).toISOString().split("T")[0];

    return startDate > today;
  });

  // Get all medications
  const allMedications = medicationsData?.medications || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Medication Reminders</h3>
        <Dialog open={isAddingMedication} onOpenChange={setIsAddingMedication}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Medication
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Medication</DialogTitle>
              <DialogDescription>
                Set up reminders for your medications. You'll receive notifications at the specified times.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Medication Name</FormLabel>
                        <FormControl>
                          <Input placeholder="E.g., Lisinopril" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dosage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dosage</FormLabel>
                        <FormControl>
                          <Input placeholder="E.g., 10mg" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="frequency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Frequency</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="twice_daily">Twice Daily</SelectItem>
                            <SelectItem value="three_times_daily">Three Times Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="as_needed">As Needed</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div>
                    <FormField
                      control={form.control}
                      name="time"
                      render={() => (
                        <FormItem>
                          <FormLabel>Time</FormLabel>
                          <div className="flex">
                            <Input
                              type="time"
                              value={newTime}
                              onChange={(e) => setNewTime(e.target.value)}
                              className="flex-1"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={addTime}
                              className="ml-2"
                            >
                              Add
                            </Button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex flex-wrap gap-2 mt-2">
                      {times.map((time) => (
                        <Badge key={time} variant="secondary" className="flex items-center gap-1">
                          {time}
                          <button
                            type="button"
                            onClick={() => removeTime(time)}
                            className="ml-1 h-3 w-3 rounded-full hover:bg-gray-200 inline-flex items-center justify-center"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Start Date</FormLabel>
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
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>End Date (Optional)</FormLabel>
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
                                  <span>No end date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value || undefined}
                              onSelect={field.onChange}
                              initialFocus
                              disabled={(date) => date < form.getValues().startDate}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="E.g., Take with food"
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
                    onClick={() => setIsAddingMedication(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={addMedicationMutation.isPending}>
                    {addMedicationMutation.isPending ? "Adding..." : "Add Medication"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Today's Medications */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Today</CardTitle>
            <CardDescription>Medications for today</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : todayMedications?.length > 0 ? (
              <ul className="space-y-3">
                {todayMedications.map((med: any) => (
                  <li key={med.id} className="flex items-center justify-between border-b pb-3">
                    <div className="flex items-start space-x-3">
                      <div className="bg-primary-100 p-2 rounded-md">
                        <Pill className="h-4 w-4 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{med.name} {med.dosage}</p>
                        <div className="flex items-center mt-1">
                          <Clock className="h-3 w-3 text-gray-400 mr-1" />
                          <p className="text-xs text-gray-500">{med.time.join(", ")}</p>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteMedication(med.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <Pill className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                <p>No medications for today</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Medications */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Upcoming</CardTitle>
            <CardDescription>Medications starting soon</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : upcomingMedications?.length > 0 ? (
              <ul className="space-y-3">
                {upcomingMedications.map((med: any) => (
                  <li key={med.id} className="flex items-center justify-between border-b pb-3">
                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-100 p-2 rounded-md">
                        <CalendarIcon className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{med.name} {med.dosage}</p>
                        <div className="flex items-center mt-1">
                          <p className="text-xs text-gray-500">Starts: {formatDate(med.startDate)}</p>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteMedication(med.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <CalendarIcon className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                <p>No upcoming medications</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* All Medications */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>All Medications</CardTitle>
            <CardDescription>Your complete medication list</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : allMedications.length > 0 ? (
              <ul className="space-y-3">
                {allMedications.map((med: any) => (
                  <li key={med.id} className="flex items-center justify-between border-b pb-3">
                    <div className="flex items-start space-x-3">
                      <div className="bg-gray-100 p-2 rounded-md">
                        <Pill className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{med.name} {med.dosage}</p>
                        <p className="text-xs text-gray-500">{med.frequency}, {med.time.join(", ")}</p>
                        {med.notes && (
                          <p className="text-xs text-gray-400 mt-1">{med.notes}</p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteMedication(med.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <Pill className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                <p>No medications added yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
