import { useState } from 'react';
import { Icons } from './Icons';
import { Modal } from './Modal';
import { createStyles } from '../utils/theme';

export function RackMaintenanceModal({ rackLetter, shelves, onClose, onToggleShelf, onToggleAll, parcels, theme }) {
  const [filter, setFilter] = useState('all');
  const styles = createStyles(theme);
  const filteredShelves = shelves.filter(s => {
    if (filter === 'maintenance') return s.maintenance;
    if (filter === 'available') return !s.maintenance;
    return true;
  });

  const maintenanceCount = shelves.filter(s => s.maintenance).length;
  const availableCount = shelves.filter(s => !s.maintenance).length;

  return (
    <Modal title={`Rack ${rackLetter} — Maintenance Management`} onClose={onClose} xlarge theme={theme}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '120px', padding: '12px', backgroundColor: theme.maintenanceBg, borderRadius: '8px', border: `1px solid ${theme.maintenanceBorder}` }}><p style={{ margin: 0, fontSize: '11px', color: theme.maintenanceText, fontWeight: 600, textTransform: 'uppercase' }}>Under Maintenance</p><p style={{ margin: '4px 0 0 0', fontSize: '24px', fontWeight: 700, color: theme.maintenanceText }}>{maintenanceCount}</p></div>
          <div style={{ flex: 1, minWidth: '120px', padding: '12px', backgroundColor: theme.availableBg, borderRadius: '8px', border: `1px solid ${theme.availableBorder}` }}><p style={{ margin: 0, fontSize: '11px', color: theme.availableText, fontWeight: 600, textTransform: 'uppercase' }}>Available</p><p style={{ margin: '4px 0 0 0', fontSize: '24px', fontWeight: 700, color: theme.availableText }}>{availableCount}</p></div>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={() => onToggleAll(false)} style={{ ...styles.btnSecondary, flex: 1 }} onMouseOver={(e) => { e.currentTarget.style.backgroundColor = theme.availableBg; e.currentTarget.style.color = theme.availableText; e.currentTarget.style.borderColor = theme.availableBorder; }} onMouseOut={(e) => { e.currentTarget.style.backgroundColor = styles.btnSecondaryBg; e.currentTarget.style.color = styles.btnSecondaryText; e.currentTarget.style.borderColor = styles.btnSecondaryBorder; }}><Icons.Check width={16} height={16} />Mark All Available</button>
          <button onClick={() => onToggleAll(true)} style={{ ...styles.btnSecondary, flex: 1 }} onMouseOver={(e) => { e.currentTarget.style.backgroundColor = theme.maintenanceBg; e.currentTarget.style.color = theme.maintenanceText; e.currentTarget.style.borderColor = theme.maintenanceBorder; }} onMouseOut={(e) => { e.currentTarget.style.backgroundColor = styles.btnSecondaryBg; e.currentTarget.style.color = styles.btnSecondaryText; e.currentTarget.style.borderColor = styles.btnSecondaryBorder; }}><Icons.Wrench width={16} height={16} />Mark All Maintenance</button>
        </div>

        <div style={{ display: 'flex', gap: '8px', borderBottom: `1px solid ${theme.border}`, paddingBottom: '12px' }}>
          {['all', 'maintenance', 'available'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: '6px 14px', backgroundColor: filter === f ? '#4f46e5' : styles.btnSecondaryBg, color: filter === f ? '#ffffff' : theme.text, border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize' }}>{f} {f === 'all' ? `(${shelves.length})` : f === 'maintenance' ? `(${maintenanceCount})` : `(${availableCount})`}</button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '10px', maxHeight: '400px', overflowY: 'auto' }}>
          {filteredShelves.map(shelf => {
            const parcel = parcels.find(p => p.id === shelf.parcelId);
            return (
              <div key={shelf.id} style={{ padding: '12px', backgroundColor: shelf.maintenance ? theme.maintenanceBg : theme.availableBg, border: `1px solid ${shelf.maintenance ? theme.maintenanceBorder : theme.availableBorder}`, borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: '14px', color: theme.text }}>{shelf.id}</span>
                  <span style={{ fontSize: '10px', fontWeight: 600, color: shelf.maintenance ? theme.maintenanceText : theme.availableText, textTransform: 'uppercase', padding: '2px 8px', borderRadius: '9999px', backgroundColor: shelf.maintenance ? theme.maintenanceBorder : theme.availableBorder }}>
                    {shelf.maintenance ? 'Maintenance' : 'Available'}
                  </span>
                </div>
                {shelf.maintenance && shelf.maintenanceReason && <p style={{ margin: 0, fontSize: '11px', color: theme.maintenanceText, fontStyle: 'italic' }}>{shelf.maintenanceReason}</p>}
                {parcel && <p style={{ margin: 0, fontSize: '11px', color: theme.textSecondary }}>Contains: {parcel.trackingNo}</p>}
                <button onClick={() => onToggleShelf(shelf.id)} style={{ padding: '6px', backgroundColor: shelf.maintenance ? '#16a34a' : '#d97706', color: 'white', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  {shelf.maintenance ? <><Icons.Check width={12} height={12} />Set Available</> : <><Icons.Wrench width={12} height={12} />Set Maintenance</>}
                </button>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={onClose} style={{ ...styles.btnPrimary, backgroundColor: styles.btnSecondaryBg, color: styles.btnSecondaryText }}>Close</button>
        </div>
      </div>
    </Modal>
  );
}
