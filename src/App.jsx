import { useState, useRef, useEffect, useCallback } from 'react';
import {
  clearCloudSession,
  getCloudProfileByEmail,
  getSavedCloudSession,
  getCloudState,
  isCloudConfigured,
  listCloudProfiles,
  refreshCloudSession,
  saveCloudUser,
  saveCloudState,
  signInCloudUser,
  signUpCloudUser,
  subscribeCloudChanges,
  updateCloudPassword,
  deleteCloudParcel,
  deleteCloudUser,
  upsertCloudParcel,
  upsertCloudProfile,
  uploadCloudFile,
} from './services/cloudStore';

import {
  IPGKPP_LOGO,
  IPGKPP_BG,
  COURIERS,
  STORAGE_KEYS,
  NOTIFIABLE_STATUSES,
  DEFAULT_USERS,
  DEFAULT_PARCELS,
  DEFAULT_RACKS,
  MAX_POSTGRES_INT
} from './utils/constants';

import {
  formatDate,
  getTimeAgo,
  getNotificationStorageKey,
  getParcelNotificationId,
  getParcelNotificationMessage,
  normalizeRacks,
  generateParcelId
} from './utils/helpers';

import { Icons } from './components/Icons';
import { THEMES, createStyles } from './utils/theme';
import { Modal } from './components/Modal';
import { DetailRow } from './components/DetailRow';
import { UniversalScanner } from './components/UniversalScanner';
import { ProfilePicUpload } from './components/ProfilePicUpload';
import { CollectionVerifier } from './components/CollectionVerifier';
import { AuthView } from './views/AuthView';
import { DashboardView } from './views/DashboardView';
import { MyParcelsView } from './views/MyParcelsView';
import { HistoryView } from './views/HistoryView';
import { UserManagementView } from './views/UserManagementView';
import { ParcelManagementView } from './views/ParcelManagementView';
import { SmartRackView } from './views/SmartRackView';
import { RackSensorView } from './views/RackSensorView';
import { RackManagementView } from './views/RackManagementView';
import { ShelfDetailModal } from './components/ShelfDetailModal';
import { RackMaintenanceModal } from './components/RackMaintenanceModal';

import emailjs from '@emailjs/browser';

const sendParcelOTP = (recipientEmail, recipientName, trackingNo, otpCode, rackLocation) => {
  if (!recipientEmail) return;

  emailjs.send(
    'service_b85yfd9',         // <-- Replace with your Service ID
    'template_bzx28rr',    // <-- Replace with your "Parcel Arrived" Template ID
    {
      to_name: recipientName,
      to_email: recipientEmail,
      tracking_no: trackingNo,
      otp: otpCode,
      rack_location: rackLocation || 'Main Counter'
    },
    'JT3OFA36C4eS3rqWS'          // <-- Replace with your Public Key
  ).then(() => {
    console.log(`OTP Email sent successfully to ${recipientEmail}`);
  }).catch((err) => {
    console.error("Failed to send OTP email:", err);
  });
};

// NEW: Combined Security & Profile Modal Component
function ChangeInfoModal({ user, onClose, onSave, isCloudConfigured, themeObj }) {
  const styles = createStyles(themeObj);
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    countryCode: user?.phone?.startsWith('+82') ? '+82' : user?.phone?.startsWith('+65') ? '+65' : user?.phone?.startsWith('+62') ? '+62' : '+60',
    phoneLocal: user?.phone ? user.phone.replace(/^\+\d{2,3}/, '') : '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const EyeIcon = ({ hidden }) => hidden ? (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
  );

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.currentPassword) {
      return alert('Name, email, and current password are required.');
    }

    if (!isCloudConfigured && form.currentPassword !== user.password) {
      return alert('Current password is incorrect. Changes discarded.');
    }

    if (form.newPassword) {
      const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
      if (!passwordRegex.test(form.newPassword)) {
        return alert('New password must be at least 8 characters long, and include at least 1 capital letter, 1 number, and 1 special character.');
      }
      if (form.newPassword !== form.confirmPassword) {
        return alert('New passwords do not match.');
      }
    }

    onSave(form);
  };

  return (
    <Modal onClose={onClose} title="Settings & Security" theme={themeObj}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h4 style={{ margin: 0, fontSize: '13px', color: themeObj.textSecondary, textTransform: 'uppercase', fontWeight: 700 }}>Personal Information</h4>
          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value.toUpperCase() })} placeholder="FULL NAME" style={styles.input} />
          <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email Address" style={styles.input} />
          <div style={{ display: 'flex', gap: '8px' }}>
            <select value={form.countryCode} onChange={e => setForm({ ...form, countryCode: e.target.value })} style={{ ...styles.input, width: '100px', flexShrink: 0, padding: '10px 8px' }}>
              <option value="+60">🇲🇾 +60</option>
              <option value="+82">🇰🇷 +82</option>
              <option value="+65">🇸🇬 +65</option>
              <option value="+62">🇮🇩 +62</option>
            </select>
            <input value={form.phoneLocal} onChange={e => setForm({ ...form, phoneLocal: e.target.value.replace(/\D/g, '') })} type="tel" style={{ ...styles.input, flex: 1 }} placeholder="1046379730" />
          </div>
        </div>

        <div style={{ height: '1px', backgroundColor: themeObj.border }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h4 style={{ margin: 0, fontSize: '13px', color: themeObj.textSecondary, textTransform: 'uppercase', fontWeight: 700 }}>Change Password (Optional)</h4>
          <div style={{ position: 'relative' }}>
            <input type={showNew ? "text" : "password"} value={form.newPassword} onChange={e => setForm({ ...form, newPassword: e.target.value })} placeholder="New Password" style={{ ...styles.input, width: '100%', paddingRight: '40px', boxSizing: 'border-box' }} />
            <button type="button" onClick={() => setShowNew(!showNew)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#64748b' }}><EyeIcon hidden={!showNew} /></button>
          </div>
          <div style={{ position: 'relative' }}>
            <input type={showConfirm ? "text" : "password"} value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} placeholder="Confirm New Password" style={{ ...styles.input, width: '100%', paddingRight: '40px', boxSizing: 'border-box' }} />
            <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#64748b' }}><EyeIcon hidden={!showConfirm} /></button>
          </div>
        </div>

        <div style={{ padding: '16px', backgroundColor: themeObj.iconBg, borderRadius: '8px', border: `1px solid ${themeObj.border}`, display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h4 style={{ margin: 0, fontSize: '13px', color: '#dc2626', textTransform: 'uppercase', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}><Icons.Shield width={14} height={14} /> Security Verification</h4>
          <p style={{ margin: 0, fontSize: '12px', color: themeObj.textSecondary }}>Please enter your current password to save changes.</p>
          <div style={{ position: 'relative' }}>
            <input type={showCurrent ? "text" : "password"} value={form.currentPassword} onChange={e => setForm({ ...form, currentPassword: e.target.value })} placeholder="Current Password (Required)" style={{ ...styles.input, width: '100%', paddingRight: '40px', boxSizing: 'border-box', borderColor: '#f87171' }} />
            <button type="button" onClick={() => setShowCurrent(!showCurrent)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#64748b' }}><EyeIcon hidden={!showCurrent} /></button>
          </div>
        </div>

        <button type="submit" style={styles.btnPrimary}>Save & Verify Changes</button>
      </form>
    </Modal>
  );
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
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannerCallback, setScannerCallback] = useState(null);
  const [scannedTracking, setScannedTracking] = useState('');
  const [picModalOpen, setPicModalOpen] = useState(false);
  const [verifyParcel, setVerifyParcel] = useState(null);
  const [notification, setNotification] = useState(null);
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);
  const [readNotificationIds, setReadNotificationIds] = useState([]);
  const [selectedShelf, setSelectedShelf] = useState(null);
  const [maintenanceModal, setMaintenanceModal] = useState(null);
  const [cloudSession, setCloudSession] = useState(null);
  const [cloudReady, setCloudReady] = useState(!isCloudConfigured);
  const [cloudSchemaMissing, setCloudSchemaMissing] = useState(false);
  const cloudPollRef = useRef(null);
  const cloudHydratingRef = useRef(false);
  const [rackIoTData, setRackIoTData] = useState([]);

  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.THEME);
      if (saved === 'dark' || saved === 'light') return saved;
    } catch { }
    return 'light';
  });

  const themeObj = THEMES[theme] || THEMES.light;
  const styles = createStyles(themeObj);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    try { localStorage.setItem(STORAGE_KEYS.THEME, newTheme); } catch { }
  };

  const menuRef = useRef(null);
  const notificationMenuRef = useRef(null);
  const parcelsRef = useRef([]);
  const parcelStatusRef = useRef(new Map());
  const notificationsPrimedRef = useRef(false);

  const [users, setUsers] = useState(() => {
    if (isCloudConfigured) return [];
    try { const saved = localStorage.getItem(STORAGE_KEYS.USERS); return saved ? JSON.parse(saved) : DEFAULT_USERS; } catch { return DEFAULT_USERS; }
  });

  const [parcels, setParcels] = useState(() => {
    if (isCloudConfigured) return [];
    try { const saved = localStorage.getItem(STORAGE_KEYS.PARCELS); return saved ? JSON.parse(saved) : DEFAULT_PARCELS; } catch { return DEFAULT_PARCELS; }
  });

  const [racks, setRacks] = useState(() => {
    if (isCloudConfigured) return DEFAULT_RACKS;
    try { const saved = localStorage.getItem(STORAGE_KEYS.RACKS); return saved ? normalizeRacks(JSON.parse(saved)) : DEFAULT_RACKS; } catch { return DEFAULT_RACKS; }
  });

  const [adminForm, setAdminForm] = useState({ trackingNo: '', sender: '', senderOther: '', recipient: '', status: 'Pending', location: 'Main Post Office', description: '', assignRack: false, selectedRackShelf: '' });
  const [adminUserForm, setAdminUserForm] = useState({ id: null, username: '', email: '', password: '', name: '', idNo: '', phone: '', role: 'student' });
  const [profileForm, setProfileForm] = useState({ name: '', email: '', phone: '', address: '' });
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });

  useEffect(() => { parcelsRef.current = parcels; }, [parcels]);

  const loadCloudData = useCallback(async (session = getSavedCloudSession(), silent = false) => {
    if (!isCloudConfigured) return;

    if (!silent) setCloudReady(false);
    try {
      let activeSession = session;
      const expiresAt = activeSession?.expires_at ? activeSession.expires_at * 1000 : 0;
      if (activeSession?.refresh_token && expiresAt && expiresAt < Date.now() + 60000) {
        activeSession = await refreshCloudSession(activeSession);
      }

      const token = activeSession?.access_token;
      // Use allSettled so a missing table or partial failure doesn't abort the entire sync
      const results = await Promise.allSettled([
        listCloudProfiles(token),
        getCloudState('parcels', DEFAULT_PARCELS, token),
        getCloudState('racks', DEFAULT_RACKS, token),
        getCloudState('smart_racks', null, token),
      ]);

      const profiles = results[0].status === 'fulfilled' ? results[0].value : [];
      const cloudParcels = results[1].status === 'fulfilled' ? results[1].value : DEFAULT_PARCELS;
      const cloudRacks = results[2].status === 'fulfilled' ? results[2].value : DEFAULT_RACKS;
      const iotData = results[3].status === 'fulfilled' ? results[3].value : [];

      cloudHydratingRef.current = true;
      setCloudSession(activeSession || null);
      setUsers(profiles);
      setParcels(Array.isArray(cloudParcels) ? cloudParcels : DEFAULT_PARCELS);
      setRacks(normalizeRacks(cloudRacks));
      setRackIoTData(iotData);

      if (activeSession?.user?.email && !silent) {
        const profile = await getCloudProfileByEmail(activeSession.user.email, token);
        if (profile) {
          setUser(profile);
          setProfileForm({ name: profile.name, email: profile.email, phone: profile.phone || '', address: '' });
          setView('dashboard');
        }
      }
    } catch (error) {
      console.error('Cloud sync failed:', error);
      if (silent) return;
      const isSchemaError = error?.message?.includes('PGRST205') || error?.message?.includes('42703');
      if (isSchemaError) {
        setCloudSchemaMissing(true);
      }
      clearCloudSession();
      setCloudSession(null);
      setUser(null);
      setUsers([]);
      setParcels(DEFAULT_PARCELS);
      setRacks(DEFAULT_RACKS);
    } finally {
      if (!silent) setCloudReady(true);
      setTimeout(() => { cloudHydratingRef.current = false; }, 0);
    }
  }, []);

  useEffect(() => {
    if (!isCloudConfigured) return;
    loadCloudData();
  }, [loadCloudData]);

  useEffect(() => {
    if (!isCloudConfigured || !cloudReady || cloudSchemaMissing) return;
    cloudPollRef.current = setInterval(() => {
      loadCloudData(cloudSession || getSavedCloudSession(), true);
    }, 60000);
    return () => clearInterval(cloudPollRef.current);
  }, [cloudReady, cloudSession, cloudSchemaMissing, loadCloudData]);

  useEffect(() => {
    if (!isCloudConfigured || !cloudReady || cloudSchemaMissing) return;
    const unsubscribe = subscribeCloudChanges(() => {
      loadCloudData(cloudSession || getSavedCloudSession(), true);
    });
    return unsubscribe;
  }, [cloudReady, cloudSession, cloudSchemaMissing, loadCloudData]);

  // Frequent polling for IoT data as a fallback for Realtime
  useEffect(() => {
    if (!isCloudConfigured || !cloudReady) return;

    // Use faster polling (2s) when viewing the sensors page, slower (10s) otherwise
    const intervalTime = view === 'racksensors' ? 2000 : 10000;

    const iotPoll = setInterval(() => {
      loadCloudData(cloudSession || getSavedCloudSession(), true);
    }, intervalTime);

    return () => clearInterval(iotPoll);
  }, [cloudReady, cloudSession, loadCloudData, view]);

  useEffect(() => {
    const checkOverdue = () => {
      const now = new Date();
      let hasChanges = false;
      const currentParcels = parcelsRef.current;
      const updatedParcels = currentParcels.map(p => {
        if (p.status === 'Arrived' && p.dateReceived) {
          const receivedDate = new Date(p.dateReceived);
          const diffTime = now - receivedDate;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays > 3) { hasChanges = true; return { ...p, status: 'Overdue' }; }
        }
        return p;
      });
      if (hasChanges) setParcels(updatedParcels);
    };
    checkOverdue();
    const interval = setInterval(checkOverdue, 60000);
    return () => clearInterval(interval);
  }, []);

  // AUTO-CLEANUP: Hapus rekod Collected yang lebih 7 hari
  useEffect(() => {
    if (!parcels || parcels.length === 0) return;

    const cleanupOldRecords = async () => {
      const now = new Date();
      const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

      const toDelete = parcels.filter(p => {
        if (p.status !== 'Collected' || !p.dateCollected) return false;
        const collectedDate = new Date(p.dateCollected);
        return (now - collectedDate) > ONE_WEEK_MS;
      });

      if (toDelete.length > 0) {
        console.log(`Cleaning up ${toDelete.length} old collected records...`);
        for (const p of toDelete) {
          try {
            if (isCloudConfigured && cloudSession?.access_token) {
              await deleteCloudParcel(p.id, cloudSession.access_token);
            }
            setParcels(prev => prev.filter(item => item.id !== p.id));
          } catch (err) {
            console.error('Auto-cleanup failed for parcel:', p.id, err);
          }
        }
      }
    };

    const timeout = setTimeout(cleanupOldRecords, 5000);
    const interval = setInterval(cleanupOldRecords, 3600000);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [parcels, cloudSession, isCloudConfigured]);

  useEffect(() => {
    if (isCloudConfigured) return;
    try { localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users)); } catch (e) { }
  }, [users]);

  useEffect(() => {
    if (!isCloudConfigured) {
      try { localStorage.setItem(STORAGE_KEYS.PARCELS, JSON.stringify(parcels)); } catch (e) { }
    }
  }, [parcels]);

  useEffect(() => {
    if (!isCloudConfigured) {
      try { localStorage.setItem(STORAGE_KEYS.RACKS, JSON.stringify(racks)); } catch (e) { }
      return;
    }
    if (cloudHydratingRef.current) return;
    if (cloudReady && cloudSession?.access_token) saveCloudState('racks', racks, cloudSession.access_token).catch(error => console.error('Failed to save racks:', error));
  }, [racks, cloudReady, cloudSession?.access_token]);

  useEffect(() => {
    if (isCloudConfigured) return;
    try {
      const savedSession = localStorage.getItem(STORAGE_KEYS.SESSION);
      if (savedSession) { const parsed = JSON.parse(savedSession); setUser(parsed); setProfileForm({ name: parsed.name, email: parsed.email, phone: parsed.phone || '', address: '' }); }
    } catch { }
  }, []);

  useEffect(() => {
    if (isCloudConfigured) return;
    if (user) { try { localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(user)); } catch { } }
    else { try { localStorage.removeItem(STORAGE_KEYS.SESSION); } catch { } }
  }, [user]);

  useEffect(() => {
    notificationsPrimedRef.current = false;
    parcelStatusRef.current = new Map();
    setNotificationPanelOpen(false);
    if (!user?.username) {
      setReadNotificationIds([]);
      return;
    }
    try {
      const saved = localStorage.getItem(getNotificationStorageKey(user.username));
      setReadNotificationIds(saved ? JSON.parse(saved) : []);
    } catch {
      setReadNotificationIds([]);
    }
  }, [user?.username]);

  useEffect(() => {
    if (!user?.username) return;
    try {
      localStorage.setItem(getNotificationStorageKey(user.username), JSON.stringify(readNotificationIds));
    } catch { }
  }, [readNotificationIds, user?.username]);

  useEffect(() => { const timer = setInterval(() => setCurrentTime(new Date()), 1000); return () => clearInterval(timer); }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setUserMenuOpen(false);
      if (notificationMenuRef.current && !notificationMenuRef.current.contains(e.target)) setNotificationPanelOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (activeModal || verifyParcel || scannerOpen || picModalOpen || selectedShelf || maintenanceModal) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
  }, [activeModal, verifyParcel, scannerOpen, picModalOpen, selectedShelf, maintenanceModal]);

  const showNotification = (message) => { setNotification(message); setTimeout(() => setNotification(null), 5000); };

  const requestBrowserNotifications = async () => {
    if (!('Notification' in window)) {
      showNotification('Browser ini tidak menyokong notification sistem.');
      return;
    }
    if (Notification.permission === 'granted') {
      showNotification('Browser notification sudah aktif.');
      return;
    }
    const permission = await Notification.requestPermission();
    showNotification(permission === 'granted' ? 'Browser notification diaktifkan.' : 'Browser notification tidak diaktifkan.');
  };

  const pushBrowserNotification = (message) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    new Notification(`IPGKPP: ${message.title}`, {
      body: message.body,
      tag: message.id,
      icon: IPGKPP_LOGO,
    });
  };

  const handleLogin = async (username, password, loginType = 'user') => {
    if (isCloudConfigured) {
      try {
        const { session, user: loggedUser } = await signInCloudUser(username, password);

        // Security Check: Verify role matches login page
        if (loginType === 'admin' && loggedUser.role !== 'admin') {
          alert('Akses Ditolak: Akaun ini bukan akaun Administrator.');
          clearCloudSession();
          return;
        }
        if (loginType === 'user' && loggedUser.role === 'admin') {
          alert('Sila gunakan halaman Admin untuk log masuk ke akaun Administrator.');
          clearCloudSession();
          return;
        }

        setCloudSession(session);
        setUser(loggedUser);
        setProfileForm({ name: loggedUser.name, email: loggedUser.email, phone: loggedUser.phone || '', address: '' });
        setView('dashboard');
        await loadCloudData(session);
      } catch (error) {
        console.error('Cloud login failed:', error);
        alert('ID atau Kata Laluan salah.');
      }
      return;
    }

    const found = users.find(u => u.username === username && u.password === password);
    if (found) {
      // Security Check: Verify role matches login page
      if (loginType === 'admin' && found.role !== 'admin') {
        alert('Akses Ditolak: Akaun ini bukan akaun Administrator.');
        return;
      }
      if (loginType === 'user' && found.role === 'admin') {
        alert('Sila gunakan halaman Admin untuk log masuk ke akaun Administrator.');
        return;
      }

      const loggedUser = { ...found, lastLogin: new Date().toISOString() };
      setUser(loggedUser);
      setProfileForm({ name: found.name, email: found.email, phone: found.phone || '', address: '' });
      setView('dashboard');
    }
    else alert('ID atau Kata Laluan salah.');
  };

  const handleLogout = () => {
    setUser(null);
    setView('login');
    setUserMenuOpen(false);
    if (isCloudConfigured) {
      clearCloudSession();
      setCloudSession(null);
    } else {
      localStorage.removeItem(STORAGE_KEYS.SESSION);
    }
  };

  const handleSignUp = async (data) => {
    if (isCloudConfigured) {
      try {
        if (users.some(u => u.username === data.username || u.email === data.email)) { alert('Account already exists'); return; }
        const { session } = await signUpCloudUser(data);
        if (session) setCloudSession(session);
        const profiles = await listCloudProfiles(session?.access_token);
        setUsers(profiles);
        alert('Account created successfully. Please sign in.');
        setView('login');
      } catch (error) {
        console.error('Cloud signup failed:', error);
        alert('Unable to create cloud account. Please check Supabase setup and try again.');
      }
      return;
    }

    if (users.some(u => u.username === data.username || u.email === data.email)) { alert('Account already exists'); return; }
    const newUser = { ...data, profilePic: '', createdAt: new Date().toISOString() };
    setUsers(prev => [...prev, newUser]);
    alert('Account created successfully');
    setView('login');
  };

  const resetAdminUserForm = () => {
    setAdminUserForm({ id: null, username: '', email: '', password: '', name: '', idNo: '', phone: '', role: 'student' });
  };

  const handleAdminSaveUser = async (e) => {
    e.preventDefault();
    const username = adminUserForm.username.trim();
    const email = adminUserForm.email.trim();
    const name = adminUserForm.name.trim();
    const phone = adminUserForm.phone.trim();
    const idNo = adminUserForm.idNo.trim();
    const password = adminUserForm.password.trim();
    const isEditing = Boolean(adminUserForm.id);

    if (!username || !email || !name || !idNo || !phone || (!isEditing && !password)) {
      alert('Please complete all required student/staff information.');
      return;
    }
    if (adminUserForm.role === 'admin') {
      alert('This form is for student and staff accounts only.');
      return;
    }
    if (users.some(u => u.username === username && u.id !== adminUserForm.id)) {
      alert('Username already exists.');
      return;
    }
    if (users.some(u => u.email === email && u.id !== adminUserForm.id)) {
      alert('Email already exists.');
      return;
    }

    const userPayload = { ...adminUserForm, username, email, name, phone, idNo, password };

    if (isCloudConfigured && cloudSession?.access_token) {
      try {
        const savedUser = await saveCloudUser(userPayload);
        setUsers(prev => {
          const exists = prev.some(u => u.id === savedUser.id || u.username === savedUser.username);
          return exists ? prev.map(u => (u.id === savedUser.id || u.username === savedUser.username ? savedUser : u)) : [...prev, savedUser];
        });
        resetAdminUserForm();
        showNotification('Student/staff account saved.');
      } catch (error) {
        console.error('Failed to save user to cloud:', error);
        alert(`Unable to save user: ${error.message || 'Unknown error'}`);
      }
      return;
    }

    const localUser = {
      ...userPayload,
      id: adminUserForm.id || Date.now(),
      profilePic: adminUserForm.profilePic || '',
      createdAt: adminUserForm.createdAt || new Date().toISOString(),
    };
    setUsers(prev => prev.some(u => u.id === localUser.id || u.username === localUser.username)
      ? prev.map(u => (u.id === localUser.id || u.username === localUser.username ? localUser : u))
      : [...prev, localUser]);
    resetAdminUserForm();
    showNotification('Student/staff account saved.');
  };

  const handleAdminEditUser = (targetUser) => {
    setAdminUserForm({
      id: targetUser.id || null,
      username: targetUser.username || '',
      email: targetUser.email || '',
      password: '',
      name: targetUser.name || '',
      idNo: targetUser.idNo || targetUser.id_no || '',
      phone: targetUser.phone || '',
      role: targetUser.role === 'staff' ? 'staff' : 'student',
      profilePic: targetUser.profilePic || targetUser.profile_pic || '',
      createdAt: targetUser.createdAt || targetUser.created_at,
    });
  };

  const handleAdminDeleteUser = async (targetUser) => {
    if (!targetUser?.id && !targetUser?.username) return;
    if (targetUser.role === 'admin') {
      alert('Admin accounts cannot be deleted from this page.');
      return;
    }
    if (!window.confirm(`Delete ${targetUser.name || targetUser.username}? This will remove the user account only.`)) return;

    if (isCloudConfigured && cloudSession?.access_token) {
      try {
        await deleteCloudUser(targetUser.id);
        setUsers(prev => prev.filter(u => u.id !== targetUser.id));
        if (adminUserForm.id === targetUser.id) resetAdminUserForm();
        showNotification('User deleted.');
      } catch (error) {
        console.error('Failed to delete user from cloud:', error);
        alert(`Unable to delete user: ${error.message || 'Unknown error'}`);
      }
      return;
    }

    setUsers(prev => prev.filter(u => (targetUser.id ? u.id !== targetUser.id : u.username !== targetUser.username)));
    if ((adminUserForm.id && adminUserForm.id === targetUser.id) || adminUserForm.username === targetUser.username) resetAdminUserForm();
    showNotification('User deleted.');
  };

  const handleToggleMaintenance = (rackLetter, shelfId, reason = '') => {
    let statusText = '';

    setRacks(prev => {
      const next = prev.map(r => {
        if (rackLetter !== 'ALL' && r.letter !== rackLetter) return r;

        if (shelfId === null || rackLetter === 'ALL') {
          const allMaintenance = rackLetter === 'ALL' ? false : r.shelves.every(s => s.maintenance);
          const willBeMaintenance = rackLetter === 'ALL' ? false : !allMaintenance;
          statusText = willBeMaintenance ? 'MAINTENANCE' : 'AVAILABLE';

          const updatedShelves = r.shelves.map(s => ({
            ...s,
            maintenance: willBeMaintenance,
            maintenanceReason: willBeMaintenance ? reason || 'Rack-wide maintenance' : '',
            maintenanceDate: willBeMaintenance ? new Date().toISOString() : null
          }));
          return { ...r, shelves: updatedShelves };
        } else {
          return {
            ...r, shelves: r.shelves.map(s => {
              if (s.id !== shelfId) return s;
              const willBeMaintenance = !s.maintenance;
              statusText = willBeMaintenance ? 'MAINTENANCE' : 'AVAILABLE';
              return {
                ...s,
                maintenance: willBeMaintenance,
                maintenanceReason: willBeMaintenance ? reason : '',
                maintenanceDate: willBeMaintenance ? new Date().toISOString() : null
              };
            })
          };
        }
      });

      // Force an immediate cloud save to override any polling race conditions
      if (isCloudConfigured && cloudSession?.access_token) {
        saveCloudState('racks', next, cloudSession.access_token).catch(err => {
          console.error('Failed to sync maintenance status:', err);
        });
      }

      return next;
    });

    const target = rackLetter === 'ALL' ? 'Semua Rak' : (shelfId === null ? `Rak ${rackLetter}` : `Shelf ${shelfId}`);
    showNotification(`${target} kini dalam status ${statusText || 'AVAILABLE'}.`);
  };

  const handleAddParcel = async (e) => {
    e.preventDefault();
    if (!adminForm.trackingNo || !adminForm.recipient) return;
    const senderValue = adminForm.sender === 'Others' ? adminForm.senderOther : adminForm.sender;
    if (!senderValue) return;
    if (isCloudConfigured && !cloudSession?.access_token) {
      alert('Cloud session is not ready. Please log out and sign in again before registering a parcel.');
      return;
    }
    const newParcelId = generateParcelId(parcelsRef.current);
    const parcelWeight = parseFloat((Math.random() * 5 + 0.5).toFixed(1));
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    let assignedRack = null;
    let nextRacks = racks;

    if (adminForm.assignRack && adminForm.selectedRackShelf) {
      const [rackLetter] = adminForm.selectedRackShelf.split('-');
      const shelf = racks.find(r => r.letter === rackLetter)?.shelves.find(s => s.id === adminForm.selectedRackShelf);
      if (shelf?.maintenance) { alert(`Shelf ${adminForm.selectedRackShelf} is under maintenance. Please select another shelf or clear maintenance first.`); return; }
      assignedRack = adminForm.selectedRackShelf;
      nextRacks = racks.map(r => r.letter === rackLetter ? { ...r, shelves: r.shelves.map(s => s.id === adminForm.selectedRackShelf ? { ...s, status: 'occupied', parcelId: newParcelId, weight: parcelWeight } : s) } : r);
    } else if (adminForm.assignRack) {
      let assigned = false;
      for (const rack of racks) {
        const emptyShelf = rack.shelves.find(s => s.status === 'empty' && !s.maintenance);
        if (emptyShelf) {
          assignedRack = emptyShelf.id;
          nextRacks = racks.map(r => r.id === rack.id ? { ...r, shelves: r.shelves.map(s => s.id === emptyShelf.id ? { ...s, status: 'occupied', parcelId: newParcelId, weight: parcelWeight } : s) } : r);
          assigned = true;
          break;
        }
      }
      if (!assigned) { alert('No available shelves found. Some shelves may be under maintenance.'); return; }
    }

    const recipientUser = users.find(u => u.username === adminForm.recipient);

    const newParcel = {
      ...adminForm,
      sender: senderValue,
      id: newParcelId,
      dateReceived: new Date().toISOString().split('T')[0],
      otp: otp,
      status: adminForm.status || 'Pending',
      rackLocation: assignedRack,
      weight: `${parcelWeight}kg`,
      recipientName: recipientUser?.name || '',
      recipientIdNo: recipientUser?.idNo || recipientUser?.id_no || '',
      recipientRole: recipientUser?.role || 'student'
    };
    delete newParcel.senderOther;
    delete newParcel.assignRack;
    delete newParcel.selectedRackShelf;

    if (isCloudConfigured && cloudSession?.access_token) {
      try {
        const savedParcel = await upsertCloudParcel(newParcel, cloudSession.access_token);
        setRacks(nextRacks);
        setParcels(p => [savedParcel, ...p.filter(parcel => parcel.id !== savedParcel.id)]);
      } catch (error) {
        console.error('Failed to save parcel to cloud:', error);
        alert(`Parcel was not saved to Supabase: ${error.message || 'Unknown error'}. Please check the parcels table schema and RLS policies.`);
        return;
      }
    } else {
      setRacks(nextRacks);
      setParcels(p => [newParcel, ...p]);
    }

    setAdminForm({ trackingNo: '', sender: '', senderOther: '', recipient: '', status: 'Pending', location: 'Main Post Office', description: '', assignRack: false, selectedRackShelf: '' });
    setScannedTracking('');

    //const recipientUser = users.find(u => u.username === newParcel.recipient);
    const phone = recipientUser?.phone || newParcel.recipient;
    const message = getParcelNotificationMessage(newParcel);

    showNotification(`Notification sent to ${phone}: ${message.title}`);

    // NEW: Trigger Email if status is Arrived
    if (newParcel.status === 'Arrived' && recipientUser?.email) {
      sendParcelOTP(
        recipientUser.email,
        recipientUser.name || newParcel.recipientName,
        newParcel.trackingNo,
        newParcel.otp,
        newParcel.rackLocation
      );
    }

    // Auto-trigger WhatsApp link for admin
    if (isAdmin && recipientUser?.phone) {
      const whatsappUrl = `https://wa.me/${recipientUser.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message.body)}`;
      if (window.confirm(`Mahu menghantar mesej WhatsApp kepada ${recipientUser.name}?`)) {
        window.open(whatsappUrl, '_blank');
      }
    }

    pushBrowserNotification(message);
  };

  const handleDeleteParcel = async (id) => {
    const parcel = parcels.find(p => p.id === id);
    if (window.confirm('Are you sure you want to delete this parcel record?')) {
      if (isCloudConfigured && cloudSession?.access_token) {
        try {
          await deleteCloudParcel(id, cloudSession.access_token);
        } catch (error) {
          console.error('Failed to delete parcel from cloud:', error);
          alert('Unable to delete parcel from Supabase. Please try again.');
          return;
        }
      }

      if (parcel?.rackLocation) {
        const [rackLetter] = parcel.rackLocation.split('-');
        setRacks(prev => prev.map(r => r.letter === rackLetter ? { ...r, shelves: r.shelves.map(s => s.id === parcel.rackLocation ? { ...s, status: 'empty', parcelId: null, weight: 0 } : s) } : r));
      }
      setParcels(p => p.filter(parcel => parcel.id !== id));
    }
  };

  const updateStatus = async (id, status) => {
    const parcel = parcels.find(p => p.id === id);
    const dateCollected = status === 'Collected' ? new Date().toISOString() : (parcel?.dateCollected || null);

    const updatedParcel = parcel ? { ...parcel, status, dateCollected } : null;

    setParcels(p => p.map(x => x.id === id ? { ...x, status, dateCollected } : x));

    if (isCloudConfigured && cloudSession?.access_token && updatedParcel) {
      try {
        await upsertCloudParcel(updatedParcel, cloudSession.access_token);
      } catch (error) {
        console.error('Failed to update parcel status in cloud:', error);
        alert('Unable to update parcel status in Supabase. Please try again.');
      }
    }
    if (status === 'Collected' && parcel) {
      if (parcel.rackLocation) {
        const [rackLetter] = parcel.rackLocation.split('-');
        setRacks(prev => prev.map(r => r.letter === rackLetter ? { ...r, shelves: r.shelves.map(s => s.id === parcel.rackLocation ? { ...s, status: 'empty', parcelId: null, weight: 0 } : s) } : r));
      }
    } else if (parcel && NOTIFIABLE_STATUSES.includes(status)) {
      const recipientUser = users.find(u => u.username === parcel.recipient);
      const contact = recipientUser?.phone || recipientUser?.email || parcel.recipient;
      const message = getParcelNotificationMessage({ ...parcel, status });

      showNotification(`Notication sent to ${contact}: ${message.title}`);

      // NEW: Trigger Email if status was updated to Arrived
      if (status === 'Arrived' && recipientUser?.email) {
        sendParcelOTP(
          recipientUser.email,
          recipientUser.name || parcel.recipientName,
          parcel.trackingNo,
          parcel.otp,
          parcel.rackLocation
        );
      }

      // Auto-trigger WhatsApp link for admin
      if (isAdmin && recipientUser?.phone) {
        const whatsappUrl = `https://wa.me/${recipientUser.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message.body)}`;
        if (window.confirm(`Would you like to send a WhatsApp message to ${recipientUser.name}?`)) {
          window.open(whatsappUrl, '_blank');
        }
      }

      pushBrowserNotification(message);
    }
  };

  const handleTrackParcel = (e) => {
    e.preventDefault();
    if (!user) return;
    const inputTrim = trackInput.trim().toLowerCase();
    if (!inputTrim) return;
    let found = user.role === 'admin' ? parcels.find(p => p.trackingNo.toLowerCase() === inputTrim) : parcels.find(p => p.recipient === user.username && p.trackingNo.toLowerCase() === inputTrim);
    if (found) setFoundParcel(found);
    else { setFoundParcel(null); alert('Parcel not found.'); }
  };

  const handleSaveInfo = async (submittedForm) => {
    const finalPhone = `${submittedForm.countryCode}${submittedForm.phoneLocal}`;
    let updatedUser = { ...user, name: submittedForm.name, email: submittedForm.email, phone: finalPhone };

    if (submittedForm.newPassword) {
      updatedUser.password = submittedForm.newPassword;
    }

    if (isCloudConfigured) {
      try {
        if (submittedForm.newPassword) {
          await updateCloudPassword(cloudSession, submittedForm.newPassword);
        }
        const cloudUser = { ...updatedUser, email: user.email };
        if (submittedForm.email !== user.email) alert('Notice: Email login is managed by Supabase Auth and cannot be changed here.');
        const savedUser = await upsertCloudProfile(cloudUser, cloudSession?.access_token);

        setUser(savedUser);
        setUsers(prev => prev.map(u => u.username === savedUser.username ? savedUser : u));
        setActiveModal(null);
        alert('Profile and security settings updated successfully!');
      } catch (error) {
        console.error('Cloud profile update failed:', error);
        alert('Unable to update cloud profile.');
      }
      return;
    }

    setUser(updatedUser);
    setUsers(prev => prev.map(u => u.username === updatedUser.username ? updatedUser : u));
    setActiveModal(null);
    alert('Profile and security settings updated successfully!');
  };

  const handleChangePassword = async () => {
    if (passwordForm.new !== passwordForm.confirm) { alert('Passwords do not match'); return; }
    if (passwordForm.new.length < 6) { alert('Password must be at least 6 characters'); return; }
    if (isCloudConfigured) {
      try {
        await updateCloudPassword(cloudSession, passwordForm.new);
        setPasswordForm({ current: '', new: '', confirm: '' });
        setActiveModal(null);
        alert('Password updated successfully!');
      } catch (error) {
        console.error('Cloud password update failed:', error);
        alert('Unable to update password. Please sign in again and retry.');
      }
      return;
    }

    const updatedUser = { ...user, password: passwordForm.new };
    setUser(updatedUser);
    setUsers(prev => prev.map(u => u.username === updatedUser.username ? updatedUser : u));
    setPasswordForm({ current: '', new: '', confirm: '' });
    setActiveModal(null);
    alert('Password updated successfully!');
  };

  const handleUpdateProfilePic = async (picData) => {
    if (!picData) {
      // Remove picture case
      const updatedUser = { ...user, profilePic: '' };
      try {
        const savedUser = await upsertCloudProfile(updatedUser, cloudSession?.access_token);
        setUser(savedUser);
      } catch (err) { alert('Failed to update profile picture.'); }
      return;
    }

    try {
      showNotification('Processing profile picture update...');

      // 1. Upload to Supabase Storage first
      const publicUrl = await uploadCloudFile(user.id || user.username, picData);

      // 2. Update user profile with the new URL
      const updatedUser = { ...user, profilePic: publicUrl };
      const savedUser = await upsertCloudProfile(updatedUser, cloudSession?.access_token);

      setUser(savedUser);
      setUsers(prev => prev.map(u => u.username === savedUser.username ? savedUser : u));

      if (!isCloudConfigured) {
        localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(savedUser));
      }

      showNotification('Profile picture updated successfully!');
    } catch (error) {
      console.error('Cloud profile picture update failed:', error);
      // Fallback: If storage fails (maybe bucket not created), try direct table update with compressed base64
      try {
        const savedUser = await upsertCloudProfile({ ...user, profilePic: picData }, cloudSession?.access_token);
        setUser(savedUser);
        showNotification('Picture updated directly in profile (Supabase Storage may not be configured).');
      } catch (fallbackError) {
        alert(`Failed: ${error.message || 'Storage error'}. Please ensure the "profiles" bucket is created in Supabase.`);
      }
    }
  };

  // ===== UNIVERSAL SCAN HANDLER - Works with all scan modes =====
  const handleUniversalScan = (decodedText) => {
    const cleanText = decodedText.trim();
    if (!cleanText) return;

    if (scannerCallback) {
      scannerCallback(cleanText);
      setScannerCallback(null);
    } else {
      const upperText = cleanText.toUpperCase();
      setScannedTracking(upperText);
      setAdminForm(prev => ({ ...prev, trackingNo: upperText }));
      showNotification(`✅ Barcode/QR scanned: "${upperText}" — Auto-filled into tracking field`);
    }
    setScannerOpen(false);
  };

  const openScannerForTracking = () => { setScannerCallback(null); setScannerOpen(true); };
  const openScannerForVerification = (callback) => { setScannerCallback(() => callback); setScannerOpen(true); };

  const handleRequestCollect = (parcel) => {
    if (parcel.recipient === 'UNREGISTERED') {
      // Bypass OTP: Force manual ID check for unregistered boxes
      if (window.confirm(`This parcel is for an unregistered student (${parcel.recipientNameOnLabel || 'No Name'}).\n\nPlease verify the ID manually. Are you sure you want to collect this parcel?`)) {
        handleVerifiedCollect(parcel.id);
      }
    } else {
      // Normal flow: Open OTP Scanner for registered students
      setVerifyParcel(parcel);
    }
  };
  const handleVerifiedCollect = (id) => { updateStatus(id, 'Collected'); showNotification("Parcel verified and marked as 'Collected'. Rack is now free."); };

  const isAdmin = user?.role === 'admin';
  const filtered = isAdmin ? parcels : parcels.filter(p => p.recipient === user?.username && p.status !== 'Collected');
  const userNotificationMessages = (isAdmin ? [] : parcels)
    .filter(p => p.recipient === user?.username && NOTIFIABLE_STATUSES.includes(p.status))
    .map(p => {
      const copy = { ...p };
      const message = getParcelNotificationMessage(copy);
      return {
        ...message,
        id: getParcelNotificationId(copy),
        parcelId: copy.id,
        trackingNo: copy.trackingNo,
        status: copy.status,
        date: copy.dateReceived,
        rackLocation: copy.rackLocation,
      };
    })
    .sort((a, b) => {
      const priority = { Overdue: 0, Arrived: 1, Pending: 2 };
      return (priority[a.status] ?? 9) - (priority[b.status] ?? 9) || String(b.date || '').localeCompare(String(a.date || ''));
    });
  const unreadNotificationCount = userNotificationMessages.filter(message => !readNotificationIds.includes(message.id)).length;

  useEffect(() => {
    if (!user?.username || isAdmin) return;
    const relevantParcels = parcels.filter(p => p.recipient === user.username && NOTIFIABLE_STATUSES.includes(p.status));
    const nextStatuses = new Map(relevantParcels.map(p => [p.id || p.trackingNo, p.status]));

    if (!notificationsPrimedRef.current) {
      parcelStatusRef.current = nextStatuses;
      notificationsPrimedRef.current = true;
      return;
    }

    relevantParcels.forEach(parcel => {
      const key = parcel.id || parcel.trackingNo;
      const previousStatus = parcelStatusRef.current.get(key);
      if (previousStatus !== parcel.status) {
        const message = { ...getParcelNotificationMessage(parcel), id: getParcelNotificationId(parcel) };
        showNotification(message.body);
        pushBrowserNotification(message);
      }
    });

    parcelStatusRef.current = nextStatuses;
  }, [isAdmin, parcels, user?.username]);

  const itemsPerPage = 5;
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedParcels = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => { setCurrentPage(1); }, [view]);

  const stats = {
    total: filtered.length,
    pending: filtered.filter(p => p.status === 'Pending').length,
    arrived: filtered.filter(p => p.status === 'Arrived').length,
    collected: filtered.filter(p => p.status === 'Collected').length,
    overdue: filtered.filter(p => p.status === 'Overdue').length,
    racksTotal: racks.reduce((sum, r) => sum + r.shelves.length, 0),
    racksOccupied: racks.reduce((sum, r) => sum + r.shelves.filter(s => s.status !== 'empty' && !s.maintenance).length, 0),
    racksMaintenance: racks.reduce((sum, r) => sum + r.shelves.filter(s => s.maintenance).length, 0),
    racksAvailable: racks.reduce((sum, r) => sum + r.shelves.filter(s => s.status === 'empty' && !s.maintenance).length, 0),
  };

  const renderAvatar = (size = 32) => {
    if (user?.profilePic) return <img src={user.profilePic} alt={user.name} style={styles.userAvatar(size)} />;
    return (<div style={styles.avatarPlaceholder(size)}><Icons.User width={size * 0.55} height={size * 0.55} /></div>);
  };

  const markNotificationRead = (id) => {
    setReadNotificationIds(prev => prev.includes(id) ? prev : [...prev, id]);
  };

  const markAllNotificationsRead = () => {
    setReadNotificationIds(prev => Array.from(new Set([...prev, ...userNotificationMessages.map(message => message.id)])));
  };

  const openNotificationPanel = () => {
    setNotificationPanelOpen(open => !open);
    if ('Notification' in window && Notification.permission === 'default') requestBrowserNotifications();
  };

  if (isCloudConfigured && !cloudReady) {
    return (
      <div style={{ minHeight: '100vh', background: themeObj.authBg || '#0f172a', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
        Syncing cloud data...
      </div>
    );
  }

  if (!user) return <AuthView onLogin={handleLogin} onSignUp={handleSignUp} view={view === 'dashboard' ? 'login' : view} setView={setView} theme={themeObj} />;

  const viewTitles = { dashboard: 'Dashboard', myparcels: 'Parcel Tracking', admin: 'Admin Panel', users: 'Student & Staff', rack: 'Smart Rack', racksensors: 'Rack Sensors (IoT)', rackmgmt: 'Rack Maintenance', history: 'Collection History' };

  return (
    <div style={styles.app}>
      <style>{`
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes scanline { 0% { top: 10%; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: 90%; opacity: 0; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>

      {isMobile && sidebarOpen && <div style={styles.overlay} onClick={() => setSidebarOpen(false)} />}

      <aside style={{ ...styles.sidebar, ...(isMobile ? (sidebarOpen ? styles.sidebarOpen : styles.sidebarMobile) : {}) }}>
        <div style={styles.sidebarHeader}>
          <img src={IPGKPP_LOGO} alt="IPGKPP" style={styles.sidebarLogo} />
        </div>
        <nav style={styles.nav}>
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Icons.LayoutDashboard },
            { id: 'myparcels', label: 'Parcel Tracker', icon: Icons.Inbox },
            { id: 'history', label: 'Collection History', icon: Icons.Clock },
            { id: 'admin', label: 'Manage Parcels', icon: Icons.Users, adminOnly: true },
            { id: 'users', label: 'Manage Users', icon: Icons.User, adminOnly: true },
            { id: 'rack', label: 'Smart Rack', icon: Icons.Layers },
            { id: 'racksensors', label: 'Rack Sensors (IoT)', icon: Icons.Cpu },
            { id: 'rackmgmt', label: 'Rack Maintenance', icon: Icons.Wrench, adminOnly: true }
          ].filter(item => !item.adminOnly || isAdmin).map(item => (
            <button key={item.id} onClick={() => { setView(item.id); setSidebarOpen(false); }} style={styles.navItem(view === item.id)}>
              <item.icon width={20} height={20} />{item.label}
            </button>
          ))}
        </nav>
        <div style={{ padding: '16px', borderTop: `1px solid ${themeObj.border}`, fontSize: '11px', color: themeObj.textMuted, textAlign: 'center' }}>
          <p style={{ margin: 0, fontWeight: 600 }}>IPGKPP Smart Rack System v2.0</p>
          <p style={{ margin: '4px 0 0 0' }}>IoT • Secure • Connected</p>
        </div>
      </aside>

      <div style={{ ...styles.main, ...(isMobile ? styles.mainNoSidebar : {}) }}>
        <header style={styles.header}>
          <button onClick={() => setSidebarOpen(true)} style={{ ...styles.hamburger, display: isMobile ? 'flex' : 'none' }}>
            <Icons.Menu width={24} height={24} />
          </button>
          <div style={styles.headerInstitution}>
            <img src={IPGKPP_LOGO} alt="IPGKPP" style={styles.headerInstitutionLogo} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button onClick={toggleTheme} title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`} style={styles.themeToggle} onMouseOver={(e) => { e.currentTarget.style.backgroundColor = styles.themeToggleHover; }} onMouseOut={(e) => { e.currentTarget.style.backgroundColor = styles.btnSecondaryBg; }}>
              {theme === 'light' ? <Icons.Moon width={18} height={18} /> : <Icons.Sun width={18} height={18} />}
            </button>

            {!isAdmin && (
              <div style={{ position: 'relative' }} ref={notificationMenuRef}>
                <button onClick={openNotificationPanel} title="Notifications" style={{ ...styles.themeToggle, position: 'relative' }} onMouseOver={(e) => { e.currentTarget.style.backgroundColor = styles.themeToggleHover; }} onMouseOut={(e) => { e.currentTarget.style.backgroundColor = styles.btnSecondaryBg; }}>
                  <Icons.Bell width={18} height={18} />
                  {unreadNotificationCount > 0 && (
                    <span style={{ position: 'absolute', top: '-6px', right: '-6px', minWidth: '18px', height: '18px', padding: '0 5px', borderRadius: '9999px', backgroundColor: '#dc2626', color: '#ffffff', fontSize: '11px', fontWeight: 800, lineHeight: '18px', textAlign: 'center', boxSizing: 'border-box' }}>{unreadNotificationCount}</span>
                  )}
                </button>
                {notificationPanelOpen && (
                  <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: isMobile ? 'min(320px, calc(100vw - 32px))' : '360px', maxHeight: '440px', overflow: 'hidden', backgroundColor: themeObj.dropdownBg, borderRadius: '12px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.25)', border: `1px solid ${themeObj.border}`, zIndex: 220 }}>
                    <div style={{ padding: '14px 16px', borderBottom: `1px solid ${themeObj.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                      <div>
                        <p style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: themeObj.text }}>Mesej Parcel</p>
                        <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: themeObj.textSecondary }}>{unreadNotificationCount} belum dibaca</p>
                      </div>
                      {userNotificationMessages.length > 0 && (
                        <button type="button" onClick={markAllNotificationsRead} style={{ border: 'none', backgroundColor: 'transparent', color: themeObj.iconColor, fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>Mark all</button>
                      )}
                    </div>
                    <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
                      {userNotificationMessages.length === 0 ? (
                        <div style={{ padding: '28px 18px', textAlign: 'center', color: themeObj.textSecondary }}>
                          <Icons.Bell width={32} height={32} style={{ opacity: 0.35, marginBottom: '8px' }} />
                          <p style={{ margin: 0, fontSize: '13px' }}>Tiada mesej parcel buat masa ini.</p>
                        </div>
                      ) : userNotificationMessages.map(message => {
                        const isUnread = !readNotificationIds.includes(message.id);
                        const toneColor = message.tone === 'danger' ? '#dc2626' : message.tone === 'success' ? '#16a34a' : '#d97706';
                        return (
                          <button
                            key={message.id}
                            type="button"
                            onClick={() => { markNotificationRead(message.id); setView('myparcels'); setNotificationPanelOpen(false); }}
                            style={{ width: '100%', display: 'flex', gap: '12px', padding: '14px 16px', border: 'none', borderBottom: `1px solid ${themeObj.border}`, backgroundColor: isUnread ? themeObj.iconBg : 'transparent', textAlign: 'left', cursor: 'pointer' }}
                          >
                            <span style={{ width: '34px', height: '34px', borderRadius: '8px', backgroundColor: `${toneColor}18`, color: toneColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              {message.status === 'Overdue' ? <Icons.AlertTriangle width={18} height={18} /> : message.status === 'Arrived' ? <Icons.Package width={18} height={18} /> : <Icons.Clock width={18} height={18} />}
                            </span>
                            <span style={{ minWidth: 0, flex: 1 }}>
                              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                                <span style={{ fontSize: '13px', fontWeight: 800, color: themeObj.text }}>{message.title}</span>
                                {isUnread && <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#dc2626', flexShrink: 0 }} />}
                              </span>
                              <span style={{ display: 'block', marginTop: '4px', fontSize: '12px', lineHeight: '1.4', color: themeObj.textSecondary }}>{message.body}</span>
                              <span style={{ display: 'block', marginTop: '6px', fontSize: '11px', fontFamily: 'monospace', color: themeObj.textMuted }}>{message.trackingNo}</span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div style={styles.userMenuContainer} ref={menuRef}>
              <button onClick={() => setUserMenuOpen(!userMenuOpen)} style={styles.userMenuBtn}>
                {renderAvatar(28)}
                {!isMobile && <span style={{ fontSize: '14px', fontWeight: 500 }}>{user.name}</span>}
              </button>
              {userMenuOpen && (
                <div style={styles.dropdown}>
                  <div style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: `1px solid ${themeObj.border}`, marginBottom: '4px' }}>
                    {renderAvatar(40)}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 600, fontSize: '14px', margin: 0, color: themeObj.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</p>
                      <p style={{ fontSize: '12px', color: themeObj.textSecondary, margin: '2px 0 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</p>
                    </div>
                  </div>
                  <button onClick={() => { toggleTheme(); }} style={styles.dropdownItem} onMouseOver={(e) => { e.currentTarget.style.backgroundColor = styles.dropdownHover; e.currentTarget.style.color = styles.dropdownHoverText; }} onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = themeObj.text; }}>
                    {theme === 'light' ? <Icons.Moon width={18} height={18} /> : <Icons.Sun width={18} height={18} />}
                    {theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                  </button>
                  <div style={styles.divider} />
                  <button onClick={() => { setActiveModal('viewInfo'); setUserMenuOpen(false); }} style={styles.dropdownItem} onMouseOver={(e) => { e.currentTarget.style.backgroundColor = styles.dropdownHover; e.currentTarget.style.color = styles.dropdownHoverText; }} onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = themeObj.text; }}>
                    <Icons.Eye width={18} height={18} /> View Info
                  </button>
                  <button onClick={() => { setActiveModal('changeInfo'); setUserMenuOpen(false); }} style={styles.dropdownItem} onMouseOver={(e) => { e.currentTarget.style.backgroundColor = styles.dropdownHover; e.currentTarget.style.color = styles.dropdownHoverText; }} onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = themeObj.text; }}>
                    <Icons.Shield width={18} height={18} /> Settings & Security
                  </button>
                  <button onClick={() => { setPicModalOpen(true); setUserMenuOpen(false); }} style={styles.dropdownItem} onMouseOver={(e) => { e.currentTarget.style.backgroundColor = styles.dropdownHover; e.currentTarget.style.color = styles.dropdownHoverText; }} onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = themeObj.text; }}>
                    <Icons.Camera width={18} height={18} /> Profile Picture
                  </button>
                  {/*}
                  <button onClick={() => { setActiveModal('details'); setUserMenuOpen(false); }} style={styles.dropdownItem} onMouseOver={(e) => { e.currentTarget.style.backgroundColor = styles.dropdownHover; e.currentTarget.style.color = styles.dropdownHoverText; }} onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = themeObj.text; }}>
                    <Icons.Info width={18} height={18} /> Details
                  </button>
                  */}
                  <div style={styles.divider} />
                  <button onClick={handleLogout} style={{ ...styles.dropdownItem, ...styles.dropdownLogout }} onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#fef2f2'; }} onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
                    <Icons.LogOut width={18} height={18} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div style={styles.content}>
          <div style={styles.contentBg} />
          <div style={styles.contentInner}>
            <div style={styles.pageBanner}>
              <img src={IPGKPP_LOGO} alt="IPGKPP" style={styles.bannerLogo} />
              <div style={styles.bannerText}>
                <h2 style={styles.bannerTitle}>INSTITUT PENDIDIKAN GURU KAMPUS PULAU PINANG</h2>
                <p style={styles.bannerSubtitle}>IPGKPP Smart Rack Parcel Management System — {viewTitles[view] || 'Dashboard'}</p>
              </div>
            </div>

            {view === 'dashboard' && (
              <DashboardView parcels={paginatedParcels} trackInput={trackInput} setTrackInput={setTrackInput} onTrack={handleTrackParcel} foundParcel={foundParcel} onRequestCollect={handleRequestCollect} stats={stats} isAdmin={isAdmin} user={user} racks={racks} onGoToRack={() => setView('rack')} onGoToMaintenance={() => setView('rackmgmt')} theme={themeObj} />
            )}

            {view === 'myparcels' && <MyParcelsView parcels={paginatedParcels} user={user} rackIoTData={rackIoTData} theme={themeObj} />}

            {view === 'history' && <HistoryView parcels={parcels} user={user} theme={themeObj} />}

            {view === 'rack' && (
              <SmartRackView
                racks={racks} parcels={parcels} rackIoTData={rackIoTData} isAdmin={isAdmin} theme={themeObj}
                onShelfClick={(shelf, rackLetter) => { const parcel = parcels.find(p => p.id === shelf.parcelId); setSelectedShelf({ shelf, rackLetter, parcel }); }}
                onToggleMaintenance={(rackLetter, shelfId) => {
                  if (shelfId !== null) { const reason = prompt('Enter maintenance reason (optional):'); handleToggleMaintenance(rackLetter, shelfId, reason || ''); }
                  else { const reason = prompt('Enter maintenance reason for entire rack (optional):'); handleToggleMaintenance(rackLetter, null, reason || ''); }
                }}
              />
            )}

            {view === 'racksensors' && <RackSensorView rackIoTData={rackIoTData} theme={themeObj} />}

            {view === 'rackmgmt' && isAdmin && (
              <RackManagementView
                racks={racks} parcels={parcels} theme={themeObj}
                onToggleShelf={(rackLetter, shelfId) => { const reason = prompt('Enter maintenance reason (optional):'); handleToggleMaintenance(rackLetter, shelfId, reason || ''); }}
                onToggleRack={(rackLetter) => { const reason = prompt('Enter maintenance reason for entire rack (optional):'); handleToggleMaintenance(rackLetter, null, reason || ''); }}
                onOpenDetail={(rackLetter) => setMaintenanceModal({ rackLetter })}
              />
            )}

            {view === 'users' && isAdmin && (
              <UserManagementView users={users} userForm={adminUserForm} setUserForm={setAdminUserForm} onSaveUser={handleAdminSaveUser} onEditUser={handleAdminEditUser} onDeleteUser={handleAdminDeleteUser} onCancelUserEdit={resetAdminUserForm} theme={themeObj} />
            )}

            {view === 'admin' && isAdmin && (
              <ParcelManagementView parcels={parcels} users={users} form={adminForm} setForm={setAdminForm} onAdd={handleAddParcel} onRequestCollect={handleRequestCollect} onDelete={handleDeleteParcel} onUpdateStatus={updateStatus} onOpenScanner={openScannerForTracking} scannedTracking={scannedTracking} racks={racks} theme={themeObj} />
            )}

            {totalPages > 1 && (view === 'dashboard' || view === 'myparcels' || view === 'admin') && (
              <div style={styles.pagination}>
                <span style={{ fontSize: '14px', color: themeObj.textSecondary }}>Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} records</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} style={{ ...styles.pageBtn(false), opacity: currentPage === 1 ? 0.4 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}><Icons.ChevronLeft width={16} height={16} /></button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(pg => (<button key={pg} onClick={() => setCurrentPage(pg)} style={styles.pageBtn(currentPage === pg)}>{pg}</button>))}
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} style={{ ...styles.pageBtn(false), opacity: currentPage === totalPages ? 0.4 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}><Icons.ChevronRight width={16} height={16} /></button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {activeModal === 'viewInfo' && (
        <Modal onClose={() => setActiveModal(null)} title="Your Information" theme={themeObj}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
              {user?.profilePic ? <img src={user.profilePic} alt={user.name} style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: `3px solid ${themeObj.border}` }} /> : (<div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: themeObj.border, display: 'flex', alignItems: 'center', justifyContent: 'center', color: themeObj.textMuted }}><Icons.User width={36} height={36} /></div>)}
            </div>
            <DetailRow label="Name" value={user.name} theme={themeObj} />
            <DetailRow label="Email" value={user.email} theme={themeObj} />
            <DetailRow label="Phone" value={user.phone || 'Not set'} theme={themeObj} />
            <DetailRow label="Role" value={user.role} theme={themeObj} />
            <DetailRow label={user.role === 'student' ? 'Matric Number' : 'ID Number'} value={user.idNo} theme={themeObj} />
          </div>
        </Modal>
      )}

      {activeModal === 'changeInfo' && (
        <ChangeInfoModal user={user} onClose={() => setActiveModal(null)} onSave={handleSaveInfo} isCloudConfigured={isCloudConfigured} themeObj={themeObj} />
      )}

      {/*
      {activeModal === 'details' && (
        <Modal onClose={() => setActiveModal(null)} title="Account Details" theme={themeObj}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '14px' }}>
            <DetailRow label="Status" value="● Active" valueColor="#16a34a" theme={themeObj} />
            <DetailRow label="Verification" value="Email & Phone Verified" valueColor="#2563eb" theme={themeObj} />
            <DetailRow label="Member Since" value={user.createdAt ? formatDate(user.createdAt) : 'N/A'} theme={themeObj} />
            <DetailRow label="Duration" value={user.createdAt ? getTimeAgo(user.createdAt) : ''} valueColor="#4f46e5" theme={themeObj} />
            <DetailRow label="Last Login" value={user.lastLogin ? currentTime.toLocaleString() : 'Just now'} theme={themeObj} />
          </div>
        </Modal>
      )}
      */}

      {verifyParcel && (<CollectionVerifier parcel={verifyParcel} onClose={() => setVerifyParcel(null)} onVerify={handleVerifiedCollect} onOpenScanner={openScannerForVerification} theme={themeObj} />)}

      {/* UNIVERSAL SCANNER - Works with or without HTTPS */}
      {scannerOpen && (<UniversalScanner onScan={handleUniversalScan} onClose={() => { setScannerOpen(false); setScannerCallback(null); }} theme={themeObj} />)}

      {picModalOpen && (<ProfilePicUpload currentUser={user} onUpdate={handleUpdateProfilePic} onClose={() => setPicModalOpen(false)} theme={themeObj} />)}

      {selectedShelf && (
        <ShelfDetailModal
          shelf={selectedShelf.shelf} rackLetter={selectedShelf.rackLetter} parcel={selectedShelf.parcel}
          onClose={() => setSelectedShelf(null)} isAdmin={isAdmin} theme={themeObj}
          onToggleMaintenance={(rackLetter, shelfId) => {
            const reason = prompt(shelfId ? 'Enter maintenance reason (optional):' : 'Enter reason for entire rack (optional):');
            handleToggleMaintenance(rackLetter, shelfId, reason || '');
            setSelectedShelf(null);
          }}
        />
      )}

      {maintenanceModal && (() => {
        const rack = racks.find(r => r.letter === maintenanceModal.rackLetter);
        if (!rack) return null;
        return (
          <RackMaintenanceModal
            rackLetter={rack.letter} shelves={rack.shelves} parcels={parcels} theme={themeObj}
            onClose={() => setMaintenanceModal(null)}
            onToggleShelf={(shelfId) => { const reason = prompt('Enter maintenance reason (optional):'); handleToggleMaintenance(rack.letter, shelfId, reason || ''); }}
            onToggleAll={(setMaintenance) => { if (setMaintenance) { const reason = prompt('Enter maintenance reason for entire rack (optional):'); handleToggleMaintenance(rack.letter, null, reason || ''); } else { handleToggleMaintenance(rack.letter, null, ''); } }}
          />
        );
      })()}

      {notification && (
        <div style={{ position: 'fixed', top: '20px', right: '20px', backgroundColor: '#16a34a', color: 'white', padding: '16px 24px', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)', zIndex: 9999, display: 'flex', alignItems: 'flex-start', gap: '12px', maxWidth: '400px', animation: 'slideIn 0.3s ease-out' }}>
          <Icons.CheckCircle width={20} height={20} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: '14px', letterSpacing: '0.025em' }}>Notification Sent</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', opacity: 0.95, lineHeight: '1.4' }}>{notification}</p>
          </div>
        </div>
      )}
    </div>
  );
}
