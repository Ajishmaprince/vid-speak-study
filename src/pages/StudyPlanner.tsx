import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Task {
  id: number;
  title: string;
  date: string;
  subject: string;
}

const StudyPlanner = () => {
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, title: "Complete Math Assignment", date: "2025-10-15", subject: "Mathematics" },
    { id: 2, title: "Review Biology Notes", date: "2025-10-12", subject: "Biology" },
  ]);
  const [newTask, setNewTask] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const { toast } = useToast();

  const addTask = () => {
    if (newTask && newDate && newSubject) {
      setTasks([...tasks, { id: Date.now(), title: newTask, date: newDate, subject: newSubject }]);
      setNewTask("");
      setNewDate("");
      setNewSubject("");
      toast({ title: "Task Added!", description: "Your study task has been scheduled." });
    }
  };

  const deleteTask = (id: number) => {
    setTasks(tasks.filter(task => task.id !== id));
    toast({ title: "Task Removed", variant: "destructive" });
  };

  return (
    <div className="min-h-screen bg-background pl-64">
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Study Planner</h1>
          <p className="text-muted-foreground">Plan your study schedule and stay organized</p>
        </div>

        <Card className="p-6 gradient-card shadow-card mb-6">
          <h2 className="text-2xl font-bold mb-4">Add New Task</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
          </div>
          <Button onClick={addTask} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Task
          </Button>
        </Card>

        <Card className="p-6 gradient-card shadow-card">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Calendar className="w-6 h-6" />
            Upcoming Tasks
          </h2>
          <div className="space-y-3">
            {tasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-4 bg-card/50 rounded-lg border">
                <div>
                  <h3 className="font-bold">{task.title}</h3>
                  <p className="text-sm text-muted-foreground">{task.subject} • {task.date}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => deleteTask(task.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default StudyPlanner;
