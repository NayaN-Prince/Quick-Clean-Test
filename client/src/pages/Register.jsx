import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import supabase from '../config/supabaseClient';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user' // Default to user
  });
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const { name, email, password, role } = formData;

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      console.log('🚀 Starting registration process...');
      console.log('📧 Email:', email);
      console.log('👤 Name:', name);
      console.log('🎭 Role:', role);

      // Validate password strength
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      // Sign up using Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            name: name,
            role: role
          },
          // Enable email confirmation
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      // Detailed error logging
      if (signUpError) {
        console.error('❌ Supabase Auth Error:', signUpError);
        console.error('Error Code:', signUpError.code);
        console.error('Error Message:', signUpError.message);
        console.error('Error Status:', signUpError.status);

        // Handle specific error cases
        if (signUpError.message.includes('already registered')) {
          throw new Error('This email is already registered. Please login instead.');
        } else if (signUpError.message.includes('invalid')) {
          throw new Error('Invalid email or password format. Please check your input.');
        } else if (signUpError.message.includes('password')) {
          throw new Error('Password does not meet requirements. Must be at least 6 characters.');
        } else if (signUpError.code === 'weak_password') {
          throw new Error('Password is too weak. Please use a stronger password.');
        } else if (signUpError.status === 429) {
          throw new Error('Too many requests. Please wait a moment and try again.');
        } else {
          throw new Error(signUpError.message || 'Registration failed');
        }
      }

      console.log('✅ Sign up successful:', data);

      // Check if email confirmation is required
      if (data.user && !data.session) {
        console.log('📧 Email confirmation required');
        setSuccessMessage(
          'Registration successful! Please check your email to confirm your account. ' +
          'Check your spam folder if you don\'t see the email.'
        );

        // Clear form
        setFormData({
          name: '',
          email: '',
          password: '',
          role: 'user'
        });

        // Optionally redirect to a confirmation page after a delay
        setTimeout(() => {
          navigate('/login', {
            state: {
              message: 'Please verify your email before logging in.'
            }
          });
        }, 5000);
      }
      // If email confirmation is disabled, user gets logged in immediately
      else if (data.session) {
        console.log('✅ User logged in immediately (email confirmation disabled)');
        console.log('Session:', data.session);

        setSuccessMessage('Registration successful! Redirecting...');

        // Redirect based on role
        setTimeout(() => {
          if (role === 'worker') {
            navigate('/worker-dashboard');
          } else if (role === 'admin') {
            navigate('/admin-dashboard');
          } else {
            navigate('/user-dashboard');
          }
        }, 2000);
      }

    } catch (err) {
      console.error('❌ Registration Error:', err);

      // Handle specific error types
      let errorMessage = 'Registration failed. Please try again.';

      // Network errors (Failed to fetch, TypeError: Failed to fetch)
      if (err.message === 'Failed to fetch' || err.name === 'TypeError' || err.message.includes('fetch')) {
        errorMessage = '❌ Unable to connect to server. Please check:\n' +
          '1. Your internet connection\n' +
          '2. Dev server is running (npm start)\n' +
          '3. Environment variables are loaded (check console)\n' +
          '4. Try refreshing the page';
        console.error('🌐 Network Error Details:');
        console.error('- This usually means environment variables are not loaded');
        console.error('- Or the Supabase client failed to initialize');
        console.error('- Check the console logs above for Supabase client initialization');
      }
      // Supabase client not initialized
      else if (err.message.includes('supabase') || err.message.includes('REACT_APP')) {
        errorMessage = '❌ Configuration Error: Please restart the dev server\n' +
          '1. Press Ctrl+C to stop the server\n' +
          '2. Run npm start again\n' +
          '3. Refresh this page';
      }

      setError(errorMessage || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 py-8">
      <div className="w-full max-w-md bg-white p-8 rounded shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Create Account</h2>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            <strong>Success:</strong> {successMessage}
          </div>
        )}

        <form onSubmit={onSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Full Name</label>
            <input
              type="text"
              name="name"
              value={name}
              onChange={onChange}
              className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              required
              disabled={loading}
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={onChange}
              className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              required
              disabled={loading}
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Password</label>
            <input
              type="password"
              name="password"
              value={password}
              onChange={onChange}
              className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              required
              minLength="6"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters</p>
          </div>

          {/* Role Selection */}
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">I want to register as a:</label>
            <select
              name="role"
              value={role}
              onChange={onChange}
              className="w-full border border-gray-300 p-2 rounded bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
              disabled={loading}
            >
              <option value="user">Customer (Request Pickup)</option>
              <option value="worker">Worker (Collect Waste)</option>
              <option value="admin">Administrator (Command Center)</option>
            </select>
          </div>

          <button
            type="submit"
            className={`w-full text-white p-3 rounded font-semibold transition-colors ${loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700'
              }`}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-4 text-center text-gray-600">
          Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;