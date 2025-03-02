import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Avatar,
  IconButton,
  Typography,
  Alert,
} from '@mui/material';
import { PhotoCamera as PhotoCameraIcon } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authAPI } from '../services/api';

const validationSchema = yup.object({
  first_name: yup.string().required('First name is required'),
  last_name: yup.string().required('Last name is required'),
  email: yup.string().email('Enter a valid email').required('Email is required'),
  bio: yup.string(),
});

interface ProfileEditDialogProps {
  open: boolean;
  onClose: () => void;
  userData: any;
}

const ProfileEditDialog: React.FC<ProfileEditDialogProps> = ({
  open,
  onClose,
  userData,
}) => {
  const queryClient = useQueryClient();
  const [profilePicture, setProfilePicture] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

  const updateProfileMutation = useMutation(
    (values: FormData) => authAPI.updateProfile(values),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['profile']);
        onClose();
      },
    }
  );

  const formik = useFormik({
    initialValues: {
      first_name: userData?.user.first_name || '',
      last_name: userData?.user.last_name || '',
      email: userData?.user.email || '',
      bio: userData?.bio || '',
    },
    validationSchema,
    onSubmit: (values, { setSubmitting }) => {
      try {
        const formData = new FormData();
        formData.append('first_name', values.first_name);
        formData.append('last_name', values.last_name);
        formData.append('email', values.email);
        formData.append('bio', values.bio);
        
        if (profilePicture) {
          formData.append('profile_picture', profilePicture);
        }
        
        updateProfileMutation.mutate(formData);
      } catch (error) {
        console.error('Error submitting form:', error);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    const file = event.target.files?.[0];
    if (file) {
      // Clean up previous preview URL to prevent memory leaks
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setProfilePicture(file);
      const newPreviewUrl = URL.createObjectURL(file);
      setPreviewUrl(newPreviewUrl);
    }
  };

  // Cleanup preview URL when component unmounts
  React.useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    formik.handleSubmit(e);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Profile</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {updateProfileMutation.isError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Failed to update profile. Please try again.
            </Alert>
          )}
          
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <Avatar
              sx={{ width: 100, height: 100, mb: 1 }}
              src={previewUrl || userData?.profile_picture}
            >
              {userData?.user.first_name?.[0]}
            </Avatar>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="profile-picture-input"
              type="file"
              onChange={handleFileChange}
              onClick={(e) => e.stopPropagation()}
            />
            <label htmlFor="profile-picture-input">
              <IconButton
                color="primary"
                aria-label="upload picture"
                component="span"
                onClick={(e) => e.stopPropagation()}
              >
                <PhotoCameraIcon />
              </IconButton>
            </label>
            <Typography variant="caption" color="text.secondary">
              Click to change profile picture
            </Typography>
          </Box>

          <TextField
            fullWidth
            id="first_name"
            name="first_name"
            label="First Name"
            value={formik.values.first_name}
            onChange={formik.handleChange}
            error={formik.touched.first_name && Boolean(formik.errors.first_name)}
            helperText={formik.touched.first_name && formik.errors.first_name}
            margin="normal"
          />
          <TextField
            fullWidth
            id="last_name"
            name="last_name"
            label="Last Name"
            value={formik.values.last_name}
            onChange={formik.handleChange}
            error={formik.touched.last_name && Boolean(formik.errors.last_name)}
            helperText={formik.touched.last_name && formik.errors.last_name}
            margin="normal"
          />
          <TextField
            fullWidth
            id="email"
            name="email"
            label="Email"
            value={formik.values.email}
            onChange={formik.handleChange}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
            margin="normal"
          />
          <TextField
            fullWidth
            id="bio"
            name="bio"
            label="Bio"
            multiline
            rows={4}
            value={formik.values.bio}
            onChange={formik.handleChange}
            error={formik.touched.bio && Boolean(formik.errors.bio)}
            helperText={formik.touched.bio && formik.errors.bio}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={updateProfileMutation.isLoading || formik.isSubmitting}
          >
            {updateProfileMutation.isLoading || formik.isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ProfileEditDialog; 