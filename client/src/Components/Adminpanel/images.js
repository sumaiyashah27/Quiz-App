import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaTimes, FaImage, FaCloudUploadAlt, FaTrashAlt, FaCopy } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Images() {
  const [images, setImages] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  //const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    axios
      .get('/api/images')
      .then((response) => {
        setImages(response.data);
        setLoading(false);
      })
      .catch((error) => {
        toast.error('Error fetching images');
        setLoading(false);
      });
  }, []);

  const handleFileChange = (e) => setSelectedFiles([...e.target.files]);

  const uploadImages = async () => {
    const formData = new FormData();
    selectedFiles.forEach((file) => formData.append('images', file));
    try {
      const response = await axios.post('/api/images/upload-images', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setImages(response.data);
      setIsModalOpen(false);
      setSelectedFiles([]);
      toast.success('Images uploaded successfully.');
    } catch (error) {
      console.error('Error uploading images:', error);
    }
  };//

  const deleteImage = async (imageId, imageLocation) => {
    try {
      if (!imageLocation) {
        toast.error('Image location is not available.');
        return;
      }
      await axios.delete(`/api/images/${imageId}`, { data: { location: imageLocation } });
      setImages(images.filter((image) => image._id !== imageId));
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  const Modal = ({ title, children, onClose }) => (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
      <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', width: '400px', textAlign: 'center', position: 'relative' }}>
        <span onClick={onClose} style={{ position: 'absolute', top: '10px', right: '10px', cursor: 'pointer', fontSize: '20px' }}>
          <FaTimes />
        </span>
        <h3>{title}</h3>
        {children}
      </div>
    </div>
  );

  const displaySelectedFiles = () => {
    if (selectedFiles.length === 1) {
      return `Selected: ${selectedFiles[0].name}`;
    } else if (selectedFiles.length > 1) {
      return `Selected ${selectedFiles.length} images`;
    }
    return null;
  };

  return (
    <div className="images-container" style={{ padding: '30px', backgroundColor: '#f4f4f4' }}>
      <ToastContainer />
      <h1 style={{ textAlign: 'center', color: '#333', fontSize: '2rem', marginBottom: '20px' }}>
        <FaImage style={{ marginRight: '10px' }} />
        Image Management
      </h1>

      <div onClick={() => setIsModalOpen(true)} style={{ backgroundColor: '#4CAF50', color: 'white', borderRadius: '50%', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', cursor: 'pointer', transition: 'transform 0.3s ease' }}>
        <FaPlus />
      </div>

      {isModalOpen && (
        <Modal title="Upload New Images" onClose={() => setIsModalOpen(false)}>
          <input type="file" multiple onChange={handleFileChange} style={{ marginBottom: '10px', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', width: '100%', backgroundColor: '#f9f9f9' }} />
          <p style={{ color: '#555', marginBottom: '20px' }}>{displaySelectedFiles()}</p>
          <div onClick={uploadImages} style={{ backgroundColor: '#2196F3', color: 'white', borderRadius: '50%', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', cursor: 'pointer' }}>
            <FaCloudUploadAlt />
          </div>
        </Modal>
      )}

      <div className="image-gallery" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px', marginTop: '30px' }}>
        {images.map((image, index) => {
          const imageUrl = `${image.location}`;
          return (
            <div key={index} style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', backgroundColor: '#fff' }}>
              <a href={imageUrl} target="_blank" rel="noopener noreferrer">
                <img src={imageUrl} alt={image.name} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px 8px 0 0', transition: 'transform 0.3s ease' }} />
              </a>
              <div style={{ padding: '15px', textAlign: 'center' }}>
                <span style={{ display: 'block', fontSize: '16px', color: '#333', fontWeight: '500' }}>{image.name}</span>
                {/* <span style={{ display: 'block', fontSize: '14px', color: '#666', marginTop: '5px' }}>
                  <strong>Location:</strong> {image.location}
                </span> */}
                <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                  <div onClick={() => navigator.clipboard.writeText(imageUrl)} style={{ backgroundColor: '#2196F3', color: 'white', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} aria-label="Copy Link">
                    <FaCopy />
                  </div>
                  <div onClick={() => deleteImage(image._id, image.location)} style={{ backgroundColor: '#f44336', color: 'white', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} aria-label="Delete Image">
                    <FaTrashAlt />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
