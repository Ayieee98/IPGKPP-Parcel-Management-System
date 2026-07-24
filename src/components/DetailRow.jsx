export function DetailRow({ label, value, valueColor, theme }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: `1px solid ${theme.border}` }}>
      <span style={{ color: theme.textSecondary }}>{label}</span>
      <span style={{ fontWeight: 500, color: valueColor || theme.text }}>{value}</span>
    </div>
  );
}