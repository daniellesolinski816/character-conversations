import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Trophy, Loader2, CheckCircle, XCircle, Sparkles, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function ReadingQuiz({ 
  open, 
  onOpenChange, 
  book, 
  currentChapter 
}) {
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);

  const generateQuiz = async () => {
    setLoading(true);
    setQuiz(null);
    setCurrentQuestion(0);
    setScore(0);
    setAnswers([]);
    setSelectedAnswer(null);
    setShowResult(false);

    const chaptersRead = book.chapters?.slice(0, currentChapter + 1) || [];
    const context = chaptersRead.map(c => `${c.title}: ${c.content?.slice(0, 500)}`).join('\n\n');

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Create a reading comprehension quiz for "${book.title}" by ${book.author}.

The reader has read up to chapter ${currentChapter + 1}. Here's what they've read:
${context}

Create 5 multiple choice questions that test:
- Plot comprehension
- Character understanding
- Themes and symbolism
- Key events
- Vocabulary in context

Make questions progressively harder. Each question should have 4 options with only one correct answer.`,
      response_json_schema: {
        type: 'object',
        properties: {
          questions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                question: { type: 'string' },
                options: { type: 'array', items: { type: 'string' } },
                correct_index: { type: 'number' },
                explanation: { type: 'string' }
              }
            }
          }
        }
      }
    });

    setQuiz(response);
    setLoading(false);
  };

  React.useEffect(() => {
    if (open && !quiz && !loading) {
      generateQuiz();
    }
  }, [open]);

  const handleAnswer = (index) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(index);
    const isCorrect = index === quiz.questions[currentQuestion].correct_index;
    if (isCorrect) setScore(s => s + 1);
    setAnswers([...answers, { questionIndex: currentQuestion, answer: index, correct: isCorrect }]);
  };

  const nextQuestion = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(c => c + 1);
      setSelectedAnswer(null);
    } else {
      setShowResult(true);
    }
  };

  const q = quiz?.questions?.[currentQuestion];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-600" />
            Reading Challenge
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-4" />
            <p className="text-slate-500">Generating your quiz...</p>
          </div>
        ) : showResult ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <div className={cn(
              "w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center",
              score >= 4 ? "bg-green-100" : score >= 2 ? "bg-amber-100" : "bg-red-100"
            )}>
              <span className="text-3xl font-bold">
                {score}/{quiz.questions.length}
              </span>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              {score >= 4 ? "Excellent!" : score >= 2 ? "Good job!" : "Keep reading!"}
            </h3>
            <p className="text-slate-500 mb-6">
              {score >= 4 
                ? "You have a great understanding of the story!" 
                : score >= 2 
                  ? "You're following along well." 
                  : "Review the chapters and try again."}
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button onClick={generateQuiz} className="bg-amber-600 hover:bg-amber-700">
                <RotateCcw className="w-4 h-4 mr-2" />
                New Quiz
              </Button>
            </div>
          </motion.div>
        ) : q ? (
          <div className="space-y-6">
            {/* Progress */}
            <div className="flex items-center gap-2">
              {quiz.questions.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-1.5 flex-1 rounded-full transition-colors",
                    i < currentQuestion 
                      ? answers[i]?.correct ? "bg-green-500" : "bg-red-400"
                      : i === currentQuestion 
                        ? "bg-amber-500" 
                        : "bg-slate-200"
                  )}
                />
              ))}
            </div>

            {/* Question */}
            <div>
              <span className="text-xs font-medium text-amber-600 uppercase tracking-wide">
                Question {currentQuestion + 1} of {quiz.questions.length}
              </span>
              <p className="text-lg font-medium text-slate-900 mt-2">{q.question}</p>
            </div>

            {/* Options */}
            <div className="space-y-2">
              {q.options.map((option, idx) => {
                const isSelected = selectedAnswer === idx;
                const isCorrect = q.correct_index === idx;
                const showCorrect = selectedAnswer !== null && isCorrect;
                const showWrong = isSelected && !isCorrect;

                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    disabled={selectedAnswer !== null}
                    className={cn(
                      "w-full text-left p-4 rounded-xl border-2 transition-all",
                      selectedAnswer === null 
                        ? "border-slate-200 hover:border-amber-300 hover:bg-amber-50"
                        : showCorrect
                          ? "border-green-500 bg-green-50"
                          : showWrong
                            ? "border-red-400 bg-red-50"
                            : "border-slate-200 opacity-50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                        showCorrect ? "bg-green-500 text-white" : showWrong ? "bg-red-400 text-white" : "bg-slate-100"
                      )}>
                        {showCorrect ? <CheckCircle className="w-5 h-5" /> : showWrong ? <XCircle className="w-5 h-5" /> : String.fromCharCode(65 + idx)}
                      </span>
                      <span className="flex-1">{option}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Explanation */}
            <AnimatePresence>
              {selectedAnswer !== null && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-slate-50 rounded-xl p-4"
                >
                  <p className="text-sm text-slate-600">{q.explanation}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Next */}
            {selectedAnswer !== null && (
              <Button onClick={nextQuestion} className="w-full bg-amber-600 hover:bg-amber-700">
                {currentQuestion < quiz.questions.length - 1 ? 'Next Question' : 'See Results'}
              </Button>
            )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}