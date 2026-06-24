import { useState, useRef, useEffect, useCallback } from 'react';
import {
  clearCloudSession,
  getCloudProfileByEmail,
  getSavedCloudSession,
  getCloudState,
  isCloudConfigured,
  listCloudProfiles,
  refreshCloudSession,
  saveCloudState,
  signInCloudUser,
  signUpCloudUser,
  subscribeCloudChanges,
  updateCloudPassword,
  deleteCloudParcel,
  upsertCloudParcel,
  upsertCloudProfile,
} from './services/cloudStore';

const IPGKPP_LOGO = 'https://image.qwenlm.ai/public_source/a5365ccb-778a-4d10-aedb-64b519a3dff3/10c2878d5-8e35-49f7-9978-d6f399874b81.png';
const IPGKPP_BG = 'https://image.qwenlm.ai/public_source/a5365ccb-778a-4d10-aedb-64b519a3dff3/1ee67feb7-707c-4c46-8395-a946662c0e1d.png';

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
  Unlock: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>,
  X: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>,
  Barcode: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 5v14"/><path d="M8 5v14"/><path d="M12 5v14"/><path d="M17 5v14"/><path d="M21 5v14"/></svg>,
  Camera: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>,
  Upload: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>,
  User: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Layers: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/></svg>,
  Zap: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/></svg>,
  Shield: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>,
  Wifi: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 20h.01"/><path d="M2 8.82a15 15 0 0 1 20 0"/><path d="M5 12.859a10 10 0 0 1 14 0"/><path d="M8.5 16.429a5 5 0 0 1 7 0"/></svg>,
  Scale: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></svg>,
  Activity: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/></svg>,
  Bell: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>,
  MapPin: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>,
  Cpu: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M15 2v2"/><path d="M15 20v2"/><path d="M2 15h2"/><path d="M2 9h2"/><path d="M20 15h2"/><path d="M20 9h2"/><path d="M9 2v2"/><path d="M9 20v2"/></svg>,
  Wrench: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>,
  Check: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="20 6 9 17 4 12"/></svg>,
  Settings: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>,
  Play: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="5 3 19 12 5 21 5 3"/></svg>,
  Stop: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/></svg>,
  RefreshCw: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
  Sun: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>,
  Moon: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
  FileImage: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><circle cx="10" cy="13" r="2"/><path d="m20 17-1.09-1.09a2 2 0 0 0-2.82 0L10 22"/></svg>,
  Keyboard: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M6 8h.01"/><path d="M10 8h.01"/><path d="M14 8h.01"/><path d="M18 8h.01"/><path d="M8 12h.01"/><path d="M12 12h.01"/><path d="M16 12h.01"/><path d="M7 16h10"/></svg>,
  Clipboard: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg>,
  ZapOff: (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12.41 6.75L5 22l2.43-5.12 10.47-5.24"/><path d="M18.57 12.91 21 10h-5.34"/><path d="m8 3 4 9"/></svg>,
};

const COURIERS = [
  { label: 'Pos Laju', value: 'Pos Laju' },
  { label: 'J&T Express', value: 'J&T Express' },
  { label: 'Shopee Express', value: 'Shopee Express' },
  { label: 'DHL eCommerce', value: 'DHL eCommerce' },
  { label: 'FedEx', value: 'FedEx' },
  { label: 'UPS', value: 'UPS' },
  { label: 'CityLink Express', value: 'CityLink Express' },
  { label: 'Ninja Van', value: 'Ninja Van' },
  { label: 'GDEX', value: 'GDEX' },
  { label: 'Skynet', value: 'Skynet' },
  { label: 'Others', value: 'Others' }
];

const STORAGE_KEYS = {
  USERS: 'ipgkpp_parcels_users',
  PARCELS: 'ipgkpp_parcels_data',
  SESSION: 'ipgkpp_parcels_session',
  RACKS: 'ipgkpp_racks_data',
  THEME: 'ipgkpp_theme_preference'
};

const DEFAULT_USERS = [];

const DEFAULT_PARCELS = [];

const DEFAULT_RACKS = ['A', 'B', 'C'].map(rackLetter => ({
  id: `RACK-${rackLetter}`,
  letter: rackLetter,
  shelves: Array.from({ length: 5 }, (_, shelfIdx) => ({
    id: `${rackLetter}-${shelfIdx + 1}`,
    status: 'empty',
    parcelId: null,
    weight: 0,
    maxWeight: 10,
    ledColor: 'green',
    maintenance: false,
    maintenanceReason: '',
    maintenanceDate: null,
  })),
}));

const normalizeRacks = (value) => {
  if (!Array.isArray(value)) return DEFAULT_RACKS;
  const isValid = value.every(rack =>
    rack &&
    typeof rack === 'object' &&
    typeof rack.id === 'string' &&
    typeof rack.letter === 'string' &&
    Array.isArray(rack.shelves)
  );
  return isValid ? value : DEFAULT_RACKS;
};

const MAX_POSTGRES_INT = 2147483647;

const generateParcelId = (existingParcels = []) => {
  const usedIds = new Set(existingParcels.map(parcel => Number(parcel.id)));
  for (let attempt = 0; attempt < 20; attempt += 1) {
    let id;
    if (window.crypto?.getRandomValues) {
      const values = new Uint32Array(1);
      window.crypto.getRandomValues(values);
      id = (values[0] % MAX_POSTGRES_INT) + 1;
    } else {
      id = Math.floor(Math.random() * MAX_POSTGRES_INT) + 1;
    }
    if (!usedIds.has(id)) return id;
  }
  return Math.floor(Date.now() / 1000);
};

const THEMES = {
  light: {
    name: 'light',
    bg: '#f8fafc', surface: '#ffffff', surfaceHover: '#f1f5f9',
    border: '#e2e8f0', borderStrong: '#cbd5e1',
    text: '#1e293b', textSecondary: '#64748b', textMuted: '#94a3b8',
    inputBg: '#ffffff', inputBorder: '#cbd5e1',
    navActive: '#eef2ff', navActiveText: '#4f46e5', navInactive: 'transparent', navInactiveText: '#475569',
    headerBg: '#ffffff', sidebarBg: '#ffffff',
    modalBg: '#ffffff', modalOverlay: 'rgba(0,0,0,0.5)',
    tableHeaderBg: '#f8fafc', tableRowHover: '#f8fafc', tableBorder: '#f1f5f9',
    cardBg: '#ffffff', cardBorder: '#e2e8f0', statCardBg: '#ffffff',
    bannerBg: 'rgba(255,255,255,0.92)',
    dropdownBg: '#ffffff', dropdownHover: '#eef2ff', dropdownHoverText: '#4f46e5',
    btnSecondaryBg: '#f1f5f9', btnSecondaryBorder: '#e2e8f0', btnSecondaryText: '#334155', btnSecondaryHover: '#e2e8f0',
    contentBgOpacity: 0.25,
    sectionBg: '#f8fafc', sectionBorder: '#e2e8f0', divider: '#e2e8f0',
    iconBg: '#eef2ff', iconColor: '#4f46e5',
    maintenanceBg: '#fef3c7', maintenanceBorder: '#fde68a', maintenanceText: '#92400e',
    availableBg: '#f0fdf4', availableBorder: '#bbf7d0', availableText: '#166534',
    occupiedBg: '#fef2f2', occupiedBorder: '#fecaca', occupiedText: '#991b1b',
    infoBg: '#eff6ff', infoBorder: '#bfdbfe', infoText: '#1e40af',
    successBg: '#f0fdf4', successBorder: '#bbf7d0', successText: '#166534',
    warningBg: '#fef3c7', warningBorder: '#fde68a', warningText: '#92400e',
    bannerTitle: '#1e3a8a', bannerSubtitle: '#64748b',
    tabActiveBg: '#4f46e5', tabActiveText: '#ffffff', tabInactiveBg: '#f1f5f9', tabInactiveText: '#475569',
    tabInactiveHover: '#e2e8f0',
  },
  dark: {
    name: 'dark',
    bg: '#0f172a', surface: '#1e293b', surfaceHover: '#334155',
    border: '#334155', borderStrong: '#475569',
    text: '#f1f5f9', textSecondary: '#94a3b8', textMuted: '#64748b',
    inputBg: '#1e293b', inputBorder: '#475569',
    navActive: '#1e1b4b', navActiveText: '#a5b4fc', navInactive: 'transparent', navInactiveText: '#cbd5e1',
    headerBg: '#1e293b', sidebarBg: '#1e293b',
    modalBg: '#1e293b', modalOverlay: 'rgba(0,0,0,0.75)',
    tableHeaderBg: '#1e293b', tableRowHover: '#334155', tableBorder: '#334155',
    cardBg: '#1e293b', cardBorder: '#334155', statCardBg: '#1e293b',
    bannerBg: 'rgba(30,41,59,0.92)',
    dropdownBg: '#1e293b', dropdownHover: '#1e1b4b', dropdownHoverText: '#a5b4fc',
    btnSecondaryBg: '#334155', btnSecondaryBorder: '#475569', btnSecondaryText: '#e2e8f0', btnSecondaryHover: '#475569',
    contentBgOpacity: 0.08,
    sectionBg: '#1e293b', sectionBorder: '#334155', divider: '#334155',
    iconBg: '#1e1b4b', iconColor: '#a5b4fc',
    maintenanceBg: '#451a03', maintenanceBorder: '#78350f', maintenanceText: '#fbbf24',
    availableBg: '#052e16', availableBorder: '#14532d', availableText: '#4ade80',
    occupiedBg: '#450a0a', occupiedBorder: '#7f1d1d', occupiedText: '#fca5a5',
    infoBg: '#1e1b4b', infoBorder: '#312e81', infoText: '#a5b4fc',
    successBg: '#052e16', successBorder: '#14532d', successText: '#4ade80',
    warningBg: '#451a03', warningBorder: '#78350f', warningText: '#fbbf24',
    bannerTitle: '#a5b4fc', bannerSubtitle: '#94a3b8',
    tabActiveBg: '#4f46e5', tabActiveText: '#ffffff', tabInactiveBg: '#334155', tabInactiveText: '#cbd5e1',
    tabInactiveHover: '#475569',
  }
};

const createStyles = (theme) => ({
  app: { display: 'flex', minHeight: '100vh', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", color: theme.text, backgroundColor: theme.bg, transition: 'background-color 0.3s ease, color 0.3s ease' },
  sidebar: { width: '260px', backgroundColor: theme.sidebarBg, borderRight: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 100, transition: 'transform 0.2s ease, background-color 0.3s ease' },
  sidebarMobile: { transform: 'translateX(-100%)' },
  sidebarOpen: { transform: 'translateX(0)' },
  sidebarHeader: { padding: '16px 10px', borderBottom: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  sidebarLogo: { width: '220px', height: 'auto', objectFit: 'contain' },
  nav: { flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: '4px' },
  navItem: (isActive) => ({ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '8px', fontSize: '14px', fontWeight: 500, border: 'none', cursor: 'pointer', transition: 'all 0.15s', backgroundColor: isActive ? theme.navActive : theme.navInactive, color: isActive ? theme.navActiveText : theme.navInactiveText, textAlign: 'left' }),
  main: { flex: 1, marginLeft: '260px', display: 'flex', flexDirection: 'column', minWidth: 0 },
  mainNoSidebar: { marginLeft: 0 },
  header: { backgroundColor: theme.headerBg, borderBottom: `1px solid ${theme.border}`, padding: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50, transition: 'background-color 0.3s ease' },
  headerInstitution: { display: 'flex', alignItems: 'center', gap: '6px' },
  headerInstitutionLogo: { height: '32px', width: 'auto', objectFit: 'contain' },
  content: { flex: 1, padding: '24px 32px', overflowY: 'auto', position: 'relative' },
  contentBg: { position: 'absolute', inset: 0, backgroundImage: `url(${IPGKPP_BG})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: theme.contentBgOpacity, pointerEvents: 'none', zIndex: 0 },
  contentInner: { position: 'relative', zIndex: 1 },
  hamburger: { padding: '8px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: theme.textSecondary, borderRadius: '8px', display: 'none' },
  userMenuContainer: { position: 'relative' },
  userMenuBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', border: `1px solid ${theme.border}`, borderRadius: '8px', backgroundColor: theme.surface, cursor: 'pointer', color: theme.textSecondary, transition: 'all 0.15s' },
  userAvatar: (size = 32) => ({ width: size, height: size, borderRadius: '50%', objectFit: 'cover', backgroundColor: theme.border, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }),
  avatarPlaceholder: (size = 32) => ({ width: size, height: size, borderRadius: '50%', backgroundColor: theme.border, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.textMuted, flexShrink: 0 }),
  dropdown: { position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: '224px', backgroundColor: theme.dropdownBg, borderRadius: '12px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.25)', border: `1px solid ${theme.border}`, padding: '8px', zIndex: 200 },
  dropdownItem: { width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', fontSize: '14px', border: 'none', cursor: 'pointer', backgroundColor: 'transparent', color: theme.text, textAlign: 'left', transition: 'all 0.15s' },
  dropdownLogout: { color: '#f87171' },
  divider: { height: '1px', backgroundColor: theme.divider, margin: '8px 0' },
  modal: { position: 'fixed', inset: 0, backgroundColor: theme.modalOverlay, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' },
  modalContent: { backgroundColor: theme.modalBg, borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)', width: '100%', maxWidth: '448px', overflow: 'hidden' },
  modalContentLarge: { backgroundColor: theme.modalBg, borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)', width: '100%', maxWidth: '640px', overflow: 'hidden', maxHeight: '90vh' },
  modalContentXLarge: { backgroundColor: theme.modalBg, borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)', width: '100%', maxWidth: '900px', overflow: 'hidden', maxHeight: '90vh' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: `1px solid ${theme.border}` },
  modalBody: { padding: '20px', overflowY: 'auto', maxHeight: 'calc(90vh - 70px)' },
  input: { width: '100%', padding: '10px 16px', border: `1px solid ${theme.inputBorder}`, borderRadius: '8px', fontSize: '14px', outline: 'none', transition: 'border-color 0.15s, background-color 0.3s', boxSizing: 'border-box', backgroundColor: theme.inputBg, color: theme.text },
  btnPrimary: { width: '100%', padding: '10px 16px', backgroundColor: '#4f46e5', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'background-color 0.15s' },
  btnSecondary: { padding: '8px 16px', backgroundColor: theme.btnSecondaryBg, color: theme.btnSecondaryText, border: `1px solid ${theme.btnSecondaryBorder}`, borderRadius: '8px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: '6px' },
  btnDanger: { padding: '6px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: '#f87171', borderRadius: '6px' },
  badge: (status) => {
    const colors = {
      Pending: { bg: '#fef3c7', color: '#92400e', border: '#fde68a' },
      Arrived: { bg: '#dbeafe', color: '#1e40af', border: '#bfdbfe' },
      Collected: { bg: '#d1fae5', color: '#065f46', border: '#a7f3d0' },
      Overdue: { bg: '#fee2e2', color: '#991b1b', border: '#fecaca' },
      Maintenance: { bg: theme.maintenanceBg, color: theme.maintenanceText, border: theme.maintenanceBorder }
    };
    const c = colors[status] || colors.Pending;
    return { display: 'inline-flex', padding: '4px 10px', borderRadius: '9999px', fontSize: '12px', fontWeight: 600, backgroundColor: c.bg, color: c.color, border: `1px solid ${c.border}` };
  },
  card: { backgroundColor: theme.cardBg, borderRadius: '12px', border: `1px solid ${theme.cardBorder}`, overflow: 'hidden', position: 'relative', zIndex: 1, transition: 'background-color 0.3s ease, border-color 0.3s ease' },
  statCard: { backgroundColor: theme.statCardBg, padding: '16px', borderRadius: '12px', border: `1px solid ${theme.cardBorder}`, position: 'relative', zIndex: 1, transition: 'background-color 0.3s ease' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '14px' },
  th: { padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: theme.textSecondary, backgroundColor: theme.tableHeaderBg, borderBottom: `1px solid ${theme.border}`, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' },
  td: { padding: '12px 16px', borderBottom: `1px solid ${theme.tableBorder}`, color: theme.text },
  pagination: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px', paddingTop: '16px', borderTop: `1px solid ${theme.border}`, position: 'relative', zIndex: 1 },
  pageBtn: (active) => ({ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', border: active ? 'none' : `1px solid ${theme.border}`, backgroundColor: active ? '#4f46e5' : theme.surface, color: active ? '#ffffff' : theme.text, fontSize: '14px', fontWeight: 500, cursor: 'pointer' }),
  overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 99 },
  pageBanner: { position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 20px', marginBottom: '20px', backgroundColor: theme.bannerBg, borderRadius: '12px', border: `1px solid ${theme.border}`, backdropFilter: 'blur(8px)', transition: 'background-color 0.3s ease' },
  bannerLogo: { height: '48px', width: 'auto', objectFit: 'contain' },
  bannerText: { display: 'flex', flexDirection: 'column' },
  bannerTitle: { fontSize: '14px', fontWeight: 700, color: theme.bannerTitle, margin: 0, letterSpacing: '0.025em' },
  bannerSubtitle: { fontSize: '10px', color: theme.bannerSubtitle, margin: 0, marginTop: '2px' },
  scannerContainer: { width: '100%', maxWidth: '400px', margin: '0 auto', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#000', position: 'relative' },
  scannerOverlay: { position: 'absolute', inset: 0, border: '3px solid #4f46e5', borderRadius: '12px', pointerEvents: 'none' },
  scannerLine: { position: 'absolute', left: '10%', right: '10%', height: '2px', backgroundColor: '#4f46e5', boxShadow: '0 0 10px #4f46e5', animation: 'scanline 2s ease-in-out infinite' },
  scanSuccess: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', backgroundColor: theme.successBg, border: `1px solid ${theme.successBorder}`, borderRadius: '8px', color: theme.successText, fontSize: '14px', fontWeight: 500, marginTop: '12px' },
  profilePicUpload: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '20px' },
  profilePicPreview: { width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', backgroundColor: theme.border, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: `3px solid ${theme.border}`, transition: 'border-color 0.2s' },
  profilePicPlaceholder: { width: '100px', height: '100px', borderRadius: '50%', backgroundColor: theme.border, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.textMuted, border: `3px dashed ${theme.borderStrong}` },
  uploadBtn: { padding: '8px 20px', backgroundColor: theme.inputBg, color: '#4f46e5', border: `1px solid #4f46e5`, borderRadius: '8px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: '6px' },
  removePicBtn: { padding: '6px 12px', backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', transition: 'all 0.15s' },
  themeToggle: { padding: '8px', border: `1px solid ${theme.border}`, borderRadius: '8px', backgroundColor: theme.btnSecondaryBg, cursor: 'pointer', color: theme.textSecondary, transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  themeToggleHover: { backgroundColor: theme.btnSecondaryHover },
});

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const d = new Date(dateString);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

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

// ===== UNIVERSAL BARCODE/QR SCANNER - WORKS WITHOUT HTTPS =====
// Supports 4 modes: Live Camera (HTTPS/localhost), Image Upload, Manual Input, Clipboard Paste
function UniversalScanner({ onScan, onClose, theme, mode: initialMode = 'auto' }) {
  const scannerRef = useRef(null);
  const qrInstanceRef = useRef(null);
  const fileInputRef = useRef(null);
  const manualInputRef = useRef(null);
  const [scannerContainerId] = useState(() => `barcode-scanner-container-${Date.now()}`);

  const [activeMode, setActiveMode] = useState('auto'); // auto, camera, image, manual, clipboard
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanned, setLastScanned] = useState('');
  const [error, setError] = useState('');
  const [isLibraryLoaded, setIsLibraryLoaded] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [hasCamera, setHasCamera] = useState(null); // null = checking, true, false
  const [manualInput, setManualInput] = useState('');
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [clipboardSupported, setClipboardSupported] = useState(false);
  const [pasteSuccess, setPasteSuccess] = useState('');

  const scanTimeoutRef = useRef(null);
  const isUnmountingRef = useRef(false);

  const styles = createStyles(theme);
  const isSecureContext = typeof window !== 'undefined' && window.isSecureContext;
  const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname === '');

  // Check if camera is available
  const checkCameraAvailability = async () => {
    if (!isSecureContext && !isLocalhost) {
      setHasCamera(false);
      return false;
    }
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      setHasCamera(false);
      return false;
    }
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(d => d.kind === 'videoinput');
      setHasCamera(cameras.length > 0);
      return cameras.length > 0;
    } catch (err) {
      setHasCamera(false);
      return false;
    }
  };

  // Check clipboard support
  useEffect(() => {
    setClipboardSupported(!!navigator.clipboard && !!navigator.clipboard.readText);
  }, []);

  // Load html5-qrcode library
  useEffect(() => {
    if (window.Html5Qrcode) { setIsLibraryLoaded(true); checkCameraAvailability(); return; }
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js';
    script.async = true;
    script.onload = () => { setIsLibraryLoaded(true); checkCameraAvailability(); };
    script.onerror = () => setError('Failed to load scanner library. Please check your internet connection.');
    document.head.appendChild(script);
    return () => { if (document.head.contains(script)) document.head.removeChild(script); };
  }, []);

  // Auto-detect best mode on mount
  useEffect(() => {
    if (initialMode === 'auto') {
      if (isSecureContext || isLocalhost) {
        checkCameraAvailability().then(hasCam => {
          if (hasCam) setActiveMode('camera');
          else setActiveMode('manual');
        });
      } else {
        setActiveMode('manual');
      }
    } else {
      setActiveMode(initialMode);
    }
  }, [initialMode, isSecureContext, isLocalhost]);

  const safeStopScanner = async () => {
    if (!isUnmountingRef.current) setIsStarting(true);
    try {
      if (qrInstanceRef.current) {
        const instance = qrInstanceRef.current;
        qrInstanceRef.current = null;
        try {
          const isRunning = typeof instance.isScanning === 'boolean'
            ? instance.isScanning
            : typeof instance.isScanning === 'function'
              ? instance.isScanning()
              : true;
          if (isRunning) await instance.stop();
        } catch (error) {
          console.warn('Scanner stop skipped:', error);
        }
        try { await instance.clear(); } catch (error) { console.warn('Scanner clear skipped:', error); }
      }
    } catch (error) {
      console.warn('Scanner cleanup failed:', error);
    } finally {
      if (!isUnmountingRef.current) {
        setIsStarting(false);
        setIsScanning(false);
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isUnmountingRef.current = true;
      if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
      safeStopScanner();
    };
  }, []);

  const startCameraScanner = async () => {
    if (!scannerRef.current || !isLibraryLoaded) return;
    if (isStarting) return;

    setError('');
    setIsStarting(true);
    setLastScanned('');
    await safeStopScanner();

    try {
      const instance = new window.Html5Qrcode(scannerContainerId);
      qrInstanceRef.current = instance;
      const config = { fps: 10, qrbox: { width: 250, height: 150 }, aspectRatio: 1.0, disableFlip: false };
      await instance.start({ facingMode: "environment" }, config, (decodedText) => {
        if (isUnmountingRef.current) return;
        if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
        setLastScanned(decodedText);
        setIsScanning(false);
        setIsStarting(false);
        safeStopScanner().then(() => {
          scanTimeoutRef.current = setTimeout(() => { if (!isUnmountingRef.current) onScan(decodedText); }, 500);
        });
      }, () => {});
      setIsScanning(true);
    } catch (err) {
      console.error('Scanner start error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Camera permission denied. Please allow camera access in your browser settings.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError('No camera found on this device.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setError('Camera is already in use by another application.');
      } else {
        setError(`Camera error: ${err.message || 'Unknown error'}. Try another scan mode.`);
      }
      setIsScanning(false);
    } finally { setIsStarting(false); }
  };

  const stopCameraScanner = async () => { await safeStopScanner(); };

  // Scan from uploaded image file
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Please select an image file (JPG, PNG, GIF)'); return; }
    if (file.size > 5 * 1024 * 1024) { setError('Image size must be less than 5MB'); return; }

    setIsProcessingImage(true);
    setError('');
    setLastScanned('');

    try {
      if (!window.Html5Qrcode) {
        setError('Scanner library not loaded. Please wait or refresh.');
        setIsProcessingImage(false);
        return;
      }

      const tempInstance = new window.Html5Qrcode(`image-scanner-${Date.now()}`, { verbose: false });
      const decodedText = await tempInstance.scanFile(file, true);
      
      if (decodedText) {
        setLastScanned(decodedText);
        scanTimeoutRef.current = setTimeout(() => { onScan(decodedText); }, 800);
      } else {
        setError('No barcode/QR code detected in this image. Please try a clearer image.');
      }
    } catch (err) {
      console.error('Image scan error:', err);
      setError('Failed to scan image. Make sure it contains a clear barcode or QR code.');
    } finally {
      setIsProcessingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Handle manual input submission
  const handleManualSubmit = (e) => {
    if (e) e.preventDefault();
    const trimmed = manualInput.trim();
    if (!trimmed) { setError('Please enter a tracking number'); return; }
    setLastScanned(trimmed);
    setError('');
    scanTimeoutRef.current = setTimeout(() => { onScan(trimmed); }, 300);
  };

  // Handle clipboard paste
  const handlePasteFromClipboard = async () => {
    setError('');
    try {
      if (!navigator.clipboard || !navigator.clipboard.readText) {
        setError('Clipboard access not supported in this browser.');
        return;
      }
      const text = await navigator.clipboard.readText();
      if (text && text.trim()) {
        const trimmed = text.trim();
        setManualInput(trimmed);
        setLastScanned(trimmed);
        setPasteSuccess(`Pasted: "${trimmed}"`);
        setError('');
        scanTimeoutRef.current = setTimeout(() => { onScan(trimmed); }, 500);
      } else {
        setError('Clipboard is empty or does not contain text.');
      }
    } catch (err) {
      console.error('Clipboard error:', err);
      setError('Failed to read clipboard. Please allow clipboard access or use manual input.');
    }
  };

  const modes = [
    { id: 'camera', label: 'Live Camera', icon: Icons.Camera, available: (isSecureContext || isLocalhost) && hasCamera !== false },
    { id: 'image', label: 'Upload Image', icon: Icons.FileImage, available: true },
    { id: 'manual', label: 'Manual Input', icon: Icons.Keyboard, available: true },
    { id: 'clipboard', label: 'Paste', icon: Icons.Clipboard, available: clipboardSupported },
  ];

  const availableModes = modes.filter(m => m.available);

  return (
    <Modal title="Scan Barcode / QR Code" onClose={onClose} large theme={theme}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Security notice */}
        {!isSecureContext && !isLocalhost && (
          <div style={{ padding: '12px 16px', backgroundColor: theme.warningBg, border: `1px solid ${theme.warningBorder}`, borderRadius: '8px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <Icons.AlertTriangle width={20} height={20} style={{ color: '#d97706', flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '13px', color: theme.warningText }}>
              <p style={{ margin: 0, fontWeight: 600 }}>Non-HTTPS Connection Detected</p>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px' }}>Live camera requires HTTPS. Use <strong>Image Upload</strong>, <strong>Manual Input</strong>, or <strong>Paste</strong> mode instead. All modes work without HTTPS!</p>
            </div>
          </div>
        )}

        {/* Mode Tabs */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', borderBottom: `1px solid ${theme.border}`, paddingBottom: '12px' }}>
          {availableModes.map(mode => {
            const Icon = mode.icon;
            const isActive = activeMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => { setActiveMode(mode.id); setError(''); if (mode.id !== 'camera') safeStopScanner(); }}
                style={{
                  flex: '1 1 auto',
                  minWidth: '100px',
                  padding: '10px 12px',
                  backgroundColor: isActive ? theme.tabActiveBg : theme.tabInactiveBg,
                  color: isActive ? theme.tabActiveText : theme.tabInactiveText,
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.15s',
                }}
                onMouseOver={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = theme.tabInactiveHover; }}
                onMouseOut={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = theme.tabInactiveBg; }}
              >
                <Icon width={16} height={16} />
                {mode.label}
              </button>
            );
          })}
        </div>

        {/* CAMERA MODE */}
        {activeMode === 'camera' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {hasCamera === false ? (
              <div style={{ textAlign: 'center', padding: '30px', color: theme.textSecondary }}>
                <Icons.Camera width={48} height={48} style={{ marginBottom: '12px', opacity: 0.4 }} />
                <p style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600 }}>No Camera Available</p>
                <p style={{ margin: 0, fontSize: '12px' }}>Your device doesn't have a camera or camera access is blocked.</p>
                <button onClick={() => setActiveMode('image')} style={{ ...styles.btnPrimary, maxWidth: '220px', margin: '16px auto 0', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <Icons.FileImage width={16} height={16} />Try Image Upload Instead
                </button>
              </div>
            ) : !isLibraryLoaded ? (
              <div style={{ textAlign: 'center', padding: '40px', color: theme.textSecondary }}>
                <div style={{ width: '40px', height: '40px', border: `3px solid ${theme.border}`, borderTop: '3px solid #4f46e5', borderRadius: '50%', margin: '0 auto 12px', animation: 'spin 1s linear infinite' }}></div>
                <p style={{ margin: 0, fontSize: '14px' }}>Loading scanner library...</p>
              </div>
            ) : error ? (
              <div style={{ textAlign: 'center', padding: '30px' }}>
                <Icons.AlertTriangle width={48} height={48} style={{ color: '#dc2626', marginBottom: '12px' }} />
                <p style={{ color: '#dc2626', fontSize: '14px', margin: '0 0 8px 0', fontWeight: 600 }}>{error}</p>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '12px' }}>
                  <button onClick={startCameraScanner} style={{ ...styles.btnPrimary, maxWidth: '180px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><Icons.RefreshCw width={16} height={16} />Retry Camera</button>
                  <button onClick={() => setActiveMode('image')} style={{ ...styles.btnPrimary, maxWidth: '200px', backgroundColor: styles.btnSecondaryBg, color: styles.btnSecondaryText, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><Icons.FileImage width={16} height={16} />Use Image Upload</button>
                </div>
              </div>
            ) : (
              <>
                <div style={styles.scannerContainer}>
                  <div id={scannerContainerId} ref={scannerRef} style={{ width: '100%', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.textSecondary, fontSize: '13px' }}>
                    {!isScanning && !isStarting && 'Camera preview will appear here'}
                  </div>
                  {isScanning && (<><div style={styles.scannerOverlay}></div><div style={styles.scannerLine}></div></>)}
                </div>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  {!isScanning && !isStarting && (<button onClick={startCameraScanner} style={{ ...styles.btnPrimary, maxWidth: '220px', backgroundColor: '#16a34a', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><Icons.Play width={16} height={16} />Start Camera</button>)}
                  {isScanning && (<button onClick={stopCameraScanner} style={{ ...styles.btnPrimary, maxWidth: '220px', backgroundColor: '#dc2626', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><Icons.Stop width={16} height={16} />Stop Camera</button>)}
                  {isStarting && (<div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', color: theme.textSecondary, fontSize: '13px' }}><div style={{ width: '16px', height: '16px', border: `2px solid ${theme.border}`, borderTop: '2px solid #4f46e5', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div><span>Initializing camera...</span></div>)}
                </div>
                {isScanning && (<div style={{ textAlign: 'center', padding: '12px', backgroundColor: theme.infoBg, borderRadius: '8px', border: `1px solid ${theme.infoBorder}` }}><p style={{ margin: 0, fontSize: '13px', color: theme.infoText, fontWeight: 500 }}> Camera active — Point at barcode/QR code</p><p style={{ margin: '4px 0 0 0', fontSize: '11px', color: theme.textSecondary }}>System will auto-detect and process</p></div>)}
              </>
            )}
          </div>
        )}

        {/* IMAGE UPLOAD MODE */}
        {activeMode === 'image' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ textAlign: 'center', padding: '8px', color: theme.textSecondary, fontSize: '13px' }}>
              <p style={{ margin: 0 }}>Upload a photo of the barcode or QR code from your device gallery</p>
            </div>
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                padding: '32px 20px',
                border: `2px dashed ${theme.borderStrong}`,
                borderRadius: '12px',
                textAlign: 'center',
                cursor: 'pointer',
                backgroundColor: theme.sectionBg,
                transition: 'all 0.2s',
              }}
              onMouseOver={(e) => { e.currentTarget.style.borderColor = '#4f46e5'; e.currentTarget.style.backgroundColor = theme.iconBg; }}
              onMouseOut={(e) => { e.currentTarget.style.borderColor = theme.borderStrong; e.currentTarget.style.backgroundColor = theme.sectionBg; }}
            >
              {isProcessingImage ? (
                <div>
                  <div style={{ width: '48px', height: '48px', border: `3px solid ${theme.border}`, borderTop: '3px solid #4f46e5', borderRadius: '50%', margin: '0 auto 12px', animation: 'spin 1s linear infinite' }}></div>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: theme.text }}>Scanning image...</p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: theme.textSecondary }}>Detecting barcode/QR code</p>
                </div>
              ) : (
                <div>
                  <Icons.FileImage width={48} height={48} style={{ color: '#4f46e5', marginBottom: '12px' }} />
                  <p style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: theme.text }}>Click to upload image</p>
                  <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: theme.textSecondary }}>Supports JPG, PNG, GIF • Max 5MB</p>
                  <p style={{ margin: '8px 0 0 0', fontSize: '11px', color: theme.textMuted }}>💡 Works on any connection — no HTTPS required!</p>
                </div>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
            {error && <div style={{ padding: '10px 14px', backgroundColor: '#fee2e2', border: '1px solid #fecaca', borderRadius: '8px', color: '#991b1b', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}><Icons.AlertTriangle width={16} height={16} />{error}</div>}
            {lastScanned && (<div style={styles.scanSuccess}><Icons.CheckCircle width={20} height={20} /><span>Code detected: <strong>{lastScanned}</strong> — Processing...</span></div>)}
          </div>
        )}

        {/* MANUAL INPUT MODE */}
        {activeMode === 'manual' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ textAlign: 'center', padding: '8px', color: theme.textSecondary, fontSize: '13px' }}>
              <p style={{ margin: 0 }}>Type or paste the tracking number directly</p>
            </div>
            <form onSubmit={handleManualSubmit}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  ref={manualInputRef}
                  value={manualInput}
                  onChange={(e) => { setManualInput(e.target.value); setError(''); }}
                  placeholder="Enter tracking number (e.g. PKG-8821X)"
                  style={{ ...styles.input, fontFamily: 'monospace', fontSize: '16px', fontWeight: 600, letterSpacing: '0.5px' }}
                  autoFocus
                />
                <button type="submit" style={{ ...styles.btnPrimary, width: 'auto', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
                  <Icons.Check width={16} height={16} />Submit
                </button>
              </div>
            </form>
            {error && <div style={{ padding: '10px 14px', backgroundColor: '#fee2e2', border: '1px solid #fecaca', borderRadius: '8px', color: '#991b1b', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}><Icons.AlertTriangle width={16} height={16} />{error}</div>}
            <div style={{ padding: '12px', backgroundColor: theme.infoBg, borderRadius: '8px', border: `1px solid ${theme.infoBorder}`, fontSize: '12px', color: theme.infoText }}>
              <p style={{ margin: 0, fontWeight: 600 }}>💡 Quick Tips:</p>
              <ul style={{ margin: '6px 0 0 0', paddingLeft: '20px', lineHeight: '1.6' }}>
                <li>Works on any connection (HTTP/HTTPS)</li>
                <li>Supports all barcode formats</li>
                <li>Press Enter to submit quickly</li>
              </ul>
            </div>
            {lastScanned && (<div style={styles.scanSuccess}><Icons.CheckCircle width={20} height={20} /><span>Submitted: <strong>{lastScanned}</strong> — Processing...</span></div>)}
          </div>
        )}

        {/* CLIPBOARD PASTE MODE */}
        {activeMode === 'clipboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ textAlign: 'center', padding: '8px', color: theme.textSecondary, fontSize: '13px' }}>
              <p style={{ margin: 0 }}>Paste tracking number from your clipboard</p>
            </div>
            <button onClick={handlePasteFromClipboard} style={{ ...styles.btnPrimary, padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '15px' }}>
              <Icons.Clipboard width={20} height={20} />
              Paste from Clipboard
            </button>
            {pasteSuccess && (<div style={styles.scanSuccess}><Icons.CheckCircle width={20} height={20} /><span>{pasteSuccess} — Processing...</span></div>)}
            {error && <div style={{ padding: '10px 14px', backgroundColor: '#fee2e2', border: '1px solid #fecaca', borderRadius: '8px', color: '#991b1b', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}><Icons.AlertTriangle width={16} height={16} />{error}</div>}
            <div style={{ padding: '12px', backgroundColor: theme.infoBg, borderRadius: '8px', border: `1px solid ${theme.infoBorder}`, fontSize: '12px', color: theme.infoText }}>
              <p style={{ margin: 0, fontWeight: 600 }}>📋 How to use:</p>
              <ol style={{ margin: '6px 0 0 0', paddingLeft: '20px', lineHeight: '1.6' }}>
                <li>Copy tracking number from any source</li>
                <li>Click the button above</li>
                <li>Allow clipboard access if prompted</li>
                <li>System will auto-process the code</li>
              </ol>
            </div>
            <div style={{ textAlign: 'center', color: theme.textMuted, fontSize: '12px' }}>
              <p style={{ margin: 0 }}>Or type manually: <button onClick={() => setActiveMode('manual')} style={{ background: 'none', border: 'none', color: '#4f46e5', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline' }}>Switch to Manual Input</button></p>
            </div>
          </div>
        )}

        {/* Last scanned result */}
        {lastScanned && activeMode !== 'manual' && activeMode !== 'clipboard' && (
          <div style={{ padding: '12px', backgroundColor: theme.successBg, borderRadius: '8px', border: `1px solid ${theme.successBorder}`, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Icons.CheckCircle width={20} height={20} style={{ color: '#16a34a' }} />
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: '12px', color: theme.successText, fontWeight: 600 }}>Successfully scanned:</p>
              <p style={{ margin: '2px 0 0 0', fontSize: '16px', fontWeight: 700, color: '#0f172a', fontFamily: 'monospace' }}>{lastScanned}</p>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          <button onClick={onClose} style={{ ...styles.btnPrimary, backgroundColor: styles.btnSecondaryBg, color: styles.btnSecondaryText }}>Close Scanner</button>
        </div>
      </div>
    </Modal>
  );
}

function ProfilePicUpload({ currentUser, onUpdate, onClose, theme }) {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(currentUser?.profilePic || '');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const styles = createStyles(theme);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setUploadError('Please select an image file'); return; }
    if (file.size > 2 * 1024 * 1024) { setUploadError('Image size must be less than 2MB'); return; }
    setIsUploading(true);
    setUploadError('');
    const reader = new FileReader();
    reader.onload = (event) => { setPreview(event.target.result); setIsUploading(false); onUpdate(event.target.result); };
    reader.onerror = () => { setUploadError('Failed to read image file'); setIsUploading(false); };
    reader.readAsDataURL(file);
  };

  const handleRemovePic = () => { setPreview(''); onUpdate(''); };

  return (
    <Modal title="Gambar Profil" onClose={onClose} large theme={theme}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        <p style={{ fontSize: '13px', color: theme.textSecondary, margin: 0, textAlign: 'center' }}>Muat naik gambar profil untuk memperibadikan akaun anda</p>
        <div style={styles.profilePicUpload}>
          {preview ? <img src={preview} alt="Profile" style={styles.profilePicPreview} /> : (<div style={styles.profilePicPlaceholder}><Icons.User width={40} height={40} /></div>)}
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button onClick={() => fileInputRef.current?.click()} style={styles.uploadBtn} disabled={isUploading}><Icons.Upload width={16} height={16} />{isUploading ? 'Memuat Naik...' : 'Pilih Foto'}</button>
            {preview && <button onClick={handleRemovePic} style={styles.removePicBtn}>Buang</button>}
          </div>
          {uploadError && <p style={{ color: '#dc2626', fontSize: '12px', margin: 0, textAlign: 'center' }}>{uploadError}</p>}
          <p style={{ fontSize: '11px', color: theme.textMuted, margin: 0, textAlign: 'center' }}>Format disokong: JPG, PNG, GIF • Saiz maksimum: 2MB</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', width: '100%', maxWidth: '280px' }}>
          <button onClick={onClose} style={{ ...styles.btnPrimary, backgroundColor: styles.btnSecondaryBg, color: styles.btnSecondaryText }}>Selesai</button>
        </div>
      </div>
    </Modal>
  );
}

function CollectionVerifier({ parcel, onClose, onVerify, onOpenScanner, theme }) {
  const [inputOtp, setInputOtp] = useState('');
  const [error, setError] = useState('');
  const styles = createStyles(theme);

  const handleVerify = () => {
    if (inputOtp === parcel.otp) { onVerify(parcel.id); onClose(); }
    else setError('Kod OTP tidak sah. Sila cuba lagi.');
  };

  const handleScanSuccess = (decodedText) => {
    const cleanText = decodedText.trim();
    setInputOtp(cleanText);
    setTimeout(() => {
      if (cleanText === parcel.otp) { onVerify(parcel.id); onClose(); }
      else setError('Kod QR tidak sah untuk parcel ini.');
    }, 500);
  };

  return (
    <Modal title="Pengesahan Pengambilan Parcel" onClose={onClose} large theme={theme}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ backgroundColor: styles.sectionBg, padding: '16px', borderRadius: '8px', border: `1px solid ${styles.sectionBorder}` }}>
          <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: theme.textSecondary, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Maklumat Parcel</p>
          <p style={{ margin: 0, fontWeight: 700, fontSize: '18px', color: theme.text }}>{parcel.trackingNo}</p>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: theme.text }}>Penerima: <strong>{parcel.recipient}</strong></p>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: theme.text }}>Penghantar: <strong>{parcel.sender}</strong></p>
          {parcel.rackLocation && <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: theme.text }}>Rak: <strong style={{ color: '#4f46e5' }}>{parcel.rackLocation}</strong></p>}
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: theme.text, marginBottom: '8px' }}>Masukkan Kod OTP 6-Digit atau Imbas Kod QR Pelajar</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input value={inputOtp} onChange={(e) => { setInputOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); setError(''); }} placeholder="Contoh: 123456" style={{ ...styles.input, fontFamily: 'monospace', fontSize: '20px', letterSpacing: '6px', textAlign: 'center', borderColor: error ? '#dc2626' : styles.inputBorder, fontWeight: 700 }} />
            <button type="button" onClick={() => onOpenScanner(handleScanSuccess)} style={{ ...styles.btnSecondary, padding: '10px 16px', whiteSpace: 'nowrap' }}><Icons.Camera width={18} height={18} />Imbas QR</button>
          </div>
          {error && <p style={{ color: '#dc2626', fontSize: '13px', marginTop: '8px', fontWeight: 500 }}>{error}</p>}
        </div>
        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          <button onClick={onClose} style={{ ...styles.btnPrimary, backgroundColor: styles.btnSecondaryBg, color: styles.btnSecondaryText, flex: 1 }}>Batal</button>
          <button onClick={handleVerify} style={{ ...styles.btnPrimary, backgroundColor: '#16a34a', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><Icons.CheckCircle width={18} height={18} />Sahkan & Ambil</button>
        </div>
      </div>
    </Modal>
  );
}

function SmartRackView({ racks, parcels, onShelfClick, isAdmin, onToggleMaintenance, theme }) {
  const totalShelves = racks.reduce((sum, r) => sum + r.shelves.length, 0);
  const occupiedShelves = racks.reduce((sum, r) => sum + r.shelves.filter(s => s.status === 'occupied').length, 0);
  const readyShelves = racks.reduce((sum, r) => sum + r.shelves.filter(s => s.status === 'ready').length, 0);
  const maintenanceShelves = racks.reduce((sum, r) => sum + r.shelves.filter(s => s.maintenance).length, 0);
  const emptyShelves = totalShelves - occupiedShelves - readyShelves - maintenanceShelves;
  const styles = createStyles(theme);

  const getShelfColor = (shelf) => {
    if (shelf.maintenance) return { bg: theme.maintenanceBg, border: theme.maintenanceBorder, led: '#d97706', label: 'Maintenance' };
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
            <h2 style={{ fontSize: '22px', fontWeight: 700, margin: 0 }}>Smart Rack System (Smart Shelf)</h2>
            <p style={{ margin: '4px 0 0 0', opacity: 0.9, fontSize: '14px' }}>Organized • Tracked • Real-Time Monitoring</p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
          <div style={{ backgroundColor: 'rgba(255,255,255,0.15)', padding: '12px', borderRadius: '8px' }}><p style={{ margin: 0, fontSize: '12px', opacity: 0.8 }}>Total Shelves</p><p style={{ margin: '4px 0 0 0', fontSize: '24px', fontWeight: 700 }}>{totalShelves}</p></div>
          <div style={{ backgroundColor: 'rgba(22,163,74,0.3)', padding: '12px', borderRadius: '8px' }}><p style={{ margin: 0, fontSize: '12px', opacity: 0.9 }}>🟢 Empty</p><p style={{ margin: '4px 0 0 0', fontSize: '24px', fontWeight: 700 }}>{emptyShelves}</p></div>
          <div style={{ backgroundColor: 'rgba(220,38,38,0.3)', padding: '12px', borderRadius: '8px' }}><p style={{ margin: 0, fontSize: '12px', opacity: 0.9 }}>🔴 Occupied</p><p style={{ margin: '4px 0 0 0', fontSize: '24px', fontWeight: 700 }}>{occupiedShelves}</p></div>
          <div style={{ backgroundColor: 'rgba(37,99,235,0.3)', padding: '12px', borderRadius: '8px' }}><p style={{ margin: 0, fontSize: '12px', opacity: 0.9 }}>🔵 Ready</p><p style={{ margin: '4px 0 0 0', fontSize: '24px', fontWeight: 700 }}>{readyShelves}</p></div>
          {maintenanceShelves > 0 && (<div style={{ backgroundColor: 'rgba(217,119,6,0.3)', padding: '12px', borderRadius: '8px' }}><p style={{ margin: 0, fontSize: '12px', opacity: 0.9 }}>🟠 Maintenance</p><p style={{ margin: '4px 0 0 0', fontSize: '24px', fontWeight: 700 }}>{maintenanceShelves}</p></div>)}
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        {racks.map((rack) => {
          const rackMaintenanceCount = rack.shelves.filter(s => s.maintenance).length;
          return (
            <div key={rack.id} style={{ ...styles.card, overflow: 'visible' }}>
              <div style={{ padding: '12px 16px', backgroundColor: '#1e3a8a', color: 'white', borderRadius: '12px 12px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Icons.Layers width={18} height={18} /><span style={{ fontWeight: 700, fontSize: '14px' }}>RACK {rack.letter}</span></div>
                {rackMaintenanceCount > 0 && (<span style={{ fontSize: '11px', backgroundColor: 'rgba(217,119,6,0.9)', padding: '3px 8px', borderRadius: '9999px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}><Icons.Wrench width={10} height={10} />{rackMaintenanceCount} under maintenance</span>)}
              </div>
              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', backgroundColor: styles.sectionBg }}>
                {rack.shelves.map((shelf) => {
                  const shelfInfo = getShelfColor(shelf);
                  const shelfParcel = parcels.find(p => p.id === shelf.parcelId);
                  return (
                    <div key={shelf.id} onClick={() => onShelfClick(shelf, rack.letter)} style={{ backgroundColor: shelfInfo.bg, border: `2px solid ${shelfInfo.border}`, borderRadius: '8px', padding: '12px', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', opacity: shelf.maintenance ? 0.85 : 1 }} onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; }} onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '14px', height: '14px', borderRadius: '50%', backgroundColor: shelfInfo.led, boxShadow: `0 0 10px ${shelfInfo.led}`, animation: (shelf.status !== 'empty' && !shelf.maintenance) ? 'pulse 2s infinite' : 'none', flexShrink: 0 }} />
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: theme.text }}>{shelf.id}</p>{shelf.maintenance && <Icons.Wrench width={14} height={14} style={{ color: '#d97706' }} />}</div>
                          {shelfParcel && <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: theme.textSecondary }}>{shelfParcel.trackingNo}</p>}
                          {shelf.maintenance && shelf.maintenanceReason && <p style={{ margin: '2px 0 0 0', fontSize: '10px', color: theme.maintenanceText, fontStyle: 'italic' }}>{shelf.maintenanceReason}</p>}
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                        <span style={{ fontSize: '10px', fontWeight: 600, color: shelfInfo.led, textTransform: 'uppercase' }}>{shelfInfo.label}</span>
                        {shelf.weight > 0 && <span style={{ fontSize: '10px', color: theme.textSecondary, display: 'flex', alignItems: 'center', gap: '4px' }}><Icons.Scale width={10} height={10} />{shelf.weight}kg</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
              {isAdmin && (
                <div style={{ padding: '12px 16px', borderTop: `1px solid ${theme.border}`, backgroundColor: styles.cardBg, borderRadius: '0 0 12px 12px' }}>
                  <button onClick={(e) => { e.stopPropagation(); onToggleMaintenance(rack.letter, null); }} style={{ width: '100%', padding: '8px', backgroundColor: rackMaintenanceCount > 0 ? theme.availableBg : theme.maintenanceBg, color: rackMaintenanceCount > 0 ? theme.availableText : theme.maintenanceText, border: `1px solid ${rackMaintenanceCount > 0 ? theme.availableBorder : theme.maintenanceBorder}`, borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    {rackMaintenanceCount > 0 ? <><Icons.Check width={14} height={14} />Mark All as Available</> : <><Icons.Wrench width={14} height={14} />Set Entire Rack to Maintenance</>}
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
    </div>
  );
}

function ShelfDetailModal({ shelf, rackLetter, parcel, onClose, isAdmin, onToggleMaintenance, theme }) {
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

function RackMaintenanceModal({ rackLetter, shelves, onClose, onToggleShelf, onToggleAll, parcels, theme }) {
  const [filter, setFilter] = useState('all');
  const styles = createStyles(theme);
  const filteredShelves = shelves.filter(s => {
    if (filter === 'maintenance') return s.maintenance;
    if (filter === 'available') return !s.maintenance;
    return true;
  });

  const maintenanceCount = shelves.filter(s => s.maintenance).length;
  const availableCount = shelves.filter(s => !s.maintenance).length;

  return (
    <Modal title={`Rack ${rackLetter} — Maintenance Management`} onClose={onClose} xlarge theme={theme}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '120px', padding: '12px', backgroundColor: theme.maintenanceBg, borderRadius: '8px', border: `1px solid ${theme.maintenanceBorder}` }}><p style={{ margin: 0, fontSize: '11px', color: theme.maintenanceText, fontWeight: 600, textTransform: 'uppercase' }}>Under Maintenance</p><p style={{ margin: '4px 0 0 0', fontSize: '24px', fontWeight: 700, color: theme.maintenanceText }}>{maintenanceCount}</p></div>
          <div style={{ flex: 1, minWidth: '120px', padding: '12px', backgroundColor: theme.availableBg, borderRadius: '8px', border: `1px solid ${theme.availableBorder}` }}><p style={{ margin: 0, fontSize: '11px', color: theme.availableText, fontWeight: 600, textTransform: 'uppercase' }}>Available</p><p style={{ margin: '4px 0 0 0', fontSize: '24px', fontWeight: 700, color: theme.availableText }}>{availableCount}</p></div>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={() => onToggleAll(false)} style={{ ...styles.btnSecondary, flex: 1 }} onMouseOver={(e) => { e.currentTarget.style.backgroundColor = theme.availableBg; e.currentTarget.style.color = theme.availableText; e.currentTarget.style.borderColor = theme.availableBorder; }} onMouseOut={(e) => { e.currentTarget.style.backgroundColor = styles.btnSecondaryBg; e.currentTarget.style.color = styles.btnSecondaryText; e.currentTarget.style.borderColor = styles.btnSecondaryBorder; }}><Icons.Check width={16} height={16} />Mark All Available</button>
          <button onClick={() => onToggleAll(true)} style={{ ...styles.btnSecondary, flex: 1 }} onMouseOver={(e) => { e.currentTarget.style.backgroundColor = theme.maintenanceBg; e.currentTarget.style.color = theme.maintenanceText; e.currentTarget.style.borderColor = theme.maintenanceBorder; }} onMouseOut={(e) => { e.currentTarget.style.backgroundColor = styles.btnSecondaryBg; e.currentTarget.style.color = styles.btnSecondaryText; e.currentTarget.style.borderColor = styles.btnSecondaryBorder; }}><Icons.Wrench width={16} height={16} />Mark All Maintenance</button>
        </div>

        <div style={{ display: 'flex', gap: '8px', borderBottom: `1px solid ${theme.border}`, paddingBottom: '12px' }}>
          {['all', 'maintenance', 'available'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: '6px 14px', backgroundColor: filter === f ? '#4f46e5' : styles.btnSecondaryBg, color: filter === f ? '#ffffff' : theme.text, border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize' }}>{f} {f === 'all' ? `(${shelves.length})` : f === 'maintenance' ? `(${maintenanceCount})` : `(${availableCount})`}</button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '10px', maxHeight: '400px', overflowY: 'auto' }}>
          {filteredShelves.map(shelf => {
            const parcel = parcels.find(p => p.id === shelf.parcelId);
            return (
              <div key={shelf.id} style={{ padding: '12px', backgroundColor: shelf.maintenance ? theme.maintenanceBg : theme.availableBg, border: `1px solid ${shelf.maintenance ? theme.maintenanceBorder : theme.availableBorder}`, borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: '14px', color: theme.text }}>{shelf.id}</span>
                  <span style={{ fontSize: '10px', fontWeight: 600, color: shelf.maintenance ? theme.maintenanceText : theme.availableText, textTransform: 'uppercase', padding: '2px 8px', borderRadius: '9999px', backgroundColor: shelf.maintenance ? theme.maintenanceBorder : theme.availableBorder }}>
                    {shelf.maintenance ? 'Maintenance' : 'Available'}
                  </span>
                </div>
                {shelf.maintenance && shelf.maintenanceReason && <p style={{ margin: 0, fontSize: '11px', color: theme.maintenanceText, fontStyle: 'italic' }}>{shelf.maintenanceReason}</p>}
                {parcel && <p style={{ margin: 0, fontSize: '11px', color: theme.textSecondary }}>Contains: {parcel.trackingNo}</p>}
                <button onClick={() => onToggleShelf(shelf.id)} style={{ padding: '6px', backgroundColor: shelf.maintenance ? '#16a34a' : '#d97706', color: 'white', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  {shelf.maintenance ? <><Icons.Check width={12} height={12} />Set Available</> : <><Icons.Wrench width={12} height={12} />Set Maintenance</>}
                </button>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={onClose} style={{ ...styles.btnPrimary, backgroundColor: styles.btnSecondaryBg, color: styles.btnSecondaryText }}>Close</button>
        </div>
      </div>
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
  const [selectedShelf, setSelectedShelf] = useState(null);
  const [maintenanceModal, setMaintenanceModal] = useState(null);
  const [cloudSession, setCloudSession] = useState(null);
  const [cloudReady, setCloudReady] = useState(!isCloudConfigured);
  const [cloudSchemaMissing, setCloudSchemaMissing] = useState(false);
  const cloudPollRef = useRef(null);
  const cloudHydratingRef = useRef(false);

  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.THEME);
      if (saved === 'dark' || saved === 'light') return saved;
    } catch {}
    return 'light';
  });

  const themeObj = THEMES[theme] || THEMES.light;
  const styles = createStyles(themeObj);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    try { localStorage.setItem(STORAGE_KEYS.THEME, newTheme); } catch {}
  };

  const menuRef = useRef(null);
  const parcelsRef = useRef([]);

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
      ]);

      const profiles = results[0].status === 'fulfilled' ? results[0].value : [];
      const cloudParcels = results[1].status === 'fulfilled' ? results[1].value : DEFAULT_PARCELS;
      const cloudRacks = results[2].status === 'fulfilled' ? results[2].value : DEFAULT_RACKS;

      cloudHydratingRef.current = true;
      setCloudSession(activeSession || null);
      setUsers(profiles);
      setParcels(Array.isArray(cloudParcels) ? cloudParcels : DEFAULT_PARCELS);
      setRacks(normalizeRacks(cloudRacks));

      if (activeSession?.user?.email) {
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

  useEffect(() => {
    if (isCloudConfigured) return;
    try { localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users)); } catch (e) {}
  }, [users]);

  useEffect(() => {
    if (!isCloudConfigured) {
      try { localStorage.setItem(STORAGE_KEYS.PARCELS, JSON.stringify(parcels)); } catch (e) {}
    }
  }, [parcels]);

  useEffect(() => {
    if (!isCloudConfigured) {
      try { localStorage.setItem(STORAGE_KEYS.RACKS, JSON.stringify(racks)); } catch (e) {}
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
    } catch {}
  }, []);

  useEffect(() => {
    if (isCloudConfigured) return;
    if (user) { try { localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(user)); } catch {} }
    else { try { localStorage.removeItem(STORAGE_KEYS.SESSION); } catch {} }
  }, [user]);

  useEffect(() => { const timer = setInterval(() => setCurrentTime(new Date()), 1000); return () => clearInterval(timer); }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setUserMenuOpen(false); };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (activeModal || verifyParcel || scannerOpen || picModalOpen || selectedShelf || maintenanceModal) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
  }, [activeModal, verifyParcel, scannerOpen, picModalOpen, selectedShelf, maintenanceModal]);

  const showNotification = (message) => { setNotification(message); setTimeout(() => setNotification(null), 5000); };

  const handleLogin = async (username, password) => {
    if (isCloudConfigured) {
      try {
        const { session, user: loggedUser } = await signInCloudUser(username, password);
        setCloudSession(session);
        setUser(loggedUser);
        setProfileForm({ name: loggedUser.name, email: loggedUser.email, phone: loggedUser.phone || '', address: '' });
        setView('dashboard');
        await loadCloudData(session);
      } catch (error) {
        console.error('Cloud login failed:', error);
        alert('Invalid credentials or cloud account not found.');
      }
      return;
    }

    const found = users.find(u => u.username === username && u.password === password);
    if (found) { const loggedUser = { ...found, lastLogin: new Date().toISOString() }; setUser(loggedUser); setProfileForm({ name: found.name, email: found.email, phone: found.phone || '', address: '' }); setView('dashboard'); }
    else alert('Invalid credentials');
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

  const handleToggleMaintenance = (rackLetter, shelfId, reason = '') => {
    setRacks(prev => prev.map(r => {
      if (r.letter !== rackLetter) return r;
      if (shelfId === null) {
        const allMaintenance = r.shelves.every(s => s.maintenance);
        const updatedShelves = r.shelves.map(s => ({ ...s, maintenance: !allMaintenance, maintenanceReason: !allMaintenance ? reason || 'Rack-wide maintenance' : '', maintenanceDate: !allMaintenance ? new Date().toISOString() : null }));
        return { ...r, shelves: updatedShelves };
      } else {
        return { ...r, shelves: r.shelves.map(s => { if (s.id !== shelfId) return s; return { ...s, maintenance: !s.maintenance, maintenanceReason: !s.maintenance ? reason : '', maintenanceDate: !s.maintenance ? new Date().toISOString() : null }; }) };
      }
    }));
    const target = shelfId === null ? `Rack ${rackLetter} (all shelves)` : `Shelf ${shelfId}`;
    const isNowMaintenance = shelfId === null ? !racks.find(r => r.letter === rackLetter)?.shelves.every(s => s.maintenance) : !racks.find(r => r.letter === rackLetter)?.shelves.find(s => s.id === shelfId)?.maintenance;
    showNotification(`${target} has been ${isNowMaintenance ? 'set to MAINTENANCE' : 'marked as AVAILABLE'}.`);
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

    const newParcel = { ...adminForm, sender: senderValue, id: newParcelId, dateReceived: new Date().toISOString().split('T')[0], otp: otp, status: adminForm.status || 'Pending', rackLocation: assignedRack, weight: `${parcelWeight}kg` };
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

    const recipientUser = users.find(u => u.username === newParcel.recipient);
    const phone = recipientUser?.phone || newParcel.recipient;
    let notifyMsg = `Parcel dari ${newParcel.sender} telah sampai. Kod OTP: ${otp}`;
    if (assignedRack) notifyMsg += ` | Rak: ${assignedRack}`;
    showNotification(`API WhatsApp/Telegram: "${notifyMsg}" dihantar kepada ${phone}.`);
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
    const updatedParcel = parcel ? { ...parcel, status } : null;
    setParcels(p => p.map(x => x.id === id ? { ...x, status } : x));
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

  const handleSaveInfo = async () => {
    if (!profileForm.name || !profileForm.email) { alert('Name and email are required'); return; }
    const updatedUser = { ...user, ...profileForm };
    if (isCloudConfigured) {
      try {
        const cloudUser = { ...updatedUser, email: user.email };
        if (profileForm.email !== user.email) alert('Email login is managed by Supabase Auth and was kept unchanged.');
        const savedUser = await upsertCloudProfile(cloudUser, cloudSession?.access_token);
        setUser(savedUser);
        setProfileForm({ name: savedUser.name, email: savedUser.email, phone: savedUser.phone || '', address: '' });
        setUsers(prev => prev.map(u => u.username === savedUser.username ? savedUser : u));
        setActiveModal(null);
        alert('Profile updated successfully!');
      } catch (error) {
        console.error('Cloud profile update failed:', error);
        alert('Unable to update cloud profile.');
      }
      return;
    }

    setUser(updatedUser);
    setUsers(prev => prev.map(u => u.username === updatedUser.username ? updatedUser : u));
    setActiveModal(null);
    alert('Profile updated successfully!');
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
    const updatedUser = { ...user, profilePic: picData };
    if (isCloudConfigured) {
      try {
        const savedUser = await upsertCloudProfile(updatedUser, cloudSession?.access_token);
        setUser(savedUser);
        setUsers(prev => prev.map(u => u.username === savedUser.username ? savedUser : u));
      } catch (error) {
        console.error('Cloud profile picture update failed:', error);
        alert('Unable to update profile picture.');
      }
      return;
    }

    setUser(updatedUser);
    setUsers(prev => prev.map(u => u.username === updatedUser.username ? updatedUser : u));
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

  const handleRequestCollect = (parcel) => setVerifyParcel(parcel);
  const handleVerifiedCollect = (id) => { updateStatus(id, 'Collected'); showNotification("Parcel berjaya disahkan dan ditanda sebagai 'Collected'. Rak telah dibebaskan."); };

  const isAdmin = user?.role === 'admin';
  const filtered = isAdmin ? parcels : parcels.filter(p => p.recipient === user?.username && p.status !== 'Collected');
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

  if (isCloudConfigured && !cloudReady) {
    return (
      <div style={{ minHeight: '100vh', background: themeObj.authBg || '#0f172a', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
        Syncing cloud data...
      </div>
    );
  }

  if (!user) return <AuthView onLogin={handleLogin} onSignUp={handleSignUp} view={view === 'dashboard' ? 'login' : view} setView={setView} theme={themeObj} />;

  const viewTitles = { dashboard: 'Dashboard', myparcels: 'Parcel Tracking', admin: 'Admin Panel', rack: 'Smart Rack', rackmgmt: 'Rack Maintenance' };

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
            { id: 'myparcels', label: 'My Parcels', icon: Icons.Inbox },
            { id: 'rack', label: 'Smart Rack', icon: Icons.Layers },
            { id: 'rackmgmt', label: 'Rack Maintenance', icon: Icons.Wrench, adminOnly: true },
            { id: 'admin', label: 'Admin Panel', icon: Icons.Users, adminOnly: true }
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
                    <Icons.Edit width={18} height={18} /> Change Info
                  </button>
                  <button onClick={() => { setPicModalOpen(true); setUserMenuOpen(false); }} style={styles.dropdownItem} onMouseOver={(e) => { e.currentTarget.style.backgroundColor = styles.dropdownHover; e.currentTarget.style.color = styles.dropdownHoverText; }} onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = themeObj.text; }}>
                    <Icons.Camera width={18} height={18} /> Profile Picture
                  </button>
                  <button onClick={() => { setActiveModal('details'); setUserMenuOpen(false); }} style={styles.dropdownItem} onMouseOver={(e) => { e.currentTarget.style.backgroundColor = styles.dropdownHover; e.currentTarget.style.color = styles.dropdownHoverText; }} onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = themeObj.text; }}>
                    <Icons.Info width={18} height={18} /> Details
                  </button>
                  <button onClick={() => { setActiveModal('password'); setUserMenuOpen(false); }} style={styles.dropdownItem} onMouseOver={(e) => { e.currentTarget.style.backgroundColor = styles.dropdownHover; e.currentTarget.style.color = styles.dropdownHoverText; }} onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = themeObj.text; }}>
                    <Icons.Lock width={18} height={18} /> Password
                  </button>
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

            {view === 'myparcels' && <MyParcelsView parcels={paginatedParcels} user={user} theme={themeObj} />}

            {view === 'rack' && (
              <SmartRackView
                racks={racks} parcels={parcels} isAdmin={isAdmin} theme={themeObj}
                onShelfClick={(shelf, rackLetter) => { const parcel = parcels.find(p => p.id === shelf.parcelId); setSelectedShelf({ shelf, rackLetter, parcel }); }}
                onToggleMaintenance={(rackLetter, shelfId) => {
                  if (shelfId !== null) { const reason = prompt('Enter maintenance reason (optional):'); handleToggleMaintenance(rackLetter, shelfId, reason || ''); }
                  else { const reason = prompt('Enter maintenance reason for entire rack (optional):'); handleToggleMaintenance(rackLetter, null, reason || ''); }
                }}
              />
            )}

            {view === 'rackmgmt' && isAdmin && (
              <RackManagementView
                racks={racks} parcels={parcels} theme={themeObj}
                onToggleShelf={(rackLetter, shelfId) => { const reason = prompt('Enter maintenance reason (optional):'); handleToggleMaintenance(rackLetter, shelfId, reason || ''); }}
                onToggleRack={(rackLetter) => { const reason = prompt('Enter maintenance reason for entire rack (optional):'); handleToggleMaintenance(rackLetter, null, reason || ''); }}
                onOpenDetail={(rackLetter) => setMaintenanceModal({ rackLetter })}
              />
            )}

            {view === 'admin' && isAdmin && (
              <AdminView parcels={parcels} users={users} form={adminForm} setForm={setAdminForm} onAdd={handleAddParcel} onRequestCollect={handleRequestCollect} onDelete={handleDeleteParcel} onOpenScanner={openScannerForTracking} scannedTracking={scannedTracking} racks={racks} theme={themeObj} />
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
            <DetailRow label="ID No" value={user.idNo} theme={themeObj} />
          </div>
        </Modal>
      )}

      {activeModal === 'changeInfo' && (
        <Modal onClose={() => setActiveModal(null)} title="Change Information" theme={themeObj}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} placeholder="Full Name" style={styles.input} />
            <input value={profileForm.email} onChange={e => setProfileForm({ ...profileForm, email: e.target.value })} placeholder="Email Address" style={styles.input} />
            <input value={profileForm.phone} onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} placeholder="Phone Number" style={styles.input} />
            <button onClick={handleSaveInfo} style={styles.btnPrimary}>Save Changes</button>
          </div>
        </Modal>
      )}

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

      {activeModal === 'password' && (
        <Modal onClose={() => setActiveModal(null)} title="Change Password" theme={themeObj}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input type="password" value={passwordForm.current} onChange={e => setPasswordForm({ ...passwordForm, current: e.target.value })} placeholder="Current Password" style={styles.input} />
            <input type="password" value={passwordForm.new} onChange={e => setPasswordForm({ ...passwordForm, new: e.target.value })} placeholder="New Password" style={styles.input} />
            <input type="password" value={passwordForm.confirm} onChange={e => setPasswordForm({ ...passwordForm, confirm: e.target.value })} placeholder="Confirm Password" style={styles.input} />
            <button onClick={handleChangePassword} style={styles.btnPrimary}>Update Password</button>
          </div>
        </Modal>
      )}

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
            <p style={{ margin: 0, fontWeight: 700, fontSize: '14px', letterSpacing: '0.025em' }}>Notifikasi Dihantar</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', opacity: 0.95, lineHeight: '1.4' }}>{notification}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function RackManagementView({ racks, parcels, onToggleShelf, onToggleRack, onOpenDetail, theme }) {
  const totalShelves = racks.reduce((sum, r) => sum + r.shelves.length, 0);
  const maintenanceShelves = racks.reduce((sum, r) => sum + r.shelves.filter(s => s.maintenance).length, 0);
  const availableShelves = racks.reduce((sum, r) => sum + r.shelves.filter(s => s.status === 'empty' && !s.maintenance).length, 0);
  const occupiedShelves = racks.reduce((sum, r) => sum + r.shelves.filter(s => s.status === 'occupied').length, 0);
  const styles = createStyles(theme);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ ...styles.card, padding: '24px', background: 'linear-gradient(135deg, #92400e 0%, #d97706 100%)', color: 'white', border: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          <div style={{ padding: '12px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '12px' }}><Icons.Wrench width={32} height={32} /></div>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 700, margin: 0 }}>Rack Maintenance Management</h2>
            <p style={{ margin: '4px 0 0 0', opacity: 0.9, fontSize: '14px' }}>Admin Control • Toggle Availability • Track Status</p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
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
                <button onClick={() => onToggleRack(rack.letter)} style={{ width: '100%', padding: '8px', backgroundColor: isFullyMaintenance ? theme.availableBg : theme.maintenanceBg, color: isFullyMaintenance ? theme.availableText : theme.maintenanceText, border: `1px solid ${isFullyMaintenance ? theme.availableBorder : theme.maintenanceBorder}`, borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  {isFullyMaintenance ? <><Icons.Check width={14} height={14} />Mark All Available</> : <><Icons.Wrench width={14} height={14} />Set Entire Rack to Maintenance</>}
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

function DetailRow({ label, value, valueColor, theme }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: `1px solid ${theme.border}` }}>
      <span style={{ color: theme.textSecondary }}>{label}</span>
      <span style={{ fontWeight: 500, color: valueColor || theme.text }}>{value}</span>
    </div>
  );
}

function Modal({ title, children, onClose, large, xlarge, theme }) {
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

function AuthView({ onLogin, onSignUp, view, setView, theme }) {
  return (
    <div style={{ minHeight: '100vh', background: theme.authBg || 'linear-gradient(135deg, #0f172a 0%, #312e81 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <img src={IPGKPP_LOGO} alt="IPGKPP" style={{ width: '360px', height: 'auto', marginBottom: '16px', objectFit: 'contain' }} />
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.025em' }}>IPGKPP Smart Rack Parcel Management System</h1>
        <p style={{ color: '#c7d2fe', marginTop: '4px', fontSize: '13px' }}>Secure, efficient campus logistics tracking with IoT</p>
      </div>
      <div style={{ width: '100%', maxWidth: '448px', backgroundColor: theme.authCardBg || '#ffffff', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: `1px solid ${theme.authBorder || '#f1f5f9'}` }}>
          <button onClick={() => setView('login')} style={{ flex: 1, padding: '16px', fontSize: '14px', fontWeight: 600, border: 'none', cursor: 'pointer', borderBottom: view === 'login' ? '2px solid #4f46e5' : 'none', backgroundColor: view === 'login' ? (theme.authTabActive || '#eef2ff') : 'transparent', color: view === 'login' ? (theme.authTabActiveText || '#4f46e5') : (theme.authTabInactiveText || '#64748b'), transition: 'all 0.15s' }}>Sign In</button>
          <button onClick={() => setView('signup')} style={{ flex: 1, padding: '16px', fontSize: '14px', fontWeight: 600, border: 'none', cursor: 'pointer', borderBottom: view === 'signup' ? '2px solid #4f46e5' : 'none', backgroundColor: view === 'signup' ? (theme.authTabActive || '#eef2ff') : 'transparent', color: view === 'signup' ? (theme.authTabActiveText || '#4f46e5') : (theme.authTabInactiveText || '#64748b'), transition: 'all 0.15s' }}>Create Account</button>
        </div>
        <div style={{ padding: '32px' }}>
          {view === 'login' ? <LoginForm onLogin={onLogin} theme={theme} /> : <SignUpForm onSignUp={onSignUp} theme={theme} />}
        </div>
      </div>
      <footer style={{ marginTop: '32px', textAlign: 'center', color: theme.footerText || '#94a3b8', fontSize: '12px' }}>© {new Date().getFullYear()} IPGKPP Campus Logistics. All rights reserved.</footer>
    </div>
  );
}

function LoginForm({ onLogin, theme }) {
  const [u, setU] = useState('');
  const [p, setP] = useState('');
  const styles = createStyles(theme);
  return (
    <form onSubmit={e => { e.preventDefault(); onLogin(u, p); }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: theme.text, marginBottom: '4px' }}>Username</label>
        <input value={u} onChange={e => setU(e.target.value)} style={{ ...styles.input, boxSizing: 'border-box' }} placeholder="e.g. student1, staff1, admin" required />
      </div>
      <div>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: theme.text, marginBottom: '4px' }}>Password</label>
        <input type="password" value={p} onChange={e => setP(e.target.value)} style={{ ...styles.input, boxSizing: 'border-box' }} placeholder="••••••••" required />
      </div>
      <button type="submit" style={styles.btnPrimary}>Access Dashboard</button>
      <p style={{ fontSize: '11px', color: theme.textMuted, textAlign: 'center', margin: 0 }}>Sign in with your registered IPGKPP parcel account.</p>
    </form>
  );
}

function SignUpForm({ onSignUp, theme }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ username: '', email: '', password: '', name: '', idNo: '', phone: '', role: 'student' });
  const styles = createStyles(theme);
  const next = () => setStep(s => s + 1);
  const prev = () => setStep(s => Math.max(1, s - 1));
  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  return (
    <form onSubmit={step === 3 ? e => { e.preventDefault(); onSignUp(form); } : e => { e.preventDefault(); next(); }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
        {[1, 2, 3].map(s => <div key={s} style={{ height: '4px', flex: 1, borderRadius: '9999px', backgroundColor: s <= step ? '#4f46e5' : theme.border }} />)}
      </div>
      {step === 1 && <>
        <input name="username" value={form.username} onChange={handleChange} style={styles.input} placeholder="Username" required />
        <input name="email" value={form.email} onChange={handleChange} type="email" style={styles.input} placeholder="Email Address" required />
        <input name="password" value={form.password} onChange={handleChange} type="password" style={styles.input} placeholder="Password" required />
        <button type="button" onClick={next} style={styles.btnPrimary}>Continue</button>
      </>}
      {step === 2 && <>
        <input name="name" value={form.name} onChange={handleChange} style={styles.input} placeholder="Full Name" required />
        <input name="idNo" value={form.idNo} onChange={handleChange} style={styles.input} placeholder="Matric / Staff ID" required />
        <input name="phone" value={form.phone} onChange={handleChange} type="tel" style={styles.input} placeholder="Phone Number" required />
        <div style={{ display: 'flex', gap: '12px' }}>
          <button type="button" onClick={prev} style={{ ...styles.btnPrimary, backgroundColor: styles.btnSecondaryBg, color: styles.btnSecondaryText }}>Back</button>
          <button type="button" onClick={next} style={styles.btnPrimary}>Next</button>
        </div>
      </>}
      {step === 3 && <>
        <select name="role" value={form.role} onChange={handleChange} style={{ ...styles.input, backgroundColor: styles.inputBg }}>
          <option value="student">Student</option>
          <option value="staff">Staff</option>
          <option value="admin">Administrator</option>
        </select>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button type="button" onClick={prev} style={{ ...styles.btnPrimary, backgroundColor: styles.btnSecondaryBg, color: styles.btnSecondaryText }}>Back</button>
          <button type="submit" style={{ ...styles.btnPrimary, backgroundColor: '#16a34a' }}>Complete Registration</button>
        </div>
      </>}
    </form>
  );
}

function DashboardView({ parcels, trackInput, setTrackInput, onTrack, foundParcel, onRequestCollect, stats, isAdmin, user, racks, onGoToRack, onGoToMaintenance, theme }) {
  const cardGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' };
  const styles = createStyles(theme);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {isAdmin && (
        <div style={{ ...styles.statCard, backgroundColor: theme.iconBg, border: `1px solid ${theme === 'dark' ? '#4338ca' : '#c7d2fe'}`, color: theme === 'dark' ? '#a5b4fc' : '#3730a3', padding: '10px 16px', fontSize: '14px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Icons.Users width={16} height={16} />Administrator View: Showing all system parcels
        </div>
      )}

      <div style={{ backgroundColor: '#4f46e5', borderRadius: '12px', padding: '24px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', position: 'relative', zIndex: 1 }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#ffffff', margin: '0 0 8px 0' }}>Track Your Parcel</h2>
        <p style={{ color: '#c7d2fe', marginBottom: '16px', fontSize: '14px' }}>Enter your tracking number to find the status and description of your package.</p>
        <form onSubmit={onTrack} style={{ display: 'flex', gap: '12px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Icons.Search style={{ position: 'absolute', left: '12px', top: '10px', width: 20, height: 20, color: '#a5b4fc' }} />
            <input value={trackInput} onChange={e => setTrackInput(e.target.value)} style={{ width: '100%', paddingLeft: '40px', paddingRight: '12px', padding: '10px 12px 10px 40px', backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid #818cf8', borderRadius: '8px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} placeholder="e.g. PKG-8821X" required />
          </div>
          <button type="submit" style={{ padding: '10px 24px', backgroundColor: '#ffffff', color: '#4f46e5', fontWeight: 700, borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '14px' }}>Search</button>
        </form>
      </div>

      {foundParcel && (
        <div style={{ ...styles.card, border: '2px solid #bfdbfe' }}>
          <div style={{ backgroundColor: theme.infoBg, padding: '16px 24px', borderBottom: `1px solid ${theme.infoBorder}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Icons.CheckCircle width={20} height={20} style={{ color: '#2563eb' }} /><h3 style={{ fontWeight: 700, color: theme.infoText, margin: 0, fontSize: '16px' }}>Parcel Found: {foundParcel.trackingNo}</h3></div>
            <span style={styles.badge(foundParcel.status)}>{foundParcel.status}</span>
          </div>
          <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p style={{ margin: 0, color: theme.text }}><span style={{ fontSize: '11px', color: theme.textSecondary, fontWeight: 700, textTransform: 'uppercase' }}>Sender</span><br /><span style={{ fontWeight: 500 }}>{foundParcel.sender}</span></p>
              <p style={{ margin: 0, color: theme.text }}><span style={{ fontSize: '11px', color: theme.textSecondary, fontWeight: 700, textTransform: 'uppercase' }}>Location</span><br /><span style={{ fontWeight: 500 }}>{foundParcel.location}</span></p>
              <p style={{ margin: 0, color: theme.text }}><span style={{ fontSize: '11px', color: theme.textSecondary, fontWeight: 700, textTransform: 'uppercase' }}>Date Received</span><br /><span style={{ fontWeight: 500 }}>{foundParcel.dateReceived}</span></p>
              {foundParcel.rackLocation && <p style={{ margin: 0, color: theme.text }}><span style={{ fontSize: '11px', color: theme.textSecondary, fontWeight: 700, textTransform: 'uppercase' }}>Rack Location</span><br /><span style={{ fontWeight: 600, color: '#4f46e5' }}>{foundParcel.rackLocation}</span></p>}
              {foundParcel.weight && <p style={{ margin: 0, color: theme.text }}><span style={{ fontSize: '11px', color: theme.textSecondary, fontWeight: 700, textTransform: 'uppercase' }}>Weight</span><br /><span style={{ fontWeight: 500 }}>{foundParcel.weight}</span></p>}
            </div>
            <div style={{ backgroundColor: styles.sectionBg, padding: '16px', borderRadius: '8px', border: `1px solid ${styles.sectionBorder}` }}>
              <span style={{ fontSize: '11px', color: theme.textSecondary, fontWeight: 700, textTransform: 'uppercase' }}>Package Description</span>
              <p style={{ marginTop: '8px', color: theme.text, fontWeight: 500, lineHeight: '1.6', margin: '8px 0 0 0' }}>{foundParcel.description || "No description provided"}</p>
            </div>
          </div>
          {foundParcel.status === 'Arrived' && user?.role !== 'admin' && (
            <div style={{ padding: '24px', backgroundColor: theme.successBg, borderTop: `1px solid ${theme.successBorder}`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <p style={{ margin: 0, fontWeight: 700, color: theme.successText, fontSize: '16px' }}>Kod Pengambilan Anda</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: theme.successText, fontWeight: 600, textTransform: 'uppercase' }}>Kod OTP</p>
                  <div style={{ backgroundColor: styles.cardBg, padding: '12px 24px', borderRadius: '8px', border: '2px dashed #16a34a', fontFamily: 'monospace', fontSize: '32px', fontWeight: 700, color: '#16a34a', letterSpacing: '4px' }}>{foundParcel.otp || '------'}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: theme.successText, fontWeight: 600, textTransform: 'uppercase' }}>Kod QR</p>
                  <div style={{ backgroundColor: styles.cardBg, padding: '8px', borderRadius: '8px', border: `1px solid ${theme.successBorder}` }}>
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(foundParcel.otp || '')}`} alt="QR Code" style={{ width: '120px', height: '120px', display: 'block' }} />
                  </div>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: theme.successText, textAlign: 'center', maxWidth: '400px' }}>Tunjukkan kod ini kepada staf pos untuk pengesahan sebelum mengambil parcel.</p>
            </div>
          )}
          {foundParcel.status === 'Arrived' && (
            <div style={{ padding: '12px 24px', backgroundColor: styles.sectionBg, borderTop: `1px solid ${styles.sectionBorder}` }}>
              <button onClick={() => onRequestCollect(foundParcel)} style={{ padding: '8px 24px', backgroundColor: '#4f46e5', color: '#ffffff', borderRadius: '8px', fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}><Icons.Lock width={16} height={16} />Sahkan & Ambil (OTP/QR)</button>
            </div>
          )}
        </div>
      )}

      <div onClick={onGoToRack} style={{ ...styles.statCard, cursor: 'pointer', background: 'linear-gradient(135deg, #0f172a 0%, #312e81 100%)', color: 'white', border: 'none' }} onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(15,23,42,0.3)'; }} onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ padding: '10px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '10px' }}><Icons.Layers width={24} height={24} /></div>
          <span style={{ fontSize: '12px', opacity: 0.9, fontWeight: 600 }}>SMART RACK (SMART SHELF)</span>
        </div>
        <p style={{ fontSize: '28px', fontWeight: 700, margin: '0 0 4px 0' }}>{stats.racksTotal}</p>
        <p style={{ fontSize: '13px', opacity: 0.9, margin: 0 }}>{stats.racksOccupied} occupied • {stats.racksAvailable} available{stats.racksMaintenance > 0 ? ` • ${stats.racksMaintenance} maintenance` : ''}</p>
        <div style={{ marginTop: '12px', height: '6px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '9999px', overflow: 'hidden' }}>
          <div style={{ height: '100%', backgroundColor: '#16a34a', width: `${(stats.racksAvailable / stats.racksTotal) * 100}%`, transition: 'width 0.5s' }} />
        </div>
      </div>

      {isAdmin && stats.racksMaintenance > 0 && (
        <div onClick={onGoToMaintenance} style={{ ...styles.statCard, cursor: 'pointer', background: 'linear-gradient(135deg, #92400e 0%, #d97706 100%)', color: 'white', border: 'none' }} onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(146,64,14,0.3)'; }} onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ padding: '10px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '10px' }}><Icons.Wrench width={24} height={24} /></div>
            <span style={{ fontSize: '12px', opacity: 0.9, fontWeight: 600 }}>⚠ MAINTENANCE ALERT</span>
          </div>
          <p style={{ fontSize: '28px', fontWeight: 700, margin: '0 0 4px 0' }}>{stats.racksMaintenance}</p>
          <p style={{ fontSize: '13px', opacity: 0.9, margin: 0 }}>shelves under maintenance — Click to manage</p>
        </div>
      )}

      <div style={cardGrid}>
        {[
          { l: 'Total Parcels', v: stats.total, i: Icons.Package, c: '#4f46e5' },
          { l: 'Pending', v: stats.pending, i: Icons.Clock, c: '#d97706' },
          { l: 'Arrived', v: stats.arrived, i: Icons.Inbox, c: '#2563eb' },
          { l: 'Collected', v: stats.collected, i: Icons.CheckCircle, c: '#16a34a' }
        ].map((s, i) => (
          <div key={i} style={styles.statCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: s.c + '15' }}><s.i width={20} height={20} style={{ color: s.c }} /></div>
              <span style={{ fontSize: '24px', fontWeight: 700, color: theme.text }}>{s.v}</span>
            </div>
            <p style={{ fontSize: '14px', color: theme.textSecondary, fontWeight: 500, margin: 0 }}>{s.l}</p>
          </div>
        ))}
      </div>

      <div style={styles.card}>
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${theme.border}` }}>
          <h3 style={{ fontWeight: 600, color: theme.text, margin: 0, fontSize: '16px' }}>Benefits of Smart Parcel System</h3>
        </div>
        <div style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {[
            { icon: Icons.Users, title: 'For Students', desc: 'Easy & fast collection, Real-time notification, Secure & convenient' },
            { icon: Icons.User, title: 'For Staff', desc: 'Easy parcel management, Less manual work, Faster organization' },
            { icon: Icons.Shield, title: 'Secure', desc: 'Multi-layer authentication, Real-time monitoring, Auto-lock system' },
            { icon: Icons.Zap, title: 'Efficient', desc: 'Save time & space, Improve workflow, Smart automation' },
            { icon: Icons.MapPin, title: 'Trackable', desc: 'Real-time tracking of every parcel, Location-based storage' },
            { icon: Icons.Wifi, title: 'Smart & Connected', desc: 'IoT based system, Integrated with website, Smart Campus' },
          ].map((b, idx) => (
            <div key={idx} style={{ padding: '16px', backgroundColor: styles.sectionBg, borderRadius: '10px', border: `1px solid ${styles.sectionBorder}` }}>
              <div style={{ padding: '8px', backgroundColor: theme.iconBg, borderRadius: '8px', display: 'inline-block', marginBottom: '8px' }}><b.icon width={20} height={20} style={{ color: theme.iconColor }} /></div>
              <p style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 700, color: theme.text }}>{b.title}</p>
              <p style={{ margin: 0, fontSize: '12px', color: theme.textSecondary, lineHeight: '1.5' }}>{b.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.card}>
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${theme.border}` }}>
          <h3 style={{ fontWeight: 600, color: theme.text, margin: 0, fontSize: '16px' }}>{isAdmin ? 'All System Parcels' : 'Active Parcels'}</h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Tracking</th>
                <th style={styles.th}>Sender</th>
                <th style={styles.th}>Recipient</th>
                <th style={styles.th}>Rack</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {parcels.length === 0 ? (<tr><td colSpan="7" style={{ ...styles.td, textAlign: 'center', padding: '32px', color: theme.textSecondary }}>No parcels found</td></tr>) : parcels.map(p => (
                <tr key={p.id} style={{ transition: 'background-color 0.15s' }} onMouseOver={(e) => { e.currentTarget.style.backgroundColor = styles.tableRowHover; }} onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
                  <td style={styles.td}><span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{p.trackingNo}</span></td>
                  <td style={styles.td}>{p.sender}</td>
                  <td style={styles.td}>{p.recipient}</td>
                  <td style={styles.td}>{p.rackLocation ? <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#4f46e5' }}>{p.rackLocation}</span> : <span style={{ color: theme.textMuted }}>—</span>}</td>
                  <td style={styles.td}><span style={styles.badge(p.status)}>{p.status}</span></td>
                  <td style={styles.td}>{p.dateReceived}</td>
                  <td style={styles.td}>{p.status === 'Arrived' && (<button onClick={() => onRequestCollect(p)} style={{ padding: '4px 12px', backgroundColor: theme.iconBg, color: theme.iconColor, fontSize: '12px', fontWeight: 600, borderRadius: '6px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}><Icons.Lock width={14} height={14} />Verify</button>)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MyParcelsView({ parcels, user, theme }) {
  const styles = createStyles(theme);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {parcels.map(p => (
        <div key={p.id} style={{ ...styles.card, padding: '0' }}>
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div><span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '16px', color: theme.text }}>{p.trackingNo}</span><span style={{ marginLeft: '12px' }}><span style={styles.badge(p.status)}>{p.status}</span></span></div>
            <span style={{ fontSize: '14px', color: theme.textSecondary }}>{p.dateReceived}</span>
          </div>
          <div style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div><p style={{ margin: '0 0 4px 0', fontSize: '12px', color: theme.textSecondary, fontWeight: 600, textTransform: 'uppercase' }}>Penghantar</p><p style={{ margin: 0, fontSize: '14px', fontWeight: 500, color: theme.text }}>{p.sender}</p></div>
            <div><p style={{ margin: '0 0 4px 0', fontSize: '12px', color: theme.textSecondary, fontWeight: 600, textTransform: 'uppercase' }}>Lokasi</p><p style={{ margin: 0, fontSize: '14px', fontWeight: 500, color: theme.text }}>{p.location}</p></div>
            {p.rackLocation && (<div><p style={{ margin: '0 0 4px 0', fontSize: '12px', color: theme.textSecondary, fontWeight: 600, textTransform: 'uppercase' }}>Rak</p><p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#4f46e5' }}>{p.rackLocation}</p></div>)}
            {p.weight && (<div><p style={{ margin: '0 0 4px 0', fontSize: '12px', color: theme.textSecondary, fontWeight: 600, textTransform: 'uppercase' }}>Berat</p><p style={{ margin: 0, fontSize: '14px', fontWeight: 500, color: theme.text }}>{p.weight}</p></div>)}
            <div style={{ gridColumn: '1 / -1' }}><p style={{ margin: '0 0 4px 0', fontSize: '12px', color: theme.textSecondary, fontWeight: 600, textTransform: 'uppercase' }}>Deskripsi</p><p style={{ margin: 0, fontSize: '14px', color: theme.text }}>{p.description || '-'}</p></div>
          </div>
          {p.status === 'Arrived' && user?.role !== 'admin' && (
            <div style={{ padding: '20px', backgroundColor: theme.successBg, borderTop: `1px solid ${theme.successBorder}`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <p style={{ margin: 0, fontWeight: 700, color: theme.successText, fontSize: '15px' }}>Kod Pengambilan Anda</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ margin: '0 0 6px 0', fontSize: '11px', color: theme.successText, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Kod OTP</p>
                  <div style={{ backgroundColor: styles.cardBg, padding: '10px 20px', borderRadius: '8px', border: '2px dashed #16a34a', fontFamily: 'monospace', fontSize: '28px', fontWeight: 800, color: '#16a34a', letterSpacing: '4px' }}>{p.otp || '------'}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ margin: '0 0 6px 0', fontSize: '11px', color: theme.successText, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Kod QR</p>
                  <div style={{ backgroundColor: styles.cardBg, padding: '6px', borderRadius: '8px', border: `1px solid ${theme.successBorder}` }}>
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(p.otp || '')}`} alt="QR Code" style={{ width: '100px', height: '100px', display: 'block' }} />
                  </div>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: '12px', color: theme.successText, textAlign: 'center', maxWidth: '350px', lineHeight: '1.4' }}>Tunjukkan kod ini kepada staf pos untuk pengesahan sebelum mengambil parcel.</p>
            </div>
          )}
        </div>
      ))}
      {parcels.length === 0 && (
        <div style={{ ...styles.card, padding: '40px', textAlign: 'center', color: theme.textSecondary }}>
          <Icons.Inbox width={48} height={48} style={{ marginBottom: '12px', opacity: 0.3 }} />
          <p style={{ margin: 0, fontSize: '15px' }}>Tiada rekod parcel aktif.</p>
        </div>
      )}
    </div>
  );
}

function AdminView({ parcels, users = [], form, setForm, onAdd, onRequestCollect, onDelete, onOpenScanner, scannedTracking, racks, theme }) {
  const styles = createStyles(theme);
  const up = (k) => (e) => { const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value; setForm(prev => ({ ...prev, [k]: value })); };
  const isOthers = form.sender === 'Others';
  const emptyShelves = racks.flatMap(r => r.shelves.filter(s => s.status === 'empty' && !s.maintenance).map(s => ({ ...s, rackLetter: r.letter })));
  const maintenanceShelves = racks.flatMap(r => r.shelves.filter(s => s.maintenance).map(s => ({ ...s, rackLetter: r.letter })));
  const recipientOptions = users.filter(u => u.role !== 'admin');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={styles.card}>
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontWeight: 600, color: theme.text, margin: 0, fontSize: '16px' }}>Register Incoming Parcel</h3>
          <button type="button" onClick={onOpenScanner} style={styles.btnSecondary} onMouseOver={(e) => { e.currentTarget.style.backgroundColor = styles.btnSecondaryHover; }} onMouseOut={(e) => { e.currentTarget.style.backgroundColor = styles.btnSecondaryBg; }}><Icons.Barcode width={18} height={18} />Scan Barcode</button>
        </div>
        <form onSubmit={onAdd} style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: theme.textSecondary, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tracking Number {scannedTracking && <span style={{ color: '#16a34a', fontWeight: 400, textTransform: 'none', letterSpacing: 'normal' }}>✓ Scanned from barcode</span>}</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input value={form.trackingNo} onChange={up('trackingNo')} placeholder="Tracking Number (or scan barcode)" style={{ ...styles.input, flex: 1, borderColor: scannedTracking ? '#86efac' : styles.inputBorder }} required />
              <button type="button" onClick={onOpenScanner} style={{ ...styles.btnSecondary, flexShrink: 0, padding: '10px 14px' }} title="Scan barcode"><Icons.Camera width={18} height={18} /></button>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <select value={form.sender} onChange={up('sender')} style={{ ...styles.input, backgroundColor: styles.inputBg }} required>
              <option value="" disabled>Select Courier</option>
              {COURIERS.map((c) => (<option key={c.value} value={c.value}>{c.label}</option>))}
            </select>
            {isOthers && <input value={form.senderOther} onChange={up('senderOther')} placeholder="Enter courier name" style={styles.input} required={isOthers} />}
          </div>
          {recipientOptions.length > 0 ? (
            <select value={form.recipient} onChange={up('recipient')} style={{ ...styles.input, backgroundColor: styles.inputBg }} required>
              <option value="" disabled>Select Recipient</option>
              {recipientOptions.map(u => (
                <option key={u.username} value={u.username}>{u.name || u.username} ({u.username})</option>
              ))}
            </select>
          ) : (
            <input value={form.recipient} onChange={up('recipient')} placeholder="Recipient Username" style={styles.input} required />
          )}
          <select value={form.status} onChange={up('status')} style={{ ...styles.input, backgroundColor: styles.inputBg }}>
            <option>Pending</option><option>Arrived</option><option>Overdue</option>
          </select>
          <input value={form.location} onChange={up('location')} placeholder="Storage Location" style={{ ...styles.input, gridColumn: '1 / -1' }} required />
          <input value={form.description} onChange={up('description')} placeholder="Package Description (Visible to User)" style={{ ...styles.input, gridColumn: '1 / -1' }} />

          <div style={{ gridColumn: '1 / -1', padding: '16px', backgroundColor: styles.sectionBg, borderRadius: '10px', border: `1px solid ${styles.sectionBorder}` }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 700, color: theme.text, display: 'flex', alignItems: 'center', gap: '8px' }}><Icons.Zap width={18} height={18} style={{ color: '#4f46e5' }} />Smart Rack Assignment (IoT Integration)</h4>
            {maintenanceShelves.length > 0 && (
              <div style={{ marginBottom: '12px', padding: '8px 12px', backgroundColor: theme.maintenanceBg, border: `1px solid ${theme.maintenanceBorder}`, borderRadius: '6px', fontSize: '12px', color: theme.maintenanceText, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Icons.AlertTriangle width={14} height={14} /><span><strong>{maintenanceShelves.length} shelf{maintenanceShelves.length > 1 ? 's' : ''} under maintenance</strong> — excluded from auto-assignment</span>
              </div>
            )}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: theme.text, marginBottom: '8px', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.assignRack || false} onChange={up('assignRack')} style={{ width: '16px', height: '16px' }} />Assign to Smart Rack Shelf
              </label>
              {form.assignRack && (
                <select value={form.selectedRackShelf || ''} onChange={up('selectedRackShelf')} style={{ ...styles.input, backgroundColor: styles.inputBg, fontSize: '13px' }}>
                  <option value="">Auto-find empty shelf (excludes maintenance)</option>
                  {emptyShelves.map(s => (<option key={s.id} value={s.id}>Rack {s.rackLetter} - Shelf {s.id} (Empty)</option>))}
                </select>
              )}
            </div>
          </div>

          <button type="submit" style={{ ...styles.btnPrimary, gridColumn: '1 / -1' }}>Register Parcel</button>
        </form>
      </div>

      <div style={styles.card}>
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${theme.border}` }}>
          <h3 style={{ fontWeight: 600, color: theme.text, margin: 0, fontSize: '16px' }}>System Parcel Management (All Records)</h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Tracking</th>
                <th style={styles.th}>Recipient</th>
                <th style={styles.th}>Rack</th>
                <th style={styles.th}>Description</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {parcels.map(p => (
                <tr key={p.id} style={{ transition: 'background-color 0.15s' }} onMouseOver={(e) => { e.currentTarget.style.backgroundColor = styles.tableRowHover; }} onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
                  <td style={styles.td}><span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{p.trackingNo}</span></td>
                  <td style={styles.td}>{p.recipient}</td>
                  <td style={styles.td}>{p.rackLocation ? <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#4f46e5' }}>{p.rackLocation}</span> : <span style={{ color: theme.textMuted }}>—</span>}</td>
                  <td style={{ ...styles.td, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.description || '-'}</td>
                  <td style={styles.td}><span style={styles.badge(p.status)}>{p.status}</span></td>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {p.status === 'Arrived' && (<button onClick={() => onRequestCollect(p)} style={{ padding: '6px 12px', backgroundColor: '#4f46e5', color: '#ffffff', fontSize: '12px', fontWeight: 600, borderRadius: '6px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}><Icons.Lock width={14} height={14} />Verify</button>)}
                      <button onClick={() => onDelete(p.id)} style={styles.btnDanger}><Icons.Trash2 width={18} height={18} /></button>
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

