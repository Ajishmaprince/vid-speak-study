import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload as UploadIcon, FileText, Loader2, Volume2, VolumeX } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

import { Navigation } from "@/components/Navigation";

const Upload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [summary, setSummary] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setSummary("");
    }
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const extractText = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        resolve(text);
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsLoading(true);
    try {
      let text = "";
      
      if (file.type === "text/plain") {
        text = await extractText(file);
      } else {
        throw new Error("Please upload a text file (.txt)");
      }

      // Call AI to summarize
      const { data, error } = await supabase.functions.invoke('summarize', {
        body: { text }
      });

      if (error) throw error;

      setSummary(data.summary);
      toast({
        title: "Success!",
        description: "Your notes have been summarized."
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to process file. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadSummary = () => {
    const blob = new Blob([summary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'summary.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background pt-20">
      <Navigation />
      <div className="max-w-4xl mx-auto p-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Upload & Summarize Notes</h1>
          <p className="text-muted-foreground">Upload your study notes and get AI-powered summaries</p>
        </div>

        <div className="grid gap-6">
          {/* Upload Card */}
          <Card className="p-8 gradient-card shadow-card">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <UploadIcon className="w-10 h-10 text-primary" />
              </div>
              
              <div className="text-center">
                <h3 className="text-xl font-bold mb-2">Upload Your Notes</h3>
                <p className="text-muted-foreground mb-4">
                  Supports text files (.txt)
                </p>
              </div>

              <input
                type="file"
                accept=".txt"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              
              <label htmlFor="file-upload">
                <Button variant="outline" className="cursor-pointer" asChild>
                  <span>
                    <FileText className="w-4 h-4 mr-2" />
                    Choose File
                  </span>
                </Button>
              </label>

              {file && (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    Selected: {file.name}
                  </p>
                  <Button onClick={handleUpload} disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Generate Summary"
                    )}
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {/* Summary Card */}
          {summary && (
            <Card className="p-6 gradient-card shadow-card">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">AI Summary</h3>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => isSpeaking ? stopSpeaking() : speak(summary)}
                  >
                    {isSpeaking ? <VolumeX className="w-4 h-4 mr-1" /> : <Volume2 className="w-4 h-4 mr-1" />}
                    {isSpeaking ? "Stop" : "Listen"}
                  </Button>
                  <Button size="sm" onClick={downloadSummary}>
                    Download
                  </Button>
                </div>
              </div>
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap text-foreground">{summary}</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Upload;
