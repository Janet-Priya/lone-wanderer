
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const roles = [
  {
    name: 'Insight Oracle',
    description: 'Summarizes your emotional state.',
    icon: '/lovable-uploads/a46dc79e-1594-479f-88ce-073b7a6a975a.png', // King
  },
  {
    name: 'Empath',
    description: 'Validates your feelings and offers comfort.',
    icon: '/lovable-uploads/7500485c-c568-4691-889d-951bc73cefff.png', // Torch
  },
  {
    name: 'Healer',
    description: 'Offers coping advice and strategies.',
    icon: '/lovable-uploads/952378c2-3120-4c5c-bcfe-9c322d76cebb.png', // Armor
  },
  {
    name: 'Pattern Watcher',
    description: 'Identifies recurring emotional loops.',
    icon: '/lovable-uploads/c2d753b7-0247-4d50-b35a-37dc9ae05fb0.png', // Sword
  },
];

const Index = () => {
  const { user, signOut } = useAuth();

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 bg-cover bg-center font-pixel text-stone-200"
      style={{
        backgroundImage: "url('/lovable-uploads/e1d62c79-b67b-4e3f-ad65-6f107da85107.png')",
      }}
    >
      <div className="absolute top-4 right-4">
        <Button
          onClick={signOut}
          variant="outline"
          className="bg-yellow-600/80 hover:bg-yellow-700 border-yellow-800 text-stone-900 font-bold"
        >
          Logout
        </Button>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-3xl text-yellow-300 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">Choose Your Guide</h1>
        <p className="text-stone-300">Logged in as: {user?.email}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl">
        {roles.map((role) => (
          <Card
            key={role.name}
            className="bg-stone-900/70 border-stone-700 text-stone-200 hover:bg-stone-800/90 hover:border-yellow-500 cursor-pointer transition-all duration-300 transform hover:-translate-y-1"
          >
            <CardHeader className="text-center">
              <CardTitle className="text-xl text-yellow-300">{role.name}</CardTitle>
              <CardDescription className="text-stone-300 h-10">{role.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center items-center p-6">
              <img src={role.icon} alt={role.name} className="w-24 h-24 object-contain" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Index;
