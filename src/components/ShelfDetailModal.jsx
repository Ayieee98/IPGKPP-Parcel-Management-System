import { Icons } from './Icons';
import { Modal } from './Modal';
import { createStyles } from '../utils/theme';
import { formatDate } from '../utils/helpers';

export function ShelfDetailModal({ shelf, rackLetter, parcel, onClose, isAdmin, onToggleMaintenance, theme }) {
  if (!shelf) return null;
  const styles = createStyles(theme);
  const shelfInfo = shelf.maintenance ? { color: '#d97706', label: 'Under Maintenance' } : shelf.status === 'empty' ? { color: '#16a34a', label: 'Empty' } : shelf.status === 'ready' ? { color: '#2563eb', label: 'Ready for Pickup' } : { color: '#dc2626', label: 'Occupied' };

  return (
    <Modal title={`Shelf ${shelf.id} Details`} onClose={onClose} large theme={theme}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: shelf.maintenance ? theme.maintenanceBg : styles.sectionBg, borderRadius: '8px', border: `1px solid ${shelf.maintenance ? theme.maintenanceBorder : styles.sectionBorder}` }}>
          <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: shelfInfo.color, boxShadow: `0 0 12px ${shelfInfo.color}` }} />
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: theme.text }}>Rack {rackLetter} - Shelf {shelf.id}</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: shelfInfo.color, fontWeight: 600 }}>{shelfInfo.label}</p>
          </div>
          {shelf.maintenance && <Icons.Wrench width={28} height={28} style={{ color: '#d97706' }} />}
        </div>

        {shelf.maintenance && (
          <div style={{ padding: '12px 16px', backgroundColor: theme.maintenanceBg, borderRadius: '8px', border: `1px solid ${theme.maintenanceBorder}`, display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <Icons.AlertTriangle width={20} height={20} style={{ color: '#d97706', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: theme.maintenanceText }}>⚠ Shelf Under Maintenance</p>
              {shelf.maintenanceReason && <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: theme.maintenanceText }}>Reason: {shelf.maintenanceReason}</p>}
              {shelf.maintenanceDate && <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: theme.maintenanceText }}>Since: {formatDate(shelf.maintenanceDate)}</p>}
              <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: theme.maintenanceText, fontWeight: 500 }}>This shelf cannot be assigned new parcels until maintenance is cleared.</p>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div style={{ padding: '12px', backgroundColor: styles.sectionBg, borderRadius: '8px' }}>
            <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: theme.textSecondary, fontWeight: 600, textTransform: 'uppercase' }}>Weight Sensor</p>
            <p style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: theme.text, display: 'flex', alignItems: 'center', gap: '8px' }}><Icons.Scale width={20} height={20} style={{ color: '#4f46e5' }} />{shelf.weight}kg</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: theme.textMuted }}>Max capacity: {shelf.maxWeight}kg</p>
          </div>
          <div style={{ padding: '12px', backgroundColor: styles.sectionBg, borderRadius: '8px' }}>
            <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: theme.textSecondary, fontWeight: 600, textTransform: 'uppercase' }}>Occupancy Sensor</p>
            <p style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: shelf.maintenance ? '#d97706' : shelf.status === 'empty' ? '#16a34a' : '#dc2626' }}>{shelf.maintenance ? ' Maint.' : shelf.status === 'empty' ? '✓ Clear' : '● Detected'}</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: theme.textMuted }}>Real-time monitoring</p>
          </div>
        </div>
        {parcel && (
          <div style={{ padding: '16px', backgroundColor: theme.infoBg, borderRadius: '8px', border: `1px solid ${theme.infoBorder}` }}>
            <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: theme.infoText, fontWeight: 600, textTransform: 'uppercase' }}>Assigned Parcel</p>
            <p style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: theme.text }}>{parcel.trackingNo}</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: theme.text }}>Recipient: <strong>{parcel.recipient}</strong></p>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: theme.text }}>Sender: <strong>{parcel.sender}</strong></p>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: theme.text }}>Weight: <strong>{parcel.weight}</strong></p>
            <div style={{ marginTop: '8px' }}><span style={styles.badge(parcel.status)}>{parcel.status}</span></div>
          </div>
        )}
        {isAdmin && (
          <div style={{ padding: '16px', backgroundColor: styles.sectionBg, borderRadius: '8px', border: `1px solid ${styles.sectionBorder}` }}>
            <p style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 700, color: theme.text, display: 'flex', alignItems: 'center', gap: '6px' }}><Icons.Settings width={16} height={16} /> Admin Controls</p>
            <button onClick={() => onToggleMaintenance(rackLetter, shelf.id)} style={{ width: '100%', padding: '10px', backgroundColor: shelf.maintenance ? '#16a34a' : '#d97706', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              {shelf.maintenance ? <><Icons.Check width={16} height={16} />Mark as Available (Clear Maintenance)</> : <><Icons.Wrench width={16} height={16} />Set to Maintenance Mode</>}
            </button>
          </div>
        )}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={onClose} style={{ ...styles.btnPrimary, backgroundColor: styles.btnSecondaryBg, color: styles.btnSecondaryText }}>Close</button>
        </div>
      </div>
    </Modal>
  );
}