
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { roles } from '@/data/roles';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BookMarked } from 'lucide-react';
import WisdomWizardChat from '@/components/WisdomWizardChat';

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

  return (
    <div
      className="min-h-screen flex flex-col items-center p-4 bg-cover bg-center font-pixel text-stone-200"
      style={{
        backgroundImage: "url('/lovable-uploads/e1d62c79-b67b-4e3f-ad65-6f107da85107.png')",
      }}
    >
      <div className="absolute top-4 right-4 flex items-center gap-4">
        <div className="bg-stone-900/70 border border-stone-700 rounded-md px-4 py-2 text-yellow-300 flex items-center gap-2">
            <BookMarked size={20} />
            <span>Wanderer's Log: {isLoadingCount ? '...' : questCount}</span>
        </div>
        <Button
          onClick={signOut}
          variant="outline"
          className="bg-yellow-600/80 hover:bg-yellow-700 border-yellow-800 text-stone-900 font-bold"
        >
          Logout
        </Button>
      </div>

      <div className="text-center my-8">
        <h1 className="text-3xl text-yellow-300 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">Choose Your Guide</h1>
        <p className="text-stone-300">Logged in as: {user?.email}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl w-full">
        {roles.map((role) => (
          <Card
            key={role.name}
            onClick={() => navigate(`/journal/${role.slug}`)}
            className="bg-stone-900/70 border-stone-700 text-stone-200 hover:bg-stone-800/90 hover:border-yellow-500 cursor-pointer transition-all duration-300 transform hover:-translate-y-1"
          >
            <CardHeader className="text-center">
              <CardTitle className="text-xl text-yellow-300">{role.name}</CardTitle>
              <CardDescription className="text-stone-300 h-10">{role.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center items-center p-6">
              <img src={role.icon} alt={role.name} className="w-24 h-24 object-contain" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="w-full max-w-4xl mt-12 mb-10">
        <WisdomWizardChat />
      </div>
    </div>
  );
};

export default Index;
