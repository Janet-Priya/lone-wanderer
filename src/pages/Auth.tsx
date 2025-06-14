
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
      toast({ title: 'Success', description: 'Check your email for the confirmation link!' });
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
          <CardTitle className="text-2xl text-yellow-300">The Lone Wanderer</CardTitle>
          <CardDescription className="text-stone-300">Sign in or create an account to begin your quest.</CardDescription>
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
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
