import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { roles } from '@/data/roles';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { QuestResultData } from '@/types';
import QuestResult from '@/components/QuestResult';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import DOMPurify from 'dompurify';

const Journal = () => {
  const { roleSlug } = useParams<{ roleSlug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [journalEntry, setJournalEntry] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questResult, setQuestResult] = useState<QuestResultData | null>(null);

  const role = roles.find((r) => r.slug === roleSlug);
  const MAX_JOURNAL_LENGTH = 5000;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const sanitizedEntry = DOMPurify.sanitize(journalEntry);
    if (!sanitizedEntry.trim()) {
      toast.error('Please write something in your journal.');
      return;
    }
    if (sanitizedEntry.length > MAX_JOURNAL_LENGTH) {
      toast.error(`Journal entry cannot exceed ${MAX_JOURNAL_LENGTH} characters.`);
      return;
    }

    setIsLoading(true);
    setError(null);
    setQuestResult(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('generate-quest', {
        body: { entry: sanitizedEntry },
      });

      if (functionError) {
        throw functionError;
      }
      
      setQuestResult(data);
      
      // Save to DB and award XP
      if (data && user) {
        const { quest: questData } = data;
        const { error: insertError } = await supabase.from('journal_entries').insert([{
          user_id: user.id,
          text: sanitizedEntry,
          emotion: questData.emotion,
          class: questData.class,
          realm: questData.realm,
          item: questData.item,
          quest: questData.quest,
          avatar_transformation: questData.transformation,
        }]);

        if (insertError) {
          console.error("Failed to save journal entry:", insertError);
          toast.error("Could not save your quest progress, but here is your result!");
        } else {
          const XP_PER_QUEST = 25;
          const { error: xpError } = await supabase.rpc('increment_xp', {
            user_id_to_update: user.id,
            xp_to_add: XP_PER_QUEST,
          });

          if (xpError) {
            console.error("Failed to award XP:", xpError);
            toast.warning("Failed to award XP for this quest.");
          } else {
            toast.success(`Quest complete! You earned ${XP_PER_QUEST} XP!`);
          }
        }
      }

    } catch (err: any) {
      console.error('Error invoking edge function:', err);
      
      let errorMessage = 'The connection to the arcane realm has failed. Please try again.';

      // supabase-js FunctionsHttpError has a context property with the response
      if (err.context && typeof err.context.json === 'function') {
        try {
          const errorBody = await err.context.json();
          if (errorBody.error && errorBody.error.includes('429')) {
            errorMessage = 'The OpenAI realm is overwhelmed! This is likely due to rate limits or billing issues on your API key. Please check your OpenAI account dashboard.';
          } else if (errorBody.error) {
            errorMessage = `An arcane disturbance occurred: ${errorBody.error}`;
          }
        } catch (e) {
          // Body wasn't json, fall through to default error.
          console.error('Could not parse error response json', e);
        }
      }

      setError(errorMessage);
      toast.error(errorMessage, { duration: 10000 });
    } finally {
      setIsLoading(false);
    }
  };

  if (!role) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-cover bg-center font-pixel text-stone-200" style={{ backgroundImage: "url('/lovable-uploads/e1d62c79-b67b-4e3f-ad65-6f107da85107.png')" }}>
        <h1 className="text-2xl text-yellow-300">Guide not found!</h1>
        <Button onClick={() => navigate('/')} className="mt-4 bg-yellow-600 hover:bg-yellow-700 text-stone-900 font-bold">
          Choose a Guide
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center p-4 bg-cover bg-center font-pixel text-stone-200" style={{ backgroundImage: "url('/lovable-uploads/e1d62c79-b67b-4e3f-ad65-6f107da85107.png')" }}>
      <div className="absolute top-4 left-4">
        <Button
          onClick={() => navigate('/')}
          variant="outline"
          className="bg-yellow-600/80 hover:bg-yellow-700 border-yellow-800 text-stone-900 font-bold flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Change Guide
        </Button>
      </div>

      <main className="w-full max-w-4xl mt-20 mb-10">
        <Card className="bg-stone-900/80 border-stone-700 text-stone-200">
          <CardHeader className="text-center flex flex-col items-center">
            <img src={role.icon} alt={role.name} className="w-24 h-24 object-contain mb-4" />
            <CardTitle className="text-2xl text-yellow-300">{role.name}</CardTitle>
            <CardDescription className="text-stone-300">{role.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Textarea
                value={journalEntry}
                onChange={(e) => setJournalEntry(e.target.value)}
                placeholder="Tell me what is on your mind, wanderer..."
                className="bg-stone-800/80 border-stone-600 focus:ring-yellow-400 text-base min-h-[150px] font-sans text-stone-200"
                rows={8}
                disabled={isLoading}
                maxLength={MAX_JOURNAL_LENGTH}
              />
              <Button type="submit" className="w-full bg-yellow-600 hover:bg-yellow-700 text-stone-900 font-bold" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin" /> : 'Begin Quest'}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        {error && <p className="text-red-400 text-center mt-4">{error}</p>}

        {questResult && <QuestResult result={questResult} />}
      </main>
    </div>
  );
};

export default Journal;
