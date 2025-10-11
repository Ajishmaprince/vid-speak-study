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

  const stats = [
    { label: "Study Hours", value: "24", icon: Clock, color: "text-blue-500" },
    { label: "Notes Created", value: "12", icon: BookOpen, color: "text-green-500" },
    { label: "Quizzes Taken", value: "8", icon: Trophy, color: "text-yellow-500" },
    { label: "Progress", value: "78%", icon: TrendingUp, color: "text-purple-500" },
  ];

  const recentActivity = [
    { title: "Biology Notes Summarized", time: "2 hours ago", type: "summary" },
    { title: "Math Quiz Completed", time: "5 hours ago", type: "quiz" },
    { title: "Physics Study Session", time: "1 day ago", type: "study" },
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
          {stats.map((stat) => (
            <Card key={stat.label} className="p-6 gradient-card shadow-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className={`w-12 h-12 ${stat.color}`} />
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

          <Card className="p-6 gradient-card shadow-card">
            <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <div>
                    <p className="font-medium">{activity.title}</p>
                    <p className="text-sm text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
