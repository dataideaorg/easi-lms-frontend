import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  LinearProgress,
  Chip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface CourseCardProps {
  course: {
    id: number;
    title: string;
    description: string;
    thumbnail?: string;
    instructor: {
      id: number;
      username: string;
    };
    is_published: boolean;
    is_enrolled?: boolean;
    progress?: number;
  };
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isInstructor = user?.user_type === 'instructor';
  const isOwner = isInstructor && user?.id === course.instructor.id;

  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        position: 'relative'
      }}
    >
      {!course.is_published && (
        <Chip
          label="Draft"
          color="warning"
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 1
          }}
        />
      )}
      <CardMedia
        component="img"
        height="140"
        image={course.thumbnail || '/default-course-image.jpg'}
        alt={course.title}
      />
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography gutterBottom variant="h6" component="div">
          {course.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {course.description}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Instructor: {course.instructor.username}
        </Typography>
        
        {course.is_enrolled && course.progress !== undefined && (
          <Box sx={{ mt: 'auto', mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Progress
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {Math.round(course.progress)}%
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={course.progress} 
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>
        )}

        <Box sx={{ mt: 'auto', display: 'flex', gap: 1 }}>
          <Button 
            size="small" 
            variant="contained"
            onClick={() => navigate(`/courses/${course.id}`)}
            fullWidth
          >
            {course.is_enrolled ? 'Continue Learning' : 'View Course'}
          </Button>
          {isOwner && (
            <Button
              size="small"
              variant="outlined"
              onClick={() => navigate(`/courses/${course.id}/edit`)}
            >
              Edit
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default CourseCard; 