"use client";

import { useState, useRef, useEffect } from "react";
import { fetchApi } from "@/lib/api";

interface Message {
  role: "user" | "assistant";
  content: string;
  time: string;
  isVoice?: boolean;
}

interface KuddusCopilotProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function KuddusCopilot({ isOpen, onClose }: KuddusCopilotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I am Kuddus, your AI HR Assistant. You can speak or type to ask me about employee attendance, pending leaves, company stats, or perform HR tasks.",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [followUps, setFollowUps] = useState<string[]>([
    "Who is late today?",
    "Show pending leave requests",
    "What is my attendance record?",
  ]);

  // Voice state: TTS, Recording, and Audio playback
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [currentlySpeakingIndex, setCurrentlySpeakingIndex] = useState<number | null>(null);
  const [micError, setMicError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const cleanupMediaStream = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    mediaRecorderRef.current = null;
    audioChunksRef.current = [];
    setIsRecording(false);
    setRecordingDuration(0);
  };

  const handleClose = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    cleanupMediaStream();
    setCurrentlySpeakingIndex(null);
    onClose();
  };

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }
    };
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const speakText = (text: string, messageIndex?: number) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();
    if (messageIndex !== undefined && currentlySpeakingIndex === messageIndex) {
      setCurrentlySpeakingIndex(null);
      return;
    }

    const cleanText = text
      .replace(/[*_#`~]/g, "")
      .replace(/https?:\/\/\S+/g, "")
      .trim();
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      (v) => v.lang.startsWith("en") || v.lang.startsWith("bn")
    );
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.onend = () => setCurrentlySpeakingIndex(null);
    utterance.onerror = () => setCurrentlySpeakingIndex(null);

    if (messageIndex !== undefined) {
      setCurrentlySpeakingIndex(messageIndex);
    }
    window.speechSynthesis.speak(utterance);
  };

  const startRecording = async () => {
    setMicError(null);
    if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setMicError("Microphone access is not supported in this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      let mimeType = "audio/webm";
      if (typeof MediaRecorder !== "undefined") {
        if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
          mimeType = "audio/webm;codecs=opus";
        } else if (MediaRecorder.isTypeSupported("audio/webm")) {
          mimeType = "audio/webm";
        } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
          mimeType = "audio/mp4";
        } else if (MediaRecorder.isTypeSupported("audio/wav")) {
          mimeType = "audio/wav";
        }
      }

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.start(250);
      setIsRecording(true);
      setRecordingDuration(0);

      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Microphone access error:", err);
      setMicError("Microphone permission was denied or is unavailable.");
    }
  };

  const cancelRecording = () => {
    cleanupMediaStream();
  };

  const stopAndSendRecording = () => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === "inactive") {
      cleanupMediaStream();
      return;
    }

    const recorder = mediaRecorderRef.current;
    const mimeType = recorder.mimeType || "audio/webm";

    recorder.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
      cleanupMediaStream();
      if (audioBlob.size > 0) {
        await handleSendAudio(audioBlob, mimeType);
      }
    };

    recorder.stop();
  };

  const handleSendAudio = async (audioBlob: Blob, mimeType: string) => {
    if (loading) return;

    const tempUserMsg: Message = {
      role: "user",
      content: "🎤 Voice message...",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isVoice: true,
    };

    const userMsgIndex = messages.length;
    setMessages((prev) => [...prev, tempUserMsg]);
    setLoading(true);

    try {
      const formData = new FormData();
      const ext = mimeType.includes("mp4")
        ? "recording.mp4"
        : mimeType.includes("wav")
        ? "recording.wav"
        : "recording.webm";
      formData.append("audio", audioBlob, ext);

      const res = await fetchApi("/agent/converse", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        const transcript = data.transcript?.trim();

        setMessages((prev) =>
          prev.map((m, idx) =>
            idx === userMsgIndex
              ? {
                  ...m,
                  content: transcript ? `🎤 "${transcript}"` : "🎤 (Voice message)",
                }
              : m
          )
        );

        const reply = data.reply || "Task processed successfully.";
        const aiMsg: Message = {
          role: "assistant",
          content: reply,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, aiMsg]);

        if (data.followUpPrompts && Array.isArray(data.followUpPrompts)) {
          setFollowUps(data.followUpPrompts);
        }

        if (ttsEnabled) {
          speakText(reply, userMsgIndex + 1);
        }
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Sorry, I had trouble processing your audio request. Please try again.",
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Network error connecting to Kuddus AI agent.",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      role: "user",
      content: textToSend,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const nextIndex = messages.length + 1;
    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInput("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("text", textToSend);

      const res = await fetchApi("/agent/converse", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        const reply = data.reply || "Task processed successfully.";
        const aiMsg: Message = {
          role: "assistant",
          content: reply,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, aiMsg]);
        if (data.followUpPrompts && Array.isArray(data.followUpPrompts)) {
          setFollowUps(data.followUpPrompts);
        }
        if (ttsEnabled) {
          speakText(reply, nextIndex);
        }
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Sorry, I had trouble processing your request. Please try again.",
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Network error connecting to Kuddus AI agent.",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs transition-opacity"
        onClick={handleClose}
      />

      {/* Slide-Over Drawer */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 border-l border-slate-200 animate-in">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-sm shadow-sm">
              K
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                Kuddus AI Copilot
                <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                  Groq · Gemini
                </span>
              </h3>
              <p className="text-[11px] text-slate-500">Natural language HRM assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {/* TTS Voice Output Toggle */}
            <button
              type="button"
              onClick={() => {
                if (ttsEnabled && typeof window !== "undefined" && "speechSynthesis" in window) {
                  window.speechSynthesis.cancel();
                  setCurrentlySpeakingIndex(null);
                }
                setTtsEnabled(!ttsEnabled);
              }}
              title={ttsEnabled ? "Voice output enabled (click to mute)" : "Voice output muted (click to enable)"}
              className={`p-1.5 rounded-lg transition-colors ${
                ttsEnabled
                  ? "text-indigo-600 bg-indigo-50 hover:bg-indigo-100"
                  : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              }`}
            >
              {ttsEnabled ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
              )}
            </button>
            <button
              onClick={handleClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Message History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-indigo-600 text-white rounded-br-xs shadow-xs"
                    : "bg-slate-100 text-slate-800 rounded-bl-xs border border-slate-200/60"
                }`}
              >
                <p className="whitespace-pre-wrap">{m.content}</p>
              </div>

              {/* Message metadata & listen action */}
              <div className={`flex items-center gap-2 mt-1 px-1 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <span className="text-[10px] text-slate-400">{m.time}</span>
                {m.role === "assistant" && (
                  <button
                    type="button"
                    onClick={() => speakText(m.content, idx)}
                    title={currentlySpeakingIndex === idx ? "Stop speaking" : "Listen to this message"}
                    className={`p-0.5 rounded text-slate-400 hover:text-indigo-600 transition-colors flex items-center gap-0.5 ${
                      currentlySpeakingIndex === idx ? "text-indigo-600 font-medium" : ""
                    }`}
                  >
                    {currentlySpeakingIndex === idx ? (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-ping" />
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                        </svg>
                      </>
                    ) : (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      </svg>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-slate-400 py-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"></span>
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce delay-100"></span>
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce delay-200"></span>
              <span>Kuddus is thinking...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        {followUps.length > 0 && !loading && !isRecording && (
          <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/50 flex flex-wrap gap-1.5">
            {followUps.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip)}
                className="text-xs bg-white hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 px-2.5 py-1 rounded-full border border-slate-200 transition-colors truncate max-w-full"
              >
                {chip}
              </button>
            ))}
          </div>
        )}

        {/* Input Bar / Voice Recording Bar */}
        <div className="p-4 border-t border-slate-200 bg-white">
          {micError && (
            <div className="mb-2 text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-2.5 py-1.5 flex items-center justify-between">
              <span>{micError}</span>
              <button onClick={() => setMicError(null)} className="font-bold text-rose-500 hover:text-rose-700 ml-2">✕</button>
            </div>
          )}

          {isRecording ? (
            /* Active Recording View */
            <div className="flex items-center justify-between gap-3 bg-rose-50/70 border border-rose-200 rounded-xl p-2.5">
              <div className="flex items-center gap-2.5">
                <div className="relative flex items-center justify-center w-3 h-3">
                  <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping absolute" />
                  <span className="w-2 h-2 rounded-full bg-rose-600 relative" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-rose-950">Listening...</p>
                  <p className="text-[11px] text-rose-700 font-mono">{formatDuration(recordingDuration)}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={cancelRecording}
                  title="Discard recording"
                  className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors"
                >
                  Discard
                </button>
                <button
                  type="button"
                  onClick={stopAndSendRecording}
                  title="Send voice message to Kuddus"
                  className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xs flex items-center gap-1 transition-colors"
                >
                  <span>Send</span>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            /* Standard Text + Mic Input */
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything or click mic to speak..."
                disabled={loading}
                className="corp-input flex-1 text-sm py-2"
              />
              <button
                type="button"
                onClick={startRecording}
                disabled={loading}
                title="Speak to Kuddus (Click to record)"
                className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/60 hover:border-indigo-200 transition-colors disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="btn-primary p-2.5 rounded-xl disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
