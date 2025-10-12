import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Plus, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

interface Task {
  id: string;
  title: string;
  due_date: string;
  due_time?: string | null;
  subject: string;
  completed: boolean;
}

const StudyPlanner = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        fetchTasks(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        fetchTasks(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchTasks = async (userId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('study_tasks')
      .select('*')
      .eq('user_id', userId)
      .order('due_date', { ascending: true });

    if (error) {
      toast({
        title: "Error loading tasks",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setTasks(data || []);
    }
    setLoading(false);
  };

  const addTask = async () => {
    if (!newTask || !newDate || !newSubject || !user) return;

    const { data, error } = await supabase
      .from('study_tasks')
      .insert([{
        title: newTask,
        due_date: newDate,
        due_time: newTime || null,
        subject: newSubject,
        user_id: user.id,
      }])
      .select()
      .single();

    if (error) {
      toast({
        title: "Error adding task",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setTasks([...tasks, data]);
      setNewTask("");
      setNewDate("");
      setNewTime("");
      setNewSubject("");
      
      // Schedule notification if time is set
      if (newTime && 'Notification' in window && Notification.permission === 'granted') {
        scheduleNotification(data);
      }
      
      toast({ title: "Task Added!", description: "Your study task has been scheduled." });
    }
  };

  const scheduleNotification = (task: Task) => {
    const taskDateTime = new Date(`${task.due_date}T${task.due_time}`);
    const now = new Date();
    const timeUntilTask = taskDateTime.getTime() - now.getTime();
    
    // Notify 15 minutes before
    const notificationTime = timeUntilTask - (15 * 60 * 1000);
    
    if (notificationTime > 0) {
      setTimeout(() => {
        new Notification('Study Reminder', {
          body: `Your study task "${task.title}" for ${task.subject} is starting in 15 minutes!`,
          icon: '/favicon.ico'
        });
      }, notificationTime);
    }
  };

  const toggleTask = async (id: string, completed: boolean) => {
    const { error } = await supabase
      .from('study_tasks')
      .update({ completed: !completed })
      .eq('id', id);

    if (error) {
      toast({
        title: "Error updating task",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setTasks(tasks.map(task => 
        task.id === id ? { ...task, completed: !completed } : task
      ));
    }
  };

  const deleteTask = async (id: string) => {
    const { error } = await supabase
      .from('study_tasks')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error deleting task",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setTasks(tasks.filter(task => task.id !== id));
      toast({ title: "Task Removed" });
    }
  };

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Study Planner</h1>
          <p className="text-muted-foreground">Plan your study schedule and stay organized</p>
        </div>

        <Card className="p-6 gradient-card shadow-card mb-6">
          <h2 className="text-2xl font-bold mb-4">Add New Task</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <Input
              placeholder="Task title..."
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
            />
            <Input
              placeholder="Subject..."
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
            />
            <Input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
            />
            <Input
              type="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              placeholder="Time (optional)"
            />
          </div>
          <Button onClick={addTask} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Task
          </Button>
        </Card>

        <Card className="p-6 gradient-card shadow-card">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-primary" />
            Your Tasks
          </h2>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : tasks.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No tasks yet. Add your first task above!</p>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div key={task.id} className="flex items-center gap-3 p-4 bg-card/50 rounded-lg border border-border hover:border-primary/50 transition-colors">
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => toggleTask(task.id, task.completed)}
                    className="border-primary"
                  />
                  <div className="flex-1">
                    <h3 className={`font-bold ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                      {task.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {task.subject} • {task.due_date}
                      {task.due_time && ` at ${task.due_time}`}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => deleteTask(task.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default StudyPlanner;
