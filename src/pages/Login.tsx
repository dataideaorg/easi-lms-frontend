import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const message = location.state?.message;

  const formik = useFormik({
    initialValues: {
      username: '',
      password: '',
    },
    validationSchema: Yup.object({
      username: Yup.string().required('Required'),
      password: Yup.string().required('Required'),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        setError(null);
        await login(values.username, values.password);
        navigate('/courses');
      } catch (err: any) {
        console.error('Login failed:', err);
        setError(
          err.response?.data?.error || 
          err.response?.data?.detail || 
          'Login failed. Please check your credentials and try again.'
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-primary mt-6  text-center text-3xl font-extrabold text-gray-900">
            Welcome back, Login
          </h2>
          
        </div>

        {message && (
          <div className="rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className=" font-medium text-green-800">{message}</p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className=" font-medium text-red-800">Error</h3>
                <div className="mt-2  text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={formik.handleSubmit} noValidate>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              
              <input
                id="username"
                type="text"
                autoComplete="username"
                required
                placeholder="Username"
                className={`font-medium mt-1 appearance-none relative block w-full p-4 border ${
                  formik.touched.username && formik.errors.username
                    ? 'border-red-300'
                    : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:`}
                {...formik.getFieldProps('username')}
              />
              {formik.touched.username && formik.errors.username && (
                <p className="mt-1  text-red-600">{formik.errors.username}</p>
              )}
            </div>

            <div>
              
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="Password"
                className={`font-medium mt-1 appearance-none relative block w-full p-4 border ${
                  formik.touched.password && formik.errors.password
                    ? 'border-red-300'
                    : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:`}
                {...formik.getFieldProps('password')}
              />
              {formik.touched.password && formik.errors.password && (
                <p className="mt-1  text-red-600">{formik.errors.password}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={formik.isSubmitting}
              className={`group relative w-full flex justify-center p-4 border border-transparent  font-medium rounded-md text-white ${
                formik.isSubmitting
                  ? 'bg-primary-light cursor-not-allowed'
                  : 'bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary'
              }`}
            >
              {formik.isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
            <p className="mt-2 text-center  text-gray-600">
            Don't have an account?{' '}
            <Link 
            onClick={() => {
              alert('You will be redirected to the DATAIDEA website to create an account.');
              window.open('https://www.dataidea.org/register', '_blank');
            }}
            to="" className="font-medium text-primary hover:text-primary-dark">
              Register
            </Link>
          </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login; 