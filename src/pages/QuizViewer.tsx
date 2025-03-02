import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  RadioGroup,
  Radio,
  FormControlLabel,
  TextField,
  Button,
  Box,
  CircularProgress,
  Alert,
  LinearProgress,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { quizzesAPI } from '../services/api';

interface Answer {
  question_id: number;
  choice_id?: number;
  text_answer?: string;
}

const QuizViewer: React.FC = () => {
  const { courseId, quizId } = useParams();
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Fetch quiz data
  const { data: quizData, isLoading: isLoadingQuiz } = useQuery(
    ['quiz', quizId],
    () => quizzesAPI.getQuiz(Number(courseId), Number(quizId))
  );

  // Start quiz attempt
  const { data: attemptData, isLoading: isLoadingAttempt } = useQuery(
    ['quiz-attempt', quizId],
    () => quizzesAPI.startQuizAttempt(Number(courseId), Number(quizId)),
    {
      enabled: !!quizData,
      retry: false,
      onError: (error: any) => {
        setError(error.response?.data?.error || 'Failed to start quiz attempt');
      },
    }
  );

  // Submit quiz attempt
  const submitMutation = useMutation(
    (answers: Answer[]) =>
      quizzesAPI.submitQuizAttempt(Number(courseId), Number(quizId), { answers }),
    {
      onSuccess: (data) => {
        navigate(`/courses/${courseId}/quizzes/${quizId}/results/${data.data.id}`);
      },
      onError: (error: any) => {
        setError(error.response?.data?.error || 'Failed to submit quiz. Please try again.');
      },
    }
  );

  if (isLoadingQuiz || isLoadingAttempt) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Button
            variant="contained"
            onClick={() => navigate(`/courses/${courseId}`)}
          >
            Return to Course
          </Button>
        </Paper>
      </Container>
    );
  }

  const quiz = quizData?.data;
  const questions = quiz?.questions || [];
  const currentQuestion = questions[currentQuestionIndex];

  // Calculate the number of answered questions
  const answeredQuestions = new Set(answers.map(a => a.question_id)).size;

  const handleAnswerChange = (value: string) => {
    const newAnswers = answers.filter(a => a.question_id !== currentQuestion.id);
    const answer: Answer = {
      question_id: currentQuestion.id,
      ...(currentQuestion.question_type === 'short_answer'
        ? { text_answer: value }
        : { choice_id: Number(value) }),
    };
    
    // Log the answer being added
    console.log('Adding answer:', answer);
    console.log('Current question:', currentQuestion);
    
    setAnswers([...newAnswers, answer]);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = () => {
    // Check if all questions are answered
    const answeredQuestionIds = new Set(answers.map(a => a.question_id));
    const unansweredQuestions = questions.filter(q => !answeredQuestionIds.has(q.id));
    
    if (unansweredQuestions.length > 0) {
      setError(`Please answer all questions. Missing questions: ${unansweredQuestions.map(q => q.order || questions.indexOf(q) + 1).join(', ')}`);
      return;
    }
    
    // Log the answers being submitted
    console.log('Submitting answers:', answers);
    console.log('Questions:', questions);
    
    submitMutation.mutate(answers);
  };

  const currentAnswer = answers.find((a) => a.question_id === currentQuestion?.id);

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          {quiz.title}
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          {quiz.description}
        </Typography>

        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Progress
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {Math.round((answeredQuestions / questions.length) * 100)}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={(answeredQuestions / questions.length) * 100}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>

        {currentQuestion && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Question {currentQuestionIndex + 1} of {questions.length}
            </Typography>
            <Typography variant="body1" paragraph>
              {currentQuestion.text}
            </Typography>

            {currentQuestion.question_type === 'short_answer' ? (
              <TextField
                fullWidth
                multiline
                rows={4}
                value={currentAnswer?.text_answer || ''}
                onChange={(e) => handleAnswerChange(e.target.value)}
                placeholder="Type your answer here..."
              />
            ) : (
              <RadioGroup
                value={currentAnswer?.choice_id || ''}
                onChange={(e) => handleAnswerChange(e.target.value)}
              >
                {currentQuestion.choices.map((choice) => (
                  <FormControlLabel
                    key={choice.id}
                    value={choice.id}
                    control={<Radio />}
                    label={choice.text}
                  />
                ))}
              </RadioGroup>
            )}
          </Box>
        )}

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            Previous
          </Button>
          {currentQuestionIndex === questions.length - 1 ? (
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={submitMutation.isLoading}
            >
              {submitMutation.isLoading ? 'Submitting...' : 'Submit Quiz'}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={!currentAnswer}
            >
              Next
            </Button>
          )}
        </Box>

        {submitMutation.isError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error || 'Failed to submit quiz. Please try again.'}
          </Alert>
        )}
      </Paper>
    </Container>
  );
};

export default QuizViewer; 