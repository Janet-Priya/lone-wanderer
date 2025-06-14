
    import { useAuth } from '@/contexts/AuthContext';
    import { Button } from '@/components/ui/button';

    const Index = () => {
      const { user, signOut } = useAuth();

      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
          <div className="absolute top-4 right-4">
            <Button onClick={signOut} variant="outline">Logout</Button>
          </div>
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Welcome, Wanderer</h1>
            <p className="text-xl text-muted-foreground mb-8">You are logged in as: {user?.email}</p>
            <p className="max-w-md">Your journey begins here. In the next step, you'll be able to write journal entries and see them transformed into quests.</p>
          </div>
        </div>
      );
    };

    export default Index;
    