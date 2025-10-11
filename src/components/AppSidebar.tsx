import { LayoutDashboard, MessageSquare, Calendar, FileEdit, FileText, HelpCircle, Clock, Image, Trophy, Users, LogOut } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const menuItems = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/" },
  { title: "AI Chatbot", icon: MessageSquare, path: "/chat" },
  { title: "Study Planner", icon: Calendar, path: "/planner" },
  { title: "Notes Generator", icon: FileEdit, path: "/notes-generator" },
  { title: "Notes Summarizer", icon: FileText, path: "/upload" },
  { title: "Q&A Generator", icon: HelpCircle, path: "/qa-generator" },
  { title: "Last Minute Revision Kit", icon: Clock, path: "/revision" },
  { title: "Visuals Generator", icon: Image, path: "/visuals" },
  { title: "Quiz Generator", icon: Trophy, path: "/games" },
  { title: "Study Club", icon: Users, path: "/study-club" },
];

export const AppSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const { toast } = useToast();

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

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-[hsl(220,40%,12%)] to-[hsl(220,40%,8%)] border-r border-white/10 z-50 overflow-y-auto flex flex-col">
      <div className="p-6 flex-1">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-accent">
            <span className="text-primary-foreground font-bold text-lg">SB</span>
          </div>
          <span className="font-bold text-xl text-white">StudyBuddy AI</span>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left",
                isActive(item.path)
                  ? "bg-primary/20 text-primary border border-primary/30 shadow-accent"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.title}</span>
            </button>
          ))}
        </nav>
      </div>

      {user && (
        <div className="p-6 border-t border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="w-10 h-10 border-2 border-primary">
              {profile?.avatar_url ? (
                <AvatarImage src={profile.avatar_url} />
              ) : (
                <AvatarFallback className="bg-primary/20 text-primary">
                  {profile?.full_name?.charAt(0) || user.email?.charAt(0) || "?"}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {profile?.full_name || "User"}
              </p>
              <p className="text-xs text-white/60 truncate">{user.email}</p>
            </div>
          </div>
          <Button 
            onClick={handleLogout} 
            variant="outline" 
            className="w-full gap-2 border-white/10 hover:bg-white/5 text-white/70 hover:text-white"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      )}
    </aside>
  );
};
