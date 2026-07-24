import { useState, useRef } from 'react';
import { Icons } from './Icons';
import { Modal } from './Modal';
import { createStyles } from '../utils/theme';

export function ProfilePicUpload({ currentUser, onUpdate, onClose, theme }) {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(currentUser?.profilePic || '');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const styles = createStyles(theme);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setUploadError('Please select an image file'); return; }
    if (file.size > 2 * 1024 * 1024) { setUploadError('Image size must be less than 2MB'); return; }
    setIsUploading(true);
    setUploadError('');

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Create canvas for compression
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 300;
        const MAX_HEIGHT = 300;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to low quality JPEG (Base64)
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.6);
        setPreview(compressedDataUrl);
        setIsUploading(false);
        onUpdate(compressedDataUrl);
        if (fileInputRef.current) fileInputRef.current.value = '';
      };
      img.src = event.target.result;
    };
    reader.onerror = () => { setUploadError('Failed to read image file'); setIsUploading(false); };
    reader.readAsDataURL(file);
  };

  const handleRemovePic = () => { setPreview(''); onUpdate(''); };

  return (
    <Modal title="Profile Picture" onClose={onClose} large theme={theme}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        <p style={{ fontSize: '13px', color: theme.textSecondary, margin: 0, textAlign: 'center' }}>Upload a profile picture to personalize your account</p>
        <div style={styles.profilePicUpload}>
          {preview ? <img src={preview} alt="Profile" style={styles.profilePicPreview} /> : (<div style={styles.profilePicPlaceholder}><Icons.User width={40} height={40} /></div>)}
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button onClick={() => fileInputRef.current?.click()} style={styles.uploadBtn} disabled={isUploading}><Icons.Upload width={16} height={16} />{isUploading ? 'Uploading...' : 'Choose Photo'}</button>
            {preview && <button onClick={handleRemovePic} style={styles.removePicBtn}>Remove</button>}
          </div>
          {uploadError && <p style={{ color: '#dc2626', fontSize: '12px', margin: 0, textAlign: 'center' }}>{uploadError}</p>}
          <p style={{ fontSize: '11px', color: theme.textMuted, margin: 0, textAlign: 'center' }}>Supported formats: JPG, PNG, GIF • Maximum size: 2MB</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', width: '100%', maxWidth: '280px' }}>
          <button onClick={onClose} style={{ ...styles.btnPrimary, backgroundColor: styles.btnSecondaryBg, color: styles.btnSecondaryText }}>Done</button>
        </div>
      </div>
    </Modal>
  );
}