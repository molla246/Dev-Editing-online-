import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Download,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
} from 'lucide-react';

export const ImageViewerModal: React.FC = () => {
  const {
    imageViewerData,
    setImageViewerData,
    showConfirmModal,
    addToast,
  } = useApp();

  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isFit, setIsFit] = useState<boolean>(true);

  if (!imageViewerData) return null;

  const handleClose = () => {
    setZoomLevel(1);
    setIsFit(true);
    setImageViewerData(null);
  };

  const handleDownload = () => {
    showConfirmModal(
      'Download Image Confirmation',
      `Are you sure you want to download image "${imageViewerData.title || 'Photo'}"?`,
      () => {
        const a = document.createElement('a');
        a.href = imageViewerData.url;
        a.download = imageViewerData.title || 'downloaded_image.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        addToast('Image downloaded successfully! ✓', 'success');
      }
    );
  };

  return (
    <div
      className="modal-overlay"
      style={{
        zIndex: 10000,
        backgroundColor: 'rgba(0, 0, 0, 0.92)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem',
      }}
      onClick={handleClose}
    >
      {/* Header Bar */}
      <div
        style={{
          width: '100%',
          maxWidth: '1000px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: '#ffffff',
          zIndex: 10,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>
            {imageViewerData.title || 'Image Preview'}
          </h3>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Full-screen Image Viewer</span>
        </div>

        {/* Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={() => setZoomLevel((prev) => Math.min(prev + 0.25, 3))}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              color: '#ffffff',
              padding: '0.5rem',
              borderRadius: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
            title="Zoom In"
          >
            <ZoomIn size={18} />
          </button>

          <button
            onClick={() => setZoomLevel((prev) => Math.max(prev - 0.25, 0.5))}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              color: '#ffffff',
              padding: '0.5rem',
              borderRadius: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
            title="Zoom Out"
          >
            <ZoomOut size={18} />
          </button>

          <button
            onClick={() => setIsFit(!isFit)}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              color: '#ffffff',
              padding: '0.5rem',
              borderRadius: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
            title={isFit ? 'Original Size' : 'Fit to Screen'}
          >
            {isFit ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
          </button>

          <button
            onClick={handleDownload}
            style={{
              backgroundColor: '#10b981',
              border: 'none',
              color: '#ffffff',
              padding: '0.5rem 0.85rem',
              borderRadius: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontWeight: 800,
              fontSize: '0.82rem',
            }}
            title="Download Image"
          >
            <Download size={16} />
            <span>Download</span>
          </button>

          <button
            onClick={handleClose}
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#ef4444',
              padding: '0.5rem',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: '0.5rem',
            }}
            title="Close Viewer"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Main Image Container */}
      <div
        style={{
          flex: 1,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'auto',
          margin: '1rem 0',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={imageViewerData.url}
          alt={imageViewerData.title || 'Viewer Image'}
          style={{
            maxWidth: isFit ? '90vw' : 'none',
            maxHeight: isFit ? '82vh' : 'none',
            objectFit: 'contain',
            transform: `scale(${zoomLevel})`,
            transition: 'transform 0.2s ease',
            borderRadius: '12px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
          }}
        />
      </div>

      {/* Footer Info */}
      <div style={{ color: '#94a3b8', fontSize: '0.8rem', textAlign: 'center', zIndex: 10 }}>
        Click outside or press (X) to close
      </div>
    </div>
  );
};
