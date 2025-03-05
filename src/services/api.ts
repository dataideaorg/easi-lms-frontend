import axios from 'axios';

const LMS_API_URL = 'https://lmsapi.dataidea.org/api';
// const LMS_API_URL = 'http://localhost:8001/api';

// Create API instance
const lmsApi = axios.create({
  baseURL: LMS_API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add request interceptor to include auth token
lmsApi.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('auth_token');
    
    // If token exists, add it to headers
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
lmsApi.interceptors.response.use(
  (response) => response,
  (error) => {
    // If unauthorized, clear token and redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (username: string, password: string) => {
    try {
      const response = await lmsApi.post('/users/login/', { username, password });
      // Save token to localStorage
      if (response.data.access) {
        localStorage.setItem('auth_token', response.data.access);
      }
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  register: async (data: {
    username: string;
    password: string;
    first_name: string;
    last_name: string;
    email: string;
    gender: 'M' | 'F' | 'N';
  }) => {
    // try {
    //   const response = await lmsApi.post('/users/register/', data);
    //   // If registration returns a token, save it
    //   if (response.data.token) {
    //     localStorage.setItem('auth_token', response.data.token);
    //   }
    //   return response.data;
    // } catch (error) {
    //   console.error('Registration error:', error);
    //   throw error;
    // }
    const response = await fetch("https://dataidea.pythonanywhere.com/accounts/register/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Error registering user");
    }
  },
  getProfile: () => lmsApi.get('/users/me/'),
  updateProfile: (data: FormData) => lmsApi.patch('/users/me/', data),
  logout: async () => {
    try {
      // Clear token from localStorage
      localStorage.removeItem('auth_token');
      return { detail: 'Successfully logged out' };
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },
};

// Courses API
export const coursesAPI = {
  getAllCourses: () => lmsApi.get('/courses/'),
  getCourse: (id: number) => lmsApi.get(`/courses/${id}/`),
  createCourse: (data: any) => lmsApi.post('/courses/', data),
  updateCourse: (id: number, data: any) => lmsApi.put(`/courses/${id}/`, data),
  deleteCourse: (id: number) => lmsApi.delete(`/courses/${id}/`),
  enrollInCourse: (id: number) => lmsApi.post(`/courses/${id}/enroll/`),
  getEnrollments: () => lmsApi.get('/enrollments/'),

  // Sections
  getSections: (courseId: number) => lmsApi.get(`/courses/${courseId}/sections/`),
  createSection: (courseId: number, data: any) =>
    lmsApi.post(`/courses/${courseId}/sections/`, data),
  updateSection: (courseId: number, sectionId: number, data: any) =>
    lmsApi.put(`/courses/${courseId}/sections/${sectionId}/`, data),
  deleteSection: (courseId: number, sectionId: number) =>
    lmsApi.delete(`/courses/${courseId}/sections/${sectionId}/`),

  // Lessons
  getLessons: (courseId: number, sectionId: number) =>
    lmsApi.get(`/courses/${courseId}/sections/${sectionId}/lessons/`),
  createLesson: (courseId: number, sectionId: number, data: any) =>
    lmsApi.post(`/courses/${courseId}/sections/${sectionId}/lessons/`, data),
  updateLesson: (courseId: number, sectionId: number, lessonId: number, data: any) =>
    lmsApi.put(`/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}/`, data),
  deleteLesson: (courseId: number, sectionId: number, lessonId: number) =>
    lmsApi.delete(`/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}/`),
  markLessonComplete: (courseId: number, sectionId: number, lessonId: number) =>
    lmsApi.post(`/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}/mark_complete/`),

  // Bookmarks
  addBookmark: (courseId: number, sectionId: number, lessonId: number, note?: string) =>
    lmsApi.post(`/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}/bookmark/`, { note }),
  removeBookmark: (courseId: number, sectionId: number, lessonId: number) =>
    lmsApi.delete(`/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}/bookmark/`),
  getBookmarks: () => lmsApi.get('/bookmarks/'),
};

// Quizzes API
export const quizzesAPI = {
  getQuizzes: (courseId: number) => lmsApi.get(`/courses/${courseId}/quizzes/`),
  getQuiz: (courseId: number, quizId: number) =>
    lmsApi.get(`/courses/${courseId}/quizzes/${quizId}/`),
  createQuiz: (courseId: number, data: any) =>
    lmsApi.post(`/courses/${courseId}/quizzes/`, data),
  updateQuiz: (courseId: number, quizId: number, data: any) =>
    lmsApi.put(`/courses/${courseId}/quizzes/${quizId}/`, data),
  deleteQuiz: (courseId: number, quizId: number) =>
    lmsApi.delete(`/courses/${courseId}/quizzes/${quizId}/`),

  // Quiz attempts
  startQuizAttempt: (courseId: number, quizId: number) =>
    lmsApi.post(`/courses/${courseId}/quizzes/${quizId}/start_attempt/`),
  submitQuizAttempt: (courseId: number, quizId: number, data: any) =>
    lmsApi.post(`/courses/${courseId}/quizzes/${quizId}/submit_attempt/`, data),
  getQuizAttempt: (courseId: number, quizId: number, attemptId: number) =>
    lmsApi.get(`/courses/${courseId}/quizzes/${quizId}/attempts/${attemptId}/`),

  // Questions
  getQuestions: (courseId: number, quizId: number) =>
    lmsApi.get(`/courses/${courseId}/quizzes/${quizId}/questions/`),
  createQuestion: (courseId: number, quizId: number, data: any) =>
    lmsApi.post(`/courses/${courseId}/quizzes/${quizId}/questions/`, data),
  updateQuestion: (courseId: number, quizId: number, questionId: number, data: any) =>
    lmsApi.put(`/courses/${courseId}/quizzes/${quizId}/questions/${questionId}/`, data),
  deleteQuestion: (courseId: number, quizId: number, questionId: number) =>
    lmsApi.delete(`/courses/${courseId}/quizzes/${quizId}/questions/${questionId}/`),

  // Choices
  getChoices: (courseId: number, quizId: number, questionId: number) =>
    lmsApi.get(`/courses/${courseId}/quizzes/${quizId}/questions/${questionId}/choices/`),
  createChoice: (courseId: number, quizId: number, questionId: number, data: any) =>
    lmsApi.post(`/courses/${courseId}/quizzes/${quizId}/questions/${questionId}/choices/`, data),
  updateChoice: (courseId: number, quizId: number, questionId: number, choiceId: number, data: any) =>
    lmsApi.put(`/courses/${courseId}/quizzes/${quizId}/questions/${questionId}/choices/${choiceId}/`, data),
  deleteChoice: (courseId: number, quizId: number, questionId: number, choiceId: number) =>
    lmsApi.delete(`/courses/${courseId}/quizzes/${quizId}/questions/${questionId}/choices/${choiceId}/`),
};

// Progress API
export const progressAPI = {
  getEnrollments: () => lmsApi.get('/enrollments/'),
  getLessonProgress: () => lmsApi.get('/progress/'),
};

export default lmsApi; 