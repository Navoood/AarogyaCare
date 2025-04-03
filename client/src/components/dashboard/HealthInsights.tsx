import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Zap, BookOpen, CalendarClock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";

const symptomCheckSchema = z.object({
  symptoms: z.string().min(3, { message: "Please describe your symptoms" }),
  duration: z.string().min(1, { message: "Please select a duration" }),
});

type SymptomCheckFormValues = z.infer<typeof symptomCheckSchema>;

export default function HealthInsights() {
  const { toast } = useToast();
  
  const form = useForm<SymptomCheckFormValues>({
    resolver: zodResolver(symptomCheckSchema),
    defaultValues: {
      symptoms: "",
      duration: "",
    },
  });

  const { data: recommendationsData } = useQuery({
    queryKey: ["/api/health-metrics"],
  });

  // Simulated personalized recommendations based on user data
  const recommendations = [
    {
      id: 1,
      title: "Increase daily water intake",
      description: "Your recent health data shows signs of mild dehydration",
      icon: <Zap className="h-4 w-4" />,
    },
    {
      id: 2,
      title: "Try low-impact workouts",
      description: "Good for your joint health and cardiovascular system",
      icon: <BookOpen className="h-4 w-4" />,
    },
    {
      id: 3,
      title: "Schedule cholesterol screening",
      description: "It's been 12+ months since your last test",
      icon: <CalendarClock className="h-4 w-4" />,
    },
  ];

  const onSubmit = (data: SymptomCheckFormValues) => {
    toast({
      title: "Symptoms Checked",
      description: "Redirecting to detailed symptom analysis.",
    });
    // In a real app, we would route to symptom checker page with these values
    window.location.href = `/symptom-checker?symptoms=${encodeURIComponent(data.symptoms)}&duration=${encodeURIComponent(data.duration)}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Symptom Checker Card */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Symptom Check</CardTitle>
          <CardDescription>Tell us how you're feeling</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              id="symptom-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="symptoms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-slate-700">I've been experiencing</FormLabel>
                    <FormControl>
                      <Input placeholder="E.g. Headache, cough, fever..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-slate-700">Duration</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="less_than_day">Less than a day</SelectItem>
                        <SelectItem value="1_2_days">1-2 days</SelectItem>
                        <SelectItem value="3_7_days">3-7 days</SelectItem>
                        <SelectItem value="more_than_week">More than a week</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            form="symptom-form"
            className="w-full"
          >
            Check Symptoms
          </Button>
        </CardFooter>
      </Card>

      {/* Health Recommendations Card */}
      <Card>
        <CardHeader>
          <CardTitle>Personalized Recommendations</CardTitle>
          <CardDescription>Based on your health profile</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {recommendations.map((rec) => (
              <li key={rec.id} className="flex items-start space-x-3">
                <div className="bg-primary-100 text-primary-700 rounded-md p-1.5 mt-0.5">
                  {rec.icon}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{rec.title}</p>
                  <p className="text-xs text-slate-500">{rec.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full" asChild>
            <Link href="/analytics">View All Recommendations</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
