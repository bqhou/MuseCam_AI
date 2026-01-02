import React, { useEffect, useState } from 'react';

interface OverlayProps {
  staticPrompt: string | null;
  livePrompt: string | null;
  isRecording: boolean;
}

const Overlay: React.FC<OverlayProps> = ({ staticPrompt, livePrompt, isRecording }) => {
  const [visibleText, setVisibleText] = useState<string | null>(null);

  useEffect(() => {
    if (isRecording && livePrompt) {
      setVisibleText(livePrompt);
    } else if (!isRecording && staticPrompt) {
      setVisibleText(staticPrompt);
    } else if (!isRecording && !staticPrompt) {
      setVisibleText("Ready to start your story?");
    }
  }, [isRecording, livePrompt, staticPrompt]);

  if (!visibleText) return null;

  return (
    <div className="absolute top-10 left-0 right-0 px-8 z-20 pointer-events-none">
       <div className={`max-w-xl mx-auto transition-all duration-700 transform ${visibleText ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
           <div className="bg-black/30 backdrop-blur-sm p-6 rounded-2xl border border-white/10 shadow-2xl text-center">
                <span className="inline-block mb-2 px-2 py-1 text-[10px] font-bold tracking-widest text-white/80 uppercase bg-white/10 rounded-sm">
                    {isRecording ? "Friend AI is Listening..." : "Inspiration"}
                </span>
                <h3 className="text-2xl md:text-3xl font-serif font-medium text-white leading-snug drop-shadow-md">
                    {visibleText}
                </h3>
           </div>
       </div>
    </div>
  );
};

export default Overlay;