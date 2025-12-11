import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Image, Sparkles, RefreshCw, ArrowDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface VisualNode {
  id: string;
  title: string;
  description: string;
  type: "main" | "sub" | "detail";
}

const VisualsGenerator = () => {
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [nodes, setNodes] = useState<VisualNode[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateVisuals = async () => {
    if (!topic) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-visual-nodes", {
        body: {
          topic,
          text: description || topic
        }
      });

      if (error) throw error;
      
      if (data?.nodes) {
        setNodes(data.nodes);
        toast({ title: "Visual Created!", description: "Your diagram is ready." });
      } else {
        throw new Error("No diagram generated");
      }
    } catch (error) {
      console.error("Error generating visual:", error);
      toast({ title: "Error", description: "Failed to generate visual", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const getNodeStyles = (type: string) => {
    switch (type) {
      case "main":
        return "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-primary shadow-lg scale-105";
      case "sub":
        return "bg-gradient-to-br from-secondary to-secondary/80 text-secondary-foreground border-secondary";
      case "detail":
        return "bg-gradient-to-br from-muted to-muted/80 text-muted-foreground border-muted-foreground/20";
      default:
        return "bg-card text-card-foreground border-border";
    }
  };

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Visuals Generator</h1>
          <p className="text-muted-foreground">Create visual diagrams and flowcharts for better understanding</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 gradient-card shadow-card">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Image className="w-6 h-6" />
              Create Visual Diagram
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Topic</label>
                <Input
                  placeholder="e.g., Cell Structure, Water Cycle, Algorithm Flow..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Details (optional)</label>
                <Textarea
                  placeholder="Add specific details or concepts you want visualized..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>
              <Button onClick={generateVisuals} disabled={loading || !topic} className="w-full gap-2">
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Creating Diagram...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Visual Diagram
                  </>
                )}
              </Button>
            </div>
          </Card>

          <Card className="p-6 gradient-card shadow-card">
            <h2 className="text-2xl font-bold mb-4">Visual Diagram</h2>
            {nodes.length > 0 ? (
              <div className="space-y-4 overflow-y-auto max-h-[500px] p-4">
                {nodes.map((node, index) => (
                  <div key={node.id} className="flex flex-col items-center">
                    <div 
                      className={`w-full max-w-md p-4 rounded-xl border-2 transition-all duration-300 hover:scale-102 ${getNodeStyles(node.type)}`}
                    >
                      <h3 className="font-bold text-lg mb-1">{node.title}</h3>
                      <p className="text-sm opacity-90">{node.description}</p>
                    </div>
                    {index < nodes.length - 1 && (
                      <div className="flex flex-col items-center py-2">
                        <div className="w-0.5 h-4 bg-border" />
                        <ArrowDown className="w-5 h-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Image className="w-16 h-16 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">
                  Generated visual diagrams will appear here
                </p>
                <p className="text-sm text-muted-foreground/70 mt-2">
                  Enter a topic and click generate to create a flowchart
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VisualsGenerator;
