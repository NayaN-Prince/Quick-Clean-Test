import React, { useState } from 'react';
import { submitServiceRequest } from '../../services/requestService';
import { useNavigate } from 'react-router-dom';

const ServiceRequestForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    wasteType: 'Plastic',
    quantity: 'Small (< 5kg)',
    urgency: 'Standard',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Construct payload matching Backend Model
      const payload = {
        ...formData,
        location: {
            address: formData.address,
            // Hardcoded coordinates for demo (Use MapSelector.jsx for real data)
            coordinates: { lat: 19.0760, lng: 72.8777 } 
        }
      };

      await submitServiceRequest(payload);
      alert('Request Submitted Successfully!');
      navigate('/dashboard'); // Redirect to dashboard
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md mt-10">
      <h2 className="text-2xl font-bold mb-6 text-center">Request Pickup</h2>
      
      {error && <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Waste Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Waste Type</label>
          <select 
            name="wasteType" 
            value={formData.wasteType} 
            onChange={handleChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          >
            <option>Plastic</option>
            <option>Organic</option>
            <option>Metal</option>
            <option>Electronic</option>
          </select>
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Quantity</label>
          <select 
            name="quantity" 
            value={formData.quantity} 
            onChange={handleChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          >
            <option>Small (&lt; 5kg)</option>
            <option>Medium (5-15kg)</option>
            <option>Large (15kg+)</option>
          </select>
        </div>

        {/* Urgency */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Urgency</label>
          <div className="flex gap-4 mt-1">
            <label className="flex items-center">
              <input 
                type="radio" 
                name="urgency" 
                value="Standard" 
                checked={formData.urgency === 'Standard'}
                onChange={handleChange}
                className="mr-2"
              /> Standard
            </label>
            <label className="flex items-center">
              <input 
                type="radio" 
                name="urgency" 
                value="Urgent" 
                checked={formData.urgency === 'Urgent'}
                onChange={handleChange}
                className="mr-2"
              /> Urgent
            </label>
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Pickup Address</label>
          <textarea 
            name="address" 
            required
            placeholder="Enter full address"
            value={formData.address}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            rows="3"
          ></textarea>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Schedule Pickup'}
        </button>
      </form>
    </div>
  );
};

export default ServiceRequestForm;