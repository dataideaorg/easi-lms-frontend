import React, { useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Alert,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import {
  PlayCircleOutline as PlayIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as UncheckedIcon,
  NavigateNext as NextIcon,
  NavigateBefore as PrevIcon,
  Download as DownloadIcon,
  BookmarkBorder as BookmarkIcon,
  Bookmark as BookmarkFilledIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { coursesAPI } from '../services/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const LessonViewer: React.FC = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: course, isLoading: isLoadingCourse } = useQuery(
    ['course', courseId],
    () => coursesAPI.getCourse(Number(courseId))
  );

  const { data: sections } = useQuery(
    ['course', courseId, 'sections'],
    () => coursesAPI.getSections(Number(courseId)),
    {
      enabled: !!courseId,
    }
  );

  const currentLesson = sections?.data
    .flatMap((section: any) => section.lessons)
    .find((lesson: any) => lesson.id === Number(lessonId));

  const currentSection = sections?.data.find((section: any) =>
    section.lessons.some((lesson: any) => lesson.id === Number(lessonId))
  );

  const completeMutation = useMutation(
    () =>
      coursesAPI.markLessonComplete(
        Number(courseId),
        currentSection?.id,
        Number(lessonId)
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['course', courseId]);
      },
    }
  );

  const findAdjacentLesson = (direction: 'next' | 'prev') => {
    if (!sections?.data) return null;

    const allLessons = sections.data.flatMap((section: any) => section.lessons);
    const currentIndex = allLessons.findIndex(
      (lesson: any) => lesson.id === Number(lessonId)
    );

    if (direction === 'next' && currentIndex < allLessons.length - 1) {
      return allLessons[currentIndex + 1];
    } else if (direction === 'prev' && currentIndex > 0) {
      return allLessons[currentIndex - 1];
    }

    return null;
  };

  const handleComplete = () => {
    completeMutation.mutate();
  };

  const handleNavigation = (direction: 'next' | 'prev') => {
    const adjacentLesson = findAdjacentLesson(direction);
    if (adjacentLesson) {
      navigate(`/courses/${courseId}/lessons/${adjacentLesson.id}`);
    }
  };

  // Add state for bookmarks
  const [isBookmarked, setIsBookmarked] = React.useState(false);

  // Add function to handle bookmark toggle
  const handleBookmarkToggle = () => {
    setIsBookmarked(!isBookmarked);
    // TODO: Implement bookmark API
  };

  // Add function to handle content download
  const handleDownload = () => {
    const content = currentLesson.content;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentLesson.title}.md`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  if (isLoadingCourse || !currentLesson) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const courseData = course?.data;

  return (
    <Container>
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h4" gutterBottom>
              {currentLesson.title}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Download lesson content">
                <IconButton onClick={handleDownload}>
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title={isBookmarked ? "Remove bookmark" : "Add bookmark"}>
                <IconButton onClick={handleBookmarkToggle}>
                  {isBookmarked ? <BookmarkFilledIcon /> : <BookmarkIcon />}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            {currentSection?.title}
          </Typography>

          {courseData?.is_enrolled && (
            <Box sx={{ mt: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Course Progress
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {Math.round(courseData.progress)}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={courseData.progress}
                sx={{ height: 8, borderRadius: 4, mb: 2 }}
              />
            </Box>
          )}

          <Divider sx={{ my: 3 }} />

          {currentLesson.video_url && (
            <Box sx={{ mb: 4 }}>
              <iframe
                width="100%"
                height="400"
                src={currentLesson.video_url}
                title={currentLesson.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </Box>
          )}

          <Box sx={{ 
            backgroundColor: 'background.paper',
            borderRadius: 1,
            p: 2,
            '& pre': { margin: 0 },
            '& code': { fontSize: '0.9em' }
          }}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={vscDarkPlus}
                      language={match[1]}
                      PreTag="div"
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                }
              }}
            >
              {currentLesson.content}
            </ReactMarkdown>
          </Box>

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<PrevIcon />}
                onClick={() => handleNavigation('prev')}
                disabled={!findAdjacentLesson('prev')}
              >
                Previous
              </Button>
              <Button
                variant="outlined"
                endIcon={<NextIcon />}
                onClick={() => handleNavigation('next')}
                disabled={!findAdjacentLesson('next')}
              >
                Next
              </Button>
            </Box>

            {courseData?.is_enrolled && (
              <Button
                variant="contained"
                color="primary"
                onClick={handleComplete}
                disabled={completeMutation.isLoading || currentLesson.completed}
                startIcon={currentLesson.completed ? <CheckCircleIcon /> : undefined}
              >
                {currentLesson.completed ? 'Completed' : 'Mark as Complete'}
              </Button>
            )}
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Course Content
          </Typography>
          <List>
            {sections?.data.map((section: any) => (
              <React.Fragment key={section.id}>
                <ListItem>
                  <ListItemText
                    primary={section.title}
                    sx={{ fontWeight: 'bold' }}
                  />
                  {courseData?.is_enrolled && (
                    <Typography variant="body2" color="text.secondary">
                      {Math.round(section.progress)}% Complete
                    </Typography>
                  )}
                </ListItem>
                <List component="div" disablePadding>
                  {section.lessons.map((lesson: any) => (
                    <ListItem
                      key={lesson.id}
                      sx={{
                        pl: 4,
                        bgcolor:
                          lesson.id === Number(lessonId)
                            ? 'action.selected'
                            : 'inherit',
                      }}
                      secondaryAction={
                        courseData?.is_enrolled ? (
                          <IconButton
                            edge="end"
                            onClick={() =>
                              navigate(`/courses/${courseId}/lessons/${lesson.id}`)
                            }
                          >
                            {lesson.completed ? (
                              <CheckCircleIcon color="success" />
                            ) : (
                              <UncheckedIcon />
                            )}
                          </IconButton>
                        ) : (
                          <IconButton
                            edge="end"
                            onClick={() =>
                              navigate(`/courses/${courseId}/lessons/${lesson.id}`)
                            }
                          >
                            <PlayIcon />
                          </IconButton>
                        )
                      }
                    >
                      <ListItemIcon>
                        <PlayIcon />
                      </ListItemIcon>
                      <ListItemText primary={lesson.title} />
                    </ListItem>
                  ))}
                </List>
              </React.Fragment>
            ))}
          </List>
        </Box>
      </Paper>
    </Container>
  );
};

export default LessonViewer; 