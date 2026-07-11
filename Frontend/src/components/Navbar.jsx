import { LogOut, MessageSquare, Settings, User, Phone, Video } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../store/slices/authSlice";
import { useCall } from "../context/CallContext";

const Navbar = () => {
  const { authUser, onlineUsers } = useSelector((state) => state.auth);
  const { selectedUser } = useSelector((state) => state.chat);
  const { startCall } = useCall();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await dispatch(logout());
    navigate("/login");
  };

  const isOnline = selectedUser && onlineUsers.includes(selectedUser._id);

  return (
 <>
  <header className="fixed top-0 w-full z-40 bg-white/80 backdrop-blur-lg border border-gray-200 shadow-sm">
    <div className="max-w-7xl mx-auto px-4 h-16">
      <div className="flex items-center justify-between h-full">
        {/* LEFT LOGO & CALL ACTIONS */}
        <div className="flex items-center gap-4 md:gap-8">
          <Link to={"/"} className="flex items-center gap-2.5 hover:opacity-80 transition shrink-0">
            <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
            <h1 className="text-lg font-bold text-gray-800">Talk</h1>
          </Link>

          {selectedUser && (
            <div className="flex items-center gap-2 border-l border-gray-200 pl-4 animate-fade-in">
              <span className="text-xs font-medium text-gray-500 hidden sm:inline max-w-[120px] truncate">
                Call {selectedUser.fullName.split(" ")[0]}:
              </span>
              
              {/* Voice Call */}
              <button
                onClick={() => startCall(selectedUser, "audio")}
                disabled={!isOnline}
                className={`p-2 rounded-full transition ${
                  isOnline
                    ? "text-gray-600 hover:bg-gray-100 hover:text-blue-600"
                    : "text-gray-300 cursor-not-allowed opacity-50"
                }`}
                title={isOnline ? `Voice Call ${selectedUser.fullName}` : "User is offline"}
              >
                <Phone className="w-4 h-4" />
              </button>

              {/* Video Call */}
              <button
                onClick={() => startCall(selectedUser, "video")}
                disabled={!isOnline}
                className={`p-2 rounded-full transition ${
                  isOnline
                    ? "text-gray-600 hover:bg-gray-100 hover:text-blue-600"
                    : "text-gray-300 cursor-not-allowed opacity-50"
                }`}
                title={isOnline ? `Video Call ${selectedUser.fullName}` : "User is offline"}
              >
                <Video className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* RIGHT USER MENU */}
        <div className="flex items-center gap-3">
          {authUser && (
            <>
            <Link
            to={"/profile"}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
            >
              {authUser?.avatar?.url ? (
                <img 
                  src={authUser.avatar.url} 
                  alt="Profile" 
                  className="w-6 h-6 rounded-full object-cover" 
                />
              ) : (
                <User className="w-5 h-6" />
              )}
              <span className="hidden sm:inline">Profile</span>
            </Link>

             <button
              onClick={handleLogout}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium text-red-700 hover:bg-red-100 transition"
            >
              <LogOut className="w-5 h-6" />
              <span className="hidden sm:inline">LogOut</span>
            </button>
            </>
          )}
        </div>
      </div>
    </div>
  </header>
 </>

  );
};

export default Navbar;
