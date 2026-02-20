import React, { useState, useEffect, useContext } from 'react';
import { uploadGarbageImage, submitRequest } from '../../services/supabaseRequestService';
import { AuthContext } from '../../context/AuthContext';

const RequestForm = ({ onSuccess }) => {
    const { user } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        garbage_type: 'Wet',
        weight_kg: '',
        address: '',
        preferred_date: '',
        preferred_time: '',
        mobile_contact: '',
    });
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [estimatedPrice, setEstimatedPrice] = useState(0);

    // Pricing logic
    const rates = {
        'Wet': 1.0,
        'Dry': 1.5,
        'Mixed': 2.0,
        'Recyclable': 0.8,
        'E-Waste': 5.0
    };

    useEffect(() => {
        const weight = parseFloat(formData.weight_kg) || 0;
        const rate = rates[formData.garbage_type] || 0;
        setEstimatedPrice(weight * rate);
    }, [formData.garbage_type, formData.weight_kg]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) return setError('You must be logged in');
        if (!imageFile) return setError('Please upload a garbage photo');

        setLoading(true);
        setError('');

        try {
            // 1. Upload Image
            const imageUrl = await uploadGarbageImage(imageFile);

            // 2. Submit Request
            const payload = {
                ...formData,
                weight_kg: parseFloat(formData.weight_kg),
                image_url: imageUrl,
                estimated_price: estimatedPrice,
                // Hardcoded for now as per plan
                latitude: 19.0760,
                longitude: 72.8777
            };

            await submitRequest(payload, user.id);
            setFormData({
                garbage_type: 'Wet',
                weight_kg: '',
                address: '',
                preferred_date: '',
                preferred_time: '',
                mobile_contact: '',
            });
            setImageFile(null);
            setPreviewUrl(null);
            if (onSuccess) onSuccess();
            alert('Request submitted successfully!');
        } catch (err) {
            console.error(err);
            setError(err.message || 'Error submitting request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-5">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Create Cleaning Request</h3>

            {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Image Upload */}
                <div className="space-y-2 md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700">Garbage Image</label>
                    <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors overflow-hidden">
                            {previewUrl ? (
                                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                                    </svg>
                                    <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or take a photo</p>
                                    <p className="text-xs text-gray-400">PNG, JPG or JPEG</p>
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                capture="environment"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                        </label>
                    </div>
                </div>

                {/* Waste Type */}
                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Garbage Type</label>
                    <select
                        name="garbage_type"
                        value={formData.garbage_type}
                        onChange={handleChange}
                        className="w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block"
                    >
                        {Object.keys(rates).map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>

                {/* Weight */}
                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Weight (KG)</label>
                    <input
                        type="number"
                        name="weight_kg"
                        value={formData.weight_kg}
                        onChange={handleChange}
                        required
                        placeholder="e.g. 5"
                        className="w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block"
                    />
                </div>

                {/* Date */}
                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Preferred Date</label>
                    <input
                        type="date"
                        name="preferred_date"
                        value={formData.preferred_date}
                        onChange={handleChange}
                        required
                        className="w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block"
                    />
                </div>

                {/* Time */}
                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Preferred Time</label>
                    <input
                        type="time"
                        name="preferred_time"
                        value={formData.preferred_time}
                        onChange={handleChange}
                        required
                        className="w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block"
                    />
                </div>

                {/* Address */}
                <div className="space-y-2 md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700">Location Address</label>
                    <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        required
                        placeholder="Enter full pickup address"
                        className="w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block h-20"
                    />
                </div>

                {/* Mobile */}
                <div className="space-y-2 md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700">Mobile Number (Optional)</label>
                    <input
                        type="tel"
                        name="mobile_contact"
                        value={formData.mobile_contact}
                        onChange={handleChange}
                        placeholder="+91 XXXXX XXXXX"
                        className="w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block"
                    />
                </div>
            </div>

            {/* Price Estimate */}
            <div className="p-4 bg-green-50 rounded-xl flex justify-between items-center border border-green-100">
                <div>
                    <p className="text-xs text-green-600 font-bold uppercase tracking-wider">Estimated Price</p>
                    <p className="text-2xl font-black text-green-700">₹{estimatedPrice.toFixed(2)}</p>
                    <p className="text-[10px] text-green-500">*Based on {formData.garbage_type} rates</p>
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Submitting...' : 'Submit Request'}
                </button>
            </div>
        </form>
    );
};

export default RequestForm;
