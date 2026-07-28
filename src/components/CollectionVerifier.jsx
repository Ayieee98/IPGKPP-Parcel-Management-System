import { useState } from 'react';
import { Modal } from './Modal';
import { Icons } from './Icons';
import { createStyles } from '../utils/theme';

export function CollectionVerifier({ parcel, onClose, onVerify, theme }) {
  const [otpInput, setOtpInput] = useState('');
  const styles = createStyles(theme);

  const handleVerify = () => {
    if (!otpInput) return;

    // Check if the typed OTP matches the parcel's OTP
    if (otpInput === parcel.otp) {
      onVerify(parcel.id);
      onClose();
    } else {
      alert('Invalid OTP code. Please check the number and try again.');
    }
  };

  return (
    <Modal onClose={onClose} title="Confirmation of Parcel Retrieval" theme={theme}>
      <div style={{ textAlign: 'center', padding: '10px 0' }}>
        <p style={{ fontSize: '12px', fontWeight: 600, color: theme.textSecondary, letterSpacing: '0.05em', margin: '0 0 8px 0' }}>PARCEL INFORMATION</p>
        <h3 style={{ margin: '0 0 16px 0', color: theme.text, fontSize: '20px' }}>{parcel.trackingNo}</h3>
        <p style={{ margin: '4px 0', fontSize: '14px', color: theme.text }}>Recipient: <strong>{parcel.recipientName || parcel.recipient}</strong></p>
        <p style={{ margin: '4px 0', fontSize: '14px', color: theme.text }}>Sender: <strong>{parcel.sender}</strong></p>
        <p style={{ margin: '4px 0 24px 0', fontSize: '14px', color: theme.text }}>Rack: <strong style={{ color: '#4f46e5' }}>{parcel.rackLocation || 'N/A'}</strong></p>

        <p style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600, color: theme.text }}>Enter 6-Digit OTP</p>

        {/* THE RESTORED & HIGH-CONTRAST INPUT FIELD */}
        <input
          type="text"
          maxLength={6}
          value={otpInput}
          onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))} // Forces numbers only
          placeholder="XXXXXX"
          style={{
            width: '100%',
            maxWidth: '220px',
            margin: '0 auto 24px auto',
            display: 'block',
            textAlign: 'center',
            fontSize: '24px',
            letterSpacing: '8px',
            fontWeight: 700,
            padding: '12px',
            border: '2px solid #94a3b8', // Forces a highly visible gray border
            borderRadius: '8px',
            backgroundColor: '#ffffff',  // Forces a white background
            color: '#0f172a',            // Forces dark text
            outline: 'none',
            boxShadow: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)'
          }}
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleVerify();
            }
          }}
        />

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button onClick={onClose} style={{ ...styles.btnSecondary, flex: 1, padding: '12px', justifyContent: 'center' }}>Cancel</button>
          <button onClick={handleVerify} style={{ ...styles.btnPrimary, flex: 1, padding: '12px', backgroundColor: '#16a34a', justifyContent: 'center' }}>
            <Icons.CheckCircle width={18} height={18} /> Verify & Collect
          </button>
        </div>
      </div>
    </Modal>
  );
}