
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { session } = useAuth();

  useEffect(() => {
    if (session) {
      navigate('/');
    }
  }, [session, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Logged in successfully!' });
      navigate('/');
    }
    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: 'Input Required',
        description: 'Please provide both an email and password to sign up.',
        variant: 'destructive',
      });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
      },
    });
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success! Please verify your email.', description: "A confirmation link has been sent to your inbox. You must click it to activate your account before logging in." });
    }
    setLoading(false);
  };

  return (
    <div
      className="min-h-screen w-full grid lg:grid-cols-2 bg-cover bg-center font-serif text-stone-200"
      style={{
        backgroundImage: "url('/lovable-uploads/e1d62c79-b67b-4e3f-ad65-6f107da85107.png')",
      }}
    >
      {/* Left Panel: Content */}
      <div className="hidden lg:flex flex-col justify-center items-start p-12 bg-stone-900/50 backdrop-blur-sm space-y-6">
        <img src="/lovable-uploads/07e30047-faf1-4218-b752-b5267524d989.png" alt="The Lone Wanderer Logo" className="w-72 mb-4" />
        <h1 className="font-pixel text-3xl text-yellow-300 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">Embark on a Quest of Self-Discovery</h1>
        <p className="text-stone-300 text-lg leading-relaxed">
          Life's trials are not burdens, but quests in disguise. Here, we transmute the lead of your daily struggles into the gold of heroic sagas. The Lone Wanderer is a sanctuary where your emotions are the ink, and your life, the parchment.
        </p>
        <p className="text-stone-300 text-lg leading-relaxed">
          By chronicling your feelings, you summon forth a Questmaster to forge an epic adventure, and an Insight Oracle to reveal the wisdom hidden within. Each entry is a step on a path to mastering your inner world, transforming turmoil into triumph.
        </p>
        <div className="text-left text-stone-300 text-base mt-4 space-y-2 border-t border-stone-700 pt-4 w-full">
            <p><span className="font-pixel text-yellow-400 text-sm">Journal:</span> Chronicle your emotions and experiences.</p>
            <p><span className="font-pixel text-yellow-400 text-sm">Quest:</span> Receive a unique adventure and a magical item.</p>
            <p><span className="font-pixel text-yellow-400 text-sm">Logbook:</span> Track your journey and emotional patterns.</p>
            <p><span className="font-pixel text-yellow-400 text-sm">Grow:</span> Gain powerful insights and level up your spirit.</p>
        </div>
      </div>

      {/* Right Panel: Auth Form */}
      <div className="flex flex-col items-center justify-center p-4 bg-stone-900/90 lg:bg-stone-900/70 lg:backdrop-blur-sm">
        <div className="lg:hidden flex flex-col items-center text-center mb-6">
            <img src="/lovable-uploads/07e30047-faf1-4218-b752-b5267524d989.png" alt="The Lone Wanderer Logo" className="w-48" />
            <p className="font-pixel text-stone-300 mt-2 text-sm">Welcome, Wanderer.</p>
        </div>
        
        <div className="w-full max-w-sm">
          <h2 className="font-pixel text-2xl text-center text-yellow-300 mb-8">Begin Your Journey</h2>
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <Label htmlFor="email" className="font-pixel text-sm">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="wanderer@quest.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="bg-stone-800/80 border-stone-600 focus:ring-yellow-400 text-base font-sans"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="font-pixel text-sm">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="bg-stone-800/80 border-stone-600 focus:ring-yellow-400 text-base font-sans"
              />
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 pt-2">
              <Button onClick={handleLogin} disabled={loading} className="w-full bg-yellow-600 hover:bg-yellow-700 text-stone-900 font-bold font-pixel">
                {loading ? 'Entering...' : 'Login'}
              </Button>
              <Button onClick={handleSignup} disabled={loading} variant="outline" className="w-full border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-stone-900 font-bold font-pixel">
                {loading ? 'Joining...' : 'Sign Up'}
              </Button>
            </div>
          </form>
           <p className="text-xs text-stone-400 text-center mt-6">
            Upon signing up, a verification scroll will be dispatched to your email. You must click the link within to activate your account.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
