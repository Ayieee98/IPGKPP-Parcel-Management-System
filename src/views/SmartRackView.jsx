import { Icons } from '../components/Icons';
import { createStyles } from '../utils/theme';

export function SmartRackView({ racks, parcels, rackIoTData, onShelfClick, isAdmin, onToggleMaintenance, theme }) {
  if (!Array.isArray(racks) || racks.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p style={{ color: theme.textSecondary }}>No rack data to display.</p>
      </div>
    );
  }

  const styles = createStyles(theme);

  // Fungsi untuk memadankan data IoT dengan shelf ID
  const getIoTShelfData = (shelfId) => {
    if (!Array.isArray(rackIoTData)) return null;
    return rackIoTData.find(d => {
      if (!d || !d.rack_id || typeof d.rack_id !== 'string') return false;
      const formattedId = d.rack_id.replace('RACK-', '').replace('-SHELF-', '-');
      return formattedId === shelfId || d.rack_id === shelfId;
    });
  };

  const totalShelves = racks.reduce((sum, r) => sum + (r?.shelves?.length || 0), 0);

  const occupiedShelvesCount = racks.reduce((sum, r) => {
    const shelves = r?.shelves || [];
    return sum + shelves.filter(s => {
      if (!s) return false;
      const iot = getIoTShelfData(s.id);
      return s.status === 'occupied' || (iot && (Number(iot.weight) > 0.1 || iot.is_full));
    }).length;
  }, 0);

  const readyShelves = racks.reduce((sum, r) => sum + (r?.shelves || []).filter(s => s && s.status === 'ready').length, 0);
  const maintenanceShelves = racks.reduce((sum, r) => sum + (r?.shelves || []).filter(s => s && s.maintenance).length, 0);
  const emptyShelves = totalShelves - occupiedShelvesCount - readyShelves - maintenanceShelves;

  const getShelfColor = (shelf, iotData) => {
    if (!shelf) return { bg: theme.availableBg, border: theme.availableBorder, led: '#16a34a', label: 'Unknown' };
    if (shelf.maintenance) return { bg: theme.maintenanceBg, border: theme.maintenanceBorder, led: '#d97706', label: 'Maintenance' };

    if (iotData) {
      if (iotData.is_full) {
        return { bg: theme.occupiedBg, border: '#dc2626', led: '#dc2626', label: 'FULL' };
      }
      if (Number(iotData.weight) > 0.1) {
        return { bg: theme.occupiedBg, border: theme.occupiedBorder, led: '#dc2626', label: 'Occupied (Sensor)' };
      }
    }

    if (shelf.status === 'empty') return { bg: theme.availableBg, border: theme.availableBorder, led: '#16a34a', label: 'Empty' };
    if (shelf.status === 'ready') return { bg: theme.infoBg, border: theme.infoBorder, led: '#2563eb', label: 'Ready' };
    return { bg: theme.occupiedBg, border: theme.occupiedBorder, led: '#dc2626', label: 'Occupied' };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ ...styles.card, padding: '24px', background: 'linear-gradient(135deg, #0f172a 0%, #312e81 100%)', color: 'white', border: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          <div style={{ padding: '12px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '12px' }}><Icons.Layers width={32} height={32} /></div>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 700, margin: 0 }}>Smart Rack System</h2>
            <p style={{ margin: '4px 0 0 0', opacity: 0.9, fontSize: '14px' }}>Organized • Tracked • Real-Time Monitoring</p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
          <div style={{ backgroundColor: 'rgba(255,255,255,0.15)', padding: '12px', borderRadius: '8px' }}><p style={{ margin: 0, fontSize: '12px', opacity: 0.8 }}>Total Shelves</p><p style={{ margin: '4px 0 0 0', fontSize: '24px', fontWeight: 700 }}>{totalShelves}</p></div>
          <div style={{ backgroundColor: 'rgba(22,163,74,0.3)', padding: '12px', borderRadius: '8px' }}><p style={{ margin: 0, fontSize: '12px', opacity: 0.9 }}>🟢 Empty</p><p style={{ margin: '4px 0 0 0', fontSize: '24px', fontWeight: 700 }}>{emptyShelves}</p></div>
          <div style={{ backgroundColor: 'rgba(220,38,38,0.3)', padding: '12px', borderRadius: '8px' }}><p style={{ margin: 0, fontSize: '12px', opacity: 0.9 }}>🔴 Occupied</p><p style={{ margin: '4px 0 0 0', fontSize: '24px', fontWeight: 700 }}>{occupiedShelvesCount}</p></div>
          <div style={{ backgroundColor: 'rgba(37,99,235,0.3)', padding: '12px', borderRadius: '8px' }}><p style={{ margin: 0, fontSize: '12px', opacity: 0.9 }}>🔵 Ready</p><p style={{ margin: '4px 0 0 0', fontSize: '24px', fontWeight: 700 }}>{readyShelves}</p></div>
          {maintenanceShelves > 0 && (<div style={{ backgroundColor: 'rgba(217,119,6,0.3)', padding: '12px', borderRadius: '8px' }}><p style={{ margin: 0, fontSize: '12px', opacity: 0.9 }}>🟠 Maintenance</p><p style={{ margin: '4px 0 0 0', fontSize: '24px', fontWeight: 700 }}>{maintenanceShelves}</p></div>)}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        {racks.map((rack) => {
          if (!rack || !Array.isArray(rack.shelves)) return null;
          const rackMaintenanceCount = rack.shelves.filter(s => s && s.maintenance).length;
          const isFullyMaintenance = rackMaintenanceCount === rack.shelves.length;

          return (
            <div key={rack.id} style={{ ...styles.card, overflow: 'visible' }}>
              <div style={{ padding: '12px 16px', backgroundColor: '#1e3a8a', color: 'white', borderRadius: '12px 12px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Icons.Layers width={18} height={18} /><span style={{ fontWeight: 700, fontSize: '14px' }}>RACK {rack.letter}</span></div>
                {rackMaintenanceCount > 0 && (<span style={{ fontSize: '11px', backgroundColor: 'rgba(217,119,6,0.9)', padding: '3px 8px', borderRadius: '9999px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}><Icons.Wrench width={10} height={10} />{rackMaintenanceCount} under maintenance</span>)}
              </div>
              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', backgroundColor: styles.sectionBg }}>
                {rack.shelves.map((shelf) => {
                  if (!shelf) return null;
                  const iotData = getIoTShelfData(shelf.id);
                  const shelfInfo = getShelfColor(shelf, iotData);
                  const shelfParcel = Array.isArray(parcels) ? parcels.find(p => p && p.id === shelf.parcelId) : null;

                  const currentWeight = iotData ? Number(iotData.weight) : (Number(shelf.weight) || 0);

                  return (
                    <div key={shelf.id} onClick={() => onShelfClick(shelf, rack.letter)} style={{ backgroundColor: shelfInfo.bg, border: `2px solid ${shelfInfo.border}`, borderRadius: '8px', padding: '12px', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', opacity: shelf.maintenance ? 0.85 : 1 }} onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; }} onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '14px', height: '14px', borderRadius: '50%', backgroundColor: shelfInfo.led, boxShadow: `0 0 10px ${shelfInfo.led}`, animation: (shelfInfo.led !== '#16a34a' && !shelf.maintenance) ? 'pulse 2s infinite' : 'none', flexShrink: 0 }} />
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: theme.text }}>{shelf.id}</p>{shelf.maintenance && <Icons.Wrench width={14} height={14} style={{ color: '#d97706' }} />}</div>
                          {shelfParcel && <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: theme.textSecondary }}>{shelfParcel.trackingNo}</p>}
                          {shelf.maintenance && shelf.maintenanceReason && <p style={{ margin: '2px 0 0 0', fontSize: '10px', color: theme.maintenanceText, fontStyle: 'italic' }}>{shelf.maintenanceReason}</p>}
                          {iotData && <p style={{ margin: '2px 0 0 0', fontSize: '9px', color: '#4f46e5', fontWeight: 600 }}>LIVE SENSOR ACTIVE</p>}
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                        <span style={{ fontSize: '10px', fontWeight: 600, color: shelfInfo.led, textTransform: 'uppercase' }}>{shelfInfo.label}</span>
                        {currentWeight > 0 && <span style={{ fontSize: '10px', color: theme.textSecondary, display: 'flex', alignItems: 'center', gap: '4px' }} title="Berat"><Icons.Scale width={10} height={10} />{currentWeight.toFixed(2)}kg</span>}
                        {iotData && (
                          <>
                            <span style={{ fontSize: '10px', color: theme.textSecondary, display: 'flex', alignItems: 'center', gap: '4px' }} title="Kapasiti"><Icons.Layers width={10} height={10} />{iotData.fill_level}%</span>
                            <span style={{ fontSize: '10px', color: theme.textSecondary, display: 'flex', alignItems: 'center', gap: '4px' }} title="Gas/Bau"><Icons.Activity width={10} height={10} />{iotData.gas_value}</span>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              {isAdmin && (
                <div style={{ padding: '12px 16px', borderTop: `1px solid ${theme.border}`, backgroundColor: styles.cardBg, borderRadius: '0 0 12px 12px' }}>
                  <button onClick={(e) => { e.stopPropagation(); onToggleMaintenance(rack.letter, null); }} style={{ width: '100%', padding: '8px', backgroundColor: isFullyMaintenance ? theme.availableBg : theme.maintenanceBg, color: isFullyMaintenance ? theme.availableText : theme.maintenanceText, border: `1px solid ${isFullyMaintenance ? theme.availableBorder : theme.maintenanceBorder}`, borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    {isFullyMaintenance ? <><Icons.Check width={14} height={14} />Set All to Available</> : <><Icons.Wrench width={14} height={14} />Set Entire Rack to Maintenance</>}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ ...styles.card, padding: '16px 24px' }}>
        <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600, color: theme.text }}>LED Status Legend</h4>
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#16a34a', boxShadow: '0 0 8px #16a34a' }} /><span style={{ fontSize: '13px', color: theme.text }}><strong>GREEN</strong> = Empty</span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#dc2626', boxShadow: '0 0 8px #dc2626' }} /><span style={{ fontSize: '13px', color: theme.text }}><strong>RED</strong> = Occupied</span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#2563eb', boxShadow: '0 0 8px #2563eb' }} /><span style={{ fontSize: '13px', color: theme.text }}><strong>BLUE</strong> = Ready for Pickup</span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#d97706', boxShadow: '0 0 8px #d97706' }} /><span style={{ fontSize: '13px', color: theme.text }}><strong>ORANGE</strong> = Under Maintenance</span></div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
        {[
          { icon: Icons.Zap, label: 'LED Indicator (Status)', desc: 'Green/Red/Blue status' },
          { icon: Icons.Activity, label: 'Occupancy Sensor', desc: 'Detects parcel presence' },
          { icon: Icons.Scale, label: 'Weight Sensor', desc: 'Monitors parcel weight' },
          { icon: Icons.MapPin, label: 'Shelf / Location ID', desc: 'Precise location tracking' },
          { icon: Icons.Wifi, label: 'Real-Time Tracking', desc: 'IoT-based monitoring' },
          { icon: Icons.Cpu, label: 'Smart Campus IoT', desc: 'Integrated with website' },
        ].map((feat, idx) => (
          <div key={idx} style={{ ...styles.statCard, display: 'flex', alignItems: 'center', gap: '12px', padding: '12px' }}>
            <div style={{ padding: '8px', backgroundColor: theme.iconBg, borderRadius: '8px' }}><feat.icon width={20} height={20} style={{ color: theme.iconColor }} /></div>
            <div>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: theme.text }}>{feat.label}</p>
              <p style={{ margin: 0, fontSize: '11px', color: theme.textSecondary }}>{feat.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>


  );
}