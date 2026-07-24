import { Icons } from './Icons';
import { THEMES, createStyles } from '../utils/theme';

export function Modal({ title, children, onClose, large, xlarge, theme }) {
  const t = theme || THEMES.light;
  const styles = createStyles(t);
  
  return (
    <div style={styles.modal} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={xlarge ? styles.modalContentXLarge : large ? styles.modalContentLarge : styles.modalContent}>
        <div style={styles.modalHeader}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: t.text, margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.textSecondary, padding: '4px', borderRadius: '6px' }} onMouseOver={(e) => { e.currentTarget.style.backgroundColor = styles.btnSecondaryBg; }} onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
            <Icons.X width={20} height={20} />
          </button>
        </div>
        <div style={styles.modalBody}>{children}</div>
      </div>
    </div>
  );
}