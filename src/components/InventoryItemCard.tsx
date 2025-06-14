
import { Tables } from '@/integrations/supabase/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, ShieldCheck, Sword } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface InventoryItemCardProps {
  item: Tables<'user_inventory'>;
}

export const InventoryItemCard = ({ item }: InventoryItemCardProps) => {
    const queryClient = useQueryClient();

    const { mutate: toggleEquip, isPending } = useMutation({
        mutationFn: async (itemToToggle: Tables<'user_inventory'>) => {
            const { error } = await supabase
                .from('user_inventory')
                .update({ is_equipped: !itemToToggle.is_equipped })
                .eq('id', itemToToggle.id);
            
            if (error) {
                toast.error(`Failed to ${itemToToggle.is_equipped ? 'unequip' : 'equip'} item.`);
                throw error;
            }

            return !itemToToggle.is_equipped;
        },
        onSuccess: (isNowEquipped) => {
            toast.success(`Item ${isNowEquipped ? 'equipped' : 'unequipped'}!`);
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
        },
        onError: (error) => {
            console.error("Error toggling equip status:", error);
        }
    });
    
  return (
    <Card className="bg-stone-800/90 border-stone-600 text-stone-200 flex flex-col justify-between">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-lg text-yellow-400">
            <Sword size={20} />
            {item.item_name}
        </CardTitle>
        <CardDescription className="text-stone-400 font-sans italic">"{item.item_effect}"</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-stone-300 font-sans">
            Found on {new Date(item.created_at).toLocaleDateString()}.
        </p>
      </CardContent>
      <CardFooter>
        <Button 
            className="w-full font-bold" 
            variant={item.is_equipped ? "default" : "outline"}
            onClick={() => toggleEquip(item)}
            disabled={isPending}
        >
          {item.is_equipped ? (
            <><ShieldCheck className="mr-2 h-4 w-4" /> Equipped</>
          ) : (
            <><Shield className="mr-2 h-4 w-4" /> Equip</>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};
