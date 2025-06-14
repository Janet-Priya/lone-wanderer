
import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import DOMPurify from 'dompurify';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const WisdomWizardChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const MAX_CHAT_LENGTH = 500;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const sanitizedInput = DOMPurify.sanitize(input);
    if (!sanitizedInput.trim() || isLoading) return;

    if (sanitizedInput.length > MAX_CHAT_LENGTH) {
      toast.error(`Message cannot exceed ${MAX_CHAT_LENGTH} characters.`);
      return;
    }

    const userMessage: Message = { role: 'user', content: sanitizedInput };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('wisdom-wizard-chat', {
        body: { messages: [...messages, userMessage] },
      });

      if (error) throw error;
      
      const assistantMessage: Message = { role: 'assistant', content: data.reply };
      setMessages((prev) => [...prev, assistantMessage]);

    } catch (err: any) {
      console.error('Error with wisdom wizard chat:', err);
      toast.error('The Wizard seems to be in deep meditation. Please try again later.');
      setMessages(prev => prev.slice(0, prev.length -1));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-stone-900/80 border-stone-700 text-stone-200">
      <CardHeader className="text-center flex flex-col items-center">
        <img src="/lovable-uploads/f14866c6-b31f-4770-ac61-fdf1c63563cc.png" alt="Wizard of Wisdom" className="w-24 h-24 object-contain mb-4" />
        <CardTitle className="text-2xl text-yellow-300">Wizard of Wisdom</CardTitle>
        <CardDescription className="text-stone-300">Speak, and I shall ponder your words.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80 overflow-y-auto p-4 border border-stone-700 rounded-md mb-4 bg-stone-800/50 space-y-4 font-pixel text-base">
          {messages.length === 0 && (
            <div className="flex justify-center items-center h-full text-stone-400">
              Your conversation with the wizard begins here...
            </div>
          )}
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`rounded-lg px-4 py-2 max-w-sm ${msg.role === 'user' ? 'bg-yellow-800/80 text-stone-100' : 'bg-stone-700/80 text-stone-200'}`}>
                {msg.content}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            className="bg-stone-800/80 border-stone-600 focus:ring-yellow-400 font-pixel text-stone-200"
            disabled={isLoading}
            maxLength={MAX_CHAT_LENGTH}
          />
          <Button type="submit" className="bg-yellow-600 hover:bg-yellow-700 text-stone-900 font-bold" disabled={isLoading}>
            {isLoading ? <Loader2 className="animate-spin" /> : <Send />}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default WisdomWizardChat;
