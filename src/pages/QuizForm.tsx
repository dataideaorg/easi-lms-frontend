import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  Divider,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  DragHandle as DragHandle,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { quizzesAPI } from '../services/api';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const validationSchema = yup.object({
  title: yup.string().required('Title is required'),
  description: yup.string(),
  passing_score: yup
    .number()
    .min(0, 'Must be at least 0')
    .max(100, 'Must be at most 100')
    .required('Passing score is required'),
});

interface Question {
  id?: number;
  question_type: 'multiple_choice' | 'true_false' | 'short_answer';
  text: string;
  order: number;
  points: number;
  choices: Choice[];
}

interface Choice {
  id?: number;
  text: string;
  is_correct: boolean;
}

const QuizForm: React.FC = () => {
  const { courseId, quizId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [questions, setQuestions] = useState<Question[]>([]);
  const isEditing = Boolean(quizId);

  // Fetch quiz data if editing
  const { isLoading: isLoadingQuiz } = useQuery(
    ['quiz', quizId],
    () => quizzesAPI.getQuiz(Number(courseId), Number(quizId)),
    {
      enabled: isEditing,
      onSuccess: (data) => {
        formik.setValues({
          title: data.data.title,
          description: data.data.description,
          passing_score: data.data.passing_score,
        });
        setQuestions(data.data.questions);
      },
    }
  );

  const mutation = useMutation(
    (values: any) =>
      isEditing
        ? quizzesAPI.updateQuiz(Number(courseId), Number(quizId), {
            ...values,
            questions,
          })
        : quizzesAPI.createQuiz(Number(courseId), { ...values, questions }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['quizzes', courseId]);
        navigate(`/courses/${courseId}`);
      },
    }
  );

  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
      passing_score: 70,
    },
    validationSchema,
    onSubmit: (values) => {
      mutation.mutate(values);
    },
  });

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        question_type: 'multiple_choice',
        text: '',
        order: questions.length,
        points: 1,
        choices: [
          { text: '', is_correct: true },
          { text: '', is_correct: false },
        ],
      },
    ]);
  };

  const handleQuestionChange = (index: number, field: string, value: any) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setQuestions(newQuestions);
  };

  const handleChoiceChange = (
    questionIndex: number,
    choiceIndex: number,
    field: string,
    value: any
  ) => {
    const newQuestions = [...questions];
    const newChoices = [...newQuestions[questionIndex].choices];
    newChoices[choiceIndex] = { ...newChoices[choiceIndex], [field]: value };

    if (field === 'is_correct' && value === true) {
      // Uncheck other choices if this one is checked
      newChoices.forEach((choice, idx) => {
        if (idx !== choiceIndex) {
          choice.is_correct = false;
        }
      });
    }

    newQuestions[questionIndex] = {
      ...newQuestions[questionIndex],
      choices: newChoices,
    };
    setQuestions(newQuestions);
  };

  const handleAddChoice = (questionIndex: number) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].choices.push({
      text: '',
      is_correct: false,
    });
    setQuestions(newQuestions);
  };

  const handleDeleteChoice = (questionIndex: number, choiceIndex: number) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].choices.splice(choiceIndex, 1);
    setQuestions(newQuestions);
  };

  const handleDeleteQuestion = (index: number) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const newQuestions = Array.from(questions);
    const [reorderedQuestion] = newQuestions.splice(result.source.index, 1);
    newQuestions.splice(result.destination.index, 0, reorderedQuestion);

    // Update order field
    newQuestions.forEach((question, index) => {
      question.order = index;
    });

    setQuestions(newQuestions);
  };

  if (isEditing && isLoadingQuiz) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          {isEditing ? 'Edit Quiz' : 'Create Quiz'}
        </Typography>

        <form onSubmit={formik.handleSubmit}>
          <TextField
            fullWidth
            id="title"
            name="title"
            label="Quiz Title"
            margin="normal"
            value={formik.values.title}
            onChange={formik.handleChange}
            error={formik.touched.title && Boolean(formik.errors.title)}
            helperText={formik.touched.title && formik.errors.title}
          />

          <TextField
            fullWidth
            id="description"
            name="description"
            label="Description"
            margin="normal"
            multiline
            rows={3}
            value={formik.values.description}
            onChange={formik.handleChange}
          />

          <TextField
            fullWidth
            id="passing_score"
            name="passing_score"
            label="Passing Score (%)"
            type="number"
            margin="normal"
            value={formik.values.passing_score}
            onChange={formik.handleChange}
            error={
              formik.touched.passing_score && Boolean(formik.errors.passing_score)
            }
            helperText={
              formik.touched.passing_score && formik.errors.passing_score
            }
          />

          <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
            Questions
          </Typography>

          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="questions">
              {(provided) => (
                <List {...provided.droppableProps} ref={provided.innerRef}>
                  {questions.map((question, questionIndex) => (
                    <Draggable
                      key={questionIndex}
                      draggableId={`question-${questionIndex}`}
                      index={questionIndex}
                    >
                      {(provided) => (
                        <ListItem
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          sx={{ flexDirection: 'column', alignItems: 'stretch' }}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              width: '100%',
                            }}
                          >
                            <Box {...provided.dragHandleProps}>
                              <DragHandle />
                            </Box>
                            <Typography variant="subtitle1" sx={{ ml: 2 }}>
                              Question {questionIndex + 1}
                            </Typography>
                            <IconButton
                              onClick={() => handleDeleteQuestion(questionIndex)}
                              sx={{ ml: 'auto' }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>

                          <Box sx={{ pl: 6, pr: 2, width: '100%' }}>
                            <FormControl fullWidth margin="normal">
                              <InputLabel>Question Type</InputLabel>
                              <Select
                                value={question.question_type}
                                onChange={(e) =>
                                  handleQuestionChange(
                                    questionIndex,
                                    'question_type',
                                    e.target.value
                                  )
                                }
                              >
                                <MenuItem value="multiple_choice">
                                  Multiple Choice
                                </MenuItem>
                                <MenuItem value="true_false">True/False</MenuItem>
                                <MenuItem value="short_answer">
                                  Short Answer
                                </MenuItem>
                              </Select>
                            </FormControl>

                            <TextField
                              fullWidth
                              label="Question Text"
                              margin="normal"
                              value={question.text}
                              onChange={(e) =>
                                handleQuestionChange(
                                  questionIndex,
                                  'text',
                                  e.target.value
                                )
                              }
                            />

                            <TextField
                              label="Points"
                              type="number"
                              margin="normal"
                              value={question.points}
                              onChange={(e) =>
                                handleQuestionChange(
                                  questionIndex,
                                  'points',
                                  Number(e.target.value)
                                )
                              }
                              sx={{ width: 100 }}
                            />

                            {question.question_type !== 'short_answer' && (
                              <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle2" gutterBottom>
                                  Choices
                                </Typography>
                                {question.choices.map((choice, choiceIndex) => (
                                  <Box
                                    key={choiceIndex}
                                    sx={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 2,
                                      mb: 1,
                                    }}
                                  >
                                    <FormControlLabel
                                      control={
                                        <Switch
                                          checked={choice.is_correct}
                                          onChange={(e) =>
                                            handleChoiceChange(
                                              questionIndex,
                                              choiceIndex,
                                              'is_correct',
                                              e.target.checked
                                            )
                                          }
                                        />
                                      }
                                      label="Correct"
                                    />
                                    <TextField
                                      fullWidth
                                      size="small"
                                      value={choice.text}
                                      onChange={(e) =>
                                        handleChoiceChange(
                                          questionIndex,
                                          choiceIndex,
                                          'text',
                                          e.target.value
                                        )
                                      }
                                    />
                                    <IconButton
                                      onClick={() =>
                                        handleDeleteChoice(
                                          questionIndex,
                                          choiceIndex
                                        )
                                      }
                                    >
                                      <DeleteIcon />
                                    </IconButton>
                                  </Box>
                                ))}
                                <Button
                                  startIcon={<AddIcon />}
                                  onClick={() => handleAddChoice(questionIndex)}
                                  sx={{ mt: 1 }}
                                >
                                  Add Choice
                                </Button>
                              </Box>
                            )}
                          </Box>
                          <Divider sx={{ my: 2, width: '100%' }} />
                        </ListItem>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </List>
              )}
            </Droppable>
          </DragDropContext>

          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleAddQuestion}
            sx={{ mt: 2 }}
          >
            Add Question
          </Button>

          <Box sx={{ mt: 4 }}>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={mutation.isLoading}
            >
              {mutation.isLoading
                ? 'Saving...'
                : isEditing
                ? 'Update Quiz'
                : 'Create Quiz'}
            </Button>
          </Box>

          {mutation.isError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              Failed to save quiz. Please try again.
            </Alert>
          )}
        </form>
      </Paper>
    </Container>
  );
};

export default QuizForm; 