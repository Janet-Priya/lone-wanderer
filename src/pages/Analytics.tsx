
import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartConfig, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { Bar, BarChart, Pie, PieChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Cell } from 'recharts';
import { Loader2, BookOpen, Smile, Swords } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const chartColors = [
  "#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088fe", "#00c49f",
  "#ffbb28", "#ff7300", "#d0ed57", "#a4de6c", "#8dd1e1", "#83a6ed"
];

const Analytics = () => {
  const { user } = useAuth();

  const { data: journalEntries, isLoading } = useQuery({
    queryKey: ['journalEntries', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('journal_entries')
        .select('emotion, class')
        .eq('user_id', user.id);

      if (error) {
        console.error("Error fetching journal entries:", error);
        throw new Error(error.message);
      }
      return data || [];
    },
    enabled: !!user,
  });

  const emotionData = useMemo(() => {
    if (!journalEntries) return [];
    const counts = journalEntries.reduce((acc, entry) => {
      if (entry.emotion) {
        acc[entry.emotion] = (acc[entry.emotion] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [journalEntries]);

  const classData = useMemo(() => {
    if (!journalEntries) return [];
    const counts = journalEntries.reduce((acc, entry) => {
      if (entry.class) {
        acc[entry.class] = (acc[entry.class] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(counts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  }, [journalEntries]);

  const emotionChartConfig = useMemo(() => {
    const config: ChartConfig = {};
    emotionData.forEach((item, index) => {
      config[item.name] = {
        label: item.name,
        color: chartColors[index % chartColors.length],
      };
    });
    return config;
  }, [emotionData]);

  const classChartConfig = {
    count: { label: 'Quests' },
    ...classData.reduce((acc, item, index) => {
      acc[item.name] = { color: chartColors[index % chartColors.length] };
      return acc;
    }, {} as ChartConfig),
  } satisfies ChartConfig;
  

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-stone-900/90" style={{ backgroundImage: "url('/lovable-uploads/e1d62c79-b67b-4e3f-ad65-6f107da85107.png')"}}>
        <Loader2 className="h-16 w-16 animate-spin text-yellow-300" />
      </div>
    );
  }

  if (!journalEntries || journalEntries.length === 0) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center text-center p-4 bg-cover bg-center font-pixel text-stone-200" style={{ backgroundImage: "url('/lovable-uploads/e1d62c79-b67b-4e3f-ad65-6f107da85107.png')"}}>
        <h2 className="text-3xl text-yellow-300 mb-4">The Oracle's library is empty.</h2>
        <p className="text-stone-300 mb-6">Embark on a new quest to begin charting your journey.</p>
        <Link to="/">
          <Button variant="outline" className="bg-yellow-600/80 hover:bg-yellow-700 border-yellow-800 text-stone-900 font-bold">
            Begin a Quest
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 bg-cover bg-center font-pixel text-stone-200" style={{ backgroundImage: "url('/lovable-uploads/e1d62c79-b67b-4e3f-ad65-6f107da85107.png')"}}>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl text-center text-yellow-300 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] mb-8">Analytics Dashboard</h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <Card className="bg-stone-900/80 border-stone-700 text-stone-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-yellow-300">Total Quests</CardTitle>
              <BookOpen className="h-4 w-4 text-stone-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-stone-100">{journalEntries.length}</div>
            </CardContent>
          </Card>
          <Card className="bg-stone-900/80 border-stone-700 text-stone-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-yellow-300">Unique Emotions</CardTitle>
              <Smile className="h-4 w-4 text-stone-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-stone-100">{emotionData.length}</div>
            </CardContent>
          </Card>
          <Card className="bg-stone-900/80 border-stone-700 text-stone-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-yellow-300">Most Frequent Class</CardTitle>
              <Swords className="h-4 w-4 text-stone-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-stone-100">{classData[0]?.name || 'N/A'}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-stone-900/80 border-stone-700 text-stone-200">
            <CardHeader>
              <CardTitle className="text-xl text-yellow-300">Emotional Frequency</CardTitle>
              <CardDescription className="text-stone-300">A look at the emotions you've explored.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center pt-8 aspect-square">
              <ChartContainer
                config={emotionChartConfig}
                className="mx-auto aspect-square h-full max-w-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel />}
                    />
                    <Pie
                      data={emotionData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      labelLine={false}
                      label={false}
                    >
                      {emotionData.map((entry) => (
                        <Cell
                          key={`cell-${entry.name}`}
                          fill={`var(--color-${entry.name})`}
                          className="focus:outline-none"
                        />
                      ))}
                    </Pie>
                    <ChartLegend
                      content={<ChartLegendContent nameKey="name" />}
                      className="flex-row"
                      verticalAlign="bottom"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="bg-stone-900/80 border-stone-700 text-stone-200">
            <CardHeader>
              <CardTitle className="text-xl text-yellow-300">Quests by Class</CardTitle>
              <CardDescription className="text-stone-300">Which archetypes have you embodied?</CardDescription>
            </CardHeader>
            <CardContent>
               <ChartContainer config={classChartConfig} className="h-[300px] w-full">
                <BarChart data={classData} margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
                   <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.2)" />
                  <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))' }} angle={-45} textAnchor="end" height={60} />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" radius={4}>
                    {classData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
        <div className="text-center mt-8">
            <Link to="/">
                <Button variant="outline" className="bg-yellow-600/80 hover:bg-yellow-700 border-yellow-800 text-stone-900 font-bold">
                    Return to Hub
                </Button>
            </Link>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
