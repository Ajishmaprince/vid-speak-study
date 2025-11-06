import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Clock, Play, Pause, Save } from "lucide-react";

const StudyTimer = () => {
  const [subject, setSubject] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartPause = () => {
    if (!subject.trim() && !isRunning) {
      toast({
        title: "Subject Required",
        description: "Please enter a subject before starting the timer",
        variant: "destructive"
      });
      return;
    }
    setIsRunning(!isRunning);
  };

  const handleSave = async () => {
    if (!user) {
      toast({
        title: "Not Logged In",
        description: "Please log in to save your study session",
        variant: "destructive"
      });
      return;
    }

    if (seconds === 0) {
      toast({
        title: "No Time Recorded",
        description: "Please start the timer before saving",
        variant: "destructive"
      });
      return;
    }

    const minutes = Math.floor(seconds / 60);
    
    const { error } = await supabase
      .from('study_sessions')
      .insert({
        user_id: user.id,
        subject: subject.trim(),
        duration_minutes: minutes,
        session_date: new Date().toISOString()
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save study session",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Session Saved!",
      description: `Saved ${minutes} minutes of ${subject} study time`,
    });

    // Reset
    setSeconds(0);
    setIsRunning(false);
    setSubject("");
  };

  return (
    <div className="min-h-screen p-4 md:p-8 pt-20">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary mb-4 shadow-glow">
            <Clock className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Study Timer
          </h1>
          <p className="text-muted-foreground text-lg">
            Track your study sessions and build consistent habits
          </p>
        </div>

        <Card className="p-8 gradient-card shadow-glow border-2 border-primary/20 animate-scale-in">
          <div className="space-y-6">
            <div>
              <Label htmlFor="subject" className="text-lg mb-2">Subject</Label>
              <Input
                id="subject"
                type="text"
                placeholder="What are you studying?"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={isRunning}
                className="h-12 text-lg border-2"
              />
            </div>

            <div className="text-center py-8">
              <div className="text-7xl md:text-8xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-8 animate-pulse-slow">
                {formatTime(seconds)}
              </div>
              
              <div className="flex gap-4 justify-center flex-wrap">
                <Button
                  onClick={handleStartPause}
                  size="lg"
                  className="h-16 px-8 text-lg gap-2 shadow-glow hover:scale-105 transition-all"
                >
                  {isRunning ? (
                    <>
                      <Pause className="w-6 h-6" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-6 h-6" />
                      Start
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleSave}
                  size="lg"
                  variant="secondary"
                  className="h-16 px-8 text-lg gap-2 hover:scale-105 transition-all"
                  disabled={seconds === 0}
                >
                  <Save className="w-6 h-6" />
                  Save Session
                </Button>
              </div>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              <p>💡 Tip: Take breaks every 25-30 minutes for better retention</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default StudyTimer;
