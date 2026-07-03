import { supabase } from './supabaseClient'
export { isCloudConfigured } from './supabaseClient'

const isMissingSchemaError = (error) => {
  return error?.code === 'PGRST205' || error?.code === 'PGRST204' || error?.code === '42703'
}

const toAppParcel = (parcel) => {
  if (!parcel) return parcel
  return {
    ...parcel,
    trackingNo: parcel.trackingNo ?? parcel.trackingno ?? parcel.tracking_no ?? '',
    recipient: parcel.recipient ?? parcel.recipient_username ?? '',
    dateReceived: parcel.dateReceived ?? parcel.datereceived ?? parcel.date_received ?? '',
    rackLocation: parcel.rackLocation ?? parcel.racklocation ?? parcel.rack_location ?? '',
  }
}

const toDbParcel = (parcel) => ({
  id: parcel.id,
  tracking_no: parcel.trackingNo ?? parcel.trackingno ?? parcel.tracking_no ?? '',
  sender: parcel.sender ?? '',
  recipient_username: parcel.recipient ?? parcel.recipient_username ?? '',
  status: parcel.status ?? 'Pending',
  date_received: parcel.dateReceived ?? parcel.datereceived ?? parcel.date_received ?? null,
  location: parcel.location ?? '',
  description: parcel.description ?? '',
  otp: parcel.otp ?? '',
  rack_location: parcel.rackLocation ?? parcel.racklocation ?? parcel.rack_location ?? '',
  weight: parcel.weight ?? '',
})

// ===== SESSION MANAGEMENT =====
export const getSavedCloudSession = () => {
  try {
    const saved = localStorage.getItem('ipgkpp_cloud_session')
    return saved ? JSON.parse(saved) : null
  } catch {
    return null
  }
}

export const saveCloudSession = (session) => {
  try {
    localStorage.setItem('ipgkpp_cloud_session', JSON.stringify(session))
  } catch (e) {
    console.error('Failed to save session:', e)
  }
}

export const clearCloudSession = () => {
  try {
    localStorage.removeItem('ipgkpp_cloud_session')
  } catch (e) {
    console.error('Failed to clear session:', e)
  }
}

export const refreshCloudSession = async (session) => {
  const { data, error } = await supabase.auth.refreshSession({
    refresh_token: session.refresh_token
  })
  if (error) throw error
  saveCloudSession(data.session)
  return data.session
}

// ===== AUTH FUNCTIONS =====
export const signInCloudUser = async (username, password) => {
  // Login guna email + password (Supabase Auth)
  // Tapi sebab kita guna username, kita query dulu untuk dapat email
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .eq('password', password)
    .single()

  if (userError || !user) {
    throw new Error('Invalid credentials')
  }

  const session = {
    access_token: 'local_' + user.id,
    refresh_token: 'local_refresh_' + user.id,
    user: { email: user.email, id: user.id },
    expires_at: Math.floor(Date.now() / 1000) + 3600
  }

  saveCloudSession(session)
  return { session, user }
}

export const signUpCloudUser = async (data) => {
  const newUser = {
    username: data.username,
    email: data.email,
    password: data.password,
    name: data.name,
    id_no: data.idNo,
    phone: data.phone,
    role: data.role || 'student',
    profile_pic: '',
    created_at: new Date().toISOString()
  }

  const { data: inserted, error } = await supabase
    .from('users')
    .insert([newUser])
    .select()
    .single()

  if (error) throw error

  const session = {
    access_token: 'local_' + inserted.id,
    refresh_token: 'local_refresh_' + inserted.id,
    user: { email: inserted.email, id: inserted.id },
    expires_at: Math.floor(Date.now() / 1000) + 3600
  }

  saveCloudSession(session)
  return { session }
}

export const saveCloudUser = async (user) => {
  const payload = {
    username: user.username,
    email: user.email,
    password: user.password,
    name: user.name,
    id_no: user.idNo ?? user.id_no ?? '',
    phone: user.phone ?? '',
    role: user.role || 'student',
    profile_pic: user.profilePic ?? user.profile_pic ?? '',
  }

  if (!payload.password) delete payload.password

  const query = user.id
    ? supabase.from('users').update(payload).eq('id', user.id)
    : supabase.from('users').insert([payload])

  const { data, error } = await query.select().single()

  if (error) throw error
  return data
}

export const deleteCloudUser = async (id) => {
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export const updateCloudPassword = async (session, newPassword) => {
  const userId = session.user?.id
  if (!userId) throw new Error('No user ID')

  const { error } = await supabase
    .from('users')
    .update({ password: newPassword })
    .eq('id', userId)

  if (error) throw error
}

// ===== PROFILE FUNCTIONS =====
export const listCloudProfiles = async (token) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) {
    if (isMissingSchemaError(error)) return []
    throw error
  }
  return data || []
}

export const getCloudProfileByEmail = async (email, token) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single()

  if (error) {
    if (isMissingSchemaError(error)) return null
    throw error
  }
  return data
}

export const upsertCloudProfile = async (profile, token) => {
  const payload = {
    name: profile.name,
    phone: profile.phone || '',
    profile_pic: profile.profilePic || profile.profile_pic || '',
  }

  if (!profile.username) throw new Error('Username tidak ditemui. Sila log keluar dan masuk semula.');

  // Update using username as the unique key instead of id to avoid serial column errors
  const { data, error } = await supabase
    .from('users')
    .update(payload)
    .eq('username', profile.username)
    .select()
    .single()

  if (error) throw error
  return data
}

// ===== CLOUD STORAGE FUNCTIONS (Supabase Storage) =====
export const uploadCloudFile = async (userId, fileBase64) => {
  try {
    // 1. Convert Base64 back to Blob for storage
    const base64Data = fileBase64.split(',')[1];
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/jpeg' });

    const fileName = `avatar_${userId}_${Date.now()}.jpg`;
    const filePath = `${userId}/${fileName}`;

    // 2. Upload to 'profiles' bucket
    const { data, error } = await supabase.storage
      .from('profiles')
      .upload(filePath, blob, {
        contentType: 'image/jpeg',
        upsert: true
      });

    if (error) throw error;

    // 3. Get Public URL
    const { data: { publicUrl } } = supabase.storage
      .from('profiles')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Storage upload failed:', error);
    throw error;
  }
}

// ===== STATE MANAGEMENT (Parcels & Racks) =====
export const getCloudState = async (key, defaultValue, token) => {
  try {
    if (key === 'parcels') {
      const { data, error } = await supabase
        .from('parcels')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        if (isMissingSchemaError(error)) return defaultValue
        throw error
      }
      return (data || []).map(toAppParcel)
    }

    if (key === 'racks') {
      const { data, error } = await supabase
        .from('racks')
        .select('rack_data')
        .eq('id', 1)
        .single()

      if (error) {
        if (isMissingSchemaError(error)) return defaultValue
        throw error
      }
      return data?.rack_data || defaultValue
    }

    if (key === 'smart_racks') {
      const { data, error } = await supabase
        .from('smart_racks')
        .select('*')
        .eq('rack_id', 'RACK-A-SHELF-1') // Fetch specifically the rack ID used by ESP32
        .order('updated_at', { ascending: false })
        .limit(1)

      if (error) {
        if (isMissingSchemaError(error)) return null
        console.error('Supabase error fetching smart_racks:', error)
        return null
      }
      return data && data.length > 0 ? data[0] : null
    }

    return defaultValue
  } catch (error) {
      if (isMissingSchemaError(error)) return defaultValue
      console.error(`Error getting ${key}:`, error)
      return defaultValue
  }
}

export const saveCloudState = async (key, value, token) => {
  try {
    if (key === 'parcels') {
      if (value.length > 0) {
        await upsertCloudParcels(value, token)
      }
    }

    if (key === 'racks') {
      const { error } = await supabase
        .from('racks')
        .upsert({ id: 1, rack_data: value, updated_at: new Date().toISOString() })
      
      if (error) throw error
    }
  } catch (error) {
    console.error(`Error saving ${key}:`, error)
    throw error
  }
}

export const upsertCloudParcels = async (parcels, token) => {
  const rows = parcels.map(toDbParcel)
  const { data, error } = await supabase
    .from('parcels')
    .upsert(rows, { onConflict: 'id' })
    .select()

  if (error) throw error
  return (data || []).map(toAppParcel)
}

export const upsertCloudParcel = async (parcel, token) => {
  const rows = await upsertCloudParcels([parcel], token)
  return rows[0] || parcel
}

export const deleteCloudParcel = async (id, token) => {
  const { error } = await supabase
    .from('parcels')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export const subscribeCloudChanges = (onChange) => {
  const channel = supabase
    .channel('ipgkpp-parcel-system-realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'parcels' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'racks' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'smart_racks' }, (payload) => {
      // Trigger update specifically for smart_racks if needed,
      // but passing it to the general onChange works too as it triggers loadCloudData
      onChange(payload);
    })
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}
