import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut, Menu } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useSidebar } from "@/components/ui/sidebar";

export const Header = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { toggleSidebar } = useSidebar();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        fetchProfile(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setUser(session.user);
        fetchProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (data) {
      setProfile(data);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: "Logged out successfully" });
    navigate("/auth");
  };

  if (!user) return null;

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-card/80 backdrop-blur-xl border-b border-border/50 z-40 flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={toggleSidebar}
        >
          <Menu className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-accent">
            <span className="text-primary-foreground font-bold text-lg">SB</span>
          </div>
          <span className="font-bold text-xl hidden md:block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">StudyBuddy AI</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 bg-card/50 border border-border/50 rounded-full px-4 py-2 shadow-card">
          <Avatar className="w-8 h-8 border-2 border-primary">
            {profile?.avatar_url ? (
              <AvatarImage src={profile.avatar_url} />
            ) : (
              <AvatarFallback className="bg-primary/20 text-primary text-sm">
                {profile?.full_name?.charAt(0) || user.email?.charAt(0) || "?"}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="hidden md:block">
            <p className="text-sm font-medium">
              {profile?.full_name || "User"}
            </p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <Button 
          onClick={handleLogout} 
          variant="outline" 
          size="icon"
          className="border-border/50 hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
};
