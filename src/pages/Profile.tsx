import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Avatar,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Button,
  CircularProgress,
  Card,
  CardContent,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  School as SchoolIcon,
  CheckCircle as CheckCircleIcon,
  Timeline as TimelineIcon,
  Bookmark as BookmarkIcon,
  Edit as EditIcon,
  PlayCircle as PlayCircleIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { coursesAPI } from '../services/api';
import ProfileEditDialog from '../components/ProfileEditDialog';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { data: enrollments, isLoading: isLoadingEnrollments } = useQuery(
    ['enrollments'],
    () => coursesAPI.getEnrollments()
  );

  const { data: bookmarks, isLoading: isLoadingBookmarks } = useQuery(
    ['bookmarks'],
    () => coursesAPI.getBookmarks()
  );

  if (isLoadingEnrollments || isLoadingBookmarks) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const enrolledCourses = enrollments?.data || [];
  const userBookmarks = bookmarks?.data || [];

  // Calculate statistics
  const completedCourses = enrolledCourses.filter((e: any) => e.completed).length;
  const inProgressCourses = enrolledCourses.length - completedCourses;
  const averageProgress = enrolledCourses.length
    ? enrolledCourses.reduce((acc: number, curr: any) => acc + curr.progress, 0) /
      enrolledCourses.length
    : 0;

  const handleEditClick = () => {
    setIsEditDialogOpen(true);
  };

  const handleEditClose = () => {
    setIsEditDialogOpen(false);
  };

  return (
    <Container>
      <Grid container spacing={3}>
        {/* Profile Overview */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 3 }}>
            <Avatar
              sx={{ width: 100, height: 100 }}
              src={user?.profile_picture || undefined}
            >
              {user?.user.first_name?.[0]}
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="h4">
                  {user?.user.first_name} {user?.user.last_name}
                </Typography>
                <Tooltip title="Edit Profile">
                  <IconButton onClick={handleEditClick}>
                    <EditIcon />
                  </IconButton>
                </Tooltip>
              </Box>
              <Typography variant="subtitle1" color="text.secondary">
                @{user?.user.username}
              </Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                {user?.bio || 'No bio added yet'}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Learning Statistics */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Learning Statistics
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <SchoolIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Enrolled Courses"
                    secondary={enrolledCourses.length}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Completed Courses"
                    secondary={completedCourses}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <TimelineIcon color="info" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Average Progress"
                    secondary={`${Math.round(averageProgress)}%`}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <List>
                {enrolledCourses.slice(0, 5).map((enrollment: any) => (
                  <React.Fragment key={enrollment.id}>
                    <ListItem
                      secondaryAction={
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<PlayCircleIcon />}
                          onClick={() =>
                            navigate(`/courses/${enrollment.course.id}`)
                          }
                        >
                          Continue
                        </Button>
                      }
                    >
                      <ListItemText
                        primary={enrollment.course.title}
                        secondary={`Progress: ${Math.round(enrollment.progress)}%`}
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Bookmarked Lessons */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Bookmarked Lessons
              </Typography>
              <List>
                {userBookmarks.map((bookmark: any) => (
                  <React.Fragment key={bookmark.id}>
                    <ListItem
                      secondaryAction={
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() =>
                            navigate(
                              `/courses/${bookmark.lesson.section.course.id}/lessons/${bookmark.lesson.id}`
                            )
                          }
                        >
                          View Lesson
                        </Button>
                      }
                    >
                      <ListItemIcon>
                        <BookmarkIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={bookmark.lesson.title}
                        secondary={
                          <>
                            {bookmark.lesson.section.course.title} -{' '}
                            {bookmark.lesson.section.title}
                            {bookmark.note && (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mt: 0.5 }}
                              >
                                Note: {bookmark.note}
                              </Typography>
                            )}
                          </>
                        }
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
                {userBookmarks.length === 0 && (
                  <ListItem>
                    <ListItemText
                      primary="No bookmarks yet"
                      secondary="Bookmark lessons to quickly access them later"
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <ProfileEditDialog
        open={isEditDialogOpen}
        onClose={handleEditClose}
        userData={user}
      />
    </Container>
  );
};

export default Profile; 