import { Camera, Loader2, Mail, User } from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateProfile } from "../store/slices/authSlice";

const Profile = () => {
  const { authUser, isUpdatingProfile } = useSelector((state) => state.auth);

  const [selectedImage, setSelectedImage] = useState(null);

  const [formData, setFormData] = useState({
    fullName: authUser?.fullName,
    email: authUser?.email,
    avatar: authUser?.avatar?.url,
  });

  const dispatch = useDispatch();

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => {
      const base64Image = reader.result;
      setSelectedImage(base64Image);
      setFormData({ ...formData, avatar: file });
    };
  };

  const handleUpdateProfile = () => {
    const data = new FormData();
    data.append("fullName", formData.fullName);
    data.append("email", formData.email);
    if (formData.avatar instanceof File) {
      data.append("avatar", formData.avatar);
    }
    dispatch(updateProfile(data));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your account information</p>
        </div>

        {/* Avatar Upload */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <img
              src={selectedImage || authUser?.avatar?.url || "/avatar-holder.avif"}
              alt="Profile"
              className="w-28 h-28 rounded-full object-cover border-4 border-gray-100 shadow"
            />
            <label
              htmlFor="avatar-upload"
              className={`absolute bottom-0 right-0 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full cursor-pointer transition-colors ${
                isUpdatingProfile ? "pointer-events-none opacity-60" : ""
              }`}
            >
              <Camera className="w-5 h-5 text-white"/>
              <input
                type="file"
                id="avatar-upload"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
                disabled={isUpdatingProfile}
              />
            </label>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {isUpdatingProfile ? "Uploading..." : "Click the camera icon to update photo"}
          </p>
        </div>

        {/* USER INFO */}
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg py-2 pl-9 pr-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                disabled={isUpdatingProfile}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                className="w-full border border-gray-300 rounded-lg py-2 pl-9 pr-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={isUpdatingProfile}
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleUpdateProfile}
          disabled={isUpdatingProfile}
          className="mt-8 w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:pointer-events-none"
        >
          {isUpdatingProfile ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </button>

        {/* Account Info */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <h2 className="text-sm font-medium text-gray-700 mb-3">Account Information</h2>
          <div className="space-y-2 text-sm text-gray-500">
            <div className="flex justify-between">
              <span>Member since</span>
              <span>{new Date(authUser?.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Account status</span>
              <span className="text-green-500 font-medium">Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
