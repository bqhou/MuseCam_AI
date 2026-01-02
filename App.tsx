import React, { useState, useEffect } from 'react';
import Recorder from './components/Recorder';
import ControlPanel from './components/ControlPanel';
import Overlay from './components/Overlay';
import { AspectRatio, PromptSuggestion } from './types';
import { generateIceBreakers } from './services/geminiService';
import { useGeminiLive } from './hooks/useGeminiLive';

const App: React.FC = () => {
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.NINE_SIXTEEN);
  const [isRecording, setIsRecording] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [staticPrompts, setStaticPrompts] = useState<PromptSuggestion[]>([]);
  const [currentStaticPromptIndex, setCurrentStaticPromptIndex] = useState(0);
  const [isLoadingPrompts, setIsLoadingPrompts] = useState(false);

  // Gemini Live Hook
  const { isConnected, livePrompt, connect, disconnect, clearPrompt } = useGeminiLive();

  // Fetch initial prompts
  useEffect(() => {
    const loadPrompts = async () => {
      setIsLoadingPrompts(true);
      const prompts = await generateIceBreakers();
      setStaticPrompts(prompts);
      setIsLoadingPrompts(false);
    };
    loadPrompts();
  }, []);

  const handleToggleRecording = async () => {
    if (isRecording) {
      // Stop
      setIsRecording(false);
      disconnect(); // Stop AI
    } else {
      // Start
      setVideoUrl(null); // Reset previous video
      setIsRecording(true);
      clearPrompt(); // Clear old live prompts
      await connect(); // Start AI listener
    }
  };

  const handleRecordingFinish = (url: string) => {
    setVideoUrl(url);
  };

  const handleDownload = () => {
    if (videoUrl) {
      const a = document.createElement('a');
      a.href = videoUrl;
      a.download = `musecam-${Date.now()}.mp4`;
      a.click();
    }
  };

  const handleReset = () => {
    setVideoUrl(null);
    clearPrompt();
  };

  const handleRefreshPrompts = async () => {
    if (isLoadingPrompts) return;
    setIsLoadingPrompts(true);
    const prompts = await generateIceBreakers();
    setStaticPrompts(prompts);
    setCurrentStaticPromptIndex(0);
    setIsLoadingPrompts(false);
  };

  const cyclePrompt = () => {
    if (staticPrompts.length > 0) {
      setCurrentStaticPromptIndex((prev) => (prev + 1) % staticPrompts.length);
    }
  };

  const currentStaticPrompt = staticPrompts.length > 0 ? staticPrompts[currentStaticPromptIndex].text : null;

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-slate-800 flex flex-col md:flex-row p-6 md:p-10 gap-8 font-sans overflow-x-hidden">
      
      {/* Sidebar (Left) - Prompts Only */}
      <div className="md:w-[320px] flex flex-col gap-6 order-2 md:order-1 shrink-0 pt-4">
        
        {/* Header */}
        <div className="space-y-2">
            <h1 className="text-5xl font-serif italic text-indigo-950">MuseCam</h1>
            <p className="text-slate-500 font-light text-sm">
                Your AI-powered video diarist.
            </p>
        </div>

        {/* Topic Prompt Card */}
        <div className="bg-white p-6 rounded-2xl border border-orange-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="absolute top-0 left-0 w-1 h-full bg-orange-300"></div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-orange-400 mb-4">Topic Ideas</h4>
            <div className="min-h-[120px] flex items-center">
                <p className="text-xl font-serif text-slate-800 leading-relaxed">
                    {isLoadingPrompts ? "Gathering thoughts..." : currentStaticPrompt || "Tap refresh for ideas..."}
                </p>
            </div>
            
            <div className="flex gap-2 mt-6 pt-4 border-t border-slate-50">
                  <button 
                    onClick={cyclePrompt}
                    className="flex-1 py-2 px-4 bg-orange-50 text-orange-700 rounded-lg text-sm font-bold tracking-wide hover:bg-orange-100 transition-colors"
                  >
                    NEXT TOPIC
                  </button>
                  <button 
                    onClick={handleRefreshPrompts}
                    className="py-2 px-3 bg-white border border-slate-200 text-slate-400 rounded-lg hover:text-orange-500 hover:border-orange-200 transition-colors"
                    title="Generate New Ideas"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                  </button>
            </div>
        </div>

        <div className="bg-indigo-50 p-4 rounded-xl text-indigo-900/60 text-xs leading-relaxed">
            <span className="font-bold block mb-1">How it works:</span>
            Start recording and say whatever is on your mind. MuseCam AI will listen like a friend and ask occasional questions to keep the flow going.
        </div>
      </div>

      {/* Main Content (Right/Center) */}
      <div className="flex-1 flex flex-col items-center justify-start gap-8 order-1 md:order-2">
         
         {/* Video Frame */}
         <div className="relative shadow-2xl rounded-3xl overflow-hidden bg-black ring-8 ring-white/50 transition-all duration-500"
              style={{
                 width: 'auto',
                 height: 'auto',
                 maxHeight: '65vh',
                 maxWidth: '100%',
                 aspectRatio: aspectRatio === AspectRatio.NINE_SIXTEEN ? '9/16' : 
                              aspectRatio === AspectRatio.THREE_FOUR ? '3/4' :
                              aspectRatio === AspectRatio.ONE_ONE ? '1/1' : '16/9',
              }}
         >
             <Recorder 
                aspectRatio={aspectRatio} 
                isRecording={isRecording} 
                onRecordingFinish={handleRecordingFinish} 
             />
             <Overlay 
                staticPrompt={currentStaticPrompt} 
                livePrompt={livePrompt} 
                isRecording={isRecording}
             />
         </div>

         {/* Unified Control Panel */}
         <div className="w-full flex justify-center pb-8 min-h-[140px]">
             <ControlPanel 
                isRecording={isRecording} 
                onToggleRecording={handleToggleRecording}
                isProcessing={false}
                aspectRatio={aspectRatio}
                setAspectRatio={setAspectRatio}
                videoUrl={videoUrl}
                onDownload={handleDownload}
                onReset={handleReset}
             />
         </div>
      </div>

    </div>
  );
};

export default App;