import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#0891b2", "#06b6d4", "#22d3ee", "#67e8f9"];

export default function HealthAnalytics() {
  const [timeRange, setTimeRange] = useState("month");
  const [metricType, setMetricType] = useState("all");
  const { user } = useAuth();

  // Fetch health metrics
  const { data: metricsData, isLoading } = useQuery({
    queryKey: ["/api/health-metrics", metricType],
    enabled: !!user,
  });

  // Process data for charts
  const processDataForCharts = () => {
    if (!metricsData?.metrics) return { lineData: [], pieData: [], barData: [] };

    const allMetrics = metricsData.metrics;
    
    // Filter by time range
    const now = new Date();
    const filteredMetrics = allMetrics.filter((metric: any) => {
      const metricDate = new Date(metric.timestamp);
      if (timeRange === "week") {
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        return metricDate >= weekAgo;
      } else if (timeRange === "month") {
        const monthAgo = new Date(now);
        monthAgo.setMonth(now.getMonth() - 1);
        return metricDate >= monthAgo;
      } else if (timeRange === "year") {
        const yearAgo = new Date(now);
        yearAgo.setFullYear(now.getFullYear() - 1);
        return metricDate >= yearAgo;
      }
      return true;
    });

    // Prepare data for line chart (time series)
    const lineData = filteredMetrics.map((metric: any) => ({
      date: new Date(metric.timestamp).toLocaleDateString(),
      [metric.type]: parseFloat(metric.value),
    }));

    // Count metrics by type for pie chart
    const metricCounts: Record<string, number> = {};
    filteredMetrics.forEach((metric: any) => {
      metricCounts[metric.type] = (metricCounts[metric.type] || 0) + 1;
    });
    
    const pieData = Object.entries(metricCounts).map(([name, value]) => ({
      name,
      value,
    }));

    // Prepare data for bar chart (average by type)
    const metricSums: Record<string, number> = {};
    const metricCounts2: Record<string, number> = {};
    
    filteredMetrics.forEach((metric: any) => {
      if (!isNaN(parseFloat(metric.value))) {
        metricSums[metric.type] = (metricSums[metric.type] || 0) + parseFloat(metric.value);
        metricCounts2[metric.type] = (metricCounts2[metric.type] || 0) + 1;
      }
    });
    
    const barData = Object.entries(metricSums).map(([type, sum]) => ({
      type,
      average: sum / metricCounts2[type],
    }));

    return { lineData, pieData, barData };
  };

  const { lineData, pieData, barData } = processDataForCharts();

  // Get human-readable metric names
  const getMetricName = (type: string) => {
    const names: Record<string, string> = {
      weight: "Weight",
      blood_pressure: "Blood Pressure",
      glucose: "Blood Glucose",
      heart_rate: "Heart Rate",
      temperature: "Temperature",
      oxygen: "Oxygen Saturation",
      steps: "Steps",
      sleep: "Sleep Hours",
      water: "Water Intake",
    };
    return names[type] || type;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Health Analytics</h2>
          <p className="text-muted-foreground">Track and visualize your health metrics over time</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={metricType} onValueChange={setMetricType}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Metric Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Metrics</SelectItem>
              <SelectItem value="weight">Weight</SelectItem>
              <SelectItem value="blood_pressure">Blood Pressure</SelectItem>
              <SelectItem value="glucose">Blood Glucose</SelectItem>
              <SelectItem value="heart_rate">Heart Rate</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="trends">
        <TabsList className="mb-4">
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="averages">Averages</TabsTrigger>
        </TabsList>
        
        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Health Metrics Trends</CardTitle>
              <CardDescription>
                How your health metrics have changed over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[350px] w-full" />
              ) : lineData.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart
                    data={lineData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {Object.keys(lineData[0] || {})
                      .filter(key => key !== 'date')
                      .map((key, index) => (
                        <Line
                          key={key}
                          type="monotone"
                          dataKey={key}
                          stroke={COLORS[index % COLORS.length]}
                          name={getMetricName(key)}
                          activeDot={{ r: 8 }}
                        />
                      ))}
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-500">No health metrics data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution">
          <Card>
            <CardHeader>
              <CardTitle>Health Metrics Distribution</CardTitle>
              <CardDescription>
                Distribution of your recorded health metrics by type
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[350px] w-full" />
              ) : pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${getMetricName(name)} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {pieData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} records`, 'Count']} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-500">No health metrics data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="averages">
          <Card>
            <CardHeader>
              <CardTitle>Average Metrics Values</CardTitle>
              <CardDescription>
                Average values of your health metrics by type
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[350px] w-full" />
              ) : barData.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart
                    data={barData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" tickFormatter={getMetricName} />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value}`, 'Average']} labelFormatter={getMetricName} />
                    <Legend />
                    <Bar dataKey="average" name="Average Value" fill="#0891b2" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-500">No health metrics data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Health Score</CardTitle>
            <CardDescription>Your overall health score based on your metrics</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {isLoading ? (
              <Skeleton className="h-20 w-full" />
            ) : (
              <div className="flex items-center justify-center">
                <div className="relative h-32 w-32">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl font-bold text-primary-600">
                      85
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
                      strokeDasharray="85, 100"
                    />
                  </svg>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Progress</CardTitle>
            <CardDescription>Changes in your health metrics</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Weight</span>
                  <span className="text-sm text-green-500">-0.5 kg</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Blood Pressure</span>
                  <span className="text-sm text-green-500">-5 mmHg</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Heart Rate</span>
                  <span className="text-sm text-amber-500">+2 bpm</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
            <CardDescription>Based on your health data</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
              </div>
            ) : (
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <div className="bg-primary-100 text-primary-700 rounded-full p-1 mr-2 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  Increase daily water intake to improve hydration levels
                </li>
                <li className="flex items-start">
                  <div className="bg-primary-100 text-primary-700 rounded-full p-1 mr-2 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  Add more low-impact exercises to your routine
                </li>
                <li className="flex items-start">
                  <div className="bg-primary-100 text-primary-700 rounded-full p-1 mr-2 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  Schedule your annual health check-up
                </li>
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
