import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Trophy, Star, Award, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);
  const { toast } = useToast();

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
      }
    }, 1500);
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowResult(false);
    setSelectedAnswer(null);
    setAnswered(false);
  };

  return (
    <div className="min-h-screen bg-background pl-64">
      <div className="max-w-4xl mx-auto p-4">
        <div className="mb-6 text-center">
          <img src={quizImage} alt="Quiz Games" className="w-32 h-32 mx-auto mb-4 animate-scale-in" />
          <h1 className="text-3xl font-bold text-foreground">Interactive Learning Games</h1>
          <p className="text-muted-foreground">Test your knowledge and earn rewards</p>
          
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
        </div>

        {!showResult ? (
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
