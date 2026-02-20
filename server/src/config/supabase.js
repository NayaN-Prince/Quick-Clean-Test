/**
 * Supabase Client Configuration
 * 
 * This file sets up the Supabase client for the QuickClean application.
 * Use this in place of Mongoose models for database operations.
 * 
 * Usage:
 *   const supabase = require('./config/supabase');
 *   const { data, error } = await supabase.from('users').select('*');
 */

const { createClient } = require('@supabase/supabase-js');

// Validate environment variables
if (!process.env.SUPABASE_URL) {
    throw new Error('Missing SUPABASE_URL environment variable');
}

if (!process.env.SUPABASE_ANON_KEY) {
    throw new Error('Missing SUPABASE_ANON_KEY environment variable');
}

// Create Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: false
        }
    }
);

// Optional: Add custom methods for common operations
const supabaseHelper = {
    client: supabase,

    /**
     * Get user by ID with their requests
     */
    async getUserWithRequests(userId) {
        const { data, error } = await supabase
            .from('users')
            .select(`
        *,
        requests (*)
      `)
            .eq('id', userId)
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Get request with user details
     */
    async getRequestWithUser(requestId) {
        const { data, error } = await supabase
            .from('requests')
            .select(`
        *,
        user:users (id, name, email, role),
        assigned_worker:users!assigned_worker_id (id, name, email)
      `)
            .eq('id', requestId)
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Get all pending requests
     */
    async getPendingRequests() {
        const { data, error } = await supabase
            .from('requests')
            .select(`
        *,
        user:users (id, name, email)
      `)
            .eq('status', 'Pending')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    /**
     * Create a new request
     */
    async createRequest(requestData) {
        const { data, error } = await supabase
            .from('requests')
            .insert([requestData])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Update request status
     */
    async updateRequestStatus(requestId, status, workerId = null) {
        const updateData = { status };
        if (workerId) {
            updateData.assigned_worker_id = workerId;
        }

        const { data, error } = await supabase
            .from('requests')
            .update(updateData)
            .eq('id', requestId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }
};

module.exports = supabaseHelper;
