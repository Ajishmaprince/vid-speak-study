import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, Mic, MicOff, Volume2, VolumeX, Video } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { YouTubeEmbed } from "@/components/YouTubeEmbed";

interface Message {
  role: "user" | "assistant";
  content: string;
  videoQuery?: string;
}

import { Navigation } from "@/components/Navigation";

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your AI study buddy. Ask me anything about your studies, or use the microphone to speak your question!"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showVideo, setShowVideo] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
        toast({
          title: "Speech Recognition Error",
          description: "Could not recognize speech. Please try again.",
          variant: "destructive"
        });
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [toast]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast({
        title: "Not Supported",
        description: "Speech recognition is not supported in your browser.",
        variant: "destructive"
      });
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      // Stop any ongoing speech
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

  const extractKeywords = (text: string): string => {
    // Extract meaningful keywords for video search
    const commonWords = ['what', 'is', 'the', 'a', 'an', 'how', 'why', 'when', 'where', 'can', 'you', 'explain', 'me', 'about'];
    const words = text.toLowerCase().split(' ').filter(word => 
      word.length > 3 && !commonWords.includes(word)
    );
    return words.slice(0, 3).join(' ');
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('chat', {
        body: { 
          messages: [...messages, userMessage].map(m => ({ 
            role: m.role, 
            content: m.content 
          }))
        }
      });

      if (error) throw error;

      const videoQuery = extractKeywords(input);
      const assistantMessage: Message = {
        role: "assistant",
        content: data.message,
        videoQuery
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Automatically speak the response
      speak(data.message);
    } catch (error: any) {
      console.error('Chat error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to get response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-20">
      <Navigation />
      <div className="max-w-4xl mx-auto p-4">
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-foreground">AI Study Chat</h1>
          <p className="text-muted-foreground">Ask questions, use voice, get video explanations</p>
        </div>

        <Card className="h-[600px] flex flex-col shadow-card">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div key={index}>
                <div
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "gradient-card shadow-card"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
                
                {/* Show video and audio buttons for assistant messages */}
                {message.role === "assistant" && (
                  <div className="flex gap-2 mt-2 ml-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => isSpeaking ? stopSpeaking() : speak(message.content)}
                    >
                      {isSpeaking ? <VolumeX className="w-4 h-4 mr-1" /> : <Volume2 className="w-4 h-4 mr-1" />}
                      {isSpeaking ? "Stop" : "Listen"}
                    </Button>
                    {message.videoQuery && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowVideo(message.videoQuery!)}
                      >
                        <Video className="w-4 h-4 mr-1" />
                        Watch Video
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="gradient-card rounded-2xl px-4 py-3 shadow-card">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Button
                size="icon"
                variant={isListening ? "default" : "outline"}
                onClick={toggleListening}
                className={isListening ? "animate-pulse" : ""}
              >
                {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </Button>
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type or speak your question..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Video Modal */}
        {showVideo && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowVideo(null)}>
            <div className="bg-card rounded-lg p-6 max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Video Explanation</h3>
                <Button variant="ghost" onClick={() => setShowVideo(null)}>Close</Button>
              </div>
              <YouTubeEmbed query={showVideo} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
