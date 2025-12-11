import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, Trophy, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const [stats, setStats] = useState({
    studyHours: 0,
    notesCreated: 0,
    quizzesTaken: 0,
    progress: 0
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchStats();
      fetchRecentActivity();
    }
  }, [user]);

  const fetchStats = async () => {
    if (!user) return;

    // Fetch study sessions total hours
    const { data: sessions } = await supabase
      .from('study_sessions')
      .select('duration_minutes')
      .eq('user_id', user.id);
    
    const totalHours = sessions?.reduce((sum, s) => sum + s.duration_minutes, 0) || 0;

    // Fetch notes count
    const { count: notesCount } = await supabase
      .from('user_notes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    // Fetch quizzes count
    const { count: quizzesCount } = await supabase
      .from('quiz_completions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    // Calculate progress (completed tasks vs total tasks)
    const { data: tasks } = await supabase
      .from('study_tasks')
      .select('completed')
      .eq('user_id', user.id);
    
    const progress = tasks && tasks.length > 0
      ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100)
      : 0;

    setStats({
      studyHours: Math.round(totalHours / 60),
      notesCreated: notesCount || 0,
      quizzesTaken: quizzesCount || 0,
      progress
    });
  };

  const fetchRecentActivity = async () => {
    if (!user) return;

    const activities: any[] = [];

    // Recent notes
    const { data: notes } = await supabase
      .from('user_notes')
      .select('title, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(2);

    notes?.forEach(note => {
      activities.push({
        title: `Notes: ${note.title}`,
        time: note.created_at,
        type: 'notes'
      });
    });

    // Recent quizzes
    const { data: quizzes } = await supabase
      .from('quiz_completions')
      .select('quiz_title, completed_at')
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false })
      .limit(2);

    quizzes?.forEach(quiz => {
      activities.push({
        title: `Quiz: ${quiz.quiz_title}`,
        time: quiz.completed_at,
        type: 'quiz'
      });
    });

    // Sort by time and take top 5
    activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    
    // Format time to relative
    const formatted = activities.slice(0, 5).map(act => ({
      ...act,
      time: formatRelativeTime(act.time)
    }));

    setRecentActivity(formatted);
  };

  const formatRelativeTime = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = now.getTime() - time.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  };

  const statsDisplay = [
    { label: "Study Hours", value: stats.studyHours.toString(), icon: Clock, color: "text-primary" },
    { label: "Notes Created", value: stats.notesCreated.toString(), icon: BookOpen, color: "text-secondary" },
    { label: "Quizzes Taken", value: stats.quizzesTaken.toString(), icon: Trophy, color: "text-accent" },
    { label: "Progress", value: `${stats.progress}%`, icon: TrendingUp, color: "text-primary" },
  ];

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="p-4 md:p-8 animate-fade-in">
        <div className="mb-8 relative">
          <div className="absolute -top-4 -left-4 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-4 -right-4 w-72 h-72 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="relative z-10">
            <h1 className="text-5xl md:text-6xl font-bold mb-3 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-fade-in">
              My Learning Hub
            </h1>
            <p className="text-muted-foreground text-lg">
              Welcome back{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ''}! Here's your learning overview 🚀
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsDisplay.map((stat, index) => (
            <Card 
              key={stat.label} 
              className="p-6 gradient-card shadow-glow border-2 border-primary/20 hover:border-primary/40 transition-all duration-500 hover:scale-110 group cursor-pointer overflow-hidden relative animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-sm text-muted-foreground mb-2 font-medium uppercase tracking-wide">{stat.label}</p>
                  <p className="text-5xl font-bold bg-gradient-to-br from-primary via-secondary to-accent bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">{stat.value}</p>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center shadow-glow group-hover:rotate-12 transition-transform duration-300">
                  <stat.icon className={`w-10 h-10 ${stat.color} group-hover:scale-125 transition-transform duration-300`} />
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="p-8 gradient-card shadow-glow border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 animate-fade-in group">
            <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Quick Actions</h2>
            <div className="space-y-4">
              <Button 
                onClick={() => navigate("/chat")} 
                className="w-full justify-start h-14 text-lg group/btn hover:scale-105 transition-all shadow-card" 
                variant="outline"
              >
                <BookOpen className="w-6 h-6 mr-3 group-hover/btn:rotate-12 transition-transform" />
                Start AI Chat Session
              </Button>
              <Button 
                onClick={() => navigate("/upload")} 
                className="w-full justify-start h-14 text-lg group/btn hover:scale-105 transition-all shadow-card" 
                variant="outline"
              >
                <BookOpen className="w-6 h-6 mr-3 group-hover/btn:rotate-12 transition-transform" />
                Upload & Summarize Notes
              </Button>
              <Button 
                onClick={() => navigate("/games")} 
                className="w-full justify-start h-14 text-lg group/btn hover:scale-105 transition-all shadow-card" 
                variant="outline"
              >
                <Trophy className="w-6 h-6 mr-3 group-hover/btn:rotate-12 transition-transform" />
                Take a Quiz
              </Button>
            </div>
          </Card>

          <Card className="p-8 gradient-card shadow-glow border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 animate-fade-in overflow-hidden relative group">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
            <h2 className="text-3xl font-bold mb-6 relative z-10 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Recent Activity</h2>
            <div className="space-y-4 relative z-10">
              {recentActivity.length === 0 ? (
                <div className="text-center py-12 animate-pulse">
                  <Trophy className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">No recent activity yet. Start studying to see your progress!</p>
                </div>
              ) : (
                recentActivity.map((activity, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between py-4 px-5 rounded-xl bg-card/50 border border-border/50 hover:border-primary/50 hover:bg-card/70 transition-all duration-300 hover:scale-105 cursor-pointer animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div>
                      <p className="font-semibold text-lg">{activity.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">{activity.time}</p>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
