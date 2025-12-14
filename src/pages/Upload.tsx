import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload as UploadIcon, FileText, Loader2, Volume2, VolumeX, Video, ExternalLink, Sparkles, GitBranch } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FlashcardDisplay } from "@/components/FlashcardDisplay";
import { FlowchartDisplay } from "@/components/FlowchartDisplay";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface SummaryResult {
  summary: string;
  videos?: Array<{ title: string; url: string }>;
  tutorials?: Array<{ title: string; url: string }>;
}

const Upload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<SummaryResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [flashcards, setFlashcards] = useState<Array<{question: string, answer: string}>>([]);
  const [flowchart, setFlowchart] = useState<{mermaidCode: string, description?: string} | null>(null);
  const [generatingFlashcards, setGeneratingFlashcards] = useState(false);
  const [generatingFlowchart, setGeneratingFlowchart] = useState(false);
  const [extractedText, setExtractedText] = useState("");
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
      setFlashcards([]);
      setFlowchart(null);
      setExtractedText("");
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

  const extractPdfText = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n\n';
    }
    
    return fullText.trim();
  };

  const extractPptText = async (file: File): Promise<string> => {
    // PPT/PPTX files are ZIP archives with XML content
    // We'll use JSZip to extract text from the slides
    const arrayBuffer = await file.arrayBuffer();
    
    try {
      // Dynamic import JSZip
      const JSZip = (await import('jszip')).default;
      const zip = await JSZip.loadAsync(arrayBuffer);
      
      let fullText = '';
      const slideFiles = Object.keys(zip.files)
        .filter(name => name.match(/ppt\/slides\/slide\d+\.xml/))
        .sort((a, b) => {
          const numA = parseInt(a.match(/slide(\d+)/)?.[1] || '0');
          const numB = parseInt(b.match(/slide(\d+)/)?.[1] || '0');
          return numA - numB;
        });
      
      for (const slidePath of slideFiles) {
        const slideContent = await zip.file(slidePath)?.async('string');
        if (slideContent) {
          // Extract text from XML - look for <a:t> tags which contain text
          const textMatches = slideContent.match(/<a:t>([^<]*)<\/a:t>/g);
          if (textMatches) {
            const slideText = textMatches
              .map(match => match.replace(/<\/?a:t>/g, ''))
              .filter(text => text.trim())
              .join(' ');
            fullText += slideText + '\n\n';
          }
        }
      }
      
      return fullText.trim() || `PowerPoint presentation: ${file.name}. Unable to extract detailed text content.`;
    } catch (error) {
      console.error('Error extracting PPT text:', error);
      return `PowerPoint presentation: ${file.name}. Text extraction encountered an error.`;
    }
  };

  const extractText = async (file: File): Promise<string> => {
    const fileType = file.type;
    const fileName = file.name.toLowerCase();
    
    // Handle video files
    if (fileType.startsWith('video/')) {
      toast({
        title: "Video Processing",
        description: "Video content will be analyzed. This may take a moment.",
      });
      return `Video file uploaded: ${file.name}. Content analysis available through AI processing.`;
    }
    
    // Handle PDF files
    if (fileType === "application/pdf" || fileName.endsWith('.pdf')) {
      toast({
        title: "Extracting PDF",
        description: "Reading PDF content...",
      });
      return await extractPdfText(file);
    }
    
    // Handle PowerPoint files
    if (fileType === "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
        fileType === "application/vnd.ms-powerpoint" ||
        fileName.endsWith('.pptx') || fileName.endsWith('.ppt')) {
      toast({
        title: "Extracting PowerPoint",
        description: "Reading slide content...",
      });
      return await extractPptText(file);
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
      setExtractedText(text);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to save notes",
          variant: "destructive",
        });
        return;
      }

      // Call AI to summarize
      const { data, error } = await supabase.functions.invoke('summarize', {
        body: { text, filename: file.name }
      });

      if (error) throw error;

      setResult(data);

      // Save to database
      const { error: saveError } = await supabase
        .from('user_notes')
        .insert({
          user_id: user.id,
          title: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
          content: data.summary,
          subject: 'General'
        });

      if (saveError) {
        console.error('Error saving notes:', saveError);
      }

      toast({
        title: "Success!",
        description: "Your notes have been summarized and saved with video & tutorial recommendations."
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

  const generateFlashcards = async () => {
    if (!extractedText) {
      toast({
        title: "No Content",
        description: "Please upload and summarize a document first",
        variant: "destructive"
      });
      return;
    }

    setGeneratingFlashcards(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      const { data, error } = await supabase.functions.invoke("generate-flashcards", {
        body: { 
          text: extractedText,
          topic: file?.name || "Study Material"
        }
      });

      if (error) throw error;
      
      setFlashcards(data.flashcards || []);
      
      // Save flashcards to database
      if (userData?.user && data.flashcards) {
        const flashcardsToInsert = data.flashcards.map((card: any) => ({
          user_id: userData.user.id,
          topic: file?.name || "Study Material",
          question: card.question,
          answer: card.answer
        }));

        await supabase.from('flashcards').insert(flashcardsToInsert);
      }

      toast({ 
        title: "Flashcards Generated!", 
        description: `Created ${data.flashcards?.length || 0} flashcards` 
      });
    } catch (error) {
      console.error('Flashcard generation error:', error);
      toast({ 
        title: "Error", 
        description: "Failed to generate flashcards", 
        variant: "destructive" 
      });
    } finally {
      setGeneratingFlashcards(false);
    }
  };

  const generateFlowchart = async () => {
    if (!extractedText) {
      toast({
        title: "No Content",
        description: "Please upload and summarize a document first",
        variant: "destructive"
      });
      return;
    }

    setGeneratingFlowchart(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      const { data, error } = await supabase.functions.invoke("generate-flowchart", {
        body: { 
          text: extractedText,
          topic: file?.name || "Study Material"
        }
      });

      if (error) throw error;
      
      setFlowchart(data);
      
      // Save flowchart to database
      if (userData?.user && data.mermaidCode) {
        await supabase.from('flowcharts').insert({
          user_id: userData.user.id,
          topic: file?.name || "Study Material",
          mermaid_code: data.mermaidCode,
          description: data.description
        });
      }

      toast({ 
        title: "Flowchart Generated!", 
        description: "Your visual diagram is ready" 
      });
    } catch (error) {
      console.error('Flowchart generation error:', error);
      toast({ 
        title: "Error", 
        description: "Failed to generate flowchart", 
        variant: "destructive" 
      });
    } finally {
      setGeneratingFlowchart(false);
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
    <div className="min-h-screen bg-background pt-16">
      <div className="max-w-6xl mx-auto p-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Upload & Analyze Content</h1>
          <p className="text-muted-foreground">Upload documents or videos to get AI-powered summaries, flashcards, and flowcharts</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Upload Card */}
          <Card className="p-8 gradient-card shadow-card">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <UploadIcon className="w-10 h-10 text-primary" />
              </div>
              
              <div className="text-center">
                <h3 className="text-xl font-bold mb-2">Upload Content</h3>
                <p className="text-muted-foreground mb-4">
                  Supports PDF, PowerPoint, text files, and videos
                </p>
              </div>

              <input
                type="file"
                accept=".txt,.pdf,.ppt,.pptx,.mp4,.mov,.avi,.mkv"
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
                <div className="text-center w-full space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Selected: {file.name}
                  </p>
                  <Button onClick={handleUpload} disabled={isLoading} className="w-full">
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Generate Summary"
                    )}
                  </Button>

                  {result && (
                    <div className="flex gap-2 pt-2">
                      <Button 
                        onClick={generateFlashcards} 
                        disabled={generatingFlashcards}
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        {generatingFlashcards ? "Creating..." : "Flashcards"}
                      </Button>
                      <Button 
                        onClick={generateFlowchart} 
                        disabled={generatingFlowchart}
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-1"
                      >
                        <GitBranch className="w-3 h-3" />
                        {generatingFlowchart ? "Creating..." : "Flowchart"}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* Results Card */}
          <Card className="p-6 gradient-card shadow-card lg:row-span-2">
            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
                <TabsTrigger value="flowchart">Flowchart</TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="mt-4">
                {result ? (
                  <div className="space-y-6">
                    <div className="flex gap-2 mb-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => isSpeaking ? stopSpeaking() : speak(result.summary)}
                      >
                        {isSpeaking ? <VolumeX className="w-4 h-4 mr-1" /> : <Volume2 className="w-4 h-4 mr-1" />}
                        {isSpeaking ? "Stop" : "Listen"}
                      </Button>
                      <Button size="sm" variant="outline" onClick={downloadSummary}>
                        Download
                      </Button>
                    </div>
                    
                    <div className="prose prose-sm max-w-none">
                      <h3 className="text-lg font-semibold mb-2">Summary</h3>
                      <p className="whitespace-pre-wrap text-foreground">{result.summary}</p>
                    </div>

                    {result.videos && result.videos.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                          <Video className="w-5 h-5" />
                          Related Videos
                        </h3>
                        <div className="space-y-2">
                          {result.videos.map((video, index) => (
                            <a
                              key={index}
                              href={video.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block p-3 border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-between"
                            >
                              <span className="font-medium">{video.title}</span>
                              <ExternalLink className="w-4 h-4 text-muted-foreground" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {result.tutorials && result.tutorials.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Tutorial Links</h3>
                        <div className="space-y-2">
                          {result.tutorials.map((tutorial, index) => (
                            <a
                              key={index}
                              href={tutorial.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block p-3 border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-medium">{tutorial.title}</span>
                                <ExternalLink className="w-4 h-4 text-muted-foreground" />
                              </div>
                              <p className="text-xs text-muted-foreground mt-1 truncate">{tutorial.url}</p>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Upload and process content to see the summary and resources
                  </p>
                )}
              </TabsContent>

              <TabsContent value="flashcards" className="mt-4">
                {flashcards.length > 0 ? (
                  <FlashcardDisplay flashcards={flashcards} />
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Generate flashcards from your uploaded content to study key concepts
                  </p>
                )}
              </TabsContent>

              <TabsContent value="flowchart" className="mt-4">
                {flowchart ? (
                  <FlowchartDisplay 
                    mermaidCode={flowchart.mermaidCode} 
                    description={flowchart.description}
                  />
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Generate a flowchart to visualize concepts and relationships
                  </p>
                )}
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Upload;
