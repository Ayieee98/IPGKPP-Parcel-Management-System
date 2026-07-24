import { useState } from 'react';
import { Icons } from '../components/Icons';
import { createStyles } from '../utils/theme';

export function MyParcelsView({ parcels, user, rackIoTData, theme }) {
  const styles = createStyles(theme);
  const isAdmin = user?.role === 'admin';
  const [activeTab, setActiveTab] = useState('student');

  // Fungsi untuk memadankan data IoT dengan rack location parcel
  const getIoTShelfData = (rackLocation) => {
    if (!Array.isArray(rackIoTData) || !rackLocation) return null;
    return rackIoTData.find(d => {
      if (!d || !d.rack_id || typeof d.rack_id !== 'string') return false;
      const formattedId = d.rack_id.replace('RACK-', '').replace('-SHELF-', '-');
      return formattedId === rackLocation || d.rack_id === rackLocation;
    });
  };

  const filteredParcels = parcels.filter(p => {
    if (!isAdmin) return true; // Pelajar/Staf sudah difilter di peringkat atas
    const matchesRole = p.recipientRole === activeTab || (!p.recipientRole && activeTab === 'student');
    return matchesRole;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {isAdmin && (
        <div style={{ ...styles.card, padding: '12px', marginBottom: '8px', display: 'flex', justifyContent: 'center' }}>
          <div style={{ display: 'flex', gap: '4px', backgroundColor: styles.sectionBg, padding: '4px', borderRadius: '8px' }}>
            <button onClick={() => setActiveTab('student')} style={{ padding: '8px 24px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 600, backgroundColor: activeTab === 'student' ? '#4f46e5' : 'transparent', color: activeTab === 'student' ? '#fff' : theme.textSecondary }}>Student Parcels</button>
            <button onClick={() => setActiveTab('staff')} style={{ padding: '8px 24px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 600, backgroundColor: activeTab === 'staff' ? '#4f46e5' : 'transparent', color: activeTab === 'staff' ? '#fff' : theme.textSecondary }}>Staff Parcels</button>
          </div>
        </div>
      )}

      {filteredParcels.map(p => {
        const iotData = getIoTShelfData(p.rackLocation);
        const currentWeight = iotData ? `${iotData.weight.toFixed(2)}kg` : p.weight;

        return (
          <div key={p.id} style={{ ...styles.card, padding: '0' }}>
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div><span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '16px', color: theme.text }}>{p.trackingNo}</span><span style={{ marginLeft: '12px' }}><span style={styles.badge(p.status)}>{p.status}</span></span></div>
              <span style={{ fontSize: '14px', color: theme.textSecondary }}>{p.dateReceived}</span>
            </div>
            <div style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ gridColumn: '1 / -1', paddingBottom: '8px', borderBottom: `1px dashed ${theme.border}` }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: theme.textSecondary, fontWeight: 600, textTransform: 'uppercase' }}>Receiver</p>
                <p style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: theme.text }}>{p.recipientName || p.recipient}</p>
                {p.recipientIdNo && <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: theme.textSecondary }}>ID: <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{p.recipientIdNo}</span></p>}
              </div>
              <div><p style={{ margin: '0 0 4px 0', fontSize: '12px', color: theme.textSecondary, fontWeight: 600, textTransform: 'uppercase' }}>Courier</p><p style={{ margin: 0, fontSize: '14px', fontWeight: 500, color: theme.text }}>{p.sender}</p></div>
              <div><p style={{ margin: '0 0 4px 0', fontSize: '12px', color: theme.textSecondary, fontWeight: 600, textTransform: 'uppercase' }}>Location</p><p style={{ margin: 0, fontSize: '14px', fontWeight: 500, color: theme.text }}>{p.location}</p></div>
              {p.rackLocation && (<div><p style={{ margin: '0 0 4px 0', fontSize: '12px', color: theme.textSecondary, fontWeight: 600, textTransform: 'uppercase' }}>Rack</p><p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#4f46e5' }}>{p.rackLocation}</p></div>)}
              {currentWeight && (
                <div>
                  <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: theme.textSecondary, fontWeight: 600, textTransform: 'uppercase' }}>Weight {iotData ? '(Live Sensor)' : ''}</p>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: iotData ? '#16a34a' : theme.text }}>
                    {currentWeight}
                  </p>
                </div>
              )}
              <div style={{ gridColumn: '1 / -1' }}><p style={{ margin: '0 0 4px 0', fontSize: '12px', color: theme.textSecondary, fontWeight: 600, textTransform: 'uppercase' }}>Description</p><p style={{ margin: 0, fontSize: '14px', color: theme.text }}>{p.description || '-'}</p></div>
            </div>
            {p.status === 'Arrived' && user?.role !== 'admin' && (
              <div style={{ padding: '20px', backgroundColor: theme.successBg, borderTop: `1px solid ${theme.successBorder}`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <p style={{ margin: 0, fontWeight: 700, color: theme.successText, fontSize: '15px' }}>Your Collection Code</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ margin: '0 0 6px 0', fontSize: '11px', color: theme.successText, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Kod OTP</p>
                    <div style={{ backgroundColor: styles.cardBg, padding: '10px 20px', borderRadius: '8px', border: '2px dashed #16a34a', fontFamily: 'monospace', fontSize: '28px', fontWeight: 800, color: '#16a34a', letterSpacing: '4px' }}>{p.otp || '------'}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ margin: '0 0 6px 0', fontSize: '11px', color: theme.successText, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>QR Code</p>
                    <div style={{ backgroundColor: styles.cardBg, padding: '6px', borderRadius: '8px', border: `1px solid ${theme.successBorder}` }}>
                      <img src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(p.otp || '')}`} alt="QR Code" style={{ width: '100px', height: '100px', display: 'block' }} />
                    </div>
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: '12px', color: theme.successText, textAlign: 'center', maxWidth: '350px', lineHeight: '1.4' }}>Please show this code to the staff before claiming your parcels.</p>
              </div>
            )}
          </div>
        );
      })}
      {parcels.length === 0 && (
        <div style={{ ...styles.card, padding: '40px', textAlign: 'center', color: theme.textSecondary }}>
          <Icons.Inbox width={48} height={48} style={{ marginBottom: '12px', opacity: 0.3 }} />
          <p style={{ margin: 0, fontSize: '15px' }}>No active record.</p>
        </div>
      )}
    </div>
  );
}