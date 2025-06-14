
import { QuestResultData } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Wand2, Lightbulb } from 'lucide-react';

interface QuestResultProps {
  result: QuestResultData;
}

const QuestResult = ({ result }: QuestResultProps) => {
  if (!result) return null;

  const { quest, insight } = result;

  return (
    <div className="mt-8 w-full grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-500">
      <Card className="bg-stone-900/80 border-stone-700 text-stone-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-300">
            <Wand2 /> Your Quest
          </CardTitle>
          <CardDescription className="text-stone-300">A challenge forged from your feelings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-stone-200 font-sans">
          <p><strong>Emotion:</strong> {quest.emotion}</p>
          <p><strong>Class:</strong> {quest.class}</p>
          <p><strong>Realm:</strong> {quest.realm}</p>
          <p className="italic text-stone-400">"{quest.realm_description}"</p>
          <p><strong>Quest:</strong> {quest.quest}</p>
          <p><strong>Sacred Item:</strong> {quest.item}</p>
          <p className="italic text-stone-400">"{quest.item_effect}"</p>
          <p><strong>Transformation:</strong> {quest.transformation}</p>
        </CardContent>
      </Card>
      
      <Card className="bg-stone-900/80 border-stone-700 text-stone-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sky-300">
            <Lightbulb /> Oracle's Insight
          </CardTitle>
          <CardDescription className="text-stone-300">Wisdom to light your path.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-stone-200 font-sans">
          <p><strong>Summary:</strong> {insight.summary}</p>
          <p><strong>Emotional Pattern:</strong> {insight.emotional_pattern}</p>
          <p><strong>Path to Growth:</strong> {insight.growth_advice}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuestResult;
