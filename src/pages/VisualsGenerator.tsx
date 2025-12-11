import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Image, Sparkles, Download, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import mermaid from "mermaid";

const VisualsGenerator = () => {
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [mermaidCode, setMermaidCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const mermaidRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'loose',
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: 'basis'
      }
    });
  }, []);

  useEffect(() => {
    const renderDiagram = async () => {
      if (mermaidRef.current && mermaidCode) {
        try {
          const uniqueId = `mermaid-${Date.now()}`;
          const { svg } = await mermaid.render(uniqueId, mermaidCode);
          mermaidRef.current.innerHTML = svg;
        } catch (error) {
          console.error("Mermaid rendering error:", error);
          // Show the raw code if rendering fails
          mermaidRef.current.innerHTML = `<pre class="text-sm text-muted-foreground p-4 bg-muted rounded">${mermaidCode}</pre>`;
        }
      }
    };
    renderDiagram();
  }, [mermaidCode]);

  const generateVisuals = async () => {
    if (!topic) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-flowchart", {
        body: {
          topic,
          text: description || topic
        }
      });

      if (error) throw error;
      
      if (data?.mermaidCode) {
        setMermaidCode(data.mermaidCode);
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

  const downloadSVG = () => {
    const svgElement = mermaidRef.current?.querySelector('svg');
    if (svgElement) {
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const blob = new Blob([svgData], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${topic || 'diagram'}.svg`;
      link.click();
      URL.revokeObjectURL(url);
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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Visual Diagram</h2>
              {mermaidCode && (
                <Button variant="outline" size="sm" onClick={downloadSVG} className="gap-2">
                  <Download className="w-4 h-4" />
                  Download SVG
                </Button>
              )}
            </div>
            {mermaidCode ? (
              <div className="overflow-x-auto bg-card/50 p-4 rounded-lg border min-h-[300px]">
                <div ref={mermaidRef} className="mermaid flex justify-center" />
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
