import { supabaseUrl as FALLBACK_SUPABASE_URL, supabaseAnonKey as FALLBACK_SUPABASE_ANON_KEY } from './supabaseClient';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || FALLBACK_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || FALLBACK_SUPABASE_ANON_KEY;

export const isCloudConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

const SESSION_KEY = 'ipgkpp_supabase_session';

const normalizeBaseUrl = (url) => url?.replace(/\/$/, '');

const toSnakeProfile = (user) => ({
  auth_user_id: user.authUserId || user.auth_user_id || null,
  username: user.username,
  email: user.email,
  name: user.name,
  id_no: user.idNo || user.id_no || '',
  phone: user.phone || '',
  role: user.role || 'student',
  profile_pic: user.profilePic || user.profile_pic || '',
  created_at: user.createdAt || user.created_at || new Date().toISOString(),
});

const toCamelProfile = (row) => ({
  authUserId: row.auth_user_id,
  username: row.username,
  email: row.email,
  name: row.name,
  idNo: row.id_no || '',
  phone: row.phone || '',
  role: row.role || 'student',
  profilePic: row.profile_pic || '',
  createdAt: row.created_at,
});

const request = async (path, { method = 'GET', body, token, headers = {} } = {}) => {
  if (!isCloudConfigured) throw new Error('Cloud database is not configured.');

  const response = await fetch(`${normalizeBaseUrl(SUPABASE_URL)}${path}`, {
    method,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token || SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Cloud request failed with ${response.status}`);
  }

  if (response.status === 204) return null;
  const text = await response.text();
  return text ? JSON.parse(text) : null;
};

export const saveCloudSession = (session) => {
  if (!session) localStorage.removeItem(SESSION_KEY);
  else localStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

export const getSavedCloudSession = () => {
  try {
    const saved = localStorage.getItem(SESSION_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

export const clearCloudSession = () => saveCloudSession(null);

export const signUpCloudUser = async (data) => {
  const auth = await request('/auth/v1/signup', {
    method: 'POST',
    body: {
      email: data.email,
      password: data.password,
      data: { username: data.username, role: data.role },
    },
  });

  const session = auth.session || null;
  const profile = {
    ...data,
    authUserId: auth.user?.id || null,
    profilePic: '',
    createdAt: new Date().toISOString(),
  };
  delete profile.password;

  await upsertCloudProfile(profile, session?.access_token);
  if (session) saveCloudSession(session);
  return { user: profile, session };
};

export const signInCloudUser = async (usernameOrEmail, password) => {
  const email = usernameOrEmail.includes('@')
    ? usernameOrEmail
    : await getEmailForUsername(usernameOrEmail);

  const auth = await request('/auth/v1/token?grant_type=password', {
    method: 'POST',
    body: { email, password },
  });

  saveCloudSession(auth);
  const profile = await getCloudProfileByEmail(email, auth.access_token);
  return { session: auth, user: { ...profile, lastLogin: new Date().toISOString() } };
};

export const refreshCloudSession = async (session) => {
  if (!session?.refresh_token) return null;
  const refreshed = await request('/auth/v1/token?grant_type=refresh_token', {
    method: 'POST',
    body: { refresh_token: session.refresh_token },
  });
  saveCloudSession(refreshed);
  return refreshed;
};

export const updateCloudPassword = async (session, password) => {
  const result = await request('/auth/v1/user', {
    method: 'PUT',
    token: session?.access_token,
    body: { password },
  });
  return result;
};

export const listCloudProfiles = async (token) => {
  const rows = await request('/rest/v1/profiles?select=*&order=created_at.asc', { token });
  return (rows || []).map(toCamelProfile);
};

export const getCloudProfileByEmail = async (email, token) => {
  const rows = await request(`/rest/v1/profiles?email=eq.${encodeURIComponent(email)}&select=*&limit=1`, { token });
  if (!rows?.length) throw new Error('Profile not found.');
  return toCamelProfile(rows[0]);
};

export const getCloudProfileByUsername = async (username, token) => {
  const rows = await request(`/rest/v1/profiles?username=eq.${encodeURIComponent(username)}&select=*&limit=1`, { token });
  return rows?.length ? toCamelProfile(rows[0]) : null;
};

export const getEmailForUsername = async (username) => {
  const profile = await getCloudProfileByUsername(username);
  if (!profile?.email) throw new Error('Username not found.');
  return profile.email;
};

export const upsertCloudProfile = async (user, token) => {
  const [row] = await request('/rest/v1/profiles?on_conflict=username', {
    method: 'POST',
    token,
    headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
    body: toSnakeProfile(user),
  });
  return toCamelProfile(row);
};

export const getCloudState = async (id, fallback, token) => {
  const rows = await request(`/rest/v1/app_state?id=eq.${encodeURIComponent(id)}&select=value&limit=1`, { token });
  return rows?.length ? rows[0].value : fallback;
};

export const saveCloudState = async (id, value, token) => {
  await request('/rest/v1/app_state?on_conflict=id', {
    method: 'POST',
    token,
    headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: { id, value, updated_at: new Date().toISOString() },
  });
};
