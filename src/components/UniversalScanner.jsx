import { useState, useRef, useEffect } from 'react';
import { Icons } from './Icons';
import { Modal } from './Modal';
import { createStyles } from '../utils/theme';

export function UniversalScanner({ onScan, onClose, theme }) {
  const scannerRef = useRef(null);
  const qrInstanceRef = useRef(null);
  const [scannerContainerId] = useState(() => `barcode-scanner-container-${Date.now()}`);

  const [isScanning, setIsScanning] = useState(false);
  const [lastScanned, setLastScanned] = useState('');
  const [error, setError] = useState('');
  const [isLibraryLoaded, setIsLibraryLoaded] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [hasCamera, setHasCamera] = useState(null);

  const isUnmountingRef = useRef(false);
  const styles = createStyles(theme);
  const isSecureContext = typeof window !== 'undefined' && window.isSecureContext;
  const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname === '');

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

  const safeStopScanner = async () => {
    if (!isUnmountingRef.current) setIsStarting(true);
    try {
      if (qrInstanceRef.current) {
        const instance = qrInstanceRef.current;
        qrInstanceRef.current = null;
        try {
          const isRunning = typeof instance.isScanning === 'boolean' ? instance.isScanning : typeof instance.isScanning === 'function' ? instance.isScanning() : true;
          if (isRunning) await instance.stop();
        } catch (error) { console.warn('Scanner stop skipped:', error); }
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

  useEffect(() => {
    return () => {
      isUnmountingRef.current = true;
      safeStopScanner();
    };
  }, []);

  const startCameraScanner = async () => {
    if (!isLibraryLoaded) { setError('Scanner library not loaded yet.'); return; }
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

      const backCamera = devices.find(d => d.label.toLowerCase().includes('back'));
      const cameraId = backCamera ? backCamera.id : devices[0].id;
      const html5QrCode = new window.Html5Qrcode(scannerContainerId);
      qrInstanceRef.current = html5QrCode;

      const config = { fps: 10, qrbox: { width: 250, height: 150 } };

      await html5QrCode.start(
        cameraId, config,
        (decodedText) => {
          onScan(decodedText);
          if (qrInstanceRef.current) {
            qrInstanceRef.current.stop().catch(() => { });
            qrInstanceRef.current.clear().catch(() => { });
            qrInstanceRef.current = null;
          }
          setLastScanned(decodedText);
          setIsScanning(false);
          setIsStarting(false);
        },
        (error) => {
          if (error && !error.includes('No MultiFormat Readers')) console.warn('Scan frame error:', error);
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

  return (
    <Modal title="Live Camera Scanner" onClose={onClose} large theme={theme}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {!isSecureContext && !isLocalhost && (
          <div style={{ padding: '12px 16px', backgroundColor: theme.warningBg, border: `1px solid ${theme.warningBorder}`, borderRadius: '8px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <Icons.AlertTriangle width={20} height={20} style={{ color: '#d97706', flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '13px', color: theme.warningText }}>
              <p style={{ margin: 0, fontWeight: 600 }}>Non-HTTPS Connection Detected</p>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px' }}>Live camera requires a secure HTTPS connection.</p>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {hasCamera === false ? (
            <div style={{ textAlign: 'center', padding: '30px', color: theme.textSecondary }}>
              <Icons.Camera width={48} height={48} style={{ marginBottom: '12px', opacity: 0.4 }} />
              <p style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600 }}>No Camera Available</p>
              <p style={{ margin: 0, fontSize: '12px' }}>Your device doesn't have a camera or camera access is blocked.</p>
            </div>
          ) : !isLibraryLoaded ? (
            <div style={{ textAlign: 'center', padding: '40px', color: theme.textSecondary }}>
              <div style={{ width: '40px', height: '40px', border: `3px solid ${theme.border}`, borderTop: '3px solid #4f46e5', borderRadius: '50%', margin: '0 auto 12px', animation: 'spin 1s linear infinite' }}></div>
              <p style={{ margin: 0, fontSize: '14px' }}>Loading scanner...</p>
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '30px' }}>
              <Icons.AlertTriangle width={48} height={48} style={{ color: '#dc2626', marginBottom: '12px' }} />
              <p style={{ color: '#dc2626', fontSize: '14px', margin: '0 0 8px 0', fontWeight: 600 }}>{error}</p>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '12px' }}>
                <button onClick={startCameraScanner} style={{ ...styles.btnPrimary, maxWidth: '180px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><Icons.RefreshCw width={16} height={16} />Retry Camera</button>
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
            </>
          )}
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          <button onClick={onClose} style={{ ...styles.btnPrimary, backgroundColor: styles.btnSecondaryBg, color: styles.btnSecondaryText, width: '100%' }}>Cancel</button>
        </div>
      </div>
    </Modal>
  );
}