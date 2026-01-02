import { useState, useRef, useEffect, useCallback } from 'react';
import { getGeminiClient } from '../services/geminiService';
import { LiveSession, LiveServerMessage, Modality } from '@google/genai';

export const useGeminiLive = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [livePrompt, setLivePrompt] = useState<string | null>(null);
  const sessionRef = useRef<LiveSession | null>(null);
  const ai = getGeminiClient();
  
  // Audio context for streaming input
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  const connect = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });
      mediaStreamRef.current = stream;
      
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      // Force 16kHz for Gemini compatibility
      audioContextRef.current = new AudioContextClass({ sampleRate: 16000 });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            console.log('Gemini Live Session Opened');
            setIsConnected(true);
            setLivePrompt("Listening...");
            
            if (!audioContextRef.current || !mediaStreamRef.current) return;

            const ctx = audioContextRef.current;
            const source = ctx.createMediaStreamSource(mediaStreamRef.current);
            // Reduced buffer size to 2048 for lower latency (approx 128ms)
            const processor = ctx.createScriptProcessor(2048, 1, 1);
            
            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            source.connect(processor);
            processor.connect(ctx.destination);
            
            sourceRef.current = source;
            processorRef.current = processor;
          },
          onmessage: (message: LiveServerMessage) => {
             // Handle text output from the model (the "questions")
             const text = message.serverContent?.outputTranscription?.text;
             if (text) {
                setLivePrompt(prev => {
                    const isPlaceholder = prev === "Listening..." || prev === "Connection Error";
                    return (isPlaceholder ? "" : prev) + text;
                });
             }
             
             // If user interrupts, we can clear or keep. 
             // To make it feel like a podcast, we might want to keep the last question visible 
             // until a new one fully forms, or clear it if it's stale.
             // For now, let's just update text as it comes.
             if (message.serverContent?.interrupted) {
                 // Optional: Visual cue that AI was interrupted
             }
          },
          onclose: () => {
            console.log('Gemini Live Session Closed');
            setIsConnected(false);
            setLivePrompt(null);
          },
          onerror: (err) => {
            console.error('Gemini Live Error', err);
            setIsConnected(false);
            setLivePrompt("Connection Error");
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
          },
          outputAudioTranscription: {},
          systemInstruction: `You are a supportive, curious, and attentive friend hanging out with the user.
          
          YOUR GOAL: Listen to the user and ask short, engaging follow-up questions to help them explore their thoughts.
          
          RULES:
          1. DO NOT SPEAK FIRST. This is critical. Wait for the user to say something before you chime in.
          2. JUMP IN! Don't wait for long silences. If the user pauses, ask a quick question.
          3. LISTEN CLOSELY. React to what they actually said.
          4. KEEP IT SHORT. Questions must be under 10 words. (e.g. "Really? Then what?", "How did that feel?", "Wait, explain that.")
          5. BE CASUAL. Use a friendly, conversational tone.
          
          Your audio response will be transcribed and shown as an overlay.`
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (e) {
      console.error("Failed to connect to Live API", e);
      setIsConnected(false);
      setLivePrompt("Connection Failed");
    }
  }, [ai]);

  const disconnect = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    
    if (sourceRef.current) sourceRef.current.disconnect();
    if (processorRef.current) processorRef.current.disconnect();
    if (audioContextRef.current) audioContextRef.current.close();
    if (mediaStreamRef.current) mediaStreamRef.current.getTracks().forEach(t => t.stop());
    
    setIsConnected(false);
    setLivePrompt(null);
  }, []);

  const clearPrompt = () => setLivePrompt("");

  return {
    isConnected,
    livePrompt,
    connect,
    disconnect,
    clearPrompt
  };
};

function createBlob(data: Float32Array): any {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    let s = Math.max(-1, Math.min(1, data[i]));
    int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}