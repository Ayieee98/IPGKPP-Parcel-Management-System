export const IPGKPP_LOGO = '/logo.png';
export const IPGKPP_BG = 'https://image.qwenlm.ai/public_source/a5365ccb-778a-4d10-aedb-64b519a3dff3/1ee67feb7-707c-4c46-8395-a946662c0e1d.png';

export const COURIERS = [
  { label: 'Pos Laju', value: 'Pos Laju' },
  { label: 'J&T Express', value: 'J&T Express' },
  { label: 'Shopee Express (SPX)', value: 'Shopee Express (SPX)' },
  { label: 'DHL eCommerce', value: 'DHL eCommerce' },
  { label: 'FedEx', value: 'FedEx' },
  { label: 'UPS', value: 'UPS' },
  { label: 'CityLink Express', value: 'CityLink Express' },
  { label: 'Ninja Van', value: 'Ninja Van' },
  { label: 'GDEX', value: 'GDEX' },
  { label: 'Skynet', value: 'Skynet' },
  { label: 'Others', value: 'Others' }
];

export const STORAGE_KEYS = {
  USERS: 'ipgkpp_parcels_users',
  PARCELS: 'ipgkpp_parcels_data',
  SESSION: 'ipgkpp_parcels_session',
  RACKS: 'ipgkpp_racks_data',
  THEME: 'ipgkpp_theme_preference',
  READ_NOTIFICATIONS: 'ipgkpp_read_notifications'
};

export const NOTIFIABLE_STATUSES = ['Arrived', 'Overdue', 'Pending'];

export const DEFAULT_USERS = [];

export const DEFAULT_PARCELS = [];

export const DEFAULT_RACKS = ['A', 'B', 'C'].map(rackLetter => ({
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

export const MAX_POSTGRES_INT = 2147483647;