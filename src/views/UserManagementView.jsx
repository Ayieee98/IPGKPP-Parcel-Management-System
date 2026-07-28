import { useState, useEffect } from 'react';
import { Icons } from '../components/Icons';
import { createStyles } from '../utils/theme';
import emailjs from '@emailjs/browser';

export function UserManagementView({ users = [], userForm, setUserForm, onSaveUser, onEditUser, onDeleteUser, onCancelUserEdit, theme }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('student');
  const [sortFilter, setSortFilter] = useState('name_asc');
  const [currentPage, setCurrentPage] = useState(1);

  const styles = createStyles(theme);
  const upUser = (k) => (e) => setUserForm(prev => ({ ...prev, [k]: e.target.value }));

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, sortFilter]);

  const roleRank = { student: 1, staff: 2 };
  const processedUsers = users
    .filter(u => u && u.role === activeTab)
    .sort((a, b) => {
      if (sortFilter === 'name_asc') return String(a.name || a.username || '').localeCompare(String(b.name || b.username || ''));
      if (sortFilter === 'name_desc') return String(b.name || b.username || '').localeCompare(String(a.name || a.username || ''));
      return (roleRank[a?.role] || 99) - (roleRank[b?.role] || 99);
    });

  const itemsPerPage = 5;
  const totalPages = Math.ceil(processedUsers.length / itemsPerPage);
  const paginatedUsers = processedUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const safePhone = String(userForm.phone || '');
  const displayCountryCode = userForm.countryCode || (safePhone.startsWith('+82') ? '+82' : safePhone.startsWith('+65') ? '+65' : safePhone.startsWith('+62') ? '+62' : '+60');
  const displayPhoneLocal = userForm.phoneLocal !== undefined ? userForm.phoneLocal : safePhone.replace(displayCountryCode, '');

  const handleFormSubmit = (e) => {
    e.preventDefault();

    const usernameExists = users.some(u => String(u.username || '').toLowerCase() === String(userForm.username || '').toLowerCase() && u.id !== userForm.id);
    if (usernameExists) {
      return alert('This username is already taken. Please choose a different one.');
    }

    const idExists = users.some(u => u.idNo === userForm.idNo && u.id !== userForm.id);
    if (idExists) {
      return alert('This Matric/Staff ID is already registered to another user.');
    }

    if (userForm.password) {
      const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
      if (!passwordRegex.test(userForm.password)) {
        return alert('Password must be at least 8 characters long, and include at least 1 capital letter, 1 number, and 1 special character.');
      }
      if (userForm.password !== userForm.confirmPassword) {
        return alert('Passwords do not match. Please try again.');
      }
    }

    if (!userForm.id) {
      sendWelcomeEmail(userForm.name, userForm.email, userForm.role);
    }

    onSaveUser(e);
  };

  const EyeIcon = ({ hidden }) => hidden ? (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={styles.card}>
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${theme.border}` }}>
          <h3 style={{ fontWeight: 600, color: theme.text, margin: 0, fontSize: '16px' }}>Student & Staff Management</h3>
        </div>

        <form onSubmit={handleFormSubmit} style={{ padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }} onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}>
          <input value={userForm.name || ''} onChange={e => setUserForm(prev => ({ ...prev, name: e.target.value.toUpperCase() }))} placeholder="FULL NAME" style={styles.input} required />
          <input value={userForm.username || ''} onChange={upUser('username')} placeholder="Username" style={styles.input} required />
          <input value={userForm.email || ''} onChange={upUser('email')} type="email" placeholder="Email Address" style={styles.input} required />
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

          {!userForm.id && (
            <div style={{ position: 'relative' }}>
              <input
                value={userForm.password || ''}
                onChange={upUser('password')}
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                style={{ ...styles.input, width: '100%', paddingRight: '40px', boxSizing: 'border-box' }}
                required
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: '#64748b' }}>
                <EyeIcon hidden={!showPassword} />
              </button>
            </div>
          )}

          <select value={userForm.role || 'student'} onChange={upUser('role')} style={styles.input}>
            <option value="student">Student</option>
            <option value="staff">Staff</option>
          </select>

          {!userForm.id && (
            <div style={{ position: 'relative' }}>
              <input
                value={userForm.confirmPassword || ''}
                onChange={upUser('confirmPassword')}
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                style={{ ...styles.input, width: '100%', paddingRight: '40px', boxSizing: 'border-box' }}
                required
              />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: '#64748b' }}>
                <EyeIcon hidden={!showConfirmPassword} />
              </button>
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="submit" style={{ ...styles.btnPrimary, flex: 1 }}>{userForm.id ? 'Update User' : 'Add User'}</button>
            {userForm.id && (
              <button type="button" onClick={onCancelUserEdit} style={{ ...styles.btnSecondary, justifyContent: 'center' }}>Cancel</button>
            )}
          </div>
        </form>

        <div style={{ padding: '16px 20px', borderTop: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: theme.text }}>Registered Users</h4>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <select
              value={sortFilter}
              onChange={(e) => setSortFilter(e.target.value)}
              style={{ ...styles.input, minWidth: '170px', padding: '6px 12px', fontSize: '13px', cursor: 'pointer' }}
            >
              <option value="name_asc">Sort: Name (A - Z)</option>
              <option value="name_desc">Sort: Name (Z - A)</option>
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
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Username</th>
                <th style={styles.th}>Role</th>
                <th style={styles.th}>Matric / ID</th>
                <th style={styles.th}>Phone</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.length === 0 ? (
                <tr><td colSpan="6" style={{ ...styles.td, textAlign: 'center', color: theme.textSecondary, padding: '32px' }}>No student or staff accounts found</td></tr>
              ) : paginatedUsers.map(u => (
                <tr key={u.id || u.username} style={{ transition: 'background-color 0.15s' }}>
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

        {totalPages > 1 && (
          <div style={{ padding: '16px 20px', borderTop: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <span style={{ fontSize: '14px', color: theme.textSecondary }}>
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, processedUsers.length)} of {processedUsers.length} records
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

const sendWelcomeEmail = (userName, userEmail, userRole) => {
  if (!userEmail) return;

  try {
    emailjs.send(
      'service_b85yfd9',
      'template_nrs5gxn',
      {
        to_name: userName,
        to_email: userEmail,
        role: userRole === 'staff' ? 'Staff' : 'Student'
      },
      'JT3OFA36C4eS3rqWS'
    ).catch((err) => console.error("Failed to send welcome email:", err));
  } catch (error) {
    console.error("EmailJS execution failed:", error);
  }
};