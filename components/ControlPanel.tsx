import React from 'react';
import { AspectRatio } from '../types';

interface ControlPanelProps {
  isRecording: boolean;
  onToggleRecording: () => void;
  isProcessing: boolean;
  aspectRatio: AspectRatio;
  setAspectRatio: (ratio: AspectRatio) => void;
  videoUrl: string | null;
  onDownload: () => void;
  onReset: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ 
  isRecording, 
  onToggleRecording, 
  isProcessing,
  aspectRatio,
  setAspectRatio,
  videoUrl,
  onDownload,
  onReset
}) => {

  // DOWNLOAD STATE
  if (videoUrl) {
    return (
      <div className="w-full max-w-2xl bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-indigo-100 shadow-xl flex flex-col md:flex-row items-center gap-6 animate-in slide-in-from-bottom-4 duration-500">
        <div className="flex-1 text-center md:text-left">
           <h3 className="text-xl font-serif text-indigo-900 font-bold mb-1">Session Complete</h3>
           <p className="text-slate-500 text-sm">Your video is ready to save.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
             <button 
                onClick={onReset}
                className="flex-1 md:flex-none py-3 px-6 text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium transition-colors"
             >
                Discard
             </button>
             <button 
                onClick={onDownload}
                className="flex-1 md:flex-none py-3 px-8 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-xl transition-all transform active:scale-95 flex items-center justify-center gap-2"
             >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Download MP4
             </button>
        </div>
      </div>
    );
  }

  // RECORDING STATE (Minimal controls)
  if (isRecording) {
      return (
        <div className="flex flex-col gap-4 items-center justify-center p-4">
          <div className="relative group cursor-pointer" onClick={onToggleRecording}>
            <div className="absolute inset-0 rounded-full blur-xl opacity-40 bg-red-500 animate-pulse scale-125"></div>
            <button
              className="relative w-24 h-24 flex items-center justify-center rounded-full border-[6px] border-white shadow-2xl transition-all duration-300 transform bg-red-500 scale-100"
            >
              <div className="w-8 h-8 bg-white rounded-md" />
            </button>
          </div>
          <p className="text-sm font-bold tracking-widest uppercase text-red-500 animate-pulse">
             Recording in Progress
          </p>
        </div>
      );
  }

  // SETUP STATE (Size selection + Start)
  return (
    <div className="w-full max-w-3xl flex flex-col items-center gap-8">
      
      {/* Aspect Ratio Selector */}
      <div className="bg-white/60 backdrop-blur p-2 rounded-2xl flex gap-2 shadow-sm border border-white/50">
          {[
            { label: '9:16', ratio: AspectRatio.NINE_SIXTEEN, icon: 'h-8 w-5' },
            { label: '16:9', ratio: AspectRatio.SIXTEEN_NINE, icon: 'h-5 w-8' },
            { label: '1:1', ratio: AspectRatio.ONE_ONE, icon: 'h-6 w-6' },
            { label: '3:4', ratio: AspectRatio.THREE_FOUR, icon: 'h-8 w-6' },
          ].map((opt) => (
            <button
              key={opt.ratio}
              onClick={() => setAspectRatio(opt.ratio)}
              className={`relative px-6 py-3 rounded-xl flex flex-col items-center gap-1 transition-all duration-300 ${
                aspectRatio === opt.ratio 
                ? 'bg-white shadow-md text-indigo-600 ring-1 ring-indigo-100' 
                : 'text-slate-400 hover:bg-white/50 hover:text-slate-600'
              }`}
            >
              <div className={`border-2 rounded-sm border-current ${opt.icon} mb-1`} />
              <span className="text-[10px] font-bold tracking-wider">{opt.label}</span>
            </button>
          ))}
      </div>

      {/* Start Button */}
      <div className="flex flex-col items-center gap-3">
        <div className="relative group cursor-pointer" onClick={onToggleRecording}>
            <div className="absolute inset-0 rounded-full blur-xl opacity-30 bg-indigo-400 scale-90 group-hover:scale-110 transition-all duration-500"></div>
            <button
            disabled={isProcessing}
            className="relative w-20 h-20 flex items-center justify-center rounded-full border-[4px] border-white shadow-xl transition-all duration-300 transform bg-indigo-600 group-hover:bg-indigo-500 group-hover:scale-105"
            >
            <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-white border-b-[10px] border-b-transparent ml-1" />
            </button>
        </div>
        <p className="text-xs font-bold tracking-[0.2em] uppercase text-indigo-900/60">
            Start Session
        </p>
      </div>

    </div>
  );
};

export default ControlPanel;