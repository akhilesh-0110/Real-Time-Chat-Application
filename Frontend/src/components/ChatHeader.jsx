import { X, Phone, Video } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedUser } from "../store/slices/chatSlice";
import { useCall } from "../context/CallContext";

const ChatHeader = () => {
  const { selectedUser } = useSelector((state) => state.chat);
  const { onlineUsers } = useSelector((state) => state.auth);
  const { startCall } = useCall();
  const dispatch = useDispatch();

  const isOnline = onlineUsers.includes(selectedUser?._id);

  return (
    <>
      <div className="p-3 border-b bg-gray-200 ring-1 ring-gray-300">
        <div className="flex items-center justify-between">
          {/* USER INFO */}
          <div className="flex items-center gap-3">
            {/* AVATAR */}
            <div className="relative w-10 h-10">
              <img
                src={selectedUser?.avatar?.url || "/avatar-holder.avif"}
                alt="/avatar-holder.avif"
                className="w-full h-full object-cover rounded-full"
              />
              {isOnline && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-white border-2 rounded-full" />
              )}
            </div>

            {/* Name and Status */}
            <div>
              <h3 className="font-medium text-base text-black">
                {selectedUser?.fullName}
              </h3>
              <p className="text-sm text-black">
                {isOnline ? "Online" : "Offline"}
              </p>
            </div>
          </div>

          {/* ACTIONS & CLOSE */}
          <div className="flex items-center gap-2">
            {/* Voice Call */}
            <button
              onClick={() => startCall(selectedUser, "audio")}
              disabled={!isOnline}
              className={`p-2 rounded-full transition ${
                isOnline
                  ? "text-gray-700 hover:bg-gray-300 hover:text-black"
                  : "text-gray-400 cursor-not-allowed opacity-50"
              }`}
              title={isOnline ? "Start Voice Call" : "User is offline"}
            >
              <Phone className="w-5 h-5" />
            </button>

            {/* Video Call */}
            <button
              onClick={() => startCall(selectedUser, "video")}
              disabled={!isOnline}
              className={`p-2 rounded-full transition ${
                isOnline
                  ? "text-gray-700 hover:bg-gray-300 hover:text-black"
                  : "text-gray-400 cursor-not-allowed opacity-50"
              }`}
              title={isOnline ? "Start Video Call" : "User is offline"}
            >
              <Video className="w-5 h-5" />
            </button>

            <div className="w-px h-6 bg-gray-300 mx-1" />

            {/* Close Button */}
            <button
              onClick={() => dispatch(setSelectedUser(null))}
              className="text-gray-800 hover:text-black transition p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatHeader;
