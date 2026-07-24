import { useState } from 'react';
import { Icons } from '../components/Icons';
import { createStyles } from '../utils/theme';
import { IPGKPP_LOGO } from '../utils/constants';
import emailjs from '@emailjs/browser';

// Added 'users' prop so we can check for duplicate usernames
export function AuthView({ onLogin, onSignUp, view, setView, theme, users = [] }) {
  const [authMode, setAuthMode] = useState('user'); 

  return (
    <div style={{ minHeight: '100vh', background: authMode === 'admin' ? 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)' : 'linear-gradient(135deg, #0f172a 0%, #312e81 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <img src={IPGKPP_LOGO} alt="IPGKPP" style={{ width: '360px', height: 'auto', marginBottom: '16px', objectFit: 'contain' }} />
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.025em' }}>IPGKPP Smart Rack Parcel Management System</h1>
        <p style={{ color: '#c7d2fe', marginTop: '4px', fontSize: '13px' }}>{authMode === 'admin' ? 'Administrator Secure Login Portal' : 'Student & Staff Parcel Portal'}</p>
      </div>
      <div style={{ width: '100%', maxWidth: '448px', backgroundColor: theme.authCardBg || '#ffffff', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: `1px solid ${theme.authBorder || '#f1f5f9'}` }}>
          {authMode === 'user' ? (
            <>
              <button onClick={() => setView('login')} style={{ flex: 1, padding: '16px', fontSize: '14px', fontWeight: 600, border: 'none', cursor: 'pointer', borderBottom: view === 'login' ? '2px solid #4f46e5' : 'none', backgroundColor: view === 'login' ? (theme.authTabActive || '#eef2ff') : 'transparent', color: view === 'login' ? (theme.authTabActiveText || '#4f46e5') : (theme.authTabInactiveText || '#64748b'), transition: 'all 0.15s' }}>Sign In</button>
              <button onClick={() => setView('signup')} style={{ flex: 1, padding: '16px', fontSize: '14px', fontWeight: 600, border: 'none', cursor: 'pointer', borderBottom: view === 'signup' ? '2px solid #4f46e5' : 'none', backgroundColor: view === 'signup' ? (theme.authTabActive || '#eef2ff') : 'transparent', color: view === 'signup' ? (theme.authTabActiveText || '#4f46e5') : (theme.authTabInactiveText || '#64748b'), transition: 'all 0.15s' }}>Register Account</button>
            </>
          ) : (
            <div style={{ flex: 1, padding: '16px', fontSize: '14px', fontWeight: 800, textAlign: 'center', backgroundColor: '#1e1b4b', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Icons.Shield width={18} height={18} /> Administrator Login
            </div>
          )}
        </div>
        <div style={{ padding: '32px' }}>
          {view === 'login' || authMode === 'admin' ? (
            <LoginForm onLogin={(u, p) => onLogin(u, p, authMode)} theme={theme} isAdmin={authMode === 'admin'} />
          ) : (
            <SignUpForm onSignUp={onSignUp} theme={theme} users={users} />
          )}
        </div>
        <div style={{ padding: '12px', borderTop: `1px solid ${theme.authBorder || '#f1f5f9'}`, textAlign: 'center', backgroundColor: theme.authCardBg || '#ffffff' }}>
          <button
            onClick={() => { setAuthMode(authMode === 'user' ? 'admin' : 'user'); setView('login'); }}
            style={{ background: 'none', border: 'none', color: '#4f46e5', fontSize: '12px', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
          >
            {authMode === 'user' ? 'Access Admin Portal' : 'Return to Student/Staff Portal'}
          </button>
        </div>
      </div>
      <footer style={{ marginTop: '32px', textAlign: 'center', color: theme.footerText || '#94a3b8', fontSize: '12px' }}>© {new Date().getFullYear()} IPGKPP Campus Logistics. All rights reserved.</footer>
    </div>
  );
}

function LoginForm({ onLogin, theme, isAdmin = false }) {
  const [u, setU] = useState('');
  const [p, setP] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Track visibility
  
  const styles = createStyles(theme);
  
  return (
    <form onSubmit={e => { e.preventDefault(); onLogin(u, p); }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: theme.text, marginBottom: '4px' }}>{isAdmin ? 'Admin Username' : 'Username'}</label>
        <input value={u} onChange={e => setU(e.target.value)} style={{ ...styles.input, boxSizing: 'border-box' }} placeholder={isAdmin ? "Enter admin ID" : "e.g. student1, staff1"} required />
      </div>
      
      <div>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: theme.text, marginBottom: '4px' }}>Password</label>
        <div style={{ position: 'relative' }}>
          <input 
            type={showPassword ? "text" : "password"} 
            value={p} 
            onChange={e => setP(e.target.value)} 
            style={{ ...styles.input, boxSizing: 'border-box', width: '100%', paddingRight: '40px' }} 
            placeholder="••••••••" 
            required 
          />
          <button 
            type="button" 
            onClick={() => setShowPassword(!showPassword)} 
            style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: '#64748b' }}
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            )}
          </button>
        </div>
      </div>

      <button type="submit" style={{ ...styles.btnPrimary, backgroundColor: isAdmin ? '#1e1b4b' : '#4f46e5' }}>
        {isAdmin ? 'Sign In as Administrator' : 'Access Portal'}
      </button>
      <p style={{ fontSize: '11px', color: theme.textMuted, textAlign: 'center', margin: 0 }}>
        {isAdmin ? 'This portal is restricted to authorized personnel only.' : 'Sign in with your registered IPGKPP parcel account.'}
      </p>
    </form>
  );
}

function SignUpForm({ onSignUp, theme, users = [] }) {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [form, setForm] = useState({ 
    username: '', 
    email: '', 
    password: '', 
    confirmPassword: '',
    name: '', 
    idNo: '', 
    countryCode: '+60',
    phoneLocal: '', 
    role: 'student' 
  });
  
  const styles = createStyles(theme);
  const prev = () => setStep(s => Math.max(1, s - 1));
  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleStep1Next = () => {
    if (!form.username || !form.email) return alert('Please fill in all fields.');
    const usernameExists = users.some(u => u.username.toLowerCase() === form.username.toLowerCase());
    if (usernameExists) return alert('This username is already taken. Please choose a different one.');
    setStep(2);
  };

  // Validation for Step 2 (ID Check & Passwords)
  const handleStep2Next = () => {
    if (!form.name || !form.idNo || !form.phoneLocal || !form.password || !form.confirmPassword) {
      return alert('Please fill in all fields.');
    }

    // NEW: Check if the Matric/Staff ID already exists!
    const idExists = users.some(u => u.idNo === form.idNo);
    if (idExists) {
      return alert('This Matric/Staff ID is already registered in the system.');
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    if (!passwordRegex.test(form.password)) {
      return alert('Password must be at least 8 characters long, and include at least 1 capital letter, 1 number, and 1 special character (e.g., @, $, !, %).');
    }

    if (form.password !== form.confirmPassword) {
      return alert('Passwords do not match. Please try again.');
    }
    setStep(3);
  };

  // Final Form Assembly & Email Trigger
  const handleFinalSubmit = (e) => {
    e.preventDefault();
    const finalData = {
      username: form.username,
      email: form.email,
      password: form.password,
      name: form.name,
      idNo: form.idNo,
      phone: `${form.countryCode}${form.phoneLocal}`,
      role: form.role,
      isVerified: true // Automatically verified without a code
    };
    
    // NEW: Trigger the welcome email in the background!
    sendWelcomeEmail(form.name, form.email, form.role);
    
    onSignUp(finalData);
  };

  // Reusable Eye Icon Component
  const EyeIcon = ({ hidden }) => hidden ? (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
  );

  return (
    <form onSubmit={step === 3 ? handleFinalSubmit : e => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
        {[1, 2, 3].map(s => <div key={s} style={{ height: '4px', flex: 1, borderRadius: '9999px', backgroundColor: s <= step ? '#4f46e5' : theme.border }} />)}
      </div>
      
      {step === 1 && <>
        <input name="username" value={form.username} onChange={handleChange} style={styles.input} placeholder="Username" required />
        <input name="email" value={form.email} onChange={handleChange} type="email" style={styles.input} placeholder="Email Address" required />
        <button type="button" onClick={handleStep1Next} style={styles.btnPrimary}>Continue</button>
      </>}
      
      {step === 2 && <>
        <input name="name" value={form.name} onChange={e => setForm(prev => ({...prev, name: e.target.value.toUpperCase()}))} style={styles.input} placeholder="FULL NAME" required />
        <input name="idNo" value={form.idNo} onChange={handleChange} style={styles.input} placeholder={form.role === 'student' ? "Matric Number" : "Staff ID Number"} required />
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <select name="countryCode" value={form.countryCode} onChange={handleChange} style={{ ...styles.input, width: '100px', flexShrink: 0, padding: '10px 8px' }}>
            <option value="+60">🇲🇾 +60</option>
            <option value="+82">🇰🇷 +82</option>
            <option value="+65">🇸🇬 +65</option>
            <option value="+62">🇮🇩 +62</option>
          </select>
          <input name="phoneLocal" value={form.phoneLocal} onChange={e => setForm(prev => ({...prev, phoneLocal: e.target.value.replace(/\D/g, '')}))} type="tel" style={{ ...styles.input, flex: 1 }} placeholder="1023456789" required />
        </div>

        <div style={{ position: 'relative' }}>
          <input name="password" value={form.password} onChange={handleChange} type={showPassword ? "text" : "password"} style={{ ...styles.input, width: '100%', paddingRight: '40px', boxSizing: 'border-box' }} placeholder="Password" required />
          <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: '#64748b' }}>
            <EyeIcon hidden={!showPassword} />
          </button>
        </div>

        <div style={{ position: 'relative' }}>
          <input name="confirmPassword" value={form.confirmPassword} onChange={handleChange} type={showConfirmPassword ? "text" : "password"} style={{ ...styles.input, width: '100%', paddingRight: '40px', boxSizing: 'border-box' }} placeholder="Confirm Password" required />
          <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: '#64748b' }}>
            <EyeIcon hidden={!showConfirmPassword} />
          </button>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button type="button" onClick={prev} style={{ ...styles.btnPrimary, backgroundColor: styles.btnSecondaryBg, color: styles.btnSecondaryText }}>Back</button>
          <button type="button" onClick={handleStep2Next} style={styles.btnPrimary}>Next</button>
        </div>
      </>}
      
      {step === 3 && <>
        <select name="role" value={form.role} onChange={handleChange} style={styles.input}>
          <option value="student">Student</option>
          <option value="staff">Staff</option>
        </select>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button type="button" onClick={prev} style={{ ...styles.btnPrimary, backgroundColor: styles.btnSecondaryBg, color: styles.btnSecondaryText }}>Back</button>
          <button type="submit" style={{ ...styles.btnPrimary, backgroundColor: '#16a34a' }}>Complete Registration</button>
        </div>
      </>}
    </form>
  );
}

const sendWelcomeEmail = (userName, userEmail, userRole) => {
  if (!userEmail) return;
  
  // Replace with your actual EmailJS keys
  emailjs.send(
    'service_b85yfd9', // service ID
    'template_nrs5gxn', // template ID 
    {
      to_name: userName,
      to_email: userEmail,
      role: userRole === 'staff' ? 'Staff' : 'Student'
    }, 
    'JT3OFA36C4eS3rqWS' // public key
  ).then(() => {
    console.log("Welcome email sent successfully!");
  }).catch((err) => {
    console.error("Failed to send welcome email:", err);
  });
};