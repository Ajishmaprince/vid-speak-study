import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { HelpCircle, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const QAGenerator = () => {
  const [content, setContent] = useState("");
  const [numQuestions, setNumQuestions] = useState(5);
  const [questions, setQuestions] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateQA = async () => {
    if (!content) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("chat", {
        body: {
          messages: [
            {
              role: "user",
              content: `Generate ${numQuestions} practice questions and answers based on this content: ${content}. Format as Q1: [question] A1: [answer], etc.`
            }
          ]
        }
      });

      if (error) throw error;
      setQuestions(data.message);
      toast({ title: "Q&A Generated!", description: `${numQuestions} questions created.` });
    } catch (error) {
      toast({ title: "Error", description: "Failed to generate Q&A", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Q&A Generator</h1>
          <p className="text-muted-foreground">Generate practice questions from your study material</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 gradient-card shadow-card">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <HelpCircle className="w-6 h-6" />
              Input Content
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Study Material</label>
                <Textarea
                  placeholder="Paste your notes or topic content here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={8}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Number of Questions</label>
                <Input
                  type="number"
                  min="1"
                  max="20"
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(parseInt(e.target.value) || 5)}
                />
              </div>
              <Button onClick={generateQA} disabled={loading} className="w-full gap-2">
                <Sparkles className="w-4 h-4" />
                {loading ? "Generating..." : "Generate Q&A"}
              </Button>
            </div>
          </Card>

          <Card className="p-6 gradient-card shadow-card">
            <h2 className="text-2xl font-bold mb-4">Practice Questions</h2>
            {questions ? (
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap text-sm">{questions}</pre>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Generated questions and answers will appear here
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default QAGenerator;
