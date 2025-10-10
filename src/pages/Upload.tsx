import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload as UploadIcon, FileText, Loader2, Volume2, VolumeX, Video, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { YouTubeEmbed } from "@/components/YouTubeEmbed";

interface SummaryResult {
  summary: string;
  videos?: string[];
  tutorials?: Array<{ title: string; url: string }>;
}

const Upload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<SummaryResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showVideo, setShowVideo] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
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
    // For PDF and other documents, use the document parsing tool
    if (file.type === "application/pdf" || 
        file.type === "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
        file.type === "application/vnd.ms-powerpoint") {
      
      // Convert file to base64 for parsing
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const arrayBuffer = e.target?.result as ArrayBuffer;
            const uint8Array = new Uint8Array(arrayBuffer);
            let binary = '';
            for (let i = 0; i < uint8Array.byteLength; i++) {
              binary += String.fromCharCode(uint8Array[i]);
            }
            const base64 = btoa(binary);
            
            // For now, we'll use a simple text extraction
            // In a real app, you'd use a proper PDF parser
            resolve("Content extracted from document. Please implement proper PDF/PPT parsing.");
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
      });
    }
    
    // For text files
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
      const text = await extractText(file);

      // Call AI to summarize
      const { data, error } = await supabase.functions.invoke('summarize', {
        body: { text, filename: file.name }
      });

      if (error) throw error;

      setResult(data);
      toast({
        title: "Success!",
        description: "Your notes have been summarized with video tutorials."
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
    if (!result) return;
    const blob = new Blob([result.summary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'summary.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background pl-64">
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
                  Supports PDF, PowerPoint, and text files
                </p>
              </div>

              <input
                type="file"
                accept=".txt,.pdf,.ppt,.pptx"
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
          {result && (
            <div className="space-y-6">
              <Card className="p-6 gradient-card shadow-card animate-fade-in">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold">AI Summary</h3>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => isSpeaking ? stopSpeaking() : speak(result.summary)}
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
                  <p className="whitespace-pre-wrap text-foreground">{result.summary}</p>
                </div>
              </Card>

              {/* Video Tutorials */}
              {result.videos && result.videos.length > 0 && (
                <Card className="p-6 gradient-card shadow-card animate-fade-in">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Video className="w-6 h-6 text-primary" />
                    Video Tutorials
                  </h3>
                  <div className="grid gap-4">
                    {result.videos.map((videoQuery, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="justify-start"
                        onClick={() => setShowVideo(videoQuery)}
                      >
                        <Video className="w-4 h-4 mr-2" />
                        Watch: {videoQuery}
                      </Button>
                    ))}
                  </div>
                </Card>
              )}

              {/* Online Tutorials */}
              {result.tutorials && result.tutorials.length > 0 && (
                <Card className="p-6 gradient-card shadow-card animate-fade-in">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <ExternalLink className="w-6 h-6 text-primary" />
                    Recommended Tutorials
                  </h3>
                  <div className="space-y-3">
                    {result.tutorials.map((tutorial, index) => (
                      <a
                        key={index}
                        href={tutorial.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-3 border rounded-lg hover:bg-primary/5 transition-colors"
                      >
                        <p className="font-medium story-link">{tutorial.title}</p>
                        <p className="text-sm text-muted-foreground">{tutorial.url}</p>
                      </a>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* Video Modal */}
          {showVideo && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowVideo(null)}>
              <div className="bg-card rounded-lg p-6 max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold">Video Tutorial</h3>
                  <Button variant="ghost" onClick={() => setShowVideo(null)}>Close</Button>
                </div>
                <YouTubeEmbed query={showVideo} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Upload;
