"use client";

import React, { useRef, useState, useEffect } from 'react';
import { Video, Loader2, AlertCircle, Smartphone } from 'lucide-react';
import { toast } from 'sonner';
import FrameManager from '@/components/products/media/FrameManager'; // Import the new manager

interface VideoTo360UploaderProps {
  storeId: string;    // <--- Added for DB save
  productId: string;  // <--- Added for DB save
  onSuccess: () => void; // Called when everything is saved to DB
}

export const VideoTo360Uploader = ({ storeId, productId, onSuccess }: VideoTo360UploaderProps) => {
  // Processing States
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  // Review States
  const [processedFrames, setProcessedFrames] = useState<string[]>([]);
  const [isReviewing, setIsReviewing] = useState(false);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Constants
  const FRAMES_COUNT = 36; 
  const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
  const MAX_RESOLUTION = 1920; 
  const FRAME_QUALITY = 0.75; // Slightly bumped for better quality

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      if (videoRef.current?.src) {
        URL.revokeObjectURL(videoRef.current.src);
      }
      // Note: We don't revoke frame blobs here immediately as FrameManager needs them,
      // but browsers handle blob cleanup on page reload/navigation well.
    };
  }, []);

  // Detect mobile
  const isMobile = () => {
    if (typeof window === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
      || window.innerWidth < 768;
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setProcessedFrames([]); // Reset previous frames

    if (isMobile()) {
        toast.error("Desktop Only", { description: "Please use a computer for 360 processing." });
        e.target.value = '';
        return;
    }

    if (file.size > MAX_VIDEO_SIZE) {
        toast.error("Video too large. Keep it under 50MB.");
        e.target.value = '';
        return;
    }

    if (!file.type.startsWith('video/')) {
        toast.error("Invalid file type.");
        e.target.value = '';
        return;
    }

    const url = URL.createObjectURL(file);
    if (videoRef.current) {
        videoRef.current.src = url;
        videoRef.current.load();
        setProcessing(true);
    }
  };

  const extractFrames = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const duration = video.duration;
    if (duration < 3 || duration > 60) {
        setError("Video must be between 3 and 60 seconds.");
        setProcessing(false);
        URL.revokeObjectURL(video.src);
        return;
    }

    // Resolution Logic
    const scale = Math.min(1, MAX_RESOLUTION / Math.max(video.videoWidth, video.videoHeight));
    canvas.width = Math.floor(video.videoWidth * scale);
    canvas.height = Math.floor(video.videoHeight * scale);

    const interval = duration / FRAMES_COUNT;
    const blobUrls: string[] = []; // Store string URLs, not Blob objects
    let failedFrames = 0;

    try {
        for (let i = 0; i < FRAMES_COUNT; i++) {
            const time = i * interval;
            video.currentTime = time;

            // Seek Promise
            const seekSuccess = await new Promise<boolean>((resolve) => {
                const timeout = setTimeout(() => {
                    video.removeEventListener('seeked', onSeek);
                    resolve(false);
                }, 3000);

                const onSeek = () => {
                    clearTimeout(timeout);
                    video.removeEventListener('seeked', onSeek);
                    resolve(true);
                };
                video.addEventListener('seeked', onSeek);
            });

            if (!seekSuccess) {
                failedFrames++;
                continue;
            }

            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Convert to Blob URL directly here
            const blobUrl = await new Promise<string | null>(resolve => 
                canvas.toBlob((blob) => {
                    if (blob) resolve(URL.createObjectURL(blob));
                    else resolve(null);
                }, 'image/webp', FRAME_QUALITY)
            );

            if (blobUrl) blobUrls.push(blobUrl);
            
            setProgress(Math.round(((i + 1) / FRAMES_COUNT) * 100));
        }

        if (blobUrls.length < 24) {
            setError("Failed to extract enough frames. Try a different video.");
            setProcessing(false);
            return;
        }

        // --- SUCCESS: Switch to Review Mode ---
        setProcessedFrames(blobUrls);
        setIsReviewing(true);
        toast.success(`Extracted ${blobUrls.length} frames ready for review.`);

    } catch (err) {
        console.error(err);
        setError("Processing failed unexpectedly.");
    } finally {
        setProcessing(false);
        setProgress(0);
        URL.revokeObjectURL(video.src); // Done with the video source
    }
  };

  const handleCancelReview = () => {
    setIsReviewing(false);
    setProcessedFrames([]);
  };

  // --- RENDER ---

  // 1. If reviewing, show the Frame Manager
  if (isReviewing) {
    return (
        <FrameManager 
            storeId={storeId}
            productId={productId}
            initialFrames={processedFrames}
            onCancel={handleCancelReview}
            onSaveSuccess={onSuccess}
        />
    );
  }

  // 2. Default Upload UI
  return (
    <div className="bg-slate-50 border-2 border-dashed border-indigo-200 rounded-xl p-6 text-center">
        {/* Hidden Processing Elements */}
        <video 
            ref={videoRef} 
            className="hidden" 
            muted 
            playsInline 
            onLoadedMetadata={() => extractFrames()} 
            onError={() => { setError("Video load failed."); setProcessing(false); }}
            crossOrigin="anonymous"
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* Mobile Warning */}
        {isMobile() && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4 flex items-start gap-3 text-left">
                <Smartphone className="text-orange-600 flex-shrink-0 mt-0.5" size={20} />
                <div>
                    <h5 className="font-bold text-orange-900 text-sm">Desktop Only Feature</h5>
                    <p className="text-xs text-orange-700 mt-1">
                        Video extraction requires significant processing power.
                    </p>
                </div>
            </div>
        )}

        {/* Error State */}
        {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-start gap-2 text-left">
                <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                <div className="flex-1">
                    <h5 className="font-bold text-red-900 text-sm">Processing Failed</h5>
                    <p className="text-xs text-red-700 mt-1">{error}</p>
                    <button onClick={() => setError(null)} className="mt-2 text-xs font-bold text-red-600 underline">Try Again</button>
                </div>
            </div>
        )}

        {/* Upload or Processing UI */}
        {!processing ? (
            <label className={`cursor-pointer block ${isMobile() ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Video size={24} />
                </div>
                <h4 className="font-bold text-slate-900">Upload 360° Video</h4>
                <p className="text-xs text-slate-500 mt-1 mb-2">
                    Upload a 5-30 second video of your product spinning.
                </p>
                <div className="flex flex-col items-center gap-2">
                    <span className="bg-indigo-600 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
                        Select Video (Max 50MB)
                    </span>
                    <span className="text-[10px] text-slate-400">
                        MP4, H.264, 1080p
                    </span>
                </div>
                <input 
                    type="file" 
                    accept="video/mp4,video/quicktime,video/webm" 
                    className="hidden" 
                    onChange={handleVideoUpload}
                    disabled={isMobile()}
                />
            </label>
        ) : (
            <div className="py-4">
                <Loader2 className="animate-spin text-indigo-600 mx-auto mb-3" size={32} />
                <h4 className="font-bold text-slate-900">Processing Video...</h4>
                <div className="w-full bg-slate-200 rounded-full h-2 mt-3 overflow-hidden">
                    <div 
                        className="bg-indigo-600 h-full transition-all duration-300 ease-out" 
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <p className="text-xs text-slate-500 mt-2">
                    {progress}% complete • extracting frames...
                </p>
            </div>
        )}
    </div>
  );
};