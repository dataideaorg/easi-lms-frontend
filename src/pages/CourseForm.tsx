import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Switch,
  FormControlLabel,
  CircularProgress,
  Alert,
  IconButton,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { coursesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const validationSchema = yup.object({
  title: yup.string().required('Title is required'),
  description: yup.string().required('Description is required'),
  thumbnail: yup.mixed(),
});

const CourseForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const isEditing = Boolean(id);

  // Debug user information
  React.useEffect(() => {
    console.log('Current user:', user);
  }, [user]);

  // Redirect if not instructor
  React.useEffect(() => {
    if (!user) {
      console.log('No user found');
      return;
    }
    console.log('User type:', user.user_type);
    if (user.user_type !== 'instructor') {
      console.log('User is not an instructor, redirecting...');
      navigate('/courses');
    }
  }, [user, navigate]);

  // Fetch course data if editing
  const { data: courseData, isLoading: isLoadingCourse } = useQuery(
    ['course', id],
    () => coursesAPI.getCourse(Number(id)),
    {
      enabled: isEditing,
      onSuccess: (data) => {
        // Check if the logged-in user is the course instructor
        if (user && data.data.instructor.id !== user.user.id) {
          navigate('/courses');
          return;
        }
        formik.setValues({
          title: data.data.title,
          description: data.data.description,
          is_published: data.data.is_published,
          thumbnail: null,
        });
        if (data.data.thumbnail) {
          setThumbnailPreview(data.data.thumbnail);
        }
      },
    }
  );

  const mutation = useMutation(
    (values: FormData) =>
      isEditing
        ? coursesAPI.updateCourse(Number(id), values)
        : coursesAPI.createCourse(values),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['courses']);
        navigate('/courses');
      },
      onError: (error: any) => {
        console.error('Mutation error:', error.response?.data);
        if (error.response?.status === 403) {
          console.log('403 error - not authorized');
          // If not authorized, redirect to courses page
          navigate('/courses');
        }
      },
    }
  );

  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
      is_published: false,
      thumbnail: null as File | null,
    },
    validationSchema,
    onSubmit: async (values) => {
      const formData = new FormData();
      formData.append('title', values.title);
      formData.append('description', values.description);
      formData.append('is_published', String(values.is_published));
      if (values.thumbnail) {
        formData.append('thumbnail', values.thumbnail);
      }
      mutation.mutate(formData);
    },
  });

  const handleThumbnailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      formik.setFieldValue('thumbnail', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveThumbnail = () => {
    formik.setFieldValue('thumbnail', null);
    setThumbnailPreview(null);
  };

  // Show loading state while checking authentication
  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Show error if not instructor
  if (user.user_type !== 'instructor') {
    return (
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
          <Alert severity="error">
            You must be an instructor to create or edit courses.
          </Alert>
        </Paper>
      </Container>
    );
  }

  if (isEditing && isLoadingCourse) {
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
          {isEditing ? 'Edit Course' : 'Create Course'}
        </Typography>

        <form onSubmit={formik.handleSubmit}>
          <TextField
            fullWidth
            id="title"
            name="title"
            label="Course Title"
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
            rows={4}
            value={formik.values.description}
            onChange={formik.handleChange}
            error={formik.touched.description && Boolean(formik.errors.description)}
            helperText={formik.touched.description && formik.errors.description}
          />

          <Box sx={{ mt: 3, mb: 2 }}>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="thumbnail-upload"
              type="file"
              onChange={handleThumbnailChange}
            />
            <label htmlFor="thumbnail-upload">
              <Button
                variant="outlined"
                component="span"
                startIcon={<UploadIcon />}
              >
                Upload Thumbnail
              </Button>
            </label>

            {thumbnailPreview && (
              <Box sx={{ mt: 2, position: 'relative', display: 'inline-block' }}>
                <img
                  src={thumbnailPreview}
                  alt="Course thumbnail"
                  style={{ maxWidth: '200px', maxHeight: '200px' }}
                />
                <IconButton
                  size="small"
                  onClick={handleRemoveThumbnail}
                  sx={{
                    position: 'absolute',
                    top: -8,
                    right: -8,
                    bgcolor: 'background.paper',
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            )}
          </Box>

          <FormControlLabel
            control={
              <Switch
                checked={formik.values.is_published}
                onChange={(e) =>
                  formik.setFieldValue('is_published', e.target.checked)
                }
                name="is_published"
              />
            }
            label="Publish Course"
          />

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
                ? 'Update Course'
                : 'Create Course'}
            </Button>
          </Box>

          {mutation.isError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              Failed to save course. Please try again.
            </Alert>
          )}
        </form>
      </Paper>
    </Container>
  );
};

export default CourseForm; 