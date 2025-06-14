
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Swords, Loader2 } from 'lucide-react';
import { InventoryItemCard } from '@/components/InventoryItemCard';
import { Tables } from '@/integrations/supabase/types';

const Inventory = () => {
  const { user } = useAuth();

  const { data: inventory, isLoading } = useQuery({
    queryKey: ['inventory', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('user_inventory')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) {
        console.error("Error fetching inventory:", error);
        throw error;
      }
      return data;
    },
    enabled: !!user,
  });

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center p-4 bg-cover bg-center font-pixel text-stone-200"
      style={{
        backgroundImage: "url('/lovable-uploads/e1d62c79-b67b-4e3f-ad65-6f107da85107.png')",
      }}
    >
      <div className="w-full max-w-6xl">
        <Button asChild variant="outline" className="bg-yellow-600/80 hover:bg-yellow-700 border-yellow-800 text-stone-900 font-bold self-start mb-8">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Link>
        </Button>
      </div>

      <Card className="w-full max-w-6xl bg-stone-900/80 border-stone-700 text-stone-200">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl text-yellow-300 flex items-center justify-center gap-4">
            <Swords />
            Sacred Items Inventory
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
                <Loader2 className="animate-spin h-10 w-10 text-yellow-300" />
            </div>
          ) : inventory && inventory.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {inventory.map((item) => (
                <InventoryItemCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <p className="text-center text-stone-400 py-10">Your inventory is empty. Complete quests to find Sacred Items!</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Inventory;
