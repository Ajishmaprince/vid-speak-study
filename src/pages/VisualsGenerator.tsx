import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Image, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const VisualsGenerator = () => {
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [visualContent, setVisualContent] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateVisuals = async () => {
    if (!topic) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("chat", {
        body: {
          messages: [
            {
              role: "user",
              content: `Create a text-based visual study guide for: ${topic}. ${description}. Include: 1) ASCII diagrams or flowcharts, 2) Visual mnemonics, 3) Tables/charts in text format, 4) Step-by-step visual explanations.`
            }
          ]
        }
      });

      if (error) throw error;
      setVisualContent(data.message);
      toast({ title: "Visuals Generated!", description: "Your visual study guide is ready." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to generate visuals", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Visuals Generator</h1>
          <p className="text-muted-foreground">Create visual aids and diagrams for better understanding</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 gradient-card shadow-card">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Image className="w-6 h-6" />
              Create Visual Aid
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Topic</label>
                <Input
                  placeholder="e.g., Cell Structure, Water Cycle..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">What to visualize?</label>
                <Textarea
                  placeholder="Describe what aspects you want visualized..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>
              <Button onClick={generateVisuals} disabled={loading} className="w-full gap-2">
                <Sparkles className="w-4 h-4" />
                {loading ? "Creating..." : "Generate Visuals"}
              </Button>
            </div>
          </Card>

          <Card className="p-6 gradient-card shadow-card">
            <h2 className="text-2xl font-bold mb-4">Visual Study Guide</h2>
            {visualContent ? (
              <div className="prose prose-sm max-w-none font-mono text-xs">
                <pre className="whitespace-pre-wrap">{visualContent}</pre>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Generated visual aids will appear here
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VisualsGenerator;
