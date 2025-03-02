import React from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
} from '@mui/material';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { quizzesAPI } from '../services/api';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const QuizResults: React.FC = () => {
  const { courseId, quizId, attemptId } = useParams();

  const { data: attemptData, isLoading } = useQuery(
    ['quiz-attempt', attemptId],
    () => quizzesAPI.getQuizAttempt(Number(courseId), Number(quizId), Number(attemptId))
  );

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const attempt = attemptData?.data;
  const quiz = attempt?.quiz;

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Quiz Results: {quiz?.title}
        </Typography>

        <Box sx={{ mt: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Score: {attempt?.score}%
          </Typography>
          <Chip
            icon={attempt?.passed ? <CheckCircleIcon /> : <CancelIcon />}
            label={attempt?.passed ? 'Passed' : 'Failed'}
            color={attempt?.passed ? 'success' : 'error'}
            variant="outlined"
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Passing score: {quiz?.passing_score}%
          </Typography>
        </Box>

        <Typography variant="h6" gutterBottom>
          Question Responses
        </Typography>
        <List>
          {attempt?.answers.map((answer: any, index: number) => (
            <React.Fragment key={answer.id}>
              <ListItem>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle1">
                        Question {index + 1}:
                      </Typography>
                      {answer.is_correct ? (
                        <CheckCircleIcon color="success" />
                      ) : (
                        <CancelIcon color="error" />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box component="div">
                      <Box component="div" sx={{ mt: 1 }}>
                        {answer.question.text}
                      </Box>
                      <Box component="div" sx={{ mt: 1, color: 'text.secondary' }}>
                        Your answer:{' '}
                        {answer.selected_choice
                          ? answer.selected_choice.text
                          : answer.text_answer}
                      </Box>
                      {answer.question.question_type !== 'short_answer' &&
                        !answer.is_correct && (
                          <Box component="div" sx={{ mt: 1, color: 'success.main' }}>
                            Correct answer:{' '}
                            {answer.question.choices.find((c: any) => c.is_correct)
                              ?.text}
                          </Box>
                        )}
                    </Box>
                  }
                />
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      </Paper>
    </Container>
  );
};

export default QuizResults; 