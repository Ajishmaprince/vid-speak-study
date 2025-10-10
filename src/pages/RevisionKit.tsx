import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clock, Zap, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const RevisionKit = () => {
  const [topic, setTopic] = useState("");
  const [revisionContent, setRevisionContent] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateRevision = async () => {
    if (!topic) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("chat", {
        body: {
          messages: [
            {
              role: "user",
              content: `Create a quick last-minute revision guide for: ${topic}. Include: 1) Key formulas/facts, 2) Common exam questions, 3) Quick tips, 4) Memory tricks. Keep it concise and exam-focused.`
            }
          ]
        }
      });

      if (error) throw error;
      setRevisionContent(data.message);
      toast({ title: "Revision Kit Ready!", description: "Quick review guide generated." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to generate revision kit", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pl-64">
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Last Minute Revision Kit</h1>
          <p className="text-muted-foreground">Quick, focused revision materials for exam prep</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card className="p-6 gradient-card shadow-card">
            <Clock className="w-12 h-12 text-primary mb-3" />
            <h3 className="font-bold text-lg mb-2">Fast Review</h3>
            <p className="text-sm text-muted-foreground">Get key points in minutes</p>
          </Card>
          <Card className="p-6 gradient-card shadow-card">
            <Zap className="w-12 h-12 text-yellow-500 mb-3" />
            <h3 className="font-bold text-lg mb-2">Exam Focus</h3>
            <p className="text-sm text-muted-foreground">Most likely exam questions</p>
          </Card>
          <Card className="p-6 gradient-card shadow-card">
            <BookOpen className="w-12 h-12 text-green-500 mb-3" />
            <h3 className="font-bold text-lg mb-2">Memory Tricks</h3>
            <p className="text-sm text-muted-foreground">Easy ways to remember</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 gradient-card shadow-card">
            <h2 className="text-2xl font-bold mb-4">Generate Revision Kit</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Subject/Topic</label>
                <Input
                  placeholder="e.g., Organic Chemistry, World War 2..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>
              <Button onClick={generateRevision} disabled={loading} className="w-full gap-2">
                <Zap className="w-4 h-4" />
                {loading ? "Creating..." : "Generate Revision Kit"}
              </Button>
            </div>
          </Card>

          <Card className="p-6 gradient-card shadow-card">
            <h2 className="text-2xl font-bold mb-4">Revision Guide</h2>
            {revisionContent ? (
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap text-sm">{revisionContent}</pre>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Your revision guide will appear here
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RevisionKit;
