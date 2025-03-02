import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  LinearProgress,
  Divider,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  PlayCircleOutline as PlayIcon,
  QuestionAnswer as QuizIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { coursesAPI, quizzesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface SectionFormData {
  title: string;
  order: number;
}

interface LessonFormData {
  title: string;
  content: string;
  video_url?: string;
  order: number;
}

const CourseDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isInstructor = user?.user_type === 'instructor';

  const [sectionDialogOpen, setSectionDialogOpen] = useState(false);
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<number | null>(null);
  const [formData, setFormData] = useState<SectionFormData | LessonFormData>({
    title: '',
    order: 0,
  });

  const { data: course, isLoading } = useQuery(['course', id], () =>
    coursesAPI.getCourse(Number(id))
  );

  const { data: quizzes, isLoading: isLoadingQuizzes } = useQuery(
    ['quizzes', id],
    () => quizzesAPI.getQuizzes(Number(id)),
    {
      enabled: !!id,
    }
  );

  const sectionMutation = useMutation(
    (data: SectionFormData) => coursesAPI.createSection(Number(id), data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['course', id]);
        setSectionDialogOpen(false);
        setFormData({ title: '', order: 0 });
      },
    }
  );

  const lessonMutation = useMutation(
    (data: LessonFormData) =>
      coursesAPI.createLesson(Number(id), selectedSection!, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['course', id]);
        setLessonDialogOpen(false);
        setFormData({ title: '', order: 0, content: '' });
      },
    }
  );

  const enrollMutation = useMutation(
    () => coursesAPI.enrollInCourse(Number(id)),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['course', id]);
      },
      onError: (error: any) => {
        console.error('Enrollment error:', error.response?.data);
      }
    }
  );

  if (isLoading || isLoadingQuizzes) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const courseData = course?.data;
  const quizData = quizzes?.data || [];

  const handleSectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sectionMutation.mutate(formData as SectionFormData);
  };

  const handleLessonSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    lessonMutation.mutate(formData as LessonFormData);
  };

  const handleEnroll = () => {
    if (!courseData.is_published) {
      return;
    }
    enrollMutation.mutate();
  };

  return (
    <Container>
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {courseData.title}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              By {courseData.instructor.username}
            </Typography>
          </Box>
          <Box>
            {isInstructor && courseData.instructor.id === user.id ? (
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate(`/courses/${id}/edit`)}
                startIcon={<EditIcon />}
              >
                Edit Course
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                onClick={handleEnroll}
                disabled={enrollMutation.isLoading}
              >
                {enrollMutation.isLoading ? 'Enrolling...' : 'Enroll Now'}
              </Button>
            )}
          </Box>
        </Box>

        <Typography variant="body1" paragraph>
          {courseData.description}
        </Typography>

        {enrollMutation.isError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {enrollMutation.error?.response?.data?.error || 'Failed to enroll in the course. Please try again.'}
          </Alert>
        )}

        {courseData.is_enrolled && (
          <Box sx={{ mt: 2, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Your Progress
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Overall Progress
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {Math.round(courseData.progress)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={courseData.progress}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            </Box>
          </Box>
        )}

        {/* Quizzes Section */}
        <Box sx={{ mt: 4 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <Typography variant="h5">Quizzes</Typography>
            {isInstructor && courseData.instructor.id === user.id && (
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => navigate(`/courses/${id}/quizzes/create`)}
              >
                Add Quiz
              </Button>
            )}
          </Box>

          {quizData.length > 0 ? (
            <List>
              {quizData.map((quiz: any) => (
                <React.Fragment key={quiz.id}>
                  <ListItem
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <ListItemText
                      primary={quiz.title}
                      secondary={`Passing Score: ${quiz.passing_score}%`}
                    />
                    <Box>
                      {isInstructor && courseData.instructor.id === user.id ? (
                        <IconButton
                          onClick={() =>
                            navigate(`/courses/${id}/quizzes/${quiz.id}/edit`)
                          }
                        >
                          <EditIcon />
                        </IconButton>
                      ) : (
                        <Button
                          variant="contained"
                          startIcon={<QuizIcon />}
                          onClick={() =>
                            navigate(`/courses/${id}/quizzes/${quiz.id}`)
                          }
                          disabled={!courseData.is_enrolled}
                        >
                          Take Quiz
                        </Button>
                      )}
                    </Box>
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Typography variant="body1" color="text.secondary">
              No quizzes available for this course yet.
            </Typography>
          )}
        </Box>

        {/* Course Content Section */}
        <Box sx={{ mt: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h5">Course Content</Typography>
            {isInstructor && courseData.instructor.id === user.id && (
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => setSectionDialogOpen(true)}
              >
                Add Section
              </Button>
            )}
          </Box>

          {courseData.sections.map((section: any) => (
            <Accordion key={section.id}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ width: '100%' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography>{section.title}</Typography>
                    {courseData.is_enrolled && (
                      <Typography variant="body2" color="text.secondary">
                        {Math.round(section.progress)}% Complete
                      </Typography>
                    )}
                  </Box>
                  {courseData.is_enrolled && (
                    <LinearProgress
                      variant="determinate"
                      value={section.progress}
                      sx={{ mt: 1, height: 4, borderRadius: 2 }}
                    />
                  )}
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <List>
                  {section.lessons.map((lesson: any) => (
                    <ListItem
                      key={lesson.id}
                      secondaryAction={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {courseData.is_enrolled && lesson.completed && (
                            <CheckCircleIcon color="success" fontSize="small" />
                          )}
                          <IconButton
                            edge="end"
                            onClick={() => navigate(`/courses/${id}/lessons/${lesson.id}`)}
                          >
                            <PlayIcon />
                          </IconButton>
                        </Box>
                      }
                    >
                      <ListItemText
                        primary={lesson.title}
                        secondary={`Duration: ${lesson.duration || 'N/A'}`}
                      />
                    </ListItem>
                  ))}
                </List>
                {isInstructor && courseData.instructor.id === user.id && (
                  <Button
                    variant="text"
                    startIcon={<AddIcon />}
                    onClick={() => {
                      setSelectedSection(section.id);
                      setLessonDialogOpen(true);
                    }}
                  >
                    Add Lesson
                  </Button>
                )}
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Paper>

      {/* Section Dialog */}
      <Dialog open={sectionDialogOpen} onClose={() => setSectionDialogOpen(false)}>
        <DialogTitle>Add New Section</DialogTitle>
        <form onSubmit={handleSectionSubmit}>
          <DialogContent>
            <TextField
              fullWidth
              label="Section Title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              margin="normal"
            />
            <TextField
              fullWidth
              label="Order"
              type="number"
              value={formData.order}
              onChange={(e) =>
                setFormData({ ...formData, order: Number(e.target.value) })
              }
              margin="normal"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSectionDialogOpen(false)}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={sectionMutation.isLoading}
            >
              {sectionMutation.isLoading ? 'Adding...' : 'Add Section'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Lesson Dialog */}
      <Dialog open={lessonDialogOpen} onClose={() => setLessonDialogOpen(false)}>
        <DialogTitle>Add New Lesson</DialogTitle>
        <form onSubmit={handleLessonSubmit}>
          <DialogContent>
            <TextField
              fullWidth
              label="Lesson Title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              margin="normal"
            />
            <TextField
              fullWidth
              label="Content"
              multiline
              rows={4}
              value={(formData as LessonFormData).content || ''}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              margin="normal"
            />
            <TextField
              fullWidth
              label="Video URL"
              value={(formData as LessonFormData).video_url || ''}
              onChange={(e) =>
                setFormData({ ...formData, video_url: e.target.value })
              }
              margin="normal"
            />
            <TextField
              fullWidth
              label="Order"
              type="number"
              value={formData.order}
              onChange={(e) =>
                setFormData({ ...formData, order: Number(e.target.value) })
              }
              margin="normal"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setLessonDialogOpen(false)}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={lessonMutation.isLoading}
            >
              {lessonMutation.isLoading ? 'Adding...' : 'Add Lesson'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default CourseDetail; 