
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useNavigate, Link } from 'react-router-dom';
import { roles } from '@/data/roles';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BookMarked, Shield, Swords, Lock, BarChart, Settings, LogOut } from 'lucide-react';
import WisdomWizardChat from '@/components/WisdomWizardChat';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const Index = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const { data: questCount, isLoading: isLoadingCount } = useQuery({
    queryKey: ['questCount', user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { count, error } = await supabase
        .from('journal_entries')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (error) {
        console.error("Error fetching quest count:", error);
        return 0;
      };
      return count ?? 0;
    },
    enabled: !!user,
  });

  const { data: userStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['userStats', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('user_stats')
        .select('xp, level')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching user stats:", error);
        return null;
      };
      return data;
    },
    enabled: !!user,
  });

  const userLevel = userStats?.level ?? 1;

  return (
    <div
      className="min-h-screen flex flex-col items-center p-4 bg-cover bg-center font-pixel text-stone-200"
      style={{
        backgroundImage: "url('/lovable-uploads/e1d62c79-b67b-4e3f-ad65-6f107da85107.png')",
      }}
    >
      <div className="absolute top-4 right-4 flex items-center gap-4">
        <div className="bg-stone-900/70 border border-stone-700 rounded-md px-4 py-2 text-yellow-300 flex items-center gap-2">
            <Shield size={20} className="text-green-400"/>
            <span>Level: {isLoadingStats ? '...' : userLevel}</span>
        </div>
        <div className="bg-stone-900/70 border border-stone-700 rounded-md px-4 py-2 text-yellow-300 flex items-center gap-2">
            <img src="/lovable-uploads/e95e71f9-5631-48c0-8186-eb56045d8242.png" alt="XP" className="w-6 h-6" />
            <span>XP: {isLoadingStats ? '...' : userStats?.xp ?? 0}</span>
        </div>
        
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="bg-stone-900/70 hover:bg-stone-800/90 border-stone-700 text-yellow-300 hover:border-yellow-500 p-2 h-auto">
                    <Settings className="h-5 w-5" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-stone-900/90 border-stone-700 text-stone-200 font-pixel">
                <DropdownMenuLabel>My Journey</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-stone-700" />
                <DropdownMenuItem asChild>
                    <Link to="/logbook" className="flex items-center gap-2 cursor-pointer w-full">
                        <BookMarked size={16} />
                        <span>Wanderer's Log ({isLoadingCount ? '...' : questCount})</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link to="/inventory" className="flex items-center gap-2 cursor-pointer w-full">
                        <Swords size={16} />
                        <span>Inventory</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link to="/analytics" className="flex items-center gap-2 cursor-pointer w-full">
                        <BarChart size={16} />
                        <span>Analytics</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-stone-700" />
                <DropdownMenuItem onClick={signOut} className="flex items-center gap-2 cursor-pointer text-red-400 focus:bg-red-900/50 focus:text-red-300">
                    <LogOut size={16} />
                    <span>Logout</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="text-center my-24">
        <h1 className="text-3xl text-yellow-300 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] inline-block overflow-hidden whitespace-nowrap border-r-4 border-r-yellow-300 animate-typing">Choose Your Guide</h1>
        <p className="text-stone-300 mt-2">Logged in as: {user?.email}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl w-full">
        {roles.map((role) => {
          const isUnlocked = userLevel >= (role.minLevel || 1);
          return (
            <Card
              key={role.name}
              onClick={() => isUnlocked && navigate(`/journal/${role.slug}`)}
              className={cn(
                "bg-stone-900/70 border-stone-700 text-stone-200 transition-all duration-300 transform font-pixel relative",
                isUnlocked
                  ? "hover:bg-stone-800/90 hover:border-yellow-500 cursor-pointer hover:-translate-y-1"
                  : "opacity-60 grayscale cursor-not-allowed"
              )}
            >
              {!isUnlocked && (
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center rounded-lg z-10">
                  <Lock className="text-yellow-300 w-8 h-8" />
                  <p className="text-yellow-300 mt-2">Requires Level {role.minLevel}</p>
                </div>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-xl text-yellow-300">{role.name}</CardTitle>
                <CardDescription className="text-stone-300 h-10 text-xs">{role.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center items-center p-6">
                <img src={role.icon} alt={role.name} className="w-24 h-24 object-contain" />
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="w-full max-w-4xl mt-12 mb-10">
        <WisdomWizardChat />
      </div>
    </div>
  );
};

export default Index;
