/**
 * Supabase Client Configuration for QuickClean
 * 
 * This initializes the Supabase client for authentication and database operations.
 * Includes comprehensive validation and error logging.
 */

import { createClient } from '@supabase/supabase-js';

// Debug environment variables safely in Vite
// console.log('All VITE_ vars:', Object.keys(import.meta.env).filter(key => key.startsWith('VITE_')));

// Hardcoded credentials as requested for permanent fix
const supabaseUrl = 'https://odcsntscfreytcosxiof.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kY3NudHNjZnJleXRjb3N4aW9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzNDIwMDksImV4cCI6MjA4NTkxODAwOX0.72Zji8jeMHyzFjReu05ub8VAoEYtmm8sT6UgLJknPlc';

console.log('🔑 Supabase Configuration Status:');
console.log('URL and Key are hardcoded locally.');

// Validate URL format
if (!supabaseUrl.startsWith('https://')) {
    console.error('❌ Invalid Supabase URL format. Should start with https://');
    throw new Error('Invalid REACT_APP_SUPABASE_URL format');
}

// Validate key format (JWT tokens start with 'eyJ')
if (!supabaseAnonKey.startsWith('eyJ')) {
    console.error('❌ Invalid Supabase anon key format. Should be a JWT token starting with eyJ');
    throw new Error('Invalid REACT_APP_SUPABASE_ANON_KEY format');
}

console.log('✅ Supabase credentials validated successfully');
console.log('🌐 Connecting to:', supabaseUrl);

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storage: window.localStorage,
        flowType: 'pkce' // PKCE flow for better security
    }
});

// Test connection on initialization
console.log('🔌 Testing Supabase connection...');
supabase.auth.getSession()
    .then(({ data, error }) => {
        if (error) {
            console.warn('⚠️ Supabase connection test warning:', error.message);
        } else {
            console.log('✅ Supabase client initialized successfully');
            console.log('📡 Connection status: Ready');
        }
    })
    .catch((err) => {
        console.error('❌ Supabase connection test failed:', err);
        console.error('This may indicate network issues or incorrect credentials');
    });

export default supabase;

