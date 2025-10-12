import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { FileEdit, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const NotesGenerator = () => {
  const [topic, setTopic] = useState("");
  const [detail, setDetail] = useState("");
  const [generatedNotes, setGeneratedNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateNotes = async () => {
    if (!topic) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("chat", {
        body: {
          messages: [
            {
              role: "user",
              content: `Generate comprehensive study notes about: ${topic}. ${detail ? `Focus on: ${detail}` : ""} Include key concepts, definitions, and examples. Format with clear headings and bullet points.`
            }
          ]
        }
      });

      if (error) throw error;
      setGeneratedNotes(data.message);
      toast({ title: "Notes Generated!", description: "Your study notes are ready." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to generate notes", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Notes Generator</h1>
          <p className="text-muted-foreground">Generate comprehensive study notes on any topic</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 gradient-card shadow-card">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <FileEdit className="w-6 h-6" />
              Input
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Topic</label>
                <Input
                  placeholder="e.g., Photosynthesis, Newton's Laws..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Additional Details (Optional)</label>
                <Textarea
                  placeholder="Specify what aspects to focus on..."
                  value={detail}
                  onChange={(e) => setDetail(e.target.value)}
                  rows={4}
                />
              </div>
              <Button onClick={generateNotes} disabled={loading} className="w-full gap-2">
                <Sparkles className="w-4 h-4" />
                {loading ? "Generating..." : "Generate Notes"}
              </Button>
            </div>
          </Card>

          <Card className="p-6 gradient-card shadow-card">
            <h2 className="text-2xl font-bold mb-4">Generated Notes</h2>
            {generatedNotes ? (
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap text-sm">{generatedNotes}</pre>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Your generated notes will appear here
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NotesGenerator;
