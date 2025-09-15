import React, { useState } from 'react';
import './SubmitReport.css';

const SubmitReport = () => {
  const [formData, setFormData] = useState({
    title: '',
    location_name: '',
    address: '',
    pincode: '',
    description: '',
    department: '',
    image: null
  });

  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      image: e.target.files[0]
    }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  try {
    // THIS IS WHERE THE FORMDATA CODE GOES ↓
    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title);
    formDataToSend.append('location_name', formData.location_name);
    formDataToSend.append('address', formData.address);
    formDataToSend.append('pincode', formData.pincode);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('department', formData.department);
    formDataToSend.append('user_id', 1); // Add user_id temporarily
    
    if (formData.image) {
      console.log("Adding image to form data:", formData.image);
      formDataToSend.append('image', formData.image);
    }
    // END OF FORMDATA CODE ↑

    const response = await fetch('http://localhost:5000/submit-complain', {
      method: 'POST',
      body: formDataToSend, // This sends the FormData
      
    });

    const data = await response.json();

    if (response.ok) {
      setMessage('Report submitted successfully!');
      setIsError(false);
      // Reset form
      setFormData({
        title: '',
        location_name: '',
        address: '',
        pincode: '',
        description: '',
        department: '',
        image: null
      });
      // Clear file input
      document.getElementById('image').value = '';
    } else {
      setMessage(data.error || 'Failed to submit report');
      setIsError(true);
    }
  } catch (error) {
    setMessage('Network error. Please try again.');
    setIsError(true);
  }
};

  return (
    <div className="submit-report-container">
      <div className="submit-report-form">
        <h2>Submit New Report</h2>
        
        {message && (
          <div className={`message ${isError ? 'error' : 'success'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              placeholder="Enter report title"
            />
          </div>

          <div className="form-group">
            <label htmlFor="location_name">Location Name *</label>
            <input
              type="text"
              id="location_name"
              name="location_name"
              value={formData.location_name}
              onChange={handleInputChange}
              required
              placeholder="Enter location name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="address">Address *</label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              required
              placeholder="Enter complete address"
              rows="3"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="pincode">Pincode *</label>
              <input
                type="number"
                id="pincode"
                name="pincode"
                value={formData.pincode}
                onChange={handleInputChange}
                required
                placeholder="Enter pincode"
              />
            </div>

            <div className="form-group">
              <label htmlFor="department">Department</label>
              <input
                type="text"
                id="department"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                placeholder="Enter concerned department"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              placeholder="Describe the issue in detail"
              rows="5"
            />
          </div>

          <div className="form-group">
            <label htmlFor="image">Upload Image</label>
            <input
              type="file"
              id="image"
              name="image"
              onChange={handleFileChange}
              accept="image/*"
            />
          </div>

          <button type="submit" className="submit-btn">
            Submit Report
          </button>
        </form>
      </div>
    </div>
  );
};

export default SubmitReport;