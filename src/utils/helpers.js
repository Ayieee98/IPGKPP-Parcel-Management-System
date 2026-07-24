import { STORAGE_KEYS, DEFAULT_RACKS, MAX_POSTGRES_INT } from './constants';

export function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const d = new Date(dateString);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function getTimeAgo(dateString) {
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

export const getNotificationStorageKey = (username = 'guest') => `${STORAGE_KEYS.READ_NOTIFICATIONS}_${username}`;

export const getParcelNotificationId = (parcel) => `${parcel.id || parcel.trackingNo || 'parcel'}:${parcel.status || 'Pending'}`;

export const getParcelNotificationMessage = (parcel) => {
  const tracking = parcel.trackingNo || 'Parcel';
  const rackText = parcel.rackLocation ? ` Rak: ${parcel.rackLocation}.` : '';
  
  // Grab the OTP if it exists
  const otpText = parcel.otp ? ` Kod OTP anda ialah: *${parcel.otp}*.` : '';

  if (parcel.status === 'Arrived') {
    return {
      title: 'Parcel telah sampai',
      body: `${tracking} daripada ${parcel.sender || 'kurier'} telah sampai.${rackText}${otpText} Sila tunjuk kod ini untuk mengambil parcel anda.`,
      tone: 'success',
    };
  }
  if (parcel.status === 'Overdue') {
    return {
      title: 'Parcel overdue',
      body: `${tracking} masih belum diambil selepas tempoh ditetapkan.${rackText}${otpText} Sila ambil secepat mungkin.`,
      tone: 'danger',
    };
  }
  return {
    title: 'Parcel masih pending',
    body: `${tracking} sedang diproses dan belum sedia untuk diambil.`,
    tone: 'warning',
  };
};

export const normalizeRacks = (value) => {
  if (!Array.isArray(value) || value.length === 0) return DEFAULT_RACKS;
  const isValid = value.every(rack =>
    rack &&
    typeof rack === 'object' &&
    typeof rack.id === 'string' &&
    typeof rack.letter === 'string' &&
    Array.isArray(rack.shelves)
  );
  return isValid ? value : DEFAULT_RACKS;
};

export const generateParcelId = (existingParcels = []) => {
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