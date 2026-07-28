import { useState, useRef, useEffect } from 'react';
import { Icons } from '../components/Icons';
import { createStyles } from '../utils/theme';
import { COURIERS } from '../utils/constants';

export function ParcelManagementView({ parcels, users = [], form, setForm, onAdd, onRequestCollect, onDelete, onUpdateStatus, onOpenScanner, scannedTracking, racks, theme }) {
  const [activeTab, setActiveTab] = useState('student');
  const [sortFilter, setSortFilter] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);

  const styles = createStyles(theme);
  const trackingInputRef = useRef(null);

  const up = (k) => (e) => { const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value; setForm(prev => ({ ...prev, [k]: value })); };
  const isOthers = form.sender === 'Others';
  const emptyShelves = racks.flatMap(r => r.shelves.filter(s => s.status === 'empty' && !s.maintenance).map(s => ({ ...s, rackLetter: r.letter })));
  const maintenanceShelves = racks.flatMap(r => r.shelves.filter(s => s.maintenance).map(s => ({ ...s, rackLetter: r.letter })));
  const statusOptions = ['Pending', 'Arrived', 'Overdue', 'Collected'];
  const roleRank = { student: 1, staff: 2 };
  const recipientOptions = users
    .filter(u => u.role === 'student' || u.role === 'staff')
    .sort((a, b) => (roleRank[a.role] || 99) - (roleRank[b.role] || 99) || (a.name || a.username || '').localeCompare(b.name || b.username || ''));

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, sortFilter]);

  const handleReadyScanner = () => {
    if (trackingInputRef.current) {
      trackingInputRef.current.focus();
    }
  };

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && text.trim()) {
        setForm(prev => ({ ...prev, trackingNo: text.trim().toUpperCase() }));
      } else {
        alert('Clipboard is empty or does not contain text.');
      }
    } catch (err) {
      alert('Please allow clipboard permissions in your browser to use this feature.');
    }
  };

  const getParcelRole = (parcel) => {
    if (parcel.recipientRole) return parcel.recipientRole;
    const foundUser = users.find(u => u.username === parcel.recipient);
    return foundUser?.role || 'student';
  };

  const processedParcels = [...parcels]
    .filter(p => {
      const role = getParcelRole(p);
      return activeTab === 'staff' ? role === 'staff' : role !== 'staff';
    })
    .filter(p => {
      if (sortFilter === 'status_arrived') return p.status === 'Arrived';
      if (sortFilter === 'status_pending') return p.status === 'Pending';
      if (sortFilter === 'status_collected') return p.status === 'Collected';
      if (sortFilter === 'status_overdue') return p.status === 'Overdue';
      return true;
    })
    .sort((a, b) => {
      if (sortFilter === 'name_asc') return (a.recipientName || a.recipient || '').localeCompare(b.recipientName || b.recipient || '');
      if (sortFilter === 'name_desc') return (b.recipientName || b.recipient || '').localeCompare(a.recipientName || a.recipient || '');
      if (sortFilter === 'oldest') return new Date(a.dateReceived) - new Date(b.dateReceived);
      return new Date(b.dateReceived) - new Date(a.dateReceived);
    });

  const itemsPerPage = 5;
  const totalPages = Math.ceil(processedParcels.length / itemsPerPage);
  const paginatedParcels = processedParcels.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={styles.card}>
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontWeight: 600, color: theme.text, margin: 0, fontSize: '16px' }}>Register Incoming Parcel</h3>
          <button type="button" onClick={handleReadyScanner} style={styles.btnSecondary}>
            <Icons.Barcode width={18} height={18} />Ready USB Scanner
          </button>
        </div>
        <form onSubmit={onAdd} style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: theme.textSecondary, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tracking Number {scannedTracking && <span style={{ color: '#16a34a', fontWeight: 400 }}>✓ Scanned</span>}</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                ref={trackingInputRef}
                value={form.trackingNo}
                onChange={up('trackingNo')}
                placeholder="Tracking Number (or scan barcode)"
                style={{ ...styles.input, flex: 1, borderColor: scannedTracking ? '#86efac' : styles.inputBorder }}
                required
                autoFocus
              />
              <button type="button" onClick={() => onOpenScanner('camera')} style={{ ...styles.btnSecondary, flexShrink: 0, padding: '10px 14px' }} title="Scan with Phone Camera">
                <Icons.Camera width={18} height={18} />
              </button>
              <button type="button" onClick={handlePasteClipboard} style={{ ...styles.btnSecondary, flexShrink: 0, padding: '10px 14px' }} title="Paste from Clipboard">
                <Icons.Clipboard width={18} height={18} />
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <select value={form.sender} onChange={up('sender')} style={styles.input} required>
              <option value="" disabled>Select Courier</option>
              {COURIERS.map((c) => (<option key={c.value} value={c.value}>{c.label}</option>))}
            </select>
            {isOthers && <input value={form.senderOther} onChange={up('senderOther')} placeholder="Enter courier name" style={styles.input} required={isOthers} />}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <input
              value={form.recipient}
              onChange={up('recipient')}
              list="recipient-options"
              placeholder="Type name to search..."
              style={styles.input}
              required
              onBlur={(e) => {
                const val = e.target.value;
                if (!val) return;
                const isValid = val === 'UNREGISTERED' || recipientOptions.some(u => u.username === val);
                if (!isValid) {
                  setForm(prev => ({ ...prev, recipient: '' }));
                  alert('Name not found in system! Please select a valid user from the popup list, or select "UNREGISTERED".');
                }
              }}
            />
            <datalist id="recipient-options">
              <option value="UNREGISTERED" label="⚠ Unregistered / Guest (Manual Claim)" />
              {recipientOptions.map(u => (
                <option key={u.username} value={u.username} label={`${u.name || u.username} - ${u.role === 'staff' ? 'Staff' : 'Student'}`} />
              ))}
            </datalist>

            {form.recipient === 'UNREGISTERED' && (
              <input
                value={form.recipientNameOnLabel || ''}
                onChange={up('recipientNameOnLabel')}
                placeholder="Name printed on physical parcel"
                style={styles.input}
                required
              />
            )}
          </div>

          <select value={form.status} onChange={up('status')} style={styles.input}>
            {statusOptions.filter(status => status !== 'Collected').map(status => <option key={status}>{status}</option>)}
          </select>
          <input value={form.location} onChange={up('location')} placeholder="Storage Location" style={{ ...styles.input, gridColumn: '1 / -1' }} required />
          <input value={form.description} onChange={up('description')} placeholder="Package Description (Visible to User)" style={{ ...styles.input, gridColumn: '1 / -1' }} />

          {form.recipient !== 'UNREGISTERED' ? (
            <div style={{ gridColumn: '1 / -1', padding: '16px', backgroundColor: styles.sectionBg, borderRadius: '10px', border: `1px solid ${styles.sectionBorder}` }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 700, color: theme.text, display: 'flex', alignItems: 'center', gap: '8px' }}><Icons.Zap width={18} height={18} style={{ color: '#4f46e5' }} />Smart Rack Assignment</h4>
              {maintenanceShelves.length > 0 && (
                <div style={{ marginBottom: '12px', padding: '8px 12px', backgroundColor: theme.maintenanceBg, border: `1px solid ${theme.maintenanceBorder}`, borderRadius: '6px', fontSize: '12px', color: theme.maintenanceText, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Icons.AlertTriangle width={14} height={14} /><span><strong>{maintenanceShelves.length} shelf{maintenanceShelves.length > 1 ? 's' : ''} under maintenance</strong> — excluded from auto-assignment</span>
                </div>
              )}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: theme.text, marginBottom: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={form.assignRack || false}
                    onChange={up('assignRack')}
                    style={{
                      width: '16px', height: '16px', cursor: 'pointer', accentColor: '#4f46e5', backgroundColor: '#ffffff', colorScheme: 'light', border: '1px solid #cbd5e1', borderRadius: '4px'
                    }}
                  />Assign to Smart Rack Shelf
                </label>
                {form.assignRack && (
                  <select value={form.selectedRackShelf || ''} onChange={up('selectedRackShelf')} style={{ ...styles.input, fontSize: '13px' }}>
                    <option value="">Auto-find empty shelf (excludes maintenance)</option>
                    {emptyShelves.map(s => (<option key={s.id} value={s.id}>Rack {s.rackLetter} - Shelf {s.id} (Empty)</option>))}
                  </select>
                )}
              </div>
            </div>
          ) : (
            <div style={{ gridColumn: '1 / -1', padding: '16px', backgroundColor: theme.maintenanceBg, borderRadius: '10px', border: `1px solid ${theme.maintenanceBorder}` }}>
              <p style={{ margin: 0, color: theme.maintenanceText, fontWeight: 600, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icons.AlertTriangle width={18} height={18} />
                Unregistered parcels cannot be assigned to the Smart Rack.
              </p>
            </div>
          )}

          <button type="submit" style={{ ...styles.btnPrimary, gridColumn: '1 / -1' }}>Register Parcel</button>
        </form>
      </div>

      <div style={styles.card}>
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <h3 style={{ fontWeight: 600, color: theme.text, margin: 0, fontSize: '16px' }}>System Parcel Management</h3>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <select
              value={sortFilter}
              onChange={(e) => setSortFilter(e.target.value)}
              style={{ ...styles.input, minWidth: '170px', padding: '6px 12px', fontSize: '13px', cursor: 'pointer' }}
            >
              <option value="newest">Sort: Latest Date</option>
              <option value="oldest">Sort: Oldest Date</option>
              <option value="name_asc">Sort: Name (A - Z)</option>
              <option value="name_desc">Sort: Name (Z - A)</option>
              <option disabled>──────────</option>
              <option value="status_arrived">Filter: Arrived Only</option>
              <option value="status_pending">Filter: Pending Only</option>
              <option value="status_collected">Filter: Collected Only</option>
              <option value="status_overdue">Filter: Overdue Only</option>
            </select>

            <div style={{ display: 'flex', gap: '4px', backgroundColor: styles.sectionBg, padding: '4px', borderRadius: '8px' }}>
              <button type="button" onClick={() => setActiveTab('student')} style={{ padding: '6px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 600, backgroundColor: activeTab === 'student' ? '#4f46e5' : 'transparent', color: activeTab === 'student' ? '#fff' : theme.textSecondary }}>Student</button>
              <button type="button" onClick={() => setActiveTab('staff')} style={{ padding: '6px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 600, backgroundColor: activeTab === 'staff' ? '#4f46e5' : 'transparent', color: activeTab === 'staff' ? '#fff' : theme.textSecondary }}>Staff</button>
            </div>
          </div>
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
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedParcels.length === 0 ? (
                <tr><td colSpan="7" style={{ ...styles.td, textAlign: 'center', padding: '32px', color: theme.textSecondary }}>No parcels found matching this filter</td></tr>
              ) : paginatedParcels.map(p => (
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
                  <td style={styles.td}>
                    <select
                      value={p.status || 'Pending'}
                      onChange={(e) => onUpdateStatus(p.id, e.target.value)}
                      style={{ ...styles.input, minWidth: '130px', padding: '6px 10px' }}
                    >
                      {statusOptions.map(status => <option key={status}>{status}</option>)}
                    </select>
                  </td>
                  <td style={styles.td}>{p.dateReceived}</td>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {p.status === 'Arrived' && (<button onClick={() => onRequestCollect(p)} style={{ padding: '6px 12px', backgroundColor: '#4f46e5', color: '#ffffff', fontSize: '12px', fontWeight: 600, borderRadius: '6px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}><Icons.Lock width={14} height={14} />Verify</button>)}
                      <button onClick={() => onDelete(p.id)} style={styles.btnDanger}><Icons.Trash2 width={18} height={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div style={{ padding: '16px 20px', borderTop: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <span style={{ fontSize: '14px', color: theme.textSecondary }}>
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, processedParcels.length)} of {processedParcels.length} records
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