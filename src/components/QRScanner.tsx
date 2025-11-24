import React, { useState, useEffect, useRef } from 'react';
// CORRECTED: Removed Html5QrcodeSupportedMethod from import
import { Html5Qrcode } from 'html5-qrcode'; 
import { X, Camera, AlertCircle, CheckCircle, Loader2, VideoOff } from 'lucide-react';
import { QRTokenService } from '../services/qrTokenService';

interface QRScannerProps {
  onScanSuccess: (customerId: string, restaurantId: string, payload: any) => void;
  onClose: () => void;
  restaurantId: string;
  mode?: 'customer' | 'redemption';
}

// Define the ID for the container element
const CONTAINER_ID = 'qr-reader';

const QRScanner: React.FC<QRScannerProps> = ({
  onScanSuccess,
  onClose,
  restaurantId,
  mode = 'customer'
}) => {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [cameraStarted, setCameraStarted] = useState(false);

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        // FIX: Replaced the unexported type with the correct numeric state value (2 for running)
        if (scannerRef.current.getState() === 2) { 
          await scannerRef.current.stop();
          console.log("Scanner stopped successfully.");
        }
      } catch (err) {
        // Log warnings for stop errors but continue cleanup
        console.warn("Scanner stop error:", err);
      } finally {
        try {
          // Attempt to clear the scanner instance reference
          scannerRef.current.clear();
        } catch (err) {
          console.warn("Scanner clear error:", err);
        }
        scannerRef.current = null;
        setCameraStarted(false);
        setScanning(false);
      }
    }

    // Explicitly clear container content
    const container = document.getElementById(CONTAINER_ID);
    if (container) {
      container.innerHTML = '';
    }
  };

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      // 1. Pre-flight check: Camera availability
      try {
        const cameras = await Html5Qrcode.getCameras();
        if (cameras.length === 0) {
          setError('No cameras found on this device.');
          setScanning(false);
          return;
        }
      } catch (err) {
        setError('Camera access denied or failed to enumerate devices. Please check permissions.');
        setScanning(false);
        return;
      }

      // 2. Start Scanner
      try {
        setScanning(true);
        setError('');

        const container = document.getElementById(CONTAINER_ID);
        if (!container) {
          setError('Scanner container not found in DOM.');
          return;
        }
        container.innerHTML = '';

        const scanner = new Html5Qrcode(CONTAINER_ID);
        scannerRef.current = scanner;

        // Configuration with a slightly larger qrbox for better detection
        const config = {
          fps: 10,
          qrbox: { width: 280, height: 280 }, // Slightly larger scan box
          aspectRatio: 1.0,
        };

        // Attempt to start the scanner using the environment camera
        await scanner.start(
          { facingMode: 'environment' },
          config,
          handleScanSuccess,
          // The error callback here is usually for continuous reading errors, which we can ignore
          (errorMessage) => {
            // console.warn("Scanner running error:", errorMessage); 
          } 
        );

        if (mounted) {
          setCameraStarted(true);

          // Apply necessary styling to the video element for full coverage
          setTimeout(() => {
            const videoElement = container.querySelector('video');
            if (videoElement) {
              videoElement.style.width = '100%';
              videoElement.style.height = '100%';
              videoElement.style.objectFit = 'cover';
              videoElement.style.position = 'absolute';
              videoElement.style.top = '0';
              videoElement.style.left = '0';
            }
            // Hide the canvas element used by the library internally
            const canvasElement = container.querySelector('canvas');
            if (canvasElement) {
              canvasElement.style.display = 'none';
            }

            container.style.position = 'relative';
            container.style.overflow = 'hidden';
          }, 200); // Increased timeout slightly for reliable DOM updates
        }
      } catch (err: any) {
        console.error('Camera initialization error:', err);
        if (mounted) {
          // Set a user-friendly error
          setError(err?.message || 'Failed to start camera. Please ensure permissions are granted.');
          setScanning(false);
        }
      }
    };

    init();

    // Cleanup function: stop scanner on component unmount
    return () => {
      mounted = false;
      stopScanner();
    };
  }, [restaurantId]); // Re-initialize if restaurantId changes (though unlikely in a modal)

  const handleScanSuccess = async (decodedText: string) => {
    if (processing || success) return;
    setProcessing(true);
    setError('');

    try {
      // Pause the scanner to prevent immediate re-scans
      if (scannerRef.current) {
        await scannerRef.current.pause(true);
      }

      // 1. Verify and Consume Token
      const result = await QRTokenService.verifyAndConsumeToken(decodedText);

      if (!result.valid) {
        setError(result.error || 'Invalid QR code or token already consumed.');
        // Resume scanner for user to try again
        setProcessing(false);
        if (scannerRef.current) {
          await scannerRef.current.resume();
        }
        return;
      }

      // 2. Business Logic Checks
      if (result.payload.restaurantId !== restaurantId) {
        setError('QR code is not valid for this restaurant.');
        setProcessing(false);
        if (scannerRef.current) {
          await scannerRef.current.resume();
        }
        return;
      }

      if (mode === 'redemption' && result.payload.type !== 'redemption') {
        setError('Please scan a reward redemption QR code, not a customer QR.');
        setProcessing(false);
        if (scannerRef.current) {
          await scannerRef.current.resume();
        }
        return;
      }

      // 3. Success
      setSuccess(true);
      // Wait a moment for the success message to show, then close and execute callback
      setTimeout(() => {
        onScanSuccess(
          result.payload.customerId,
          result.payload.restaurantId,
          result.payload
        );
      }, 750); // Increased timeout to 750ms
    } catch (err) {
      console.error('Error processing QR:', err);
      setError('An unexpected error occurred while processing the QR code.');
      setProcessing(false);
      if (scannerRef.current) {
        await scannerRef.current.resume();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">
            {mode === 'redemption' ? 'Scan Reward QR Code' : 'Scan Customer QR Code'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* --- Status Messages --- */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-start gap-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            <span>QR code scanned successfully! Redirecting...</span>
          </div>
        )}

        {processing && (
          <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Processing QR code...</span>
          </div>
        )}
        {/* --- End Status Messages --- */}

        <div className="relative w-full">
          <div
            id={CONTAINER_ID}
            className="w-full rounded-xl overflow-hidden bg-black"
            style={{
              aspectRatio: '1',
              display: 'block',
              position: 'relative',
              width: '100%',
              height: 'auto',
            }}
          />

          {/* Overlay elements */}
          {scanning && !processing && !success && !error && (
            <>
              {/* The Scanner Frame (Focus Box) */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-72 h-72 md:w-64 md:h-64 border-2 border-green-400 rounded-xl shadow-lg transition-all duration-300" />
              </div>
              {/* Optional Scanning Animation (simple line) */}
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-green-400 animate-pulse transition-all duration-1000" />
            </>
          )}

          {/* Overlay when scanning is not active */}
          {!scanning && !error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-white">
              <Loader2 className="h-8 w-8 animate-spin mb-3" />
              <p>Starting Camera...</p>
            </div>
          )}

          {/* Overlay when camera failed */}
          {!!error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-white">
              <VideoOff className="h-8 w-8 mb-3 text-red-400" />
              <p className='text-sm text-center'>Camera Feed Unavailable</p>
            </div>
          )}
        </div>

        <div className="mt-4 text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <Camera className="h-4 w-4" />
            <span>Position QR code within the **green frame**</span>
          </div>
          {mode === 'redemption' && (
            <p className="text-xs text-gray-500 mt-2">
              Make sure the customer shows their reward redemption QR code.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRScanner;