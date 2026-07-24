import { useState } from 'react';
import { Icons } from '../components/Icons';
import { createStyles } from '../utils/theme';
import emailjs from '@emailjs/browser';

export function DashboardView({ parcels, trackInput, setTrackInput, onTrack, foundParcel, onRequestCollect, stats, isAdmin, user, racks, onGoToRack, onGoToMaintenance, theme }) {
  const [activeTab, setActiveTab] = useState('student');
  const cardGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' };
  const styles = createStyles(theme);

  const filteredParcels = isAdmin
    ? parcels.filter(p => (p.recipientRole === activeTab || (!p.recipientRole && activeTab === 'student')))
    : parcels;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      <div style={{ backgroundColor: '#4f46e5', borderRadius: '12px', padding: '24px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', position: 'relative', zIndex: 1 }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#ffffff', margin: '0 0 8px 0' }}>Search Your Parcel</h2>
        <p style={{ color: '#c7d2fe', marginBottom: '16px', fontSize: '14px' }}>Enter your tracking number to find the status and description of your package.</p>
        <form onSubmit={onTrack} style={{ display: 'flex', gap: '12px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Icons.Search style={{ position: 'absolute', left: '12px', top: '10px', width: 20, height: 20, color: '#a5b4fc' }} />
            <input value={trackInput} onChange={e => setTrackInput(e.target.value)} style={{ width: '100%', paddingLeft: '40px', paddingRight: '12px', padding: '10px 12px 10px 40px', backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid #818cf8', borderRadius: '8px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} placeholder="e.g. PKG-8821X" required />
          </div>
          <button type="submit" style={{ padding: '10px 24px', backgroundColor: '#ffffff', color: '#4f46e5', fontWeight: 700, borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '14px' }}>Search</button>
        </form>
      </div>

      {foundParcel && (
        <div style={{ ...styles.card, border: '2px solid #bfdbfe' }}>
          <div style={{ backgroundColor: theme.infoBg, padding: '16px 24px', borderBottom: `1px solid ${theme.infoBorder}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Icons.CheckCircle width={20} height={20} style={{ color: '#2563eb' }} /><h3 style={{ fontWeight: 700, color: theme.infoText, margin: 0, fontSize: '16px' }}>Parcel Found: {foundParcel.trackingNo}</h3></div>
            <span style={styles.badge(foundParcel.status)}>{foundParcel.status}</span>
          </div>
          <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p style={{ margin: 0, color: theme.text }}><span style={{ fontSize: '11px', color: theme.textSecondary, fontWeight: 700, textTransform: 'uppercase' }}>Sender</span><br /><span style={{ fontWeight: 500 }}>{foundParcel.sender}</span></p>
              <p style={{ margin: 0, color: theme.text }}><span style={{ fontSize: '11px', color: theme.textSecondary, fontWeight: 700, textTransform: 'uppercase' }}>Location</span><br /><span style={{ fontWeight: 500 }}>{foundParcel.location}</span></p>
              <p style={{ margin: 0, color: theme.text }}><span style={{ fontSize: '11px', color: theme.textSecondary, fontWeight: 700, textTransform: 'uppercase' }}>Date Received</span><br /><span style={{ fontWeight: 500 }}>{foundParcel.dateReceived}</span></p>
              {foundParcel.rackLocation && <p style={{ margin: 0, color: theme.text }}><span style={{ fontSize: '11px', color: theme.textSecondary, fontWeight: 700, textTransform: 'uppercase' }}>Rack Location</span><br /><span style={{ fontWeight: 600, color: '#4f46e5' }}>{foundParcel.rackLocation}</span></p>}
              {foundParcel.weight && <p style={{ margin: 0, color: theme.text }}><span style={{ fontSize: '11px', color: theme.textSecondary, fontWeight: 700, textTransform: 'uppercase' }}>Weight</span><br /><span style={{ fontWeight: 500 }}>{foundParcel.weight}</span></p>}
            </div>
            <div style={{ backgroundColor: styles.sectionBg, padding: '16px', borderRadius: '8px', border: `1px solid ${styles.sectionBorder}` }}>
              <span style={{ fontSize: '11px', color: theme.textSecondary, fontWeight: 700, textTransform: 'uppercase' }}>Package Description</span>
              <p style={{ marginTop: '8px', color: theme.text, fontWeight: 500, lineHeight: '1.6', margin: '8px 0 0 0' }}>{foundParcel.description || "No description provided"}</p>
            </div>
          </div>
          {foundParcel.status === 'Arrived' && user?.role !== 'admin' && (
            <div style={{ padding: '24px', backgroundColor: theme.successBg, borderTop: `1px solid ${theme.successBorder}`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <p style={{ margin: 0, fontWeight: 700, color: theme.successText, fontSize: '16px' }}>Your Collection Code</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: theme.successText, fontWeight: 600, textTransform: 'uppercase' }}>OTP Code</p>
                  <div style={{ backgroundColor: styles.cardBg, padding: '12px 24px', borderRadius: '8px', border: '2px dashed #16a34a', fontFamily: 'monospace', fontSize: '32px', fontWeight: 700, color: '#16a34a', letterSpacing: '4px' }}>{foundParcel.otp || '------'}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: theme.successText, fontWeight: 600, textTransform: 'uppercase' }}>QR Code</p>
                  <div style={{ backgroundColor: styles.cardBg, padding: '8px', borderRadius: '8px', border: `1px solid ${theme.successBorder}` }}>
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(foundParcel.otp || '')}`} alt="QR Code" style={{ width: '120px', height: '120px', display: 'block' }} />
                  </div>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: theme.successText, textAlign: 'center', maxWidth: '400px' }}>Show this code to postal staff for verification before collecting the parcel.</p>
            </div>
          )}
          {foundParcel.status === 'Arrived' && (
            <div style={{ padding: '12px 24px', backgroundColor: styles.sectionBg, borderTop: `1px solid ${styles.sectionBorder}` }}>
              <button onClick={() => onRequestCollect(foundParcel)} style={{ padding: '8px 24px', backgroundColor: '#4f46e5', color: '#ffffff', borderRadius: '8px', fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}><Icons.Lock width={16} height={16} />Verify & Collect</button>
            </div>
          )}
        </div>
      )}

      <div onClick={onGoToRack} style={{ ...styles.statCard, cursor: 'pointer', background: 'linear-gradient(135deg, #0f172a 0%, #312e81 100%)', color: 'white', border: 'none' }} onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(15,23,42,0.3)'; }} onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ padding: '10px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '10px' }}><Icons.Layers width={24} height={24} /></div>
          <span style={{ fontSize: '12px', opacity: 0.9, fontWeight: 600 }}>SMART RACK </span>
        </div>
        <p style={{ fontSize: '28px', fontWeight: 700, margin: '0 0 4px 0' }}>{stats.racksTotal}</p>
        <p style={{ fontSize: '13px', opacity: 0.9, margin: 0 }}>{stats.racksOccupied} occupied • {stats.racksAvailable} available{stats.racksMaintenance > 0 ? ` • ${stats.racksMaintenance} maintenance` : ''}</p>
        <div style={{ marginTop: '12px', height: '6px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '9999px', overflow: 'hidden' }}>
          <div style={{ height: '100%', backgroundColor: '#16a34a', width: `${(stats.racksAvailable / stats.racksTotal) * 100}%`, transition: 'width 0.5s' }} />
        </div>
      </div>

      {isAdmin && stats.racksMaintenance > 0 && (
        <div onClick={onGoToMaintenance} style={{ ...styles.statCard, cursor: 'pointer', background: 'linear-gradient(135deg, #92400e 0%, #d97706 100%)', color: 'white', border: 'none' }} onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(146,64,14,0.3)'; }} onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ padding: '10px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '10px' }}><Icons.Wrench width={24} height={24} /></div>
            <span style={{ fontSize: '12px', opacity: 0.9, fontWeight: 600 }}>⚠ MAINTENANCE ALERT</span>
          </div>
          <p style={{ fontSize: '28px', fontWeight: 700, margin: '0 0 4px 0' }}>{stats.racksMaintenance}</p>
          <p style={{ fontSize: '13px', opacity: 0.9, margin: 0 }}>shelves under maintenance — Click to manage</p>
        </div>
      )}

      <div style={cardGrid}>
        {[
          { l: 'Total Parcels', v: stats.total, i: Icons.Package, c: '#4f46e5' },
          { l: 'Pending', v: stats.pending, i: Icons.Clock, c: '#d97706' },
          { l: 'Arrived', v: stats.arrived, i: Icons.Inbox, c: '#2563eb' },
          { l: 'Collected', v: stats.collected, i: Icons.CheckCircle, c: '#16a34a' }
        ].map((s, i) => (
          <div key={i} style={styles.statCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: s.c + '15' }}><s.i width={20} height={20} style={{ color: s.c }} /></div>
              <span style={{ fontSize: '24px', fontWeight: 700, color: theme.text }}>{s.v}</span>
            </div>
            <p style={{ fontSize: '14px', color: theme.textSecondary, fontWeight: 500, margin: 0 }}>{s.l}</p>
          </div>
        ))}
      </div>

      <div style={styles.card}>
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <h3 style={{ fontWeight: 600, color: theme.text, margin: 0, fontSize: '16px' }}>{isAdmin ? 'All System Parcels' : 'Active Parcels'}</h3>
          {isAdmin && (
            <div style={{ display: 'flex', gap: '4px', backgroundColor: styles.sectionBg, padding: '4px', borderRadius: '8px' }}>
              <button type="button" onClick={() => setActiveTab('student')} style={{ padding: '6px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 600, backgroundColor: activeTab === 'student' ? '#4f46e5' : 'transparent', color: activeTab === 'student' ? '#fff' : theme.textSecondary }}>Student</button>
              <button type="button" onClick={() => setActiveTab('staff')} style={{ padding: '6px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 600, backgroundColor: activeTab === 'staff' ? '#4f46e5' : 'transparent', color: activeTab === 'staff' ? '#fff' : theme.textSecondary }}>Staff</button>
            </div>
          )}
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Tracking</th>
                <th style={styles.th}>Sender</th>
                <th style={styles.th}>Recipient</th>
                <th style={styles.th}>Rack</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredParcels.length === 0 ? (<tr><td colSpan="7" style={{ ...styles.td, textAlign: 'center', padding: '32px', color: theme.textSecondary }}>No parcels found</td></tr>) : filteredParcels.map(p => (
                <tr key={p.id} style={{ transition: 'background-color 0.15s' }} onMouseOver={(e) => { e.currentTarget.style.backgroundColor = styles.tableRowHover; }} onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
                  <td style={styles.td}><span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{p.trackingNo}</span></td>
                  <td style={styles.td}>{p.sender}</td>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 600 }}>{p.recipientName || p.recipient}</span>
                      {p.recipientIdNo && <span style={{ fontSize: '11px', color: theme.textSecondary }}>ID: {p.recipientIdNo}</span>}
                    </div>
                  </td>
                  <td style={styles.td}>{p.rackLocation ? <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#4f46e5' }}>{p.rackLocation}</span> : <span style={{ color: theme.textMuted }}>—</span>}</td>
                  <td style={styles.td}><span style={styles.badge(p.status)}>{p.status}</span></td>
                  <td style={styles.td}>{p.dateReceived}</td>
                  <td style={styles.td}>{p.status === 'Arrived' && (<button onClick={() => onRequestCollect(p)} style={{ padding: '4px 12px', backgroundColor: theme.iconBg, color: theme.iconColor, fontSize: '12px', fontWeight: 600, borderRadius: '6px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}><Icons.Lock width={14} height={14} />Verify</button>)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MOVED BENEFITS SECTION TO THE BOTTOM */}
      <div style={styles.card}>
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${theme.border}` }}>
          <h3 style={{ fontWeight: 600, color: theme.text, margin: 0, fontSize: '16px' }}>Benefits of Smart Parcel System</h3>
        </div>
        <div style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {[
            { icon: Icons.Users, title: 'For Students', desc: 'Easy & fast collection, Real-time notification, Secure & convenient' },
            { icon: Icons.User, title: 'For Staff', desc: 'Easy parcel management, Less manual work, Faster organization' },
            { icon: Icons.Shield, title: 'Secure', desc: 'Multi-layer authentication, Real-time monitoring, Auto-lock system' },
            { icon: Icons.Zap, title: 'Efficient', desc: 'Save time & space, Improve workflow, Smart automation' },
            { icon: Icons.MapPin, title: 'Trackable', desc: 'Real-time tracking of every parcel, Location-based storage' },
            { icon: Icons.Wifi, title: 'Smart & Connected', desc: 'IoT based system, Integrated with website, Smart Campus' },
          ].map((b, idx) => (
            <div key={idx} style={{ padding: '16px', backgroundColor: styles.sectionBg, borderRadius: '10px', border: `1px solid ${styles.sectionBorder}` }}>
              <div style={{ padding: '8px', backgroundColor: theme.iconBg, borderRadius: '8px', display: 'inline-block', marginBottom: '8px' }}><b.icon width={20} height={20} style={{ color: theme.iconColor }} /></div>
              <p style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 700, color: theme.text }}>{b.title}</p>
              <p style={{ margin: 0, fontSize: '12px', color: theme.textSecondary, lineHeight: '1.5' }}>{b.desc}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

// Send parcel OTP code to user
const sendParcelOTP = (recipientEmail, recipientName, trackingNo, otpCode, rackLocation) => {
  if (!recipientEmail) {
    console.error("No email provided for this user.");
    return;
  }
  
  emailjs.send(
    'service_b85yfd9',         // Service ID
    'template_bzx28rr',    // Template ID
    {
      to_name: recipientName,
      to_email: recipientEmail,
      tracking_no: trackingNo,
      otp: otpCode,
      rack_location: rackLocation || 'Main Counter'
    }, 
    'JT3OFA36C4eS3rqWS'          // Public Key
  ).then(() => {
    console.log(`OTP Email sent successfully to ${recipientEmail}`);
  }).catch((err) => {
    console.error("Failed to send OTP email:", err);
  });
};