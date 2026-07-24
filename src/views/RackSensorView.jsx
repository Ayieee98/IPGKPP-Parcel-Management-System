import { Icons } from '../components/Icons';
import { createStyles } from '../utils/theme';

export function RackSensorView({ rackIoTData, theme }) {
  const styles = createStyles(theme);

  // Mengambil data terkini (paling atas) daripada senarai IoT data
  const latestData = Array.isArray(rackIoTData) && rackIoTData.length > 0 ? rackIoTData[0] : null;

  const fill = latestData?.fill_level || 0;
  const weight = latestData?.weight || 0;
  const gas = latestData?.gas_value || 0;
  const status = latestData?.status || 'Normal';
  const lastUpdate = latestData?.updated_at ? new Date(latestData.updated_at).toLocaleTimeString() : 'Never';

  const isFull = latestData?.is_full ?? (status === 'Penuh' || fill >= 80);
  const isOverweight = status === 'Berat Berlebihan' || weight >= 2.0;
  const hasBadOdor = status === 'Bau Busuk' || gas >= 1000;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ ...styles.card, padding: '24px', background: 'linear-gradient(135deg, #0f172a 0%, #312e81 100%)', color: 'white', border: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          <div style={{ padding: '12px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '12px' }}>
            <Icons.Cpu width={32} height={32} />
          </div>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 700, margin: 0 }}>IPGKPP Smart Rack IoT Monitor</h2>
            <p style={{ margin: '4px 0 0 0', opacity: 0.9, fontSize: '14px' }}>Real-time environmental & weight sensors — Rack {latestData?.rack_id || '-'}</p>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: latestData ? '#4ade80' : '#f87171', boxShadow: `0 0 10px ${latestData ? '#4ade80' : '#f87171'}` }}></div>
            <span style={{ fontSize: '14px', fontWeight: 600 }}>{latestData ? `Device Online (${latestData.rack_id})` : 'Waiting for data...'}</span>
          </div>
          <div style={{ fontSize: '12px', opacity: 0.8, backgroundColor: 'rgba(255,255,255,0.1)', padding: '4px 10px', borderRadius: '6px' }}>
            Last Sync: {lastUpdate}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
        <div style={styles.statCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: '#4f46e515' }}><Icons.Layers width={20} height={20} style={{ color: '#4f46e5' }} /></div>
            <span style={{ fontSize: '24px', fontWeight: 700, color: theme.text }}>{fill}%</span>
          </div>
          <p style={{ fontSize: '14px', color: theme.textSecondary, fontWeight: 500, margin: 0 }}>Capacity Fill Level</p>
          <div style={{ marginTop: '12px', height: '6px', backgroundColor: theme.border, borderRadius: '9999px', overflow: 'hidden' }}>
            <div style={{ height: '100%', backgroundColor: fill > 80 ? '#dc2626' : '#4f46e5', width: `${fill}%`, transition: 'width 0.5s' }} />
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: '#16a34a15' }}><Icons.Scale width={20} height={20} style={{ color: '#16a34a' }} /></div>
            <span style={{ fontSize: '24px', fontWeight: 700, color: theme.text }}>{weight} kg</span>
          </div>
          <p style={{ fontSize: '14px', color: theme.textSecondary, fontWeight: 500, margin: 0 }}>Total Weight Load</p>
        </div>

        <div style={styles.statCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: '#d9770615' }}><Icons.Activity width={20} height={20} style={{ color: '#d97706' }} /></div>
            <span style={{ fontSize: '24px', fontWeight: 700, color: theme.text }}>{gas}</span>
          </div>
          <p style={{ fontSize: '14px', color: theme.textSecondary, fontWeight: 500, margin: 0 }}>Gas Value / Odor Level</p>
        </div>
      </div>

      <div style={styles.card}>
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${theme.border}` }}>
          <h3 style={{ fontWeight: 600, color: theme.text, margin: 0, fontSize: '16px' }}>Sensor Alerts & Thresholds</h3>
        </div>
        <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: isFull ? theme.occupiedBg : theme.availableBg, border: `1px solid ${isFull ? theme.occupiedBorder : theme.availableBorder}`, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: isFull ? '#dc2626' : '#16a34a' }} />
            <span style={{ fontSize: '14px', fontWeight: 600, color: isFull ? theme.occupiedText : theme.availableText }}>{isFull ? 'RACK FULL' : 'Space Available'}</span>
          </div>
          <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: isOverweight ? theme.occupiedBg : theme.availableBg, border: `1px solid ${isOverweight ? theme.occupiedBorder : theme.availableBorder}`, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: isOverweight ? '#dc2626' : '#16a34a' }} />
            <span style={{ fontSize: '14px', fontWeight: 600, color: isOverweight ? theme.occupiedText : theme.availableText }}>{isOverweight ? 'OVERWEIGHT' : 'Weight Normal'}</span>
          </div>
          <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: hasBadOdor ? theme.maintenanceBg : theme.availableBg, border: `1px solid ${hasBadOdor ? theme.maintenanceBorder : theme.availableBorder}`, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: hasBadOdor ? '#d97706' : '#16a34a' }} />
            <span style={{ fontSize: '14px', fontWeight: 600, color: hasBadOdor ? theme.maintenanceText : theme.availableText }}>{hasBadOdor ? 'BAD ODOR DETECTED' : 'Air Quality Good'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}