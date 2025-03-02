import axios from 'axios';

const LMS_API_URL = 'https://lmsapi.dataidea.org/api';

// Function to get CSRF token from cookies
function getCsrfToken() {
  const name = 'csrftoken';
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

// Create API instance
const lmsApi = axios.create({
  baseURL: LMS_API_URL,
  withCredentials: true,
});

// Add request interceptor to include CSRF token
lmsApi.interceptors.request.use(
  (config) => {
    // Get CSRF token
    const csrfToken = getCsrfToken();
    
    // Always set the X-CSRFToken header if we have a token
    if (csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken;
    }
    
    // Set Content-Type header based on the request data
    if (config.data instanceof FormData) {
      // Don't set Content-Type for FormData, let the browser set it
      delete config.headers['Content-Type'];
    } else {
      config.headers['Content-Type'] = 'application/json';
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
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  getCsrfToken: async () => {
    const response = await lmsApi.get('/users/csrf_token/');
    return response.data;
  },
  login: async (username: string, password: string) => {
    try {
      await authAPI.getCsrfToken();
      const response = await lmsApi.post('/users/login/', { username, password });
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
    try {
      await authAPI.getCsrfToken();
      const response = await lmsApi.post('/users/register/', data);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },
  getProfile: () => lmsApi.get('/users/me/'),
  updateProfile: (data: FormData) => lmsApi.patch('/users/me/', data),
  logout: async () => {
    try {
      await authAPI.getCsrfToken();
      const response = await lmsApi.post('/users/logout/');
      return response.data;
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