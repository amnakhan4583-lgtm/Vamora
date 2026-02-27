 import { useState } from 'react';
import './PhotoGallery.css';

function PhotoGallery() {
  const [photos, setPhotos] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = (files) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    const newPhotos = imageFiles.map(file => ({
      id: Date.now() + Math.random(),
      url: URL.createObjectURL(file),
      name: file.name,
      date: new Date().toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
      }),
      caption: '',
      file: file,
    }));
    setPhotos(prev => [...prev, ...newPhotos]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleCaptionChange = (id, value) => {
    setPhotos(prev =>
      prev.map(photo =>
        photo.id === id ? { ...photo, caption: value } : photo
      )
    );
  };

  const handleDeletePhoto = (id) => {
    setPhotos(prev => prev.filter(photo => photo.id !== id));
  };

  return (
    <div className="gallery-container">

      <div className="gallery-header">
        <h1 className="gallery-title">My Photo Memories</h1>
        <p className="gallery-subtitle">Your precious moments, always with you</p>
      </div>

      <div
        className={`upload-area ${isDragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="upload-icon">📁</div>
        <p className="upload-text">Drag and drop photos here</p>
        <p className="upload-subtext">or</p>
        <label className="upload-btn">
          Choose Photos
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
        </label>
      </div>

      {photos.length > 0 && (
        <div className="photo-count">
          {photos.length} {photos.length === 1 ? 'Memory' : 'Memories'} Saved
        </div>
      )}

      {photos.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🖼️</div>
          <p className="empty-text">No photos yet</p>
          <p className="empty-subtext">Upload your first memory above!</p>
        </div>
      )}

      <div className="photo-list">
        {photos.map(photo => (
          <div key={photo.id} className="photo-card">
            <div className="photo-image-wrapper">
              <img
                src={photo.url}
                alt={photo.caption || photo.name}
                className="photo-image"
              />
            </div>
            <div className="photo-details">
              <div className="photo-meta">
                <span className="photo-date">📅 {photo.date}</span>
                <span className="photo-name">{photo.name}</span>
              </div>
              <div className="caption-section">
                <label className="caption-label">Add a description:</label>
                <textarea
                  className="caption-input"
                  placeholder="Who is in this photo? Where was it taken? What was the occasion?"
                  value={photo.caption}
                  onChange={(e) => handleCaptionChange(photo.id, e.target.value)}
                  rows={3}
                />
              </div>
              <div className="ai-badge">
                🤖 Face recognition coming soon
              </div>
              <button
                className="delete-btn"
                onClick={() => handleDeletePhoto(photo.id)}
              >
                🗑️ Remove Photo
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

export default PhotoGallery;