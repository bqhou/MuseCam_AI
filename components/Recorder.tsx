import React, { useRef, useEffect, useState, useCallback } from 'react';
import { AspectRatio, VideoDimensions } from '../types';

interface RecorderProps {
  aspectRatio: AspectRatio;
  isRecording: boolean;
  onRecordingFinish: (url: string) => void;
}

const Recorder: React.FC<RecorderProps> = ({ aspectRatio, isRecording, onRecordingFinish }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  // Determine canvas dimensions based on aspect ratio
  // We'll use a base height of 1080 for high quality
  const getDimensions = (ratio: AspectRatio): VideoDimensions => {
    const baseHeight = 1080;
    switch (ratio) {
      case AspectRatio.NINE_SIXTEEN:
        return { width: (baseHeight * 9) / 16, height: baseHeight }; // 607 x 1080
      case AspectRatio.SIXTEEN_NINE:
        return { width: 1920, height: 1080 }; // 1920 x 1080
      case AspectRatio.THREE_FOUR:
        return { width: (baseHeight * 3) / 4, height: baseHeight }; // 810 x 1080
      case AspectRatio.ONE_ONE:
        return { width: 1080, height: 1080 };
      default:
        return { width: 1920, height: 1080 };
    }
  };

  const dimensions = getDimensions(aspectRatio);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            aspectRatio: { ideal: 1.777 }, // Request 16:9 native
          },
          audio: false, // We handle audio separately for the file if needed, but for now let's just record video + mic audio via a combined stream if desired. 
                        // *Correction*: The prompt wants the USER to be recorded. We need to merge the mic audio into this MediaRecorder.
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
      }
    };

    startCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Draw loop to crop video to canvas
  const draw = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    // Check if video is ready
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      const { width: targetW, height: targetH } = getDimensions(aspectRatio);
      
      // Set canvas size
      canvas.width = targetW;
      canvas.height = targetH;

      // Calculate crop (Center Crop)
      const videoAspect = video.videoWidth / video.videoHeight;
      const targetAspect = targetW / targetH;
      
      let drawW, drawH, startX, startY;

      if (videoAspect > targetAspect) {
        // Video is wider than target: Crop width
        drawH = video.videoHeight;
        drawW = video.videoHeight * targetAspect;
        startX = (video.videoWidth - drawW) / 2;
        startY = 0;
      } else {
        // Video is taller than target: Crop height
        drawW = video.videoWidth;
        drawH = video.videoWidth / targetAspect;
        startX = 0;
        startY = (video.videoHeight - drawH) / 2;
      }

      ctx.drawImage(video, startX, startY, drawW, drawH, 0, 0, targetW, targetH);
    }

    animationFrameRef.current = requestAnimationFrame(draw);
  }, [aspectRatio]);

  useEffect(() => {
    draw();
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [draw]);

  // Handling Recording Logic
  useEffect(() => {
    if (isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecording]);

  const startRecording = async () => {
    if (!canvasRef.current) return;
    
    chunksRef.current = [];
    
    // 1. Get Video Stream from Canvas
    const canvasStream = canvasRef.current.captureStream(30); // 30 FPS
    
    // 2. Get Audio Stream from Mic
    let audioStream: MediaStream | null = null;
    try {
        audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (e) {
        console.error("Mic permission denied or missing for recording", e);
    }

    // 3. Combine tracks
    const combinedTracks = [
        ...canvasStream.getVideoTracks(),
        ...(audioStream ? audioStream.getAudioTracks() : [])
    ];
    const combinedStream = new MediaStream(combinedTracks);

    const recorder = new MediaRecorder(combinedStream, { mimeType: 'video/webm;codecs=vp9' });
    
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/mp4' });
        const url = URL.createObjectURL(blob);
        onRecordingFinish(url);
        
        // Stop mic tracks if they were created just for this
        if (audioStream) {
            audioStream.getTracks().forEach(t => t.stop());
        }
    };

    mediaRecorderRef.current = recorder;
    recorder.start();
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-2xl shadow-2xl bg-black">
        {/* Hidden source video */}
        <video ref={videoRef} className="hidden" muted playsInline />
        
        {/* Display/Recording Canvas */}
        <canvas 
            ref={canvasRef} 
            className="block object-contain max-w-full max-h-full"
            style={{
                // We use style to fit it nicely in the UI container while preserving aspect ratio
                aspectRatio: `${dimensions.width} / ${dimensions.height}`
            }}
        />
    </div>
  );
};

export default Recorder;