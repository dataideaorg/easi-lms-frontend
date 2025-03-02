import React from 'react';
import {
  Container,
  Grid,
  Box,
  CircularProgress,
  Typography,
  Paper,
  LinearProgress,
  Button,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { coursesAPI } from '../services/api';
import { PlayCircleOutline as PlayIcon } from '@mui/icons-material';

interface Enrollment {
  id: number;
  course: {
    id: number;
    title: string;
    description: string;
    instructor: {
      username: string;
    };
  };
  progress: number;
  completed: boolean;
  last_accessed: string;
}

const MyLearning: React.FC = () => {
  const navigate = useNavigate();
  
  const { data: enrollments, isLoading, error } = useQuery(
    ['enrollments'],
    coursesAPI.getEnrollments
  );

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 4 }}>
        <Typography color="error" align="center">
          Error loading your courses. Please try again later.
        </Typography>
      </Box>
    );
  }

  const enrolledCourses = enrollments?.data || [];

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        My Learning
      </Typography>

      {enrolledCourses.length === 0 ? (
        <Paper sx={{ p: 4, mt: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            You haven't enrolled in any courses yet
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/courses')}
            sx={{ mt: 2 }}
          >
            Browse Courses
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {enrolledCourses.map((enrollment: Enrollment) => (
            <Grid item xs={12} md={6} key={enrollment.id}>
              <Paper sx={{ p: 3 }}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    {enrollment.course.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    By {enrollment.course.instructor.username}
                  </Typography>
                  <Box sx={{ mt: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Overall Progress
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {Math.round(enrollment.progress)}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={enrollment.progress}
                      sx={{ height: 8, mb: 2 }}
                    />
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<PlayIcon />}
                      onClick={() => navigate(`/courses/${enrollment.course.id}`)}
                    >
                      Continue Learning
                    </Button>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default MyLearning; 