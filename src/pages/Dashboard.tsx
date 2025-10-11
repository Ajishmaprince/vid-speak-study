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
    <div className="min-h-screen bg-background pl-64">
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ''}! Here's your learning overview
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsDisplay.map((stat) => (
            <Card key={stat.label} className="p-6 gradient-card shadow-glow border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-sm text-muted-foreground mb-1 font-medium">{stat.label}</p>
                  <p className="text-4xl font-bold bg-gradient-to-br from-primary via-secondary to-accent bg-clip-text text-transparent">{stat.value}</p>
                </div>
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center`}>
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="p-6 gradient-card shadow-card">
            <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Button onClick={() => navigate("/chat")} className="w-full justify-start" variant="outline">
                <BookOpen className="w-5 h-5 mr-2" />
                Start AI Chat Session
              </Button>
              <Button onClick={() => navigate("/upload")} className="w-full justify-start" variant="outline">
                <BookOpen className="w-5 h-5 mr-2" />
                Upload & Summarize Notes
              </Button>
              <Button onClick={() => navigate("/games")} className="w-full justify-start" variant="outline">
                <Trophy className="w-5 h-5 mr-2" />
                Take a Quiz
              </Button>
            </div>
          </Card>

          <Card className="p-6 gradient-card shadow-glow border-2 border-primary/20">
            <h2 className="text-2xl font-bold mb-4 relative z-10">Recent Activity</h2>
            <div className="space-y-4 relative z-10">
              {recentActivity.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No recent activity yet. Start studying to see your progress!</p>
              ) : (
                recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between py-3 px-4 rounded-lg bg-card/50 border border-border/50 hover:border-primary/50 transition-all">
                    <div>
                      <p className="font-semibold">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">{activity.time}</p>
                    </div>
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
