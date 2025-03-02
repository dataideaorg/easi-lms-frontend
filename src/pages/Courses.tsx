import React from 'react';
import {
  Container,
  Grid,
  Box,
  Fab,
  CircularProgress,
  Typography,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { coursesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import CourseCard from '../components/CourseCard';

const Courses: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isInstructor = user?.user_type === 'instructor';

  const { data: courses, isLoading, error } = useQuery(['courses'], coursesAPI.getAllCourses);

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
          Error loading courses. Please try again later.
        </Typography>
      </Box>
    );
  }

  return (
    <Container>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Available Courses
        </Typography>
        {isInstructor && (
          <Fab
            color="primary"
            aria-label="add course"
            onClick={() => navigate('/courses/create')}
          >
            <AddIcon />
          </Fab>
        )}
      </Box>
      <Grid container spacing={3}>
        {courses?.data.map((course: any) => (
          <Grid item xs={12} sm={6} md={4} key={course.id}>
            <CourseCard
              course={{
                id: course.id,
                title: course.title,
                description: course.description,
                thumbnail: course.thumbnail,
                instructor: {
                  id: course.instructor.id,
                  username: course.instructor.username,
                },
                is_published: course.is_published,
                is_enrolled: course.is_enrolled,
                progress: course.progress,
              }}
            />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Courses; 