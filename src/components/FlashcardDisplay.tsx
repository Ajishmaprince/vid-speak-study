import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, RotateCw } from "lucide-react";

interface Flashcard {
  question: string;
  answer: string;
}

interface FlashcardDisplayProps {
  flashcards: Flashcard[];
}

export const FlashcardDisplay = ({ flashcards }: FlashcardDisplayProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (!flashcards || flashcards.length === 0) {
    return null;
  }

  const currentCard = flashcards[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Flashcard {currentIndex + 1} of {flashcards.length}
        </h3>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsFlipped(!isFlipped)}
          className="gap-2"
        >
          <RotateCw className="w-4 h-4" />
          Flip
        </Button>
      </div>

      <Card 
        className="relative h-64 cursor-pointer transition-all duration-300 hover:shadow-lg"
        onClick={() => setIsFlipped(!isFlipped)}
        style={{ perspective: "1000px" }}
      >
        <div
          className="absolute inset-0 transition-transform duration-500"
          style={{
            transformStyle: "preserve-3d",
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 p-6 flex flex-col items-center justify-center text-center"
            style={{ backfaceVisibility: "hidden" }}
          >
            <p className="text-sm text-muted-foreground mb-2">Question</p>
            <p className="text-xl font-semibold">{currentCard.question}</p>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 p-6 flex flex-col items-center justify-center text-center bg-primary/5"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <p className="text-sm text-muted-foreground mb-2">Answer</p>
            <p className="text-lg">{currentCard.answer}</p>
          </div>
        </div>
      </Card>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={flashcards.length <= 1}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Previous
        </Button>
        <Button
          variant="outline"
          onClick={handleNext}
          disabled={flashcards.length <= 1}
        >
          Next
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};
