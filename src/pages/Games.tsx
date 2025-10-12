import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Trophy, Star, Award, Sparkles, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import quizImage from "@/assets/quiz-feature.png";

interface Question {
  question: string;
  options: string[];
  correct: number;
  topic: string;
}

const sampleQuestions: Question[] = [
  {
    question: "What is the capital of France?",
    options: ["London", "Berlin", "Paris", "Madrid"],
    correct: 2,
    topic: "Geography"
  },
  {
    question: "What is 2 + 2?",
    options: ["3", "4", "5", "6"],
    correct: 1,
    topic: "Mathematics"
  },
  {
    question: "Who wrote Romeo and Juliet?",
    options: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"],
    correct: 1,
    topic: "Literature"
  },
  {
    question: "What is the chemical symbol for water?",
    options: ["O2", "H2O", "CO2", "NaCl"],
    correct: 1,
    topic: "Chemistry"
  }
];

const Games = () => {
  const [customTopic, setCustomTopic] = useState<string>("");
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user);
    });
  }, []);

  const handleAnswer = (optionIndex: number) => {
    if (answered) return;
    
    setSelectedAnswer(optionIndex);
    setAnswered(true);

    if (optionIndex === sampleQuestions[currentQuestion].correct) {
      setScore(score + 1);
      const points = 10;
      setTotalPoints(totalPoints + points);
      toast({
        title: "Correct! 🎉",
        description: `+${points} points`,
      });
    } else {
      toast({
        title: "Wrong Answer",
        description: "Keep trying!",
        variant: "destructive"
      });
    }

    setTimeout(() => {
      if (currentQuestion < sampleQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setAnswered(false);
      } else {
        setShowResult(true);
        saveQuizCompletion();
      }
    }, 1500);
  };

  const saveQuizCompletion = async () => {
    if (!user) return;
    
    try {
      await supabase.from('quiz_completions').insert({
        user_id: user.id,
        quiz_title: `${selectedTopic} Quiz`,
        score: score + 1,
        total_questions: sampleQuestions.length
      });
    } catch (error) {
      console.error('Error saving quiz completion:', error);
    }
  };

  const startQuiz = () => {
    if (!customTopic.trim()) {
      toast({
        title: "Topic Required",
        description: "Please enter a topic for the quiz",
        variant: "destructive"
      });
      return;
    }
    setSelectedTopic(customTopic.trim());
    setQuizStarted(true);
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowResult(false);
    setSelectedAnswer(null);
    setAnswered(false);
    setQuizStarted(false);
    setSelectedTopic("");
    setCustomTopic("");
  };

  return (
    <div className="min-h-screen bg-background pl-0 md:pl-0">
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <div className="mb-8 text-center">
          <img src={quizImage} alt="Quiz Games" className="w-32 h-32 mx-auto mb-4 animate-scale-in" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-2">Interactive Learning Games</h1>
          <p className="text-muted-foreground">Test your knowledge and earn rewards</p>
          
          {quizStarted && (
            <div className="flex gap-4 justify-center mt-4">
              <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
                <Trophy className="w-5 h-5 text-primary" />
                <span className="font-bold">{totalPoints} Points</span>
              </div>
              <div className="flex items-center gap-2 bg-accent/10 px-4 py-2 rounded-full">
                <Star className="w-5 h-5 text-accent" />
                <span className="font-bold">{score} Correct</span>
              </div>
            </div>
          )}
        </div>

        {!quizStarted ? (
          <Card className="p-8 md:p-12 gradient-card shadow-glow border-2 border-primary/20 animate-fade-in max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <BookOpen className="w-20 h-20 text-primary mb-6 mx-auto" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Enter Your Quiz Topic
              </h2>
              <p className="text-muted-foreground text-lg">
                Whether you're preparing for NEET, JEE, school exams, or college subjects - enter any topic to start your personalized quiz!
              </p>
            </div>
            
            <div className="space-y-6">
              <div>
                <Input
                  type="text"
                  placeholder="e.g., Organic Chemistry, Newton's Laws, World War II, Data Structures..."
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && startQuiz()}
                  className="h-14 text-lg border-2 border-primary/30 focus:border-primary"
                />
                <p className="text-sm text-muted-foreground mt-3 text-center">
                  💡 Examples: Physics for JEE, Human Anatomy for NEET, JavaScript for Web Dev, Linear Algebra
                </p>
              </div>
              
              <Button 
                onClick={startQuiz} 
                size="lg" 
                className="w-full h-14 text-lg shadow-glow gap-2 group hover:scale-105 transition-all"
              >
                <Trophy className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                Start Quiz
              </Button>
            </div>
          </Card>
        ) : !showResult ? (
          <Card className="p-8 gradient-card shadow-card animate-fade-in">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-medium bg-primary/10 px-3 py-1 rounded-full">
                  {sampleQuestions[currentQuestion].topic}
                </span>
                <span className="text-sm text-muted-foreground">
                  Question {currentQuestion + 1} of {sampleQuestions.length}
                </span>
              </div>
              
              <div className="w-full bg-muted rounded-full h-2 mb-4">
                <div 
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${((currentQuestion + 1) / sampleQuestions.length) * 100}%` }}
                />
              </div>

              <h2 className="text-2xl font-bold mb-6">
                {sampleQuestions[currentQuestion].question}
              </h2>

              <div className="space-y-3">
                {sampleQuestions[currentQuestion].options.map((option, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className={`w-full justify-start text-left p-4 h-auto transition-all ${
                      answered
                        ? index === sampleQuestions[currentQuestion].correct
                          ? "bg-green-500/20 border-green-500"
                          : selectedAnswer === index
                          ? "bg-red-500/20 border-red-500"
                          : ""
                        : "hover:bg-primary/10"
                    }`}
                    onClick={() => handleAnswer(index)}
                    disabled={answered}
                  >
                    <span className="font-bold mr-3">{String.fromCharCode(65 + index)}.</span>
                    {option}
                  </Button>
                ))}
              </div>
            </div>
          </Card>
        ) : (
          <Card className="p-8 gradient-card shadow-card text-center animate-scale-in">
            <div className="mb-6">
              <Award className="w-24 h-24 mx-auto text-primary mb-4" />
              <h2 className="text-3xl font-bold mb-2">Quiz Complete!</h2>
              <p className="text-xl text-muted-foreground mb-6">
                You scored {score} out of {sampleQuestions.length}
              </p>
              
              <div className="flex gap-4 justify-center mb-6">
                <div className="bg-primary/10 px-6 py-4 rounded-lg">
                  <Sparkles className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold">{totalPoints}</p>
                  <p className="text-sm text-muted-foreground">Total Points</p>
                </div>
                <div className="bg-accent/10 px-6 py-4 rounded-lg">
                  <Trophy className="w-8 h-8 text-accent mx-auto mb-2" />
                  <p className="text-2xl font-bold">{Math.round((score / sampleQuestions.length) * 100)}%</p>
                  <p className="text-sm text-muted-foreground">Accuracy</p>
                </div>
              </div>

              <Button onClick={resetQuiz} size="lg" className="gap-2">
                <Trophy className="w-5 h-5" />
                Play Again
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Games;
