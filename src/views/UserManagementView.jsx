import { useState } from 'react';
import { Icons } from '../components/Icons';
import { createStyles } from '../utils/theme';

export function UserManagementView({ users = [], userForm, setUserForm, onSaveUser, onEditUser, onDeleteUser, onCancelUserEdit, theme }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const styles = createStyles(theme);
  const upUser = (k) => (e) => setUserForm(prev => ({ ...prev, [k]: e.target.value }));
  
  const roleRank = { student: 1, staff: 2 };
  const managedUsers = users
    .filter(u => u.role === 'student' || u.role === 'staff')
    .sort((a, b) => (roleRank[a.role] || 99) - (roleRank[b.role] || 99) || (a.name || a.username || '').localeCompare(b.name || b.username || ''));

  // Smart derivation for phone numbers (so it works when editing an old user)
  const displayCountryCode = userForm.countryCode || (userForm.phone?.startsWith('+82') ? '+82' : userForm.phone?.startsWith('+65') ? '+65' : userForm.phone?.startsWith('+62') ? '+62' : '+60');
  const displayPhoneLocal = userForm.phoneLocal !== undefined ? userForm.phoneLocal : (userForm.phone ? userForm.phone.replace(displayCountryCode, '') : '');

  // Custom Interceptor to validate formatting before saving
  const handleFormSubmit = (e) => {
    e.preventDefault();

    // 1. Check for Duplicate Usernames
    const usernameExists = users.some(u => u.username.toLowerCase() === (userForm.username || '').toLowerCase() && u.id !== userForm.id);
    if (usernameExists) {
      return alert('This username is already taken. Please choose a different one.');
    }

    // 2. NEW: Check for Duplicate ID Numbers (Matric/Staff ID)
    const idExists = users.some(u => u.idNo === userForm.idNo && u.id !== userForm.id);
    if (idExists) {
      return alert('This Matric/Staff ID is already registered to another user.');
    }

    // 3. Strict Password Validation
    if (userForm.password) {
      const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
      if (!passwordRegex.test(userForm.password)) {
        return alert('Password must be at least 8 characters long, and include at least 1 capital letter, 1 number, and 1 special character (e.g., @, $, !, %).');
      }
      if (userForm.password !== userForm.confirmPassword) {
        return alert('Passwords do not match. Please try again.');
      }
    }

    // 4. NEW: Send Welcome Email ONLY IF it is a brand new user being created
    if (!userForm.id) {
      sendWelcomeEmail(userForm.name, userForm.email, userForm.role);
    }

    // Pass the safely formatted data to the main save function
    onSaveUser(e);
  };

  // Reusable Eye Icon Component
  const EyeIcon = ({ hidden }) => hidden ? (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={styles.card}>
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${theme.border}` }}>
          <h3 style={{ fontWeight: 600, color: theme.text, margin: 0, fontSize: '16px' }}>Student & Staff Management</h3>
        </div>
        
        <form onSubmit={handleFormSubmit} style={{ padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          
          {/* ROW 1 */}
          <input value={userForm.name || ''} onChange={e => setUserForm(prev => ({ ...prev, name: e.target.value.toUpperCase() }))} placeholder="FULL NAME" style={styles.input} required />
          <input value={userForm.username || ''} onChange={upUser('username')} placeholder="Username" style={styles.input} required />
          <input value={userForm.email || ''} onChange={upUser('email')} type="email" placeholder="Email Address" style={styles.input} required />
          
          {/* ROW 2 */}
          <input value={userForm.idNo || ''} onChange={upUser('idNo')} placeholder={userForm.role === 'student' ? "Matric Number" : "Staff ID Number"} style={styles.input} required />
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <select 
              value={displayCountryCode} 
              onChange={(e) => {
                const code = e.target.value;
                setUserForm(prev => ({ ...prev, countryCode: code, phone: code + displayPhoneLocal }));
              }} 
              style={{ ...styles.input, width: '90px', flexShrink: 0, padding: '10px 8px' }}
            >
              <option value="+60">🇲🇾 +60</option>
              <option value="+82">🇰🇷 +82</option>
              <option value="+65">🇸🇬 +65</option>
              <option value="+62">🇮🇩 +62</option>
            </select>
            <input 
              value={displayPhoneLocal} 
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                setUserForm(prev => ({ ...prev, phoneLocal: val, phone: displayCountryCode + val }));
              }} 
              type="tel" 
              placeholder="1023456789" 
              style={{ ...styles.input, flex: 1 }} 
              required 
            />
          </div>

          <div style={{ position: 'relative' }}>
            <input 
              value={userForm.password || ''} 
              onChange={upUser('password')} 
              type={showPassword ? "text" : "password"} 
              placeholder={userForm.id ? 'New password (optional)' : 'Password'} 
              style={{ ...styles.input, width: '100%', paddingRight: '40px', boxSizing: 'border-box' }} 
              required={!userForm.id} 
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: '#64748b' }}>
              <EyeIcon hidden={!showPassword} />
            </button>
          </div>

          {/* ROW 3 */}
          <select value={userForm.role || 'student'} onChange={upUser('role')} style={styles.input}>
            <option value="student">Student</option>
            <option value="staff">Staff</option>
          </select>
          
          <div style={{ position: 'relative' }}>
            <input 
              value={userForm.confirmPassword || ''} 
              onChange={upUser('confirmPassword')} 
              type={showConfirmPassword ? "text" : "password"} 
              placeholder={userForm.id ? 'Confirm new password (optional)' : 'Confirm Password'} 
              style={{ ...styles.input, width: '100%', paddingRight: '40px', boxSizing: 'border-box' }} 
              required={!!userForm.password} 
            />
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: '#64748b' }}>
              <EyeIcon hidden={!showConfirmPassword} />
            </button>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="submit" style={{ ...styles.btnPrimary, flex: 1 }}>{userForm.id ? 'Update User' : 'Add User'}</button>
            {userForm.id && (
              <button type="button" onClick={onCancelUserEdit} style={{ ...styles.btnSecondary, justifyContent: 'center' }}>Cancel</button>
            )}
          </div>
        </form>

        <div style={{ overflowX: 'auto', borderTop: `1px solid ${theme.border}` }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Username</th>
                <th style={styles.th}>Role</th>
                <th style={styles.th}>Matric / ID</th>
                <th style={styles.th}>Phone</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {managedUsers.length === 0 ? (
                <tr><td colSpan="6" style={{ ...styles.td, textAlign: 'center', color: theme.textSecondary }}>No student or staff accounts yet</td></tr>
              ) : managedUsers.map(u => (
                <tr key={u.id || u.username} style={{ transition: 'background-color 0.15s' }} onMouseOver={(e) => { e.currentTarget.style.backgroundColor = styles.tableRowHover; }} onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
                  <td style={styles.td}>{u.name || '-'}</td>
                  <td style={styles.td}><span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{u.username}</span></td>
                  <td style={styles.td}><span style={styles.badge(u.role === 'staff' ? 'Arrived' : 'Pending')}>{u.role === 'staff' ? 'Staff' : 'Student'}</span></td>
                  <td style={styles.td}>{u.idNo || u.id_no || '-'}</td>
                  <td style={styles.td}>{u.phone || '-'}</td>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button type="button" onClick={() => onEditUser(u)} style={styles.btnSecondary}><Icons.Edit width={16} height={16} />Edit</button>
                      <button type="button" onClick={() => onDeleteUser(u)} style={styles.btnDanger} title="Delete user"><Icons.Trash2 width={18} height={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}