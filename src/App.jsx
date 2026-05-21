import { useState, useRef, useEffect } from 'react';

const Icons = {
  Package: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16.5 9.4 7.55 4.24"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" x2="12" y1="22.08" y2="12"/></svg>,
  LayoutDashboard: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>,
  Inbox: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>,
  Users: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Search: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>,
  CheckCircle: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  Clock: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  AlertTriangle: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>,
  LogOut: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>,
  Menu: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>,
  ChevronLeft: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m15 18-6-6 6-6"/></svg>,
  ChevronRight: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m9 18 6-6-6-6"/></svg>,
  Trash2: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>,
  Eye: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  Edit: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Info: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
  Lock: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  X: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
};

const STYLES = {
  app: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    color: '#1e293b',
    backgroundColor: '#f8fafc',
  },
  sidebar: {
    width: '256px',
    backgroundColor: '#ffffff',
    borderRight: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    top: 0,
    left: 0,
    height: '100vh',
    zIndex: 100,
    transition: 'transform 0.2s ease',
  },
  sidebarMobile: {
    transform: 'translateX(-100%)',
  },
  sidebarOpen: {
    transform: 'translateX(0)',
  },
  sidebarHeader: {
    padding: '24px',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoText: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#0f172a',
  },
  nav: {
    flex: 1,
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  navItem: (isActive) => ({
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 12px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 500,
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.15s',
    backgroundColor: isActive ? '#eef2ff' : 'transparent',
    color: isActive ? '#4f46e5' : '#475569',
    textAlign: 'left',
  }),
  main: {
    flex: 1,
    marginLeft: '256px',
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  mainNoSidebar: {
    marginLeft: 0,
  },
  header: {
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'sticky',
    top: 0,
    zIndex: 50,
  },
  content: {
    flex: 1,
    padding: '24px 32px',
    overflowY: 'auto',
  },
  hamburger: {
    padding: '8px',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    color: '#475569',
    borderRadius: '8px',
    display: 'none',
  },
  userMenuContainer: {
    position: 'relative',
  },
  userMenuBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
    color: '#475569',
    transition: 'all 0.15s',
  },
  dropdown: {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    right: 0,
    width: '224px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
    border: '1px solid #e2e8f0',
    padding: '8px',
    zIndex: 200,
  },
  dropdownItem: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    borderRadius: '8px',
    fontSize: '14px',
    border: 'none',
    cursor: 'pointer',
    backgroundColor: 'transparent',
    color: '#334155',
    textAlign: 'left',
    transition: 'all 0.15s',
  },
  dropdownLogout: {
    color: '#dc2626',
  },
  divider: {
    height: '1px',
    backgroundColor: '#e2e8f0',
    margin: '8px 0',
  },
  modal: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '16px',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
    width: '100%',
    maxWidth: '448px',
    overflow: 'hidden',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid #f1f5f9',
  },
  modalBody: {
    padding: '20px',
  },
  input: {
    width: '100%',
    padding: '10px 16px',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.15s',
    boxSizing: 'border-box',
  },
  btnPrimary: {
    width: '100%',
    padding: '10px 16px',
    backgroundColor: '#4f46e5',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background-color 0.15s',
  },
  btnDanger: {
    padding: '6px',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    color: '#dc2626',
    borderRadius: '6px',
  },
  badge: (status) => {
    const colors = {
      Pending: { bg: '#fef3c7', color: '#92400e', border: '#fde68a' },
      Arrived: { bg: '#dbeafe', color: '#1e40af', border: '#bfdbfe' },
      Collected: { bg: '#d1fae5', color: '#065f46', border: '#a7f3d0' },
      Overdue: { bg: '#fee2e2', color: '#991b1b', border: '#fecaca' },
    };
    const c = colors[status] || colors.Pending;
    return {
      display: 'inline-flex',
      padding: '4px 10px',
      borderRadius: '9999px',
      fontSize: '12px',
      fontWeight: 600,
      backgroundColor: c.bg,
      color: c.color,
      border: `1px solid ${c.border}`,
    };
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
  },
  statCard: {
    backgroundColor: '#ffffff',
    padding: '16px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px',
  },
  th: {
    padding: '12px 16px',
    textAlign: 'left',
    fontWeight: 600,
    color: '#475569',
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  td: {
    padding: '12px 16px',
    borderBottom: '1px solid #f1f5f9',
    color: '#334155',
  },
  pagination: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '16px',
    paddingTop: '16px',
    borderTop: '1px solid #e2e8f0',
  },
  pageBtn: (active) => ({
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '8px',
    border: active ? 'none' : '1px solid #e2e8f0',
    backgroundColor: active ? '#4f46e5' : '#ffffff',
    color: active ? '#ffffff' : '#475569',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
  }),
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 99,
  },
};

// Utility function to format date
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const d = new Date(dateString);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

// Utility function to get time ago string
function getTimeAgo(dateString) {
  if (!dateString) return '';
  const now = new Date();
  const created = new Date(dateString);
  const diffMs = now - created;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffMonths / 12);
  
  if (diffYears > 0) return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
  if (diffMonths > 0) return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return 'Today';
}

export default function ParcelManagementSystem() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [trackInput, setTrackInput] = useState('');
  const [foundParcel, setFoundParcel] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const menuRef = useRef(null);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const [mockUsers, setMockUsers] = useState([
    { username: 'student1', email: 'student1@ipgkpp.edu', password: '123456', name: 'Ahmad Ali', idNo: 'D20201234', phone: '012-3456789', role: 'student', createdAt: new Date('2024-01-15T08:00:00').toISOString() },
    { username: 'staff1', email: 'staff1@ipgkpp.edu', password: '123456', name: 'Siti Aminah', idNo: 'ST-9988', phone: '013-9876543', role: 'staff', createdAt: new Date('2024-03-20T10:30:00').toISOString() },
    { username: 'admin', email: 'admin@ipgkpp.edu', password: '123456', name: 'Admin Office', idNo: 'ADM-001', phone: '011-1111111', role: 'admin', createdAt: new Date('2023-06-01T09:00:00').toISOString() },
  ]);

  const [parcels, setParcels] = useState([
    { id: 1, trackingNo: 'PKG-8821X', sender: 'Shopee Express', recipient: 'student1', status: 'Arrived', dateReceived: '2025-05-18', location: 'Main Post Office', description: 'Academic Textbooks & Stationery (Handle with care)' },
    { id: 2, trackingNo: 'PL-4490A', sender: 'Pos Laju', recipient: 'staff1', status: 'Pending', dateReceived: '2025-05-20', location: 'Admin Counter', description: 'Departmental Office Supplies' },
    { id: 3, trackingNo: 'JT-7723B', sender: 'J&T Express', recipient: 'student1', status: 'Overdue', dateReceived: '2025-05-10', location: 'Storage Room B', description: 'Personal Clothing Items' },
    { id: 4, trackingNo: 'DHL-9910C', sender: 'DHL eCommerce', recipient: 'admin', status: 'Collected', dateReceived: '2025-05-15', location: 'Admin Counter', description: 'Server Maintenance Parts' },
    { id: 5, trackingNo: 'FE-1123D', sender: 'FedEx', recipient: 'student1', status: 'Pending', dateReceived: '2025-05-22', location: 'Main Post Office', description: 'Electronics' },
    { id: 6, trackingNo: 'UPS-5566E', sender: 'UPS', recipient: 'staff1', status: 'Arrived', dateReceived: '2025-05-21', location: 'Admin Counter', description: 'Medical Supplies' },
  ]);

  const [adminForm, setAdminForm] = useState({ trackingNo: '', sender: '', recipient: '', status: 'Pending', location: 'Main Post Office', description: '' });
  const [profileForm, setProfileForm] = useState({ name: '', email: '', phone: '', address: '' });
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (activeModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [activeModal]);

  const handleLogin = (username, password) => {
    const found = mockUsers.find(u => u.username === username && u.password === password);
    if (found) {
      setUser({ ...found, lastLogin: new Date().toISOString() });
      setProfileForm({ name: found.name, email: found.email, phone: found.phone || '', address: '' });
      setView('dashboard');
    } else {
      alert('Invalid credentials');
    }
  };

  const handleLogout = () => { setUser(null); setView('login'); setUserMenuOpen(false); };

  const handleSignUp = (data) => {
    if (mockUsers.some(u => u.username === data.username || u.email === data.email)) { alert('Account already exists'); return; }
    const newUser = { ...data, createdAt: new Date().toISOString() };
    setMockUsers(prev => [...prev, newUser]);
    alert('Account created successfully');
    setView('login');
  };

  const handleAddParcel = (e) => {
    e.preventDefault();
    if (!adminForm.trackingNo || !adminForm.recipient) return;
    setParcels(p => [{ ...adminForm, id: Date.now(), dateReceived: new Date().toISOString().split('T')[0] }, ...p]);
    setAdminForm({ trackingNo: '', sender: '', recipient: '', status: 'Pending', location: 'Main Post Office', description: '' });
    alert('Parcel registered successfully');
  };

  const handleDeleteParcel = (id) => {
    if (window.confirm('Are you sure you want to delete this parcel record?')) {
      setParcels(p => p.filter(parcel => parcel.id !== id));
    }
  };

  const updateStatus = (id, status) => setParcels(p => p.map(x => x.id === id ? { ...x, status } : x));

  const handleTrackParcel = (e) => {
    e.preventDefault();
    if (!user) return;
    const inputTrim = trackInput.trim().toLowerCase();
    if (!inputTrim) return;
    let found = user.role === 'admin'
      ? parcels.find(p => p.trackingNo.toLowerCase() === inputTrim)
      : parcels.find(p => p.recipient === user.username && p.trackingNo.toLowerCase() === inputTrim);
    if (found) setFoundParcel(found);
    else { setFoundParcel(null); alert('Parcel not found. Please check the tracking number.'); }
  };

  const handleSaveInfo = () => {
    if (!profileForm.name || !profileForm.email) { alert('Name and email are required'); return; }
    setUser(prev => ({ ...prev, ...profileForm }));
    setActiveModal(null);
    alert('Profile updated successfully!');
  };

  const handleChangePassword = () => {
    if (passwordForm.new !== passwordForm.confirm) { alert('Passwords do not match'); return; }
    if (passwordForm.new.length < 6) { alert('Password must be at least 6 characters'); return; }
    setUser(prev => ({ ...prev, password: passwordForm.new }));
    setPasswordForm({ current: '', new: '', confirm: '' });
    setActiveModal(null);
    alert('Password updated successfully!');
  };

  const isAdmin = user?.role === 'admin';
  const filtered = isAdmin
    ? parcels
    : parcels.filter(p => p.recipient === user?.username && p.status !== 'Collected');

  const itemsPerPage = 5;
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedParcels = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => { setCurrentPage(1); }, [view]);

  const stats = {
    total: filtered.length,
    pending: filtered.filter(p => p.status === 'Pending').length,
    arrived: filtered.filter(p => p.status === 'Arrived').length,
    collected: filtered.filter(p => p.status === 'Collected').length,
    overdue: filtered.filter(p => p.status === 'Overdue').length
  };

  if (!user) return <AuthView onLogin={handleLogin} onSignUp={handleSignUp} view={view === 'dashboard' ? 'login' : view} setView={setView} />;

  return (
    <div style={STYLES.app}>
      {isMobile && sidebarOpen && (
        <div style={STYLES.overlay} onClick={() => setSidebarOpen(false)} />
      )}

      <aside style={{
        ...STYLES.sidebar,
        ...(isMobile ? (sidebarOpen ? STYLES.sidebarOpen : STYLES.sidebarMobile) : {}),
      }}>
        <div style={STYLES.sidebarHeader}>
          <span style={STYLES.logoText}>IPGKPP Parcels</span>
          {isMobile && (
            <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}>
              <Icons.ChevronLeft width={20} height={20} />
            </button>
          )}
        </div>
        <nav style={STYLES.nav}>
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Icons.LayoutDashboard },
            { id: 'myparcels', label: 'My Parcels', icon: Icons.Inbox },
            { id: 'admin', label: 'Admin Panel', icon: Icons.Users, adminOnly: true }
          ].filter(item => !item.adminOnly || isAdmin).map(item => (
            <button
              key={item.id}
              onClick={() => { setView(item.id); setSidebarOpen(false); }}
              style={STYLES.navItem(view === item.id)}
            >
              <item.icon width={20} height={20} />
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <div style={{
        ...STYLES.main,
        ...(isMobile ? STYLES.mainNoSidebar : {}),
      }}>
        <header style={STYLES.header}>
          <button
            onClick={() => setSidebarOpen(true)}
            style={{
              ...STYLES.hamburger,
              display: isMobile ? 'flex' : 'none',
            }}
          >
            <Icons.Menu width={24} height={24} />
          </button>
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#0f172a', margin: 0 }}>
            {view === 'myparcels' ? 'Parcel Tracking' : view === 'dashboard' ? 'Dashboard' : 'Admin Panel'}
          </h2>

          <div style={STYLES.userMenuContainer} ref={menuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              style={STYLES.userMenuBtn}
            >
              <Icons.Menu width={20} height={20} />
              {!isMobile && <span style={{ fontSize: '14px', fontWeight: 500 }}>{user.name}</span>}
            </button>
            {userMenuOpen && (
              <div style={STYLES.dropdown}>
                <button
                  onClick={() => { setActiveModal('viewInfo'); setUserMenuOpen(false); }}
                  style={STYLES.dropdownItem}
                  onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#eef2ff'; e.currentTarget.style.color = '#4f46e5'; }}
                  onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#334155'; }}
                >
                  <Icons.Eye width={18} height={18} /> View Info
                </button>
                <button
                  onClick={() => { setActiveModal('changeInfo'); setUserMenuOpen(false); }}
                  style={STYLES.dropdownItem}
                  onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#eef2ff'; e.currentTarget.style.color = '#4f46e5'; }}
                  onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#334155'; }}
                >
                  <Icons.Edit width={18} height={18} /> Change Info
                </button>
                <button
                  onClick={() => { setActiveModal('details'); setUserMenuOpen(false); }}
                  style={STYLES.dropdownItem}
                  onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#eef2ff'; e.currentTarget.style.color = '#4f46e5'; }}
                  onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#334155'; }}
                >
                  <Icons.Info width={18} height={18} /> Details
                </button>
                <button
                  onClick={() => { setActiveModal('password'); setUserMenuOpen(false); }}
                  style={STYLES.dropdownItem}
                  onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#eef2ff'; e.currentTarget.style.color = '#4f46e5'; }}
                  onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#334155'; }}
                >
                  <Icons.Lock width={18} height={18} /> Password
                </button>
                <div style={STYLES.divider} />
                <button
                  onClick={handleLogout}
                  style={{ ...STYLES.dropdownItem, ...STYLES.dropdownLogout }}
                  onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#fef2f2'; }}
                  onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <Icons.LogOut width={18} height={18} /> Sign Out
                </button>
              </div>
            )}
          </div>
        </header>

        <div style={STYLES.content}>
          {view === 'dashboard' && (
            <DashboardView
              parcels={paginatedParcels}
              trackInput={trackInput} setTrackInput={setTrackInput} onTrack={handleTrackParcel}
              foundParcel={foundParcel} onCollect={id => updateStatus(id, 'Collected')}
              stats={stats} isAdmin={isAdmin}
            />
          )}
          {view === 'myparcels' && <MyParcelsView parcels={paginatedParcels} />}
          {view === 'admin' && isAdmin && (
            <AdminView
              parcels={parcels} form={adminForm} setForm={setAdminForm}
              onAdd={handleAddParcel} onUpdate={updateStatus} onDelete={handleDeleteParcel}
            />
          )}

          {totalPages > 1 && (
            <div style={STYLES.pagination}>
              <span style={{ fontSize: '14px', color: '#64748b' }}>
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} records
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  style={{ ...STYLES.pageBtn(false), opacity: currentPage === 1 ? 0.4 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                >
                  <Icons.ChevronLeft width={16} height={16} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(pg => (
                  <button
                    key={pg}
                    onClick={() => setCurrentPage(pg)}
                    style={STYLES.pageBtn(currentPage === pg)}
                  >
                    {pg}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  style={{ ...STYLES.pageBtn(false), opacity: currentPage === totalPages ? 0.4 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                >
                  <Icons.ChevronRight width={16} height={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {activeModal === 'viewInfo' && (
        <Modal onClose={() => setActiveModal(null)} title="Your Information">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '14px' }}>
            <DetailRow label="Name" value={user.name} />
            <DetailRow label="Email" value={user.email} />
            <DetailRow label="Phone" value={user.phone || 'Not set'} />
            <DetailRow label="Role" value={user.role} />
            <DetailRow label="ID No" value={user.idNo} />
          </div>
        </Modal>
      )}

      {activeModal === 'changeInfo' && (
        <Modal onClose={() => setActiveModal(null)} title="Change Information">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} placeholder="Full Name" style={STYLES.input} />
            <input value={profileForm.email} onChange={e => setProfileForm({ ...profileForm, email: e.target.value })} placeholder="Email Address" style={STYLES.input} />
            <input value={profileForm.phone} onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} placeholder="Phone Number" style={STYLES.input} />
            <button onClick={handleSaveInfo} style={STYLES.btnPrimary}>Save Changes</button>
          </div>
        </Modal>
      )}

      {activeModal === 'details' && (
        <Modal onClose={() => setActiveModal(null)} title="Account Details">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '14px' }}>
            <DetailRow label="Status" value="● Active" valueColor="#16a34a" />
            <DetailRow label="Verification" value="Email & Phone Verified" valueColor="#2563eb" />
            <DetailRow 
              label="Member Since" 
              value={user.createdAt ? formatDate(user.createdAt) : 'N/A'} 
            />
            <DetailRow 
              label="Duration" 
              value={user.createdAt ? getTimeAgo(user.createdAt) : ''} 
              valueColor="#4f46e5"
            />
            <DetailRow 
              label="Last Login" 
              value={user.lastLogin ? currentTime.toLocaleString() : 'Just now'} 
            />
          </div>
        </Modal>
      )}

      {activeModal === 'password' && (
        <Modal onClose={() => setActiveModal(null)} title="Change Password">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input type="password" value={passwordForm.current} onChange={e => setPasswordForm({ ...passwordForm, current: e.target.value })} placeholder="Current Password" style={STYLES.input} />
            <input type="password" value={passwordForm.new} onChange={e => setPasswordForm({ ...passwordForm, new: e.target.value })} placeholder="New Password" style={STYLES.input} />
            <input type="password" value={passwordForm.confirm} onChange={e => setPasswordForm({ ...passwordForm, confirm: e.target.value })} placeholder="Confirm Password" style={STYLES.input} />
            <button onClick={handleChangePassword} style={STYLES.btnPrimary}>Update Password</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function DetailRow({ label, value, valueColor }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
      <span style={{ color: '#64748b' }}>{label}</span>
      <span style={{ fontWeight: 500, color: valueColor || '#1e293b' }}>{value}</span>
    </div>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div style={STYLES.modal} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={STYLES.modalContent}>
        <div style={STYLES.modalHeader}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#0f172a', margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px', borderRadius: '6px' }}
            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#f1f5f9'; }}
            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <Icons.X width={20} height={20} />
          </button>
        </div>
        <div style={STYLES.modalBody}>{children}</div>
      </div>
    </div>
  );
}

function AuthView({ onLogin, onSignUp, view, setView }) {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #312e81 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.025em' }}>IPGKPP Parcel Management System</h1>
        <p style={{ color: '#c7d2fe', marginTop: '8px', fontSize: '14px' }}>Secure, efficient campus logistics tracking system</p>
      </div>
      <div style={{ width: '100%', maxWidth: '448px', backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #f1f5f9' }}>
          <button onClick={() => setView('login')} style={{ flex: 1, padding: '16px', fontSize: '14px', fontWeight: 600, border: 'none', cursor: 'pointer', borderBottom: view === 'login' ? '2px solid #4f46e5' : 'none', backgroundColor: view === 'login' ? '#eef2ff' : 'transparent', color: view === 'login' ? '#4f46e5' : '#64748b', transition: 'all 0.15s' }}>Sign In</button>
          <button onClick={() => setView('signup')} style={{ flex: 1, padding: '16px', fontSize: '14px', fontWeight: 600, border: 'none', cursor: 'pointer', borderBottom: view === 'signup' ? '2px solid #4f46e5' : 'none', backgroundColor: view === 'signup' ? '#eef2ff' : 'transparent', color: view === 'signup' ? '#4f46e5' : '#64748b', transition: 'all 0.15s' }}>Create Account</button>
        </div>
        <div style={{ padding: '32px' }}>
          {view === 'login' ? <LoginForm onLogin={onLogin} /> : <SignUpForm onSignUp={onSignUp} />}
        </div>
      </div>
      <footer style={{ marginTop: '32px', textAlign: 'center', color: '#94a3b8', fontSize: '12px' }}>© {new Date().getFullYear()} IPGKPP Campus Logistics. All rights reserved.</footer>
    </div>
  );
}

function LoginForm({ onLogin }) {
  const [u, setU] = useState('');
  const [p, setP] = useState('');
  return (
    <form onSubmit={e => { e.preventDefault(); onLogin(u, p); }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#334155', marginBottom: '4px' }}>Username</label>
        <input value={u} onChange={e => setU(e.target.value)} style={{ ...STYLES.input, boxSizing: 'border-box' }} placeholder="e.g. student1" required />
      </div>
      <div>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#334155', marginBottom: '4px' }}>Password</label>
        <input type="password" value={p} onChange={e => setP(e.target.value)} style={{ ...STYLES.input, boxSizing: 'border-box' }} placeholder="••••••••" required />
      </div>
      <button type="submit" style={STYLES.btnPrimary}>Access Dashboard</button>
    </form>
  );
}

function SignUpForm({ onSignUp }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ username: '', email: '', password: '', name: '', idNo: '', phone: '', role: 'student' });
  const next = () => setStep(s => s + 1);
  const prev = () => setStep(s => Math.max(1, s - 1));
  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  return (
    <form onSubmit={step === 3 ? e => { e.preventDefault(); onSignUp(form); } : e => { e.preventDefault(); next(); }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
        {[1, 2, 3].map(s => <div key={s} style={{ height: '4px', flex: 1, borderRadius: '9999px', backgroundColor: s <= step ? '#4f46e5' : '#e2e8f0' }} />)}
      </div>
      {step === 1 && <>
        <input name="username" value={form.username} onChange={handleChange} style={STYLES.input} placeholder="Username" required />
        <input name="email" value={form.email} onChange={handleChange} type="email" style={STYLES.input} placeholder="Email Address" required />
        <input name="password" value={form.password} onChange={handleChange} type="password" style={STYLES.input} placeholder="Password" required />
        <button type="button" onClick={next} style={STYLES.btnPrimary}>Continue</button>
      </>}
      {step === 2 && <>
        <input name="name" value={form.name} onChange={handleChange} style={STYLES.input} placeholder="Full Name" required />
        <input name="idNo" value={form.idNo} onChange={handleChange} style={STYLES.input} placeholder="Matric / Staff ID" required />
        <input name="phone" value={form.phone} onChange={handleChange} type="tel" style={STYLES.input} placeholder="Phone Number" required />
        <div style={{ display: 'flex', gap: '12px' }}>
          <button type="button" onClick={prev} style={{ ...STYLES.btnPrimary, backgroundColor: '#f1f5f9', color: '#334155' }}>Back</button>
          <button type="button" onClick={next} style={STYLES.btnPrimary}>Next</button>
        </div>
      </>}
      {step === 3 && <>
        <select name="role" value={form.role} onChange={handleChange} style={{ ...STYLES.input, backgroundColor: '#ffffff' }}>
          <option value="student">Student</option>
          <option value="staff">Staff</option>
          <option value="admin">Administrator</option>
        </select>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button type="button" onClick={prev} style={{ ...STYLES.btnPrimary, backgroundColor: '#f1f5f9', color: '#334155' }}>Back</button>
          <button type="submit" style={{ ...STYLES.btnPrimary, backgroundColor: '#16a34a' }}>Complete Registration</button>
        </div>
      </>}
    </form>
  );
}

function DashboardView({ parcels, trackInput, setTrackInput, onTrack, foundParcel, onCollect, stats, isAdmin }) {
  const cardGrid = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {isAdmin && (
        <div style={{ backgroundColor: '#eef2ff', border: '1px solid #c7d2fe', color: '#3730a3', padding: '10px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Icons.Users width={16} height={16} />
          Administrator View: Showing all system parcels
        </div>
      )}

      <div style={{ backgroundColor: '#4f46e5', borderRadius: '12px', padding: '24px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#ffffff', margin: '0 0 8px 0' }}>Track Your Parcel</h2>
        <p style={{ color: '#c7d2fe', marginBottom: '16px', fontSize: '14px' }}>Enter your tracking number to find the status and description of your package.</p>
        <form onSubmit={onTrack} style={{ display: 'flex', gap: '12px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Icons.Search style={{ position: 'absolute', left: '12px', top: '10px', width: 20, height: 20, color: '#a5b4fc' }} />
            <input
              value={trackInput}
              onChange={e => setTrackInput(e.target.value)}
              style={{ width: '100%', paddingLeft: '40px', paddingRight: '12px', padding: '10px 12px 10px 40px', backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid #818cf8', borderRadius: '8px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              placeholder="e.g. PKG-8821X"
              required
            />
          </div>
          <button type="submit" style={{ padding: '10px 24px', backgroundColor: '#ffffff', color: '#4f46e5', fontWeight: 700, borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '14px' }}>Search</button>
        </form>
      </div>

      {foundParcel && (
        <div style={{ ...STYLES.card, border: '2px solid #bfdbfe' }}>
          <div style={{ backgroundColor: '#eff6ff', padding: '16px 24px', borderBottom: '1px solid #bfdbfe', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Icons.CheckCircle width={20} height={20} style={{ color: '#2563eb' }} />
              <h3 style={{ fontWeight: 700, color: '#1e40af', margin: 0, fontSize: '16px' }}>Parcel Found: {foundParcel.trackingNo}</h3>
            </div>
            <span style={STYLES.badge(foundParcel.status)}>{foundParcel.status}</span>
          </div>
          <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p style={{ margin: 0 }}><span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Sender</span><br /><span style={{ fontWeight: 500 }}>{foundParcel.sender}</span></p>
              <p style={{ margin: 0 }}><span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Location</span><br /><span style={{ fontWeight: 500 }}>{foundParcel.location}</span></p>
              <p style={{ margin: 0 }}><span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Date Received</span><br /><span style={{ fontWeight: 500 }}>{foundParcel.dateReceived}</span></p>
            </div>
            <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Package Description</span>
              <p style={{ marginTop: '8px', color: '#1e293b', fontWeight: 500, lineHeight: '1.6', margin: '8px 0 0 0' }}>{foundParcel.description || "No description provided"}</p>
            </div>
          </div>
          {foundParcel.status !== 'Collected' && foundParcel.status !== 'Overdue' && (
            <div style={{ padding: '12px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
              <button onClick={() => onCollect(foundParcel.id)} style={{ padding: '8px 24px', backgroundColor: '#16a34a', color: '#ffffff', borderRadius: '8px', fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: '14px' }}>Mark as Collected</button>
            </div>
          )}
        </div>
      )}

      <div style={cardGrid}>
        {[
          { l: 'Total Parcels', v: stats.total, i: Icons.Package, c: '#4f46e5' },
          { l: 'Pending', v: stats.pending, i: Icons.Clock, c: '#d97706' },
          { l: 'Arrived', v: stats.arrived, i: Icons.Inbox, c: '#2563eb' },
          { l: 'Collected', v: stats.collected, i: Icons.CheckCircle, c: '#16a34a' }
        ].map((s, i) => (
          <div key={i} style={STYLES.statCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: s.c + '15' }}><s.i width={20} height={20} style={{ color: s.c }} /></div>
              <span style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a' }}>{s.v}</span>
            </div>
            <p style={{ fontSize: '14px', color: '#64748b', fontWeight: 500, margin: 0 }}>{s.l}</p>
          </div>
        ))}
      </div>

      <div style={STYLES.card}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>
          <h3 style={{ fontWeight: 600, color: '#0f172a', margin: 0, fontSize: '16px' }}>{isAdmin ? 'All System Parcels' : 'Active Parcels'}</h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={STYLES.table}>
            <thead>
              <tr>
                <th style={STYLES.th}>Tracking</th>
                <th style={STYLES.th}>Sender</th>
                <th style={STYLES.th}>Recipient</th>
                <th style={STYLES.th}>Status</th>
                <th style={STYLES.th}>Date</th>
                <th style={STYLES.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {parcels.length === 0 ? (
                <tr><td colSpan="6" style={{ ...STYLES.td, textAlign: 'center', padding: '32px', color: '#64748b' }}>No parcels found</td></tr>
              ) : parcels.map(p => (
                <tr key={p.id} style={{ transition: 'background-color 0.15s' }}
                  onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#f8fafc'; }}
                  onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <td style={STYLES.td}><span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{p.trackingNo}</span></td>
                  <td style={STYLES.td}>{p.sender}</td>
                  <td style={STYLES.td}>{p.recipient}</td>
                  <td style={STYLES.td}><span style={STYLES.badge(p.status)}>{p.status}</span></td>
                  <td style={STYLES.td}>{p.dateReceived}</td>
                  <td style={STYLES.td}>
                    {p.status !== 'Collected' && p.status !== 'Overdue' && (
                      <button onClick={() => onCollect(p.id)} style={{ padding: '4px 12px', backgroundColor: '#eef2ff', color: '#4f46e5', fontSize: '12px', fontWeight: 600, borderRadius: '6px', border: 'none', cursor: 'pointer' }}>Mark Collected</button>
                    )}
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

function MyParcelsView({ parcels }) {
  return (
    <div style={STYLES.card}>
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0' }}>
        <h3 style={{ fontWeight: 600, color: '#0f172a', margin: 0, fontSize: '16px' }}>Complete Tracking History</h3>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={STYLES.table}>
          <thead>
            <tr>
              <th style={STYLES.th}>Tracking</th>
              <th style={STYLES.th}>Sender</th>
              <th style={STYLES.th}>Description</th>
              <th style={STYLES.th}>Status</th>
              <th style={STYLES.th}>Location</th>
              <th style={STYLES.th}>Date</th>
            </tr>
          </thead>
          <tbody>
            {parcels.length === 0 ? (
              <tr><td colSpan="6" style={{ ...STYLES.td, textAlign: 'center', padding: '32px', color: '#64748b' }}>No active records available. Collected parcels are hidden.</td></tr>
            ) : parcels.map(p => (
              <tr key={p.id} style={{ transition: 'background-color 0.15s' }}
                onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#f8fafc'; }}
                onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <td style={STYLES.td}><span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{p.trackingNo}</span></td>
                <td style={STYLES.td}>{p.sender}</td>
                <td style={{ ...STYLES.td, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.description || '-'}</td>
                <td style={STYLES.td}><span style={STYLES.badge(p.status)}>{p.status}</span></td>
                <td style={STYLES.td}>{p.location}</td>
                <td style={STYLES.td}>{p.dateReceived}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminView({ parcels, form, setForm, onAdd, onUpdate, onDelete }) {
  const up = k => e => setForm(prev => ({ ...prev, [k]: e.target.value }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={STYLES.card}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0' }}>
          <h3 style={{ fontWeight: 600, color: '#0f172a', margin: 0, fontSize: '16px' }}>Register Incoming Parcel</h3>
        </div>
        <form onSubmit={onAdd} style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <input value={form.trackingNo} onChange={up('trackingNo')} placeholder="Tracking Number" style={STYLES.input} required />
          <input value={form.sender} onChange={up('sender')} placeholder="Courier / Sender" style={STYLES.input} required />
          <input value={form.recipient} onChange={up('recipient')} placeholder="Recipient Username" style={STYLES.input} required />
          <select value={form.status} onChange={up('status')} style={{ ...STYLES.input, backgroundColor: '#ffffff' }}>
            <option>Pending</option>
            <option>Arrived</option>
            <option>Overdue</option>
          </select>
          <input value={form.location} onChange={up('location')} placeholder="Storage Location" style={{ ...STYLES.input, gridColumn: '1 / -1' }} required />
          <input value={form.description} onChange={up('description')} placeholder="Package Description (Visible to User)" style={{ ...STYLES.input, gridColumn: '1 / -1' }} />
          <button type="submit" style={{ ...STYLES.btnPrimary, gridColumn: '1 / -1' }}>Register Parcel</button>
        </form>
      </div>

      <div style={STYLES.card}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0' }}>
          <h3 style={{ fontWeight: 600, color: '#0f172a', margin: 0, fontSize: '16px' }}>System Parcel Management (All Records)</h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={STYLES.table}>
            <thead>
              <tr>
                <th style={STYLES.th}>Tracking</th>
                <th style={STYLES.th}>Recipient</th>
                <th style={STYLES.th}>Description</th>
                <th style={STYLES.th}>Status</th>
                <th style={STYLES.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {parcels.map(p => (
                <tr key={p.id} style={{ transition: 'background-color 0.15s' }}
                  onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#f8fafc'; }}
                  onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <td style={STYLES.td}><span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{p.trackingNo}</span></td>
                  <td style={STYLES.td}>{p.recipient}</td>
                  <td style={{ ...STYLES.td, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.description || '-'}</td>
                  <td style={STYLES.td}><span style={STYLES.badge(p.status)}>{p.status}</span></td>
                  <td style={STYLES.td}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <select value={p.status} onChange={e => onUpdate(p.id, e.target.value)} style={{ padding: '6px 8px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '12px', backgroundColor: '#ffffff', cursor: 'pointer' }}>
                        <option>Pending</option>
                        <option>Arrived</option>
                        <option>Collected</option>
                        <option>Overdue</option>
                      </select>
                      <button onClick={() => onDelete(p.id)} style={STYLES.btnDanger}>
                        <Icons.Trash2 width={18} height={18} />
                      </button>
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
