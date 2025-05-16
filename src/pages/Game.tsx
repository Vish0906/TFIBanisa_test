import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { 
  loadQuizData, 
  generateWord, 
  formatTime,
  generateQuestions,
  getRandomSuccessMessage,
  QuizItem,
  GameQuestion
} from '@/utils/gameUtils';
import { motion } from 'framer-motion';
import { useToast } from "@/components/ui/use-toast";
import { Trophy } from 'lucide-react';

const Game = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [quizData, setQuizData] = useState<QuizItem[]>([]);
  const [word, setWord] = useState('');
  const [questions, setQuestions] = useState<GameQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(5 * 60); // 5 minutes in seconds
  const [gameOver, setGameOver] = useState(false);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const letterInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Load quiz data and set up game
  useEffect(() => {
    async function setupGame() {
      try {
        setLoading(true);
        const data = await loadQuizData();
        
        if (data.length === 0) {
          throw new Error('Failed to load quiz data');
        }
        
        setQuizData(data);
        
        // Generate a random word from our list
        const randomWord = generateWord();
        setWord(randomWord);
        
        // Generate questions
        const gameQuestions = generateQuestions(randomWord, data);
        setQuestions(gameQuestions);
        
        // Initialize user answers array with empty strings
        setUserAnswers(new Array(randomWord.length).fill(''));
        
        setLoading(false);
      } catch (error) {
        console.error('Error setting up game:', error);
        toast({
          title: "Error",
          description: "Failed to load game data. Please try again.",
          variant: "destructive"
        });
        navigate('/');
      }
    }
    
    setupGame();
  }, [navigate, toast]);

  // Set up timer
  useEffect(() => {
    if (loading || gameOver) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [loading, gameOver]);

  // Check if player has won
  useEffect(() => {
    if (loading || gameOver || userAnswers.includes('')) return;
    
    // Check if all letters are correct
    const allCorrect = userAnswers.every((answer, index) => answer === word[index]);
    
    if (allCorrect) {
      setSuccess(true);
      setSuccessMessage(getRandomSuccessMessage());
      setGameOver(true);
      
      toast({
        title: "Congratulations!",
        description: "You've solved the puzzle!",
        variant: "default"
      });
    }
  }, [userAnswers, word, loading, gameOver, toast]);

  const handleLetterChange = (index: number, value: string) => {
    const newValue = value.toUpperCase().slice(0, 1); // Take only first character and uppercase it
    
    const newUserAnswers = [...userAnswers];
    newUserAnswers[index] = newValue;
    setUserAnswers(newUserAnswers);
    
    // Auto-focus next input if current input is filled and not the last
    if (newValue && index < word.length - 1) {
      letterInputRefs.current[index + 1]?.focus();
    }
  };
  
  const handleEndGame = () => {
    setGameOver(true);
  };
  
  const handleBackToHome = () => {
    navigate('/');
  };
  
  const isLetterCorrect = (index: number) => {
    return userAnswers[index] !== '' && userAnswers[index] === word[index];
  };
  
  const isLetterIncorrect = (index: number) => {
    return userAnswers[index] !== '' && userAnswers[index] !== word[index];
  };
  
  if (loading) {
    return (
      <div className="min-h-screen telugu-pattern-bg flex items-center justify-center">
        <div className="text-2xl text-white font-bold z-10">Loading game...</div>
      </div>
    );
  }
  
  // Calculate the appropriate size class based on word length
  const getLetterBoxSizeClass = () => {
    const wordLength = word.length;
    if (wordLength > 10) {
      return 'w-8 h-8 sm:w-10 sm:h-10 text-sm sm:text-lg';
    } else if (wordLength > 8) {
      return 'w-10 h-10 sm:w-12 sm:h-12 text-base sm:text-xl';
    } else {
      return 'w-12 h-12 sm:w-16 sm:h-16 text-xl sm:text-2xl';
    }
  };
  
  return (
    <div className="min-h-screen telugu-pattern-bg py-8 px-4">
      {/* Game title displayed on top */}
      <div className="fixed top-0 left-0 right-0 bg-telugu-blue bg-opacity-90 text-center py-2 shadow-md z-10">
        <h1 className="text-2xl font-bold text-white">TFI Banisa</h1>
      </div>

      <div className="max-w-3xl mx-auto pt-12 z-10 relative">
        {/* Game Header */}
        <div className="flex justify-between items-center mb-8">
          <Button 
            onClick={handleBackToHome}
            variant="outline" 
            className="border-white text-white bg-black bg-opacity-50 hover:bg-black hover:bg-opacity-70 z-10"
          >
            Back to Home
          </Button>
          
          <div className="text-xl font-bold px-4 py-2 bg-black bg-opacity-50 text-white rounded-lg border border-white/20 z-10">
            {formatTime(timeLeft)}
          </div>
        </div>
        
        {/* Game Content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white bg-opacity-90 backdrop-blur-sm rounded-xl shadow-lg p-6 md:p-8 z-10 relative"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-center text-telugu-blue mb-6">
            {gameOver ? "Game Over!" : "Guess the Hidden Word"}
          </h2>
          
          {/* Letter Boxes - Updated to be responsive and wrap */}
          <div className="flex flex-wrap justify-center gap-2 mb-8 max-w-full">
            {word.split('').map((letter, index) => (
              <motion.div 
                key={index}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1, type: "spring", stiffness: 260, damping: 20 }}
              >
                <div className={`${getLetterBoxSizeClass()} letter-box ${isLetterCorrect(index) ? 'letter-box-correct' : ''} ${isLetterIncorrect(index) ? 'letter-box-incorrect' : ''}`}>
                  {gameOver ? word[index] : (
                    <input 
                      type="text"
                      maxLength={1}
                      value={userAnswers[index]}
                      onChange={(e) => handleLetterChange(index, e.target.value)}
                      disabled={gameOver}
                      className="w-full h-full text-center bg-transparent outline-none"
                      ref={el => letterInputRefs.current[index] = el}
                    />
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Success Message */}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.7 }}
              className="mb-8 p-4 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg border border-blue-200"
            >
              <div className="flex items-center justify-center gap-3 text-xl font-bold text-blue-800">
                <Trophy className="h-6 w-6 text-amber-500" />
                <span>{successMessage}</span>
                <Trophy className="h-6 w-6 text-amber-500" />
              </div>
            </motion.div>
          )}
          
          {/* Questions */}
          <div className="space-y-6 mb-8">
            {questions.map((q, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="bg-white bg-opacity-80 p-4 rounded-lg border-l-4 border-telugu-blue"
              >
                <p className="text-gray-800">{q.question}</p>
                
                {gameOver && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ delay: 0.2 }}
                    className="mt-3 pl-4 border-l-2 border-telugu-gold"
                  >
                    <p className="text-sm font-medium">
                      <span className="text-telugu-blue">Answer:</span> {q.originalQuestion.Answer}
                    </p>
                    {q.originalQuestion.Song && (
                      <p className="text-sm">
                        <span className="text-telugu-blue">Song:</span> {q.originalQuestion.Song}
                      </p>
                    )}
                    <p className="text-sm">
                      <span className="text-telugu-blue">Movie:</span> {q.originalQuestion.Movie}
                    </p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
          
          {/* Game Control */}
          <div className="flex justify-center">
            {!gameOver ? (
              <Button 
                onClick={handleEndGame}
                variant="outline"
                className="border-red-500 text-red-500 hover:bg-red-500/10 bg-white bg-opacity-50"
              >
                End Game
              </Button>
            ) : (
              <Button 
                onClick={handleBackToHome}
                className="bg-telugu-blue hover:bg-telugu-lightBlue text-white"
              >
                Back to Home
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Game;