import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, MessageSquare, Upload, Video, Mic, Volume2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Navigation } from "@/components/Navigation";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: "AI Chat Assistant",
      description: "Get instant answers to your study questions with our intelligent chatbot"
    },
    {
      icon: <Mic className="w-8 h-8" />,
      title: "Voice Input",
      description: "Ask questions by speaking - our AI understands your voice"
    },
    {
      icon: <Volume2 className="w-8 h-8" />,
      title: "Audio Explanations",
      description: "Listen to AI-generated explanations with natural text-to-speech"
    },
    {
      icon: <Video className="w-8 h-8" />,
      title: "Video Learning",
      description: "Watch related educational videos for visual understanding"
    },
    {
      icon: <Upload className="w-8 h-8" />,
      title: "Smart Summaries",
      description: "Upload notes and get AI-powered summaries instantly"
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: "Personalized Dashboard",
      description: "Track your learning progress and access past conversations"
    }
  ];

  return (
    <div className="min-h-screen">
      <Navigation />
      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-hero py-20 px-6 mt-16">
        <div className="max-w-6xl mx-auto text-center">
          <div className="animate-float mb-8 inline-block">
            <Brain className="w-20 h-20 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl text-white mb-6">
            Your AI Study Partner
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
            Learn smarter with AI-powered chat, voice interactions, and video explanations
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="text-lg px-8 py-6 shadow-glow hover:scale-105 transition-transform"
            onClick={() => navigate("/chat")}
          >
            Start Learning Now
          </Button>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '0s' }} />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-300/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-background">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl text-center mb-4 text-foreground">
            Everything You Need to Succeed
          </h2>
          <p className="text-center text-muted-foreground mb-12 text-lg">
            Powerful AI tools designed for modern learners
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="p-6 gradient-card shadow-card hover:shadow-glow transition-all duration-300 hover:scale-105 border-border"
              >
                <div className="text-primary mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2 text-card-foreground">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 gradient-hero">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl text-white mb-6">
            Ready to Transform Your Learning?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of students already learning smarter
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="secondary"
              className="text-lg px-8 py-6"
              onClick={() => navigate("/chat")}
            >
              Start Chatting
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 border-white text-white hover:bg-white/10"
              onClick={() => navigate("/upload")}
            >
              Upload Notes
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
