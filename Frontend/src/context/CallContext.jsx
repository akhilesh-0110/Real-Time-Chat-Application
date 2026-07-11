import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { getSocket } from "../lib/socket";
import { toast } from "react-toastify";

const CallContext = createContext();

export const useCall = () => useContext(CallContext);

const servers = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export const CallProvider = ({ children }) => {
  const { authUser } = useSelector((state) => state.auth);
  const [callState, setCallState] = useState("idle"); // idle, calling, incoming, ongoing
  const [callType, setCallType] = useState("video"); // video, audio
  const [callerInfo, setCallerInfo] = useState(null); // { id, name, avatar }
  const [receiverInfo, setReceiverInfo] = useState(null); // { id, name, avatar }
  
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);

  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const socketRef = useRef(null);

  const cleanupCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    setLocalStream(null);
    setRemoteStream(null);

    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }

    setCallState("idle");
    setCallerInfo(null);
    setReceiverInfo(null);
    setIsMuted(false);
    setIsCameraOff(false);
  };

  useEffect(() => {
    const handleIncomingCallEvent = (e) => {
      const { from, offer, type, callerName, callerAvatar } = e.detail;
      if (pcRef.current || localStreamRef.current) {
        const socket = getSocket();
        if (socket) socket.emit("endCall", { to: from });
        return;
      }
      
      setCallType(type);
      setCallerInfo({ id: from, name: callerName, avatar: callerAvatar });
      setCallState("incoming");
      
      const pc = new RTCPeerConnection(servers);
      pcRef.current = pc;
      pc.offerData = offer;
    };

    const handleCallAcceptedEvent = async (e) => {
      const { answer } = e.detail;
      try {
        if (pcRef.current) {
          await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
          setCallState("ongoing");
        }
      } catch (err) {
        console.error("Error setting remote description:", err);
        cleanupCall();
      }
    };

    const handleIceCandidateEvent = async (e) => {
      const { candidate } = e.detail;
      try {
        if (pcRef.current) {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (err) {
        console.error("Error adding ICE candidate:", err);
      }
    };

    const handleCallEndedEvent = () => {
      toast.info("Call ended");
      cleanupCall();
    };

    window.addEventListener("incomingCall", handleIncomingCallEvent);
    window.addEventListener("callAccepted", handleCallAcceptedEvent);
    window.addEventListener("sendIceCandidate", handleIceCandidateEvent);
    window.addEventListener("callEnded", handleCallEndedEvent);

    return () => {
      window.removeEventListener("incomingCall", handleIncomingCallEvent);
      window.removeEventListener("callAccepted", handleCallAcceptedEvent);
      window.removeEventListener("sendIceCandidate", handleIceCandidateEvent);
      window.removeEventListener("callEnded", handleCallEndedEvent);
    };
  }, []);

  const startCall = async (targetUser, type) => {
    try {
      setCallType(type);
      setReceiverInfo({
        id: targetUser._id,
        name: targetUser.fullName,
        avatar: targetUser.avatar?.url
      });
      setCallState("calling");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: type === "video",
        audio: true,
      });
      localStreamRef.current = stream;
      setLocalStream(stream);

      const pc = new RTCPeerConnection(servers);
      pcRef.current = pc;

      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          const socket = getSocket();
          if (socket) {
            socket.emit("iceCandidate", {
              to: targetUser._id,
              candidate: event.candidate,
            });
          }
        }
      };

      pc.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          setRemoteStream(event.streams[0]);
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const socket = getSocket();
      if (socket) {
        socket.emit("callUser", {
          userToCall: targetUser._id,
          offer,
          type,
          callerName: authUser.fullName,
          callerAvatar: authUser.avatar?.url,
        });
      }
    } catch (err) {
      console.error("Failed to start call:", err);
      toast.error("Could not access camera/microphone.");
      cleanupCall();
    }
  };

  const acceptCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: callType === "video",
        audio: true,
      });
      localStreamRef.current = stream;
      setLocalStream(stream);

      const pc = pcRef.current;
      if (!pc) return;

      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          const socket = getSocket();
          if (socket) {
            socket.emit("iceCandidate", {
              to: callerInfo.id,
              candidate: event.candidate,
            });
          }
        }
      };

      pc.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          setRemoteStream(event.streams[0]);
        }
      };

      await pc.setRemoteDescription(new RTCSessionDescription(pc.offerData));

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      const socket = getSocket();
      if (socket) {
        socket.emit("answerCall", {
          to: callerInfo.id,
          answer,
        });
      }

      setCallState("ongoing");
    } catch (err) {
      console.error("Failed to accept call:", err);
      toast.error("Could not access camera/microphone.");
      declineCall();
    }
  };

  const declineCall = () => {
    const socket = getSocket();
    if (socket && callerInfo) {
      socket.emit("endCall", { to: callerInfo.id });
    }
    cleanupCall();
  };

  const endCall = () => {
    const activePartnerId = callerInfo?.id || receiverInfo?.id;
    const socket = getSocket();
    if (socket && activePartnerId) {
      socket.emit("endCall", { to: activePartnerId });
    }
    cleanupCall();
  };

  const toggleMic = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleCamera = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraOff(!videoTrack.enabled);
      }
    }
  };

  return (
    <CallContext.Provider
      value={{
        callState,
        callType,
        callerInfo,
        receiverInfo,
        localStream,
        remoteStream,
        isMuted,
        isCameraOff,
        startCall,
        acceptCall,
        declineCall,
        endCall,
        toggleMic,
        toggleCamera,
      }}
    >
      {children}
    </CallContext.Provider>
  );
};
