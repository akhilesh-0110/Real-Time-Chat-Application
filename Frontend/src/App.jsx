import "./App.css";
import "react-toastify/dist/ReactToastify.css";
import { Loader } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { getUser, setOnlineUsers } from "./store/slices/authSlice";
import { connectSocket, disconnectSocket } from "./lib/socket";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import { ToastContainer } from "react-toastify";
import { CallProvider } from "./context/CallContext";
import CallOverlay from "./components/CallOverlay";
import { pushNewMessage } from "./store/slices/chatSlice";


const App = () => {
  const { authUser, isCheckingAuth } = useSelector((state) => state.auth);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getUser());
  }, []);


  useEffect(() => {
    if(authUser) {
      const socket = connectSocket(authUser._id);

      const handleOnlineUsers = (users) => {
        dispatch(setOnlineUsers(users));
      };

      const handleNewMessage = (newMessage) => {
        dispatch(pushNewMessage(newMessage));
      };

      socket.off("getOnlineUsers");
      socket.on("getOnlineUsers", handleOnlineUsers);

      socket.off("newMessage");
      socket.on("newMessage", handleNewMessage);

      return () => {
        socket.off("getOnlineUsers", handleOnlineUsers);
        socket.off("newMessage", handleNewMessage);
        disconnectSocket();
      };
    }
  }, [authUser, dispatch]);


  if(isCheckingAuth && !authUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );
  }

  return (
  <>
     <CallProvider>
       <Router>
        <Navbar />
        <Routes>
          <Route 
          path="/" 
          element={authUser? <Home/> : <Navigate to={"/login"} />} 
          />
          <Route 
          path="/register" 
          element={!authUser? <Register /> : <Navigate to={"/"} />} 
          />
          <Route 
          path="/login" 
          element={!authUser? <Login/> : <Navigate to={"/"} />} 
          />
          <Route 
          path="/profile" 
          element={authUser? <Profile/> : <Navigate to={"/login"} />} 
          />
        </Routes>
        <CallOverlay />
        <ToastContainer />
       </Router>
     </CallProvider>
  </>

  );
};

export default App;
