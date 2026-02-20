import supabase from '../config/supabaseClient';

// 1. Fetch all unassigned requests
export const getUnassignedRequests = async () => {
    const { data, error } = await supabase
        .from('requests')
        .select('*')
        .eq('status', 'Pending')
        .is('worker_id', null)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
};

// 2. Accept a request
export const acceptRequest = async (requestId, workerId) => {
    const { data, error } = await supabase
        .from('requests')
        .update({
            worker_id: workerId,
            status: 'Accepted'
        })
        .eq('id', requestId)
        .select()
        .single();

    if (error) throw error;
    return data;
};

// 3. Fetch requests assigned to the worker
export const getWorkerRequests = async (workerId) => {
    const { data, error } = await supabase
        .from('requests')
        .select('*')
        .eq('worker_id', workerId)
        .order('updated_at', { ascending: false });

    if (error) throw error;
    return data;
};

// 4. Update status (e.g., 'In Progress')
export const updateRequestStatus = async (requestId, status) => {
    const { data, error } = await supabase
        .from('requests')
        .update({ status })
        .eq('id', requestId)
        .select()
        .single();

    if (error) throw error;
    return data;
};

// 5. Complete work
export const completeRequest = async (requestId, completionData) => {
    const {
        after_image_url,
        completion_time_minutes,
        final_earning
    } = completionData;

    const { data, error } = await supabase
        .from('requests')
        .update({
            after_image_url,
            completion_time_minutes,
            final_earning,
            status: 'Completed'
        })
        .eq('id', requestId)
        .select()
        .single();

    if (error) throw error;
    return data;
};
