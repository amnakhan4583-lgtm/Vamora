import { useState, useEffect } from 'react';
import api from '../services/api';
import './PhotoGallery.css';

const CATEGORIES = ['All', 'Family', 'Pet', 'Home', 'Memory'];

const CATEGORY_COLORS = {
  family: '#7b5ea7',
  pet: '#fb8c00',
  home: '#43a047',
  memory: '#1976d2',
};

export default function PhotoGallery() {
  const [photos, setPhotos] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [previewPhoto, setPreviewPhoto] = useState(null);

  useEffect(() => { fetchPhotos(); }, []);

  const fetchPhotos = async () => {
    try {
      const { data } = await api.get('/photos');
      setPhotos(data);
    } catch (err) {
      console.error('Error fetching photos:', err);
    }
  };

  const getImageUrl = (filename) => {
    return `http://localhost:5000/uploads/photos/${filename}`;
  };

  const filtered = activeCategory === 'All'
    ? photos
    : photos.filter(p => p.category?.toLowerCase() === activeCategory.toLowerCase());

  return (
    <div className="gallery-container">

      <div className="gallery-header">
        <h1 className="gallery-title">📸 My Memories</h1>
        <p className="gallery-subtitle">Your cherished moments, always with you</p>
      </div>

      {/* Category Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', margin: '1rem 0' }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: '0.45rem 1.1rem',
              borderRadius: '999px',
              border: '2px solid #7b5ea7',
              background: activeCategory === cat ? '#7b5ea7' : 'white',
              color: activeCategory === cat ? 'white' : '#7b5ea7',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.9rem',
              transition: 'all 0.15s',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💙</div>
          <p className="empty-text">Your caregiver will add your memories here 💙</p>
        </div>
      ) : (
        <div className="photo-grid">
          {filtered.map(photo => (
            <div key={photo.id} className="photo-card">
              <img
                src={getImageUrl(photo.filename)}
                alt={photo.caption}
                className="photo-image"
                style={{ cursor: 'pointer' }}
                onClick={() => setPreviewPhoto(photo)}
                onError={e => { e.target.style.display = 'none'; }}
              />
              <div className="photo-details">
                <p className="photo-caption">{photo.caption}</p>
                {photo.category && (
                  <span style={{
                    display: 'inline-block',
                    background: CATEGORY_COLORS[photo.category] || '#7b5ea7',
                    color: 'white',
                    borderRadius: '999px',
                    padding: '0.2rem 0.7rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    textTransform: 'capitalize',
                    marginTop: '0.35rem',
                  }}>
                    {photo.category}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Photo Preview Modal */}
      {previewPhoto && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.85)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: '1rem'
          }}
          onClick={() => setPreviewPhoto(null)}
        >
          <div
            style={{
              background: 'white', borderRadius: '20px', overflow: 'hidden',
              maxWidth: '90vw', maxHeight: '90vh', position: 'relative',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)', display: 'flex',
              flexDirection: 'column'
            }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewPhoto(null)}
              style={{
                position: 'absolute', top: '0.75rem', right: '0.75rem',
                background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none',
                width: '36px', height: '36px', borderRadius: '50%',
                fontSize: '1rem', cursor: 'pointer', zIndex: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >✕</button>
            <img
              src={getImageUrl(previewPhoto.filename)}
              alt={previewPhoto.caption}
              style={{
                width: '100%', maxHeight: '70vh',
                objectFit: 'contain', background: '#1a1a2e', display: 'block'
              }}
            />
            <div style={{ padding: '1.2rem 1.5rem', background: 'white' }}>
              <p style={{ fontSize: '1.2rem', fontWeight: '700', color: '#2d1f3d', margin: '0 0 0.4rem 0' }}>
                {previewPhoto.caption}
              </p>
              {previewPhoto.category && (
                <span style={{
                  display: 'inline-block',
                  background: CATEGORY_COLORS[previewPhoto.category] || '#7b5ea7',
                  color: 'white',
                  borderRadius: '999px',
                  padding: '0.2rem 0.7rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textTransform: 'capitalize',
                }}>
                  {previewPhoto.category}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
