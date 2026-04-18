import React, { useRef, useState, useEffect } from 'react';
import { UploadCloud, Camera, RefreshCw, Trash2, X, Aperture, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ImageUploader = ({ onFileSelect, previewUrl, onClearImage }) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stream, setStream] = useState(null);
  const [qualityStats, setQualityStats] = useState({ lighting: 'pending', focus: 'pending', visibility: 'pending' });
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      onFileSelect(file);
      validateImage(file);
      e.target.value = '';
    }
  };

  const validateImage = (file) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 100; // Small size for performance
        canvas.height = 100;
        ctx.drawImage(img, 0, 0, 100, 100);
        
        const imageData = ctx.getImageData(0, 0, 100, 100).data;
        let brightness = 0;
        let greenness = 0;
        let luminanceValues = [];

        for (let i = 0; i < imageData.length; i += 4) {
          const r = imageData[i];
          const g = imageData[i+1];
          const b = imageData[i+2];
          
          const lum = (r + g + b) / 3;
          brightness += lum;
          luminanceValues.push(lum);
          
          // Check if pixel is "green-ish"
          if (g > r && g > b) greenness++;
        }
        
        brightness /= (100 * 100);
        const greenPercent = (greenness / (100 * 100)) * 100;

        // Calculate Contrast (Standard Deviation)
        const mean = brightness;
        const squareDiffs = luminanceValues.map(v => Math.pow(v - mean, 2));
        const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length;
        const contrast = Math.sqrt(avgSquareDiff);

        // Heuristics
        const isGoodLighting = brightness > 60 && brightness < 200;
        const isGoodFocus = contrast > 15; // Lower values mean less detail/contrast (blur)
        const isLeafVisible = greenPercent > 10; // At least 10% green pixels

        setQualityStats({
          lighting: isGoodLighting ? 'good' : 'poor',
          focus: isGoodFocus ? 'good' : 'poor',
          visibility: isLeafVisible ? 'good' : 'poor'
        });
      };
    };
  };

  const openCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      setStream(mediaStream);
      setIsCameraOpen(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Unable to access camera. Please check permissions or use a secure context (HTTPS/localhost).");
    }
  };

  const closeCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setStream(null);
    setIsCameraOpen(false);
  };

  useEffect(() => {
    if (isCameraOpen && videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [isCameraOpen, stream]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], "camera_capture.jpg", { type: "image/jpeg" });
          onFileSelect(file);
          validateImage(file);
          closeCamera();
        }
      }, 'image/jpeg', 0.9);
    }
  };

  return (
    <div className="uploader-container">
      <input
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        ref={fileInputRef}
        onChange={handleFileInput}
      />
      
      {/* Camera Modal */}
      <AnimatePresence>
        {isCameraOpen && (
          <div className="camera-modal-overlay">
             <motion.div 
               className="camera-modal"
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.9 }}
             >
                <div className="camera-modal-header">
                   <h3>Capture Image</h3>
                   <button onClick={closeCamera} className="close-camera-btn"><X size={20}/></button>
                </div>
                <div className="camera-video-container">
                  <video ref={videoRef} autoPlay playsInline className="camera-video"></video>
                  <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
                </div>
                <div className="camera-modal-footer">
                   <button onClick={captureImage} className="btn-primary capture-action-btn">
                     <Aperture size={20} /> Take Photo
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {!previewUrl ? (
        <div 
          className={`upload-zone ${isDragActive ? 'drag-active' : ''}`}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current.click()}
        >
          <UploadCloud className="upload-icon" size={48} />
          <p className="upload-text">Drag & drop a leaf image here</p>
          <p className="upload-subtext">or click to browse files</p>
          
          <div className="upload-actions" onClick={(e) => e.stopPropagation()}>
            <button 
              className="btn-secondary camera-btn" 
              onClick={(e) => {
                e.stopPropagation();
                openCamera();
              }}
            >
              <Camera size={18} /> 📷 Capture from Camera
            </button>
          </div>
        </div>
      ) : (
        <div className="preview-layout">
          <div className="image-preview-container" onClick={() => fileInputRef.current.click()} style={{ cursor: 'pointer' }}>
            <img src={previewUrl} alt="Preview" className="image-preview" />
            <div className="preview-overlay">
              Tap to replace image
            </div>
          </div>
          <div className="preview-controls">
             <motion.button 
                className="btn-control btn-replace" 
                onClick={() => fileInputRef.current.click()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
             >
                <RefreshCw size={16} /> 🔄 Replace
             </motion.button>
             <motion.button 
                className="btn-control btn-remove" 
                onClick={onClearImage}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
             >
                <Trash2 size={16} /> ❌ Remove
             </motion.button>
          </div>

          <div className="quality-checklist">
            <h4 className="quality-title">Image Quality Check</h4>
            <div className="quality-grid">
              <div className={`quality-item ${qualityStats.lighting}`}>
                {qualityStats.lighting === 'good' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                <span>Good Lighting</span>
              </div>
              <div className={`quality-item ${qualityStats.focus}`}>
                {qualityStats.focus === 'good' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                <span>Clear Focus</span>
              </div>
              <div className={`quality-item ${qualityStats.visibility}`}>
                {qualityStats.visibility === 'good' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                <span>Leaf Visible</span>
              </div>
            </div>
            {qualityStats.lighting === 'poor' && (
              <p className="quality-warning">
                <AlertCircle size={12} /> Lighting might be too dark or bright. For better results, use clear daylight.
              </p>
            )}
            {qualityStats.focus === 'poor' && (
              <p className="quality-warning">
                <AlertCircle size={12} /> Image seems blurry. Try to hold the camera steady and focus on the leaf.
              </p>
            )}
            {qualityStats.visibility === 'poor' && (
              <p className="quality-warning">
                <AlertCircle size={12} /> No leaf detected. Ensure the leaf occupies most of the frame.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
