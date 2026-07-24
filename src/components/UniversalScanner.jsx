import { useState, useRef, useEffect } from 'react';
import { Icons } from './Icons';
import { Modal } from './Modal';
import { createStyles } from '../utils/theme';

// ===== UNIVERSAL BARCODE/QR SCANNER - WORKS WITHOUT HTTPS =====
// Supports 4 modes: Live Camera (HTTPS/localhost), Image Upload, Manual Input, Clipboard Paste
export function UniversalScanner({ onScan, onClose, theme, mode: initialMode = 'auto' }) {
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
    if (!isLibraryLoaded) {
      setError('Scanner library not loaded yet.');
      return;
    }
    if (isStarting) return;

  setError('');
  setIsStarting(true);
  setLastScanned('');
  await safeStopScanner();

  try {
    const devices = await window.Html5Qrcode.getCameras();
    if (!devices || devices.length === 0) {
      setError('No camera found');
      setIsStarting(false);
      return;
    }

    // Prefer back camera if available
    const backCamera = devices.find(d => d.label.toLowerCase().includes('back'));
    const cameraId = backCamera ? backCamera.id : devices[0].id;

    const html5QrCode = new window.Html5Qrcode(scannerContainerId);
    qrInstanceRef.current = html5QrCode;

    const config = {
      fps: 10,
      qrbox: { width: 250, height: 150 }
    };

    await html5QrCode.start(
      cameraId,
      config,
      // ✅ SUCCESS CALLBACK – calls onScan immediately, then stops camera in background
      (decodedText) => {
        // 1. Immediately pass the result to the parent (this closes the modal)
        onScan(decodedText);

        // 2. Stop and clean up the scanner in the background (fire & forget)
        if (qrInstanceRef.current) {
          qrInstanceRef.current.stop().catch(() => {});
          qrInstanceRef.current.clear().catch(() => {});
          qrInstanceRef.current = null;
        }

        // 3. Update local UI state (optional)
        setLastScanned(decodedText);
        setIsScanning(false);
        setIsStarting(false);
      },
      // Error callback – log only critical errors
      (error) => {
        if (error && !error.includes('No MultiFormat Readers')) {
          console.warn('Scan frame error:', error);
        }
      }
    );

    setIsScanning(true);
  } catch (err) {
    console.error('Scanner start error:', err);
    setError(`Camera error: ${err.message || 'Unknown'}`);
    setIsScanning(false);
  } finally {
    setIsStarting(false);
  }
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
    await safeStopScanner();

    try {
      if (!window.Html5Qrcode) {
        setError('Scanner library not loaded. Please wait or refresh.');
        setIsProcessingImage(false);
        return;
      }

      // Important: Use a fresh instance for processing
      const html5QrCode = new window.Html5Qrcode(scannerContainerId);
      
      try {
        const decodedText = await html5QrCode.scanFile(file, true);
        if (decodedText) {
          setLastScanned(decodedText);
          scanTimeoutRef.current = setTimeout(() => { onScan(decodedText); }, 800);
        } else {
          setError('No barcode detected. Try a clearer photo.');
        }
      } catch (scanErr) {
        setError('No barcode detected in this image. Please make sure the barcode is clear and well-lit.');
      } finally {
        try { await html5QrCode.clear(); } catch (e) {}
      }
    } catch (err) {
      console.error('Image scan error:', err);
      setError('Failed to process image. Try another file.');
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
                  <div id={scannerContainerId} ref={scannerRef} style={{ width: '100%', minHeight: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.textSecondary, fontSize: '13px' }}>
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