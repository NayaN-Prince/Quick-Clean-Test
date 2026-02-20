import supabase from '../config/supabaseClient';

export const submitRequest = async (requestData, userId) => {
    const {
        garbage_type,
        weight_kg,
        address,
        latitude,
        longitude,
        image_url,
        preferred_date,
        preferred_time,
        mobile_contact,
        estimated_price
    } = requestData;

    const { data, error } = await supabase
        .from('requests')
        .insert([
            {
                user_id: userId,
                garbage_type,
                weight_kg,
                address,
                latitude,
                longitude,
                image_url,
                preferred_date,
                preferred_time,
                mobile_contact,
                estimated_price,
                status: 'Pending'
            }
        ])
        .select();

    if (error) throw error;
    return data[0];
};

export const getUserRequests = async (userId) => {
    const { data, error } = await supabase
        .from('requests')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
};

export const uploadGarbageImage = async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `garbage/${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from('garbage-photos')
        .upload(filePath, file);

    if (uploadError) {
        if (uploadError.message === 'Bucket not found') {
            throw new Error('Storage bucket "garbage-photos" not found. Please create it in your Supabase Dashboard under Storage.');
        }
        throw uploadError;
    }

    const { data } = supabase.storage
        .from('garbage-photos')
        .getPublicUrl(filePath);

    return data.publicUrl;
};

export const getNotifications = async (userId) => {
    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('sent_at', { ascending: false });

    if (error) throw error;
    return data;
};
