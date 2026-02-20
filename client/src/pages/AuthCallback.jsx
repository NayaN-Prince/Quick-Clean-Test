import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../config/supabaseClient';

/**
 * Auth Callback Component
 * 
 * This page handles the email confirmation redirect from Supabase.
 * Users are redirected here after clicking the confirmation link in their email.
 */
const AuthCallback = () => {
    const navigate = useNavigate();
    const [status, setStatus] = useState('verifying');
    const [message, setMessage] = useState('Verifying your email...');

    useEffect(() => {
        const handleEmailConfirmation = async () => {
            try {
                // Get the current session after email confirmation
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) {
                    console.error('Error getting session:', error);
                    setStatus('error');
                    setMessage('Email verification failed. Please try again or contact support.');
                    return;
                }

                if (session) {
                    console.log('✅ Email verified successfully!');
                    console.log('User:', session.user);

                    setStatus('success');
                    setMessage('Email verified successfully! Redirecting to your dashboard...');

                    // Get user metadata to determine role
                    const role = session.user.user_metadata?.role || 'user';

                    // Redirect based on role after 2 seconds
                    setTimeout(() => {
                        if (role === 'worker') {
                            navigate('/worker-dashboard');
                        } else {
                            navigate('/user-dashboard');
                        }
                    }, 2000);
                } else {
                    setStatus('error');
                    setMessage('No active session found. Please log in.');

                    setTimeout(() => {
                        navigate('/login');
                    }, 3000);
                }
            } catch (err) {
                console.error('Unexpected error:', err);
                setStatus('error');
                setMessage('An unexpected error occurred. Please try logging in.');

                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            }
        };

        handleEmailConfirmation();
    }, [navigate]);

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md bg-white p-8 rounded shadow-md text-center">
                <div className="mb-6">
                    {status === 'verifying' && (
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                    )}
                    {status === 'success' && (
                        <div className="text-green-600 text-6xl">✓</div>
                    )}
                    {status === 'error' && (
                        <div className="text-red-600 text-6xl">✗</div>
                    )}
                </div>

                <h2 className="text-2xl font-bold mb-4">
                    {status === 'verifying' && 'Verifying Email'}
                    {status === 'success' && 'Success!'}
                    {status === 'error' && 'Verification Failed'}
                </h2>

                <p className="text-gray-600">{message}</p>
            </div>
        </div>
    );
};

export default AuthCallback;
