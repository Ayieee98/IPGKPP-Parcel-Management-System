import { useState } from 'react';
import { Icons } from '../components/Icons';
import { createStyles } from '../utils/theme';

export function HistoryView({ parcels, user, theme }) {
  const styles = createStyles(theme);
  const isAdmin = user?.role === 'admin';
  const [activeTab, setActiveTab] = useState('student');

  // Filter: Hanya Collected, dan jika bukan admin hanya milik sendiri
  const historyParcels = parcels
    .filter(p => {
      const isCollected = p.status === 'Collected';
      const isOwn = p.recipient === user?.username;
      const matchesRole = isAdmin ? (p.recipientRole === activeTab || (!p.recipientRole && activeTab === 'student')) : true;

      return isCollected && (isAdmin ? matchesRole : isOwn);
    })
    .sort((a, b) => new Date(b.dateCollected || 0) - new Date(a.dateCollected || 0));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ ...styles.card, padding: '24px', background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', color: 'white', border: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ padding: '12px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '12px' }}><Icons.Clock width={32} height={32} /></div>
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: 700, margin: 0 }}>Collection History</h2>
              <p style={{ margin: '4px 0 0 0', opacity: 0.9, fontSize: '14px' }}>Records are saved for 7 days before being automatically deleted.</p>
            </div>
          </div>
          {isAdmin && (
            <div style={{ display: 'flex', gap: '4px', backgroundColor: 'rgba(255,255,255,0.1)', padding: '4px', borderRadius: '8px' }}>
              <button onClick={() => setActiveTab('student')} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 600, backgroundColor: activeTab === 'student' ? '#4f46e5' : 'transparent', color: '#fff' }}>Student</button>
              <button onClick={() => setActiveTab('staff')} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 600, backgroundColor: activeTab === 'staff' ? '#4f46e5' : 'transparent', color: '#fff' }}>Staff</button>
            </div>
          )}
        </div>
      </div>

      <div style={styles.card}>
        <div style={{ overflowX: 'auto' }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Tracking No.</th>
                {isAdmin && <th style={styles.th}>Recipient</th>}
                <th style={styles.th}>Sender</th>
                <th style={styles.th}>Date Received</th>
                <th style={styles.th}>Date Collected</th>
                <th style={styles.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {historyParcels.length === 0 ? (
                <tr><td colSpan={isAdmin ? "6" : "5"} style={{ ...styles.td, textAlign: 'center', padding: '40px', color: theme.textSecondary }}>No record history for the time being.</td></tr>
              ) : historyParcels.map(p => (
                <tr key={p.id}>
                  <td style={styles.td}><span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{p.trackingNo}</span></td>
                  {isAdmin && (
                    <td style={styles.td}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600 }}>{p.recipientName || p.recipient}</span>
                        {p.recipientIdNo && <span style={{ fontSize: '11px', color: theme.textSecondary }}>ID: {p.recipientIdNo}</span>}
                      </div>
                    </td>
                  )}
                  <td style={styles.td}>{p.sender}</td>
                  <td style={styles.td}>{p.dateReceived}</td>
                  <td style={styles.td}>{p.dateCollected ? new Date(p.dateCollected).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                  <td style={styles.td}><span style={styles.badge('Collected')}>COLLECTED</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
