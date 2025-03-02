import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import CourseForm from './pages/CourseForm';
import LessonViewer from './pages/LessonViewer';
import QuizViewer from './pages/QuizViewer';
import QuizForm from './pages/QuizForm';
import QuizResults from './pages/QuizResults';
import MyLearning from './pages/MyLearning';
import Profile from './pages/Profile';

// Create a client for React Query
const queryClient = new QueryClient();

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: '#008374',
      light: '#33998c',
      dark: '#005b51',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#00b6a1',
      light: '#33c4b4',
      dark: '#007f70',
      contrastText: '#ffffff',
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Dataidea Sans", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"Dataidea Sans", "Helvetica", "Arial", sans-serif',
      fontWeight: 700,
    },
    h2: {
      fontFamily: '"Dataidea Sans", "Helvetica", "Arial", sans-serif',
      fontWeight: 700,
    },
    h3: {
      fontFamily: '"Dataidea Sans", "Helvetica", "Arial", sans-serif',
      fontWeight: 600,
    },
    h4: {
      fontFamily: '"Dataidea Sans", "Helvetica", "Arial", sans-serif',
      fontWeight: 600,
    },
    h5: {
      fontFamily: '"Dataidea Sans", "Helvetica", "Arial", sans-serif',
      fontWeight: 600,
    },
    h6: {
      fontFamily: '"Dataidea Sans", "Helvetica", "Arial", sans-serif',
      fontWeight: 600,
    },
    button: {
      fontFamily: '"Dataidea Sans", "Helvetica", "Arial", sans-serif',
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 0,
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 0,
        },
      },
    },
  },
});

// Configure React Router future flags
const router = {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
  },
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <Router {...router}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Routes>
                        <Route path="/" element={<Navigate to="/courses" replace />} />
                        <Route path="/courses" element={<Courses />} />
                        <Route path="/courses/create" element={<CourseForm />} />
                        <Route path="/courses/:id" element={<CourseDetail />} />
                        <Route path="/courses/:id/edit" element={<CourseForm />} />
                        <Route path="/courses/:courseId/lessons/:lessonId" element={<LessonViewer />} />
                        {/* Quiz routes */}
                        <Route path="/courses/:courseId/quizzes/create" element={<QuizForm />} />
                        <Route path="/courses/:courseId/quizzes/:quizId" element={<QuizViewer />} />
                        <Route path="/courses/:courseId/quizzes/:quizId/edit" element={<QuizForm />} />
                        <Route path="/courses/:courseId/quizzes/:quizId/results/:attemptId" element={<QuizResults />} />
                        {/* My Learning route */}
                        <Route path="/my-learning" element={<MyLearning />} />
                        {/* Profile route */}
                        <Route path="/profile" element={<Profile />} />
                      </Routes>
                    </Layout>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
