import { useState, useEffect } from 'react';
import { Icons } from '../components/Icons';
import { createStyles } from '../utils/theme';

export function HistoryView({ parcels, user, theme }) {
  const styles = createStyles(theme);
  const isAdmin = user?.role === 'admin';
  const [sortFilter, setSortFilter] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [sortFilter]);

  // Filter collected items only (plus user restriction if non-admin)
  const historyParcels = parcels.filter(p => {
    const isCollected = p.status === 'Collected';
    if (!isAdmin) return isCollected && p.recipient === user?.username;
    return isCollected;
  });

  const processedHistory = [...historyParcels].sort((a, b) => {
    if (sortFilter === 'name_asc') return (a.recipientName || a.recipient || '').localeCompare(b.recipientName || b.recipient || '');
    if (sortFilter === 'name_desc') return (b.recipientName || b.recipient || '').localeCompare(a.recipientName || a.recipient || '');
    if (sortFilter === 'oldest') return new Date(a.dateCollected || a.dateReceived) - new Date(b.dateCollected || b.dateReceived);
    return new Date(b.dateCollected || b.dateReceived) - new Date(a.dateCollected || a.dateReceived);
  });

  const itemsPerPage = 5;
  const totalPages = Math.ceil(processedHistory.length / itemsPerPage);
  const paginatedHistory = processedHistory.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={styles.card}>
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <h3 style={{ fontWeight: 600, color: theme.text, margin: 0, fontSize: '16px' }}>Collection History</h3>
          <select
            value={sortFilter}
            onChange={(e) => setSortFilter(e.target.value)}
            style={{ ...styles.input, minWidth: '170px', padding: '6px 12px', fontSize: '13px', cursor: 'pointer' }}
          >
            <option value="newest">Sort: Latest Collection Date</option>
            <option value="oldest">Sort: Oldest Collection Date</option>
            <option value="name_asc">Sort: Name (A - Z)</option>
            <option value="name_desc">Sort: Name (Z - A)</option>
          </select>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Tracking</th>
                <th style={styles.th}>Sender</th>
                <th style={styles.th}>Recipient</th>
                <th style={styles.th}>Rack Used</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Collected Date</th>
              </tr>
            </thead>
            <tbody>
              {paginatedHistory.length === 0 ? (
                <tr><td colSpan="6" style={{ ...styles.td, textAlign: 'center', padding: '32px', color: theme.textSecondary }}>No collection history found</td></tr>
              ) : paginatedHistory.map(p => (
                <tr key={p.id} style={{ transition: 'background-color 0.15s' }}>
                  <td style={styles.td}><span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{p.trackingNo}</span></td>
                  <td style={styles.td}>{p.sender}</td>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 600 }}>{p.recipientName || p.recipient}</span>
                      {p.recipientIdNo && <span style={{ fontSize: '11px', color: theme.textSecondary }}>ID: {p.recipientIdNo}</span>}
                    </div>
                  </td>
                  <td style={styles.td}>{p.rackLocation ? <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#4f46e5' }}>{p.rackLocation}</span> : <span style={{ color: theme.textMuted }}>—</span>}</td>
                  <td style={styles.td}><span style={styles.badge('Collected')}>Collected</span></td>
                  <td style={styles.td}>{p.dateCollected ? p.dateCollected.split('T')[0] : (p.dateReceived || '-')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div style={{ padding: '16px 20px', borderTop: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <span style={{ fontSize: '14px', color: theme.textSecondary }}>
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, processedHistory.length)} of {processedHistory.length} records
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{ padding: '6px', borderRadius: '6px', border: `1px solid ${theme.border}`, backgroundColor: 'transparent', color: theme.text, cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.4 : 1 }}
              >
                <Icons.ChevronLeft width={16} height={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pg => (
                <button
                  key={pg}
                  onClick={() => setCurrentPage(pg)}
                  style={{ width: '28px', height: '28px', borderRadius: '6px', border: 'none', backgroundColor: currentPage === pg ? '#4f46e5' : 'transparent', color: currentPage === pg ? '#ffffff' : theme.text, fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}
                >
                  {pg}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                style={{ padding: '6px', borderRadius: '6px', border: `1px solid ${theme.border}`, backgroundColor: 'transparent', color: theme.text, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.4 : 1 }}
              >
                <Icons.ChevronRight width={16} height={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}