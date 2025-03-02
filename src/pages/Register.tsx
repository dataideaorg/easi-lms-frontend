import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useState } from 'react';

type RegisterFormValues = {
  username: string;
  password: string;
  first_name: string;
  last_name: string;
  email: string;
  gender: 'M' | 'F' | 'N';
};

const Register = () => {
  const navigate = useNavigate();
  const [generalError, setGeneralError] = useState<string | null>(null);

  const formik = useFormik<RegisterFormValues>({
    initialValues: {
      username: '',
      password: '',
      first_name: '',
      last_name: '',
      email: '',
      gender: 'N',
    },
    validationSchema: Yup.object({
      username: Yup.string()
        .max(25, 'Must be 25 characters or less')
        .required('Required'),
      password: Yup.string()
        .min(8, 'Must be at least 8 characters')
        .required('Required'),
      first_name: Yup.string()
        .max(25, 'Must be 25 characters or less')
        .required('Required'),
      last_name: Yup.string()
        .max(25, 'Must be 25 characters or less')
        .required('Required'),
      email: Yup.string().email('Invalid email address'),
      gender: Yup.string()
        .oneOf(['M', 'F', 'N'] as const, 'Invalid gender')
        .required('Required'),
    }),
    onSubmit: async (values, { setSubmitting, setErrors }) => {
      try {
        setGeneralError(null);
        await authAPI.register(values);
        navigate('/login', { state: { message: 'Registration successful! Please log in.' } });
      } catch (error: any) {
        console.error('Registration error:', error);
        if (error.response?.data) {
          if (typeof error.response.data === 'object') {
            setErrors(error.response.data);
          } else {
            setGeneralError(error.response.data.message || 'Registration failed. Please try again.');
          }
        } else {
          setGeneralError('An unexpected error occurred. Please try again.');
        }
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary hover:text-primary-dark">
              Sign in
            </Link>
          </p>
        </div>

        {generalError && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{generalError}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={formik.handleSubmit} noValidate>
          <div className="rounded-md shadow-sm space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <input
                  id="first_name"
                  type="text"
                  autoComplete="given-name"
                  required
                  className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                    formik.touched.first_name && formik.errors.first_name
                      ? 'border-red-300'
                      : 'border-gray-300'
                  } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm`}
                  {...formik.getFieldProps('first_name')}
                />
                {formik.touched.first_name && formik.errors.first_name && (
                  <p className="mt-1 text-sm text-red-600">{formik.errors.first_name}</p>
                )}
              </div>

              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <input
                  id="last_name"
                  type="text"
                  autoComplete="family-name"
                  required
                  className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                    formik.touched.last_name && formik.errors.last_name
                      ? 'border-red-300'
                      : 'border-gray-300'
                  } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm`}
                  {...formik.getFieldProps('last_name')}
                />
                {formik.touched.last_name && formik.errors.last_name && (
                  <p className="mt-1 text-sm text-red-600">{formik.errors.last_name}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                required
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                  formik.touched.username && formik.errors.username
                    ? 'border-red-300'
                    : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm`}
                {...formik.getFieldProps('username')}
              />
              {formik.touched.username && formik.errors.username && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.username}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email (optional)
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                  formik.touched.email && formik.errors.email
                    ? 'border-red-300'
                    : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm`}
                {...formik.getFieldProps('email')}
              />
              {formik.touched.email && formik.errors.email && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                  formik.touched.password && formik.errors.password
                    ? 'border-red-300'
                    : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm`}
                {...formik.getFieldProps('password')}
              />
              {formik.touched.password && formik.errors.password && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.password}</p>
              )}
            </div>

            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                Gender
              </label>
              <select
                id="gender"
                required
                className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border ${
                  formik.touched.gender && formik.errors.gender
                    ? 'border-red-300'
                    : 'border-gray-300'
                } focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md`}
                {...formik.getFieldProps('gender')}
              >
                <option value="N">Prefer not to say</option>
                <option value="M">Male</option>
                <option value="F">Female</option>
              </select>
              {formik.touched.gender && formik.errors.gender && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.gender}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={formik.isSubmitting}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                formik.isSubmitting
                  ? 'bg-primary-light cursor-not-allowed'
                  : 'bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary'
              }`}
            >
              {formik.isSubmitting ? 'Creating account...' : 'Create account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register; 