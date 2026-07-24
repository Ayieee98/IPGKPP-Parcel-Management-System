import { useState } from 'react';
import { Icons } from '../components/Icons';
import { createStyles } from '../utils/theme';
import { formatDate } from '../utils/helpers';

export function RackManagementView({ racks, parcels, onToggleShelf, onToggleRack, onOpenDetail, theme }) {
  const totalShelves = racks.reduce((sum, r) => sum + r.shelves.length, 0);
  const maintenanceShelves = racks.reduce((sum, r) => sum + r.shelves.filter(s => s.maintenance).length, 0);
  const availableShelves = racks.reduce((sum, r) => sum + r.shelves.filter(s => s.status === 'empty' && !s.maintenance).length, 0);
  const occupiedShelves = racks.reduce((sum, r) => sum + r.shelves.filter(s => s.status === 'occupied').length, 0);
  const styles = createStyles(theme);

  if (racks.length === 0) {
    return (
      <div style={{ ...styles.card, padding: '40px', textAlign: 'center' }}>
        <Icons.AlertTriangle width={48} height={48} style={{ color: '#dc2626', marginBottom: '16px' }} />
        <h2 style={{ color: theme.text }}>Data Rak Tidak Ditemui</h2>
        <p style={{ color: theme.textSecondary, marginBottom: '24px' }}>Sistem gagal memuatkan data rak dari pangkalan data.</p>
        <button onClick={() => onToggleRack('ALL')} style={{ ...styles.btnPrimary, width: 'auto', padding: '12px 32px' }}>
          Pulihkan Sistem Rak (Reset)
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ ...styles.card, padding: '24px', background: 'linear-gradient(135deg, #92400e 0%, #d97706 100%)', color: 'white', border: 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ padding: '12px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '12px' }}><Icons.Wrench width={32} height={32} /></div>
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: 700, margin: 0 }}>Rack Maintenance Management</h2>
              <p style={{ margin: '4px 0 0 0', opacity: 0.9, fontSize: '14px' }}>Admin Control • Toggle Availability • Track Status</p>
            </div>
          </div>
          <button onClick={() => { if(window.confirm('Reset semua rak kepada status Available?')) onToggleRack('ALL'); }} style={{ ...styles.btnPrimary, width: 'auto', backgroundColor: '#ffffff', color: '#92400e', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
            <Icons.RefreshCw width={18} height={18} /> Reset Semua Rak
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginTop: '20px' }}>
          <div style={{ backgroundColor: 'rgba(255,255,255,0.15)', padding: '12px', borderRadius: '8px' }}><p style={{ margin: 0, fontSize: '12px', opacity: 0.8 }}>Total Shelves</p><p style={{ margin: '4px 0 0 0', fontSize: '24px', fontWeight: 700 }}>{totalShelves}</p></div>
          <div style={{ backgroundColor: 'rgba(22,163,74,0.3)', padding: '12px', borderRadius: '8px' }}><p style={{ margin: 0, fontSize: '12px', opacity: 0.9 }}>🟢 Available</p><p style={{ margin: '4px 0 0 0', fontSize: '24px', fontWeight: 700 }}>{availableShelves}</p></div>
          <div style={{ backgroundColor: 'rgba(220,38,38,0.3)', padding: '12px', borderRadius: '8px' }}><p style={{ margin: 0, fontSize: '12px', opacity: 0.9 }}>🔴 Occupied</p><p style={{ margin: '4px 0 0 0', fontSize: '24px', fontWeight: 700 }}>{occupiedShelves}</p></div>
          <div style={{ backgroundColor: 'rgba(217,119,6,0.3)', padding: '12px', borderRadius: '8px' }}><p style={{ margin: 0, fontSize: '12px', opacity: 0.9 }}>🟠 Maintenance</p><p style={{ margin: '4px 0 0 0', fontSize: '24px', fontWeight: 700 }}>{maintenanceShelves}</p></div>
        </div>
      </div>

      <div style={{ ...styles.statCard, backgroundColor: theme.maintenanceBg, border: `1px solid ${theme.maintenanceBorder}`, color: theme.maintenanceText, padding: '12px 16px', fontSize: '13px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Icons.AlertTriangle width={18} height={18} />
        <span><strong>Maintenance Mode:</strong> Shelves marked as maintenance cannot be assigned new parcels. Existing parcels remain until collected.</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {racks.map((rack) => {
          const rackMaintenanceCount = rack.shelves.filter(s => s.maintenance).length;
          const rackAvailableCount = rack.shelves.filter(s => s.status === 'empty' && !s.maintenance).length;
          const rackOccupiedCount = rack.shelves.filter(s => s.status === 'occupied').length;
          const isFullyMaintenance = rackMaintenanceCount === rack.shelves.length;

          return (
            <div key={rack.id} style={{ ...styles.card, overflow: 'visible' }}>
              <div style={{ padding: '16px', background: isFullyMaintenance ? 'linear-gradient(135deg, #92400e 0%, #d97706 100%)' : 'linear-gradient(135deg, #1e3a8a 0%, #312e81 100%)', color: 'white', borderRadius: '12px 12px 0 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ padding: '8px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '8px' }}><Icons.Layers width={20} height={20} /></div>
                    <div><h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>RACK {rack.letter}</h3><p style={{ margin: '2px 0 0 0', fontSize: '11px', opacity: 0.9 }}>{rack.shelves.length} shelves total</p></div>
                  </div>
                  {isFullyMaintenance && (<span style={{ fontSize: '10px', backgroundColor: 'rgba(255,255,255,0.25)', padding: '4px 10px', borderRadius: '9999px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}><Icons.Wrench width={10} height={10} />FULL MAINTENANCE</span>)}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', fontSize: '11px' }}>
                  <div style={{ backgroundColor: 'rgba(22,163,74,0.3)', padding: '6px 8px', borderRadius: '6px', textAlign: 'center' }}><p style={{ margin: 0, opacity: 0.9 }}>Available</p><p style={{ margin: '2px 0 0 0', fontSize: '16px', fontWeight: 700 }}>{rackAvailableCount}</p></div>
                  <div style={{ backgroundColor: 'rgba(220,38,38,0.3)', padding: '6px 8px', borderRadius: '6px', textAlign: 'center' }}><p style={{ margin: 0, opacity: 0.9 }}>Occupied</p><p style={{ margin: '2px 0 0 0', fontSize: '16px', fontWeight: 700 }}>{rackOccupiedCount}</p></div>
                  <div style={{ backgroundColor: 'rgba(217,119,6,0.3)', padding: '6px 8px', borderRadius: '6px', textAlign: 'center' }}><p style={{ margin: 0, opacity: 0.9 }}>Maintenance</p><p style={{ margin: '2px 0 0 0', fontSize: '16px', fontWeight: 700 }}>{rackMaintenanceCount}</p></div>
                </div>
              </div>

              <div style={{ padding: '12px', backgroundColor: styles.sectionBg, display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '220px', overflowY: 'auto' }}>
                {rack.shelves.map(shelf => {
                  const parcel = parcels.find(p => p.id === shelf.parcelId);
                  return (
                    <div key={shelf.id} style={{ padding: '8px 10px', backgroundColor: shelf.maintenance ? theme.maintenanceBg : shelf.status === 'occupied' ? theme.occupiedBg : theme.availableBg, border: `1px solid ${shelf.maintenance ? theme.maintenanceBorder : shelf.status === 'occupied' ? theme.occupiedBorder : theme.availableBorder}`, borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: shelf.maintenance ? '#d97706' : shelf.status === 'occupied' ? '#dc2626' : '#16a34a' }} />
                        <span style={{ fontWeight: 600, color: theme.text }}>{shelf.id}</span>
                        {parcel && <span style={{ fontSize: '10px', color: theme.textSecondary }}>({parcel.trackingNo})</span>}
                      </div>
                      <span style={{ fontSize: '10px', fontWeight: 600, color: shelf.maintenance ? theme.maintenanceText : shelf.status === 'occupied' ? theme.occupiedText : theme.availableText, textTransform: 'uppercase' }}>
                        {shelf.maintenance ? ' Maint.' : shelf.status === 'occupied' ? '● Occ.' : '✓ Empty'}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div style={{ padding: '12px', borderTop: `1px solid ${theme.border}`, backgroundColor: styles.cardBg, borderRadius: '0 0 12px 12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button onClick={() => onOpenDetail(rack.letter)} style={{ width: '100%', padding: '8px', backgroundColor: theme.iconBg, color: theme.iconColor, border: `1px solid ${theme === 'dark' ? '#4338ca' : '#c7d2fe'}`, borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><Icons.Settings width={14} height={14} />Manage Shelves</button>
                <button onClick={() => onToggleRack(rack.letter)} style={{ width: '100%', padding: '8px', backgroundColor: rackMaintenanceCount > 0 ? theme.availableBg : theme.maintenanceBg, color: rackMaintenanceCount > 0 ? theme.availableText : theme.maintenanceText, border: `1px solid ${rackMaintenanceCount > 0 ? theme.availableBorder : theme.maintenanceBorder}`, borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  {rackMaintenanceCount > 0 ? <><Icons.Check width={14} height={14} />Mark Rack as Available</> : <><Icons.Wrench width={14} height={14} />Set Entire Rack to Maintenance</>}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div style={styles.card}>
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Icons.AlertTriangle width={20} height={20} style={{ color: '#d97706' }} />
          <h3 style={{ fontWeight: 600, color: theme.text, margin: 0, fontSize: '16px' }}>Current Maintenance Status</h3>
        </div>
        <div style={{ padding: '20px 24px' }}>
          {maintenanceShelves === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px', color: theme.textSecondary }}>
              <Icons.CheckCircle width={40} height={40} style={{ color: '#16a34a', marginBottom: '8px' }} />
              <p style={{ margin: 0, fontSize: '14px', fontWeight: 500 }}>All racks are operational. No maintenance required.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '10px' }}>
              {racks.flatMap(rack => rack.shelves.filter(s => s.maintenance).map(s => ({ ...s, rackLetter: rack.letter }))).map(shelf => {
                const parcel = parcels.find(p => p.id === shelf.parcelId);
                return (
                  <div key={shelf.id} style={{ padding: '12px', backgroundColor: theme.maintenanceBg, border: `1px solid ${theme.maintenanceBorder}`, borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}><span style={{ fontWeight: 700, fontSize: '13px', color: theme.text }}>Rack {shelf.rackLetter} - {shelf.id}</span><Icons.Wrench width={16} height={16} style={{ color: '#d97706' }} /></div>
                    {shelf.maintenanceReason && <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: theme.maintenanceText, fontStyle: 'italic' }}>Reason: {shelf.maintenanceReason}</p>}
                    {shelf.maintenanceDate && <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: theme.maintenanceText }}>Since: {formatDate(shelf.maintenanceDate)}</p>}
                    {parcel && <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: theme.maintenanceText, fontWeight: 600 }}>⚠ Contains parcel: {parcel.trackingNo}</p>}
                    <button onClick={() => onToggleShelf(shelf.rackLetter, shelf.id)} style={{ marginTop: '8px', width: '100%', padding: '6px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}><Icons.Check width={12} height={12} />Clear Maintenance</button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
