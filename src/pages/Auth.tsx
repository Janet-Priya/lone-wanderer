import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardDescription } from '@/components/ui/card';
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
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center font-pixel"
      style={{
        backgroundImage: "url('/lovable-uploads/e1d62c79-b67b-4e3f-ad65-6f107da85107.png')",
      }}
    >
      <Card className="w-full max-w-sm bg-stone-900/70 border-stone-700 text-stone-200">
        <CardHeader className="text-center">
          <img src="/lovable-uploads/183784fd-3172-48e4-bc07-b6990c897722.png" alt="The Lone Wanderer Logo" className="w-48 mx-auto mb-4" />
          <CardDescription className="text-stone-300">
            Welcome, Wanderer. This is a sacred space to channel your emotions into epic quests. Chronicle your feelings, and watch as they transform into adventures for self-discovery and growth.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="wanderer@quest.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="bg-stone-800/80 border-stone-600 focus:ring-yellow-400 text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="bg-stone-800/80 border-stone-600 focus:ring-yellow-400 text-base"
              />
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 pt-2">
              <Button onClick={handleLogin} disabled={loading} className="w-full bg-yellow-600 hover:bg-yellow-700 text-stone-900 font-bold">
                {loading ? 'Logging in...' : 'Login'}
              </Button>
              <Button onClick={handleSignup} disabled={loading} variant="outline" className="w-full border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-stone-900 font-bold">
                {loading ? 'Signing up...' : 'Sign Up'}
              </Button>
            </div>
          </form>
          <div className="text-center text-stone-400 text-xs mt-6 px-2 space-y-1">
            <p className="font-bold text-stone-300 mb-2 text-sm">How Your Quest Unfolds:</p>
            <p>1. Log your feelings in the Journal.</p>
            <p>2. Receive a unique quest & a magical item.</p>
            <p>3. Track your journey in the Logbook.</p>
            <p>4. Gain insight & level up your spirit.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
