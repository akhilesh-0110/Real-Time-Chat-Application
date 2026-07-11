import React, { useEffect, useRef } from "react";
import { useCall } from "../context/CallContext";
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff } from "lucide-react";

const CallOverlay = () => {
  const {
    callState,
    callType,
    callerInfo,
    receiverInfo,
    localStream,
    remoteStream,
    isMuted,
    isCameraOff,
    acceptCall,
    declineCall,
    endCall,
    toggleMic,
    toggleCamera,
  } = useCall();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const remoteAudioRef = useRef(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, callState]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream, callState]);

  useEffect(() => {
    if (remoteAudioRef.current && remoteStream && callType === "audio") {
      remoteAudioRef.current.srcObject = remoteStream;
    }
  }, [remoteStream, callType, callState]);

  if (callState === "idle") return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 bg-opacity-95 text-white backdrop-blur-md transition-all duration-300">
      {/* 1. OUTGOING CALL STATE */}
      {callState === "calling" && (
        <div className="flex flex-col items-center justify-center space-y-8 animate-fade-in">
          <div className="relative">
            {/* Pulsing ring animation */}
            <div className="absolute inset-0 rounded-full bg-blue-500 opacity-20 animate-ping" />
            <img
              src={receiverInfo?.avatar || "/avatar-holder.avif"}
              alt={receiverInfo?.name}
              className="relative w-32 h-32 rounded-full object-cover border-4 border-blue-500 shadow-2xl"
            />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold">{receiverInfo?.name}</h2>
            <p className="text-blue-400 mt-2 animate-pulse text-sm uppercase tracking-widest font-semibold">
              Calling ({callType})...
            </p>
          </div>
          <button
            onClick={endCall}
            className="p-4 bg-red-600 hover:bg-red-700 active:scale-95 rounded-full transition shadow-lg hover:shadow-red-900/50"
          >
            <PhoneOff className="w-8 h-8" />
          </button>
        </div>
      )}

      {/* 2. INCOMING CALL STATE */}
      {callState === "incoming" && (
        <div className="flex flex-col items-center justify-center space-y-8 animate-fade-in max-w-sm px-6 py-8 bg-slate-900/80 rounded-2xl border border-slate-800 shadow-2xl">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-green-500 opacity-25 animate-ping" />
            <img
              src={callerInfo?.avatar || "/avatar-holder.avif"}
              alt={callerInfo?.name}
              className="relative w-28 h-28 rounded-full object-cover border-4 border-green-500 shadow-xl"
            />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold">{callerInfo?.name}</h2>
            <p className="text-slate-400 mt-1 text-sm">
              Incoming {callType} call...
            </p>
          </div>
          <div className="flex items-center gap-6 mt-4">
            <button
              onClick={declineCall}
              className="p-4 bg-red-600 hover:bg-red-700 active:scale-95 rounded-full transition shadow-lg hover:shadow-red-900/30"
              title="Decline"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
            <button
              onClick={acceptCall}
              className="p-4 bg-green-600 hover:bg-green-700 active:scale-95 rounded-full transition shadow-lg hover:shadow-green-900/30"
              title="Accept"
            >
              {callType === "video" ? (
                <Video className="w-6 h-6" />
              ) : (
                <Phone className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* 3. ONGOING CALL STATE */}
      {callState === "ongoing" && (
        <div className="relative w-full h-full flex flex-col justify-between p-6">
          {/* Main Area */}
          <div className="flex-1 relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-inner flex items-center justify-center">
            {callType === "video" ? (
              <>
                {/* Remote Video (Full Screen) */}
                {remoteStream ? (
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <img
                      src={callerInfo?.avatar || receiverInfo?.avatar || "/avatar-holder.avif"}
                      alt="User Avatar"
                      className="w-24 h-24 rounded-full object-cover border border-slate-700"
                    />
                    <p className="text-slate-400 animate-pulse text-sm">
                      Connecting video stream...
                    </p>
                  </div>
                )}

                {/* Local Video (Floating Overlay) */}
                <div className="absolute bottom-4 right-4 w-32 md:w-48 aspect-video rounded-xl overflow-hidden shadow-2xl border-2 border-slate-700 bg-slate-950 z-10 transition hover:scale-105">
                  {isCameraOff ? (
                    <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-500">
                      <VideoOff className="w-8 h-8" />
                    </div>
                  ) : (
                    <video
                      ref={localVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover transform -scale-x-100"
                    />
                  )}
                </div>
              </>
            ) : (
              /* Audio Call Representation */
              <div className="flex items-center justify-center gap-12 md:gap-24 flex-wrap">
                <div className="flex flex-col items-center gap-3">
                  <img
                    src={localStream ? (callerInfo?.avatar || "/avatar-holder.avif") : "/avatar-holder.avif"}
                    alt="Local User"
                    className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-slate-700 shadow-xl"
                  />
                  <span className="text-sm font-medium text-slate-400">You</span>
                </div>
                <div className="w-8 h-8 flex items-center justify-center text-slate-600 text-2xl font-bold animate-pulse">
                  •••
                </div>
                <div className="flex flex-col items-center gap-3">
                  <img
                    src={callerInfo?.avatar || receiverInfo?.avatar || "/avatar-holder.avif"}
                    alt="Remote User"
                    className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-blue-500 shadow-xl animate-pulse"
                  />
                  <span className="text-sm font-medium text-slate-400">
                    {callerInfo?.name || receiverInfo?.name}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Control Bar */}
          <div className="h-24 flex items-center justify-center gap-6 mt-4">
            {/* Toggle Microphone */}
            <button
              onClick={toggleMic}
              className={`p-4 rounded-full transition shadow-lg ${
                isMuted
                  ? "bg-amber-600 hover:bg-amber-700 text-white"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-200"
              }`}
              title={isMuted ? "Unmute Mic" : "Mute Mic"}
            >
              {isMuted ? (
                <MicOff className="w-6 h-6" />
              ) : (
                <Mic className="w-6 h-6" />
              )}
            </button>

            {/* Toggle Camera (Only for video calls) */}
            {callType === "video" && (
              <button
                onClick={toggleCamera}
                className={`p-4 rounded-full transition shadow-lg ${
                  isCameraOff
                    ? "bg-amber-600 hover:bg-amber-700 text-white"
                    : "bg-slate-800 hover:bg-slate-700 text-slate-200"
                }`}
                title={isCameraOff ? "Turn Camera On" : "Turn Camera Off"}
              >
                {isCameraOff ? (
                  <VideoOff className="w-6 h-6" />
                ) : (
                  <Video className="w-6 h-6" />
                )}
              </button>
            )}

            {/* End Call / Hang Up */}
            <button
              onClick={endCall}
              className="p-4 bg-red-600 hover:bg-red-700 active:scale-95 rounded-full transition shadow-lg hover:shadow-red-900/40"
              title="Hang Up"
            >
              <PhoneOff className="w-6 h-6" />
            </button>

            {/* Hidden Audio Tag for Audio Calls */}
            {callType === "audio" && remoteStream && (
              <audio ref={remoteAudioRef} autoPlay />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CallOverlay;
