import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, MessageSquare, FileText, Trophy, Mic } from "lucide-react";
import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import heroImage from "@/assets/hero-study.png";
import chatFeature from "@/assets/chat-feature.png";
import notesFeature from "@/assets/notes-feature.png";
import quizFeature from "@/assets/quiz-feature.png";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <div className="text-center py-12 px-4 pt-24">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-center">
          <div className="text-left">
            <div className="inline-block mb-6 px-4 py-2 bg-primary/10 rounded-full animate-fade-in">
              <span className="text-primary font-medium">AI-Powered Learning Assistant</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent animate-fade-in">
              Your AI Study Partner
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Get instant help with your studies through AI chat, voice interaction, smart note summaries, and interactive games
            </p>
            <div className="flex gap-4 flex-wrap">
              <Link to="/chat">
                <Button size="lg" className="gap-2 hover-scale">
                  <MessageSquare className="w-5 h-5" />
                  Start Learning Now
                </Button>
              </Link>
              <Link to="/upload">
                <Button size="lg" variant="outline" className="gap-2 hover-scale">
                  <FileText className="w-5 h-5" />
                  Upload Notes
                </Button>
              </Link>
            </div>
          </div>
          <div className="animate-scale-in">
            <img src={heroImage} alt="AI Study Assistant" className="rounded-2xl shadow-glow" />
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto px-4 py-12">
        <Link to="/chat">
          <Card className="p-6 gradient-card shadow-card hover-scale cursor-pointer h-full transition-all">
            <div className="mb-4 overflow-hidden rounded-lg">
              <img src={chatFeature} alt="AI Chat" className="w-full h-32 object-cover" />
            </div>
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Brain className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">AI Chat Assistant</h3>
            <p className="text-muted-foreground">
              Ask questions and get instant AI-powered explanations with voice support
            </p>
          </Card>
        </Link>

        <Link to="/upload">
          <Card className="p-6 gradient-card shadow-card hover-scale cursor-pointer h-full transition-all">
            <div className="mb-4 overflow-hidden rounded-lg">
              <img src={notesFeature} alt="Smart Notes" className="w-full h-32 object-cover" />
            </div>
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Smart Summaries</h3>
            <p className="text-muted-foreground">
              Upload PDF, PPT, or text files and get AI summaries with video tutorials
            </p>
          </Card>
        </Link>

        <Link to="/games">
          <Card className="p-6 gradient-card shadow-card hover-scale cursor-pointer h-full transition-all">
            <div className="mb-4 overflow-hidden rounded-lg">
              <img src={quizFeature} alt="Interactive Games" className="w-full h-32 object-cover" />
            </div>
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Trophy className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Interactive Games</h3>
            <p className="text-muted-foreground">
              Play quizzes and puzzles to test your knowledge and earn rewards
            </p>
          </Card>
        </Link>

        <Card className="p-6 gradient-card shadow-card hover-scale cursor-pointer h-full transition-all">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Mic className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-xl font-bold mb-2">Voice Learning</h3>
          <p className="text-muted-foreground">
            Speak your questions and listen to AI responses - hands-free learning
          </p>
        </Card>
      </div>
    </div>
  );
};

export default Index;
