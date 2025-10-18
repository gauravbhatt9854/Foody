import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UtensilsCrossed, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useForm } from '../hooks';
import Button from '../components/Button';
import Alert from '../components/Alert';

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register, isAuthenticated, error, clearError } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Clear errors when component unmounts
  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useForm(
    {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'student',
      studentId: '',
      phone: '',
      address: '',
    },
    {
      name: {
        required: 'Name is required',
        minLength: 2,
        minLengthMessage: 'Name must be at least 2 characters',
      },
      email: {
        required: 'Email is required',
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        patternMessage: 'Please enter a valid email address',
      },
      password: {
        required: 'Password is required',
        minLength: 6,
        minLengthMessage: 'Password must be at least 6 characters',
      },
      confirmPassword: {
        required: 'Please confirm your password',
        custom: (value) => {
          if (value !== values.password) {
            return 'Passwords do not match';
          }
          return '';
        },
      },
      studentId: {
        required: values.role === 'student' ? 'Student ID is required for students' : false,
      },
    }
  );

  const onSubmit = async (formData) => {
    try {
      // Remove confirmPassword from submission data
      const { confirmPassword, ...submitData } = formData;
      
      const result = await register(submitData);
      if (result.success) {
        navigate('/', { replace: true });
      }
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <UtensilsCrossed className="h-12 w-12 text-primary-600" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Join Foody
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Create your account to start ordering
          </p>
        </div>

        {/* Registration Form */}
        <form 
          className="mt-8 space-y-6" 
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(onSubmit);
          }}
        >
          {/* Error Alert */}
          {error && (
            <Alert 
              type="error" 
              message={error} 
              onClose={clearError}
            />
          )}

          <div className="space-y-4">
            {/* Name Input */}
            <div>
              <label htmlFor="name" className="form-label">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                value={values.name}
                onChange={(e) => handleChange('name', e.target.value)}
                onBlur={() => handleBlur('name')}
                className={`form-input ${
                  touched.name && errors.name ? 'form-input-error' : ''
                }`}
                placeholder="Enter your full name"
              />
              {touched.name && errors.name && (
                <p className="form-error">{errors.name}</p>
              )}
            </div>

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={values.email}
                onChange={(e) => handleChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                className={`form-input ${
                  touched.email && errors.email ? 'form-input-error' : ''
                }`}
                placeholder="Enter your email"
              />
              {touched.email && errors.email && (
                <p className="form-error">{errors.email}</p>
              )}
            </div>

            {/* Role Selection */}
            <div>
              <label htmlFor="role" className="form-label">
                Role
              </label>
              <select
                id="role"
                name="role"
                value={values.role}
                onChange={(e) => handleChange('role', e.target.value)}
                className="form-input"
              >
                <option value="student">Student</option>
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Student ID (conditional) */}
            {values.role === 'student' && (
              <div>
                <label htmlFor="studentId" className="form-label">
                  Student ID
                </label>
                <input
                  id="studentId"
                  name="studentId"
                  type="text"
                  value={values.studentId}
                  onChange={(e) => handleChange('studentId', e.target.value)}
                  onBlur={() => handleBlur('studentId')}
                  className={`form-input ${
                    touched.studentId && errors.studentId ? 'form-input-error' : ''
                  }`}
                  placeholder="Enter your student ID"
                />
                {touched.studentId && errors.studentId && (
                  <p className="form-error">{errors.studentId}</p>
                )}
              </div>
            )}

            {/* Phone Number */}
            <div>
              <label htmlFor="phone" className="form-label">
                Phone Number (Optional)
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                value={values.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="form-input"
                placeholder="Enter your phone number"
              />
            </div>

            {/* Address */}
            <div>
              <label htmlFor="address" className="form-label">
                Address (Optional)
              </label>
              <textarea
                id="address"
                name="address"
                rows={2}
                value={values.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="form-input"
                placeholder="Enter your address"
              />
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={values.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  onBlur={() => handleBlur('password')}
                  className={`form-input pr-10 ${
                    touched.password && errors.password ? 'form-input-error' : ''
                  }`}
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {touched.password && errors.password && (
                <p className="form-error">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password Input */}
            <div>
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={values.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  onBlur={() => handleBlur('confirmPassword')}
                  className={`form-input pr-10 ${
                    touched.confirmPassword && errors.confirmPassword ? 'form-input-error' : ''
                  }`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {touched.confirmPassword && errors.confirmPassword && (
                <p className="form-error">{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <Button
              type="submit"
              loading={isSubmitting}
              fullWidth
              size="lg"
            >
              Create Account
            </Button>
          </div>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;