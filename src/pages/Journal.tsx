
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { roles } from '@/data/roles';
import { ArrowLeft } from 'lucide-react';

const Journal = () => {
  const { roleSlug } = useParams<{ roleSlug: string }>();
  const navigate = useNavigate();
  const [journalEntry, setJournalEntry] = useState('');

  const role = roles.find((r) => r.slug === roleSlug);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Journal for', role?.name, ':', journalEntry);
    // TODO: LLM integration will happen here
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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-cover bg-center font-pixel text-stone-200" style={{ backgroundImage: "url('/lovable-uploads/e1d62c79-b67b-4e3f-ad65-6f107da85107.png')" }}>
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

      <main className="w-full max-w-2xl">
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
              />
              <Button type="submit" className="w-full bg-yellow-600 hover:bg-yellow-700 text-stone-900 font-bold">
                Begin Quest
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Placeholder for LLM response */}
        <div className="mt-8 w-full">
          {/* Results will be displayed here */}
        </div>
      </main>
    </div>
  );
};

export default Journal;
