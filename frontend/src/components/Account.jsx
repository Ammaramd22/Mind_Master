//frontend/src/components/Account.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { motion } from "framer-motion";
import { Brain, Mail, LogOut, Home, Key, Edit3 } from "lucide-react";

const Popup = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[998]"></div>

      {/* Popup */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed inset-0 flex items-center justify-center z-[999]"
      >
        <div className="bg-white text-black px-6 py-4 rounded-xl shadow-2xl w-80 text-center border border-gray-300">
          <p className="font-medium">{message}</p>
          <button
            className="mt-3 px-4 py-1 bg-blue-600 text-white rounded-lg text-sm"
            onClick={onClose}
          >
            OK
          </button>
        </div>
      </motion.div>
    </>
  );
};

const Account = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [popupMsg, setPopupMsg] = useState("");

  const showPopup = (msg) => {
    setPopupMsg(msg);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/");
    try {
      const decoded = jwtDecode(token);
      setEmail(decoded.email || "Unknown User");
      setNewEmail(decoded.email || "");
    } catch (err) {
      console.error("Invalid token:", err);
      navigate("/");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleGoToMenu = () => {
    navigate("/menu");
  };

  const handleUpdateEmail = async () => {
    const token = localStorage.getItem("token");
    if (!newEmail) return showPopup("Please enter a new email");

    try {
      const res = await fetch("http://localhost:5000/auth/update-email", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        setEmail(newEmail);
        localStorage.setItem("token", data.token);
        showPopup("Email updated successfully!");
      } else {
        showPopup(data.error || "Failed to update email");
      }
    } catch (err) {
      console.error(err);
      showPopup("Error updating email");
    }
  };

  const handleUpdatePassword = async () => {
    const token = localStorage.getItem("token");
    if (!newPassword) return showPopup("Please enter a new password");

    try {
      const res = await fetch("http://localhost:5000/auth/update-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setNewPassword("");
        showPopup("Password updated successfully!");
      } else {
        showPopup(data.error || "Failed to update password");
      }
    } catch (err) {
      console.error(err);
      showPopup("Error updating password");
    }
  };

  const floatingSymbols = [
    "+", "-", "×", "÷", "π", "√", "Σ", "Ω", "∞", "Δ", "Φ", "⚛", "★", "?", "!",
  ];

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-950 via-indigo-900 to-purple-900 overflow-hidden text-white">

      {/* Center Popup */}
      <Popup message={popupMsg} onClose={() => setPopupMsg("")} />

      {/* Floating Animated Symbols */}
      {[...Array(40)].map((_, i) => (
        <motion.span
          key={i}
          className="absolute text-white text-opacity-20 font-extrabold select-none pointer-events-none"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            fontSize: `${Math.random() * 2 + 1.2}rem`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.8, 0.2],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: Math.random() * 7 + 5,
            repeat: Infinity,
            delay: Math.random() * 3,
          }}
        >
          {floatingSymbols[Math.floor(Math.random() * floatingSymbols.length)]}
        </motion.span>
      ))}

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent pointer-events-none"></div>

      {/* Account Card */}
      <motion.div
        className="z-10 w-full max-w-sm mx-4 bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-8 backdrop-blur-2xl text-center"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-center gap-2 mb-6">
          <Brain className="text-blue-400 w-8 h-8" />
          <h2 className="text-3xl font-extrabold drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">
            MindMaster
          </h2>
        </div>

        <p className="text-gray-300 mb-8 text-sm italic">
          Manage your account and track your journey to mastery.
        </p>

        {/* Current Email */}
        <div className="bg-white/10 rounded-xl p-4 flex items-center justify-center gap-3 mb-6 border border-white/10 shadow-inner">
          <Mail className="text-blue-300 w-5 h-5" />
          <p className="text-white font-medium">{email}</p>
        </div>

        {/* Update Email */}
        <div className="flex flex-col gap-2 mb-4">
          <input
            type="email"
            placeholder="New email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            className="w-full p-3 rounded-lg bg-white/10 text-white placeholder-gray-300 border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
          />
          <motion.button
            onClick={handleUpdateEmail}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2 shadow-md"
          >
            <Edit3 size={18} /> Update Email
          </motion.button>
        </div>

        {/* Update Password */}
        <div className="flex flex-col gap-2 mb-6">
          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full p-3 rounded-lg bg-white/10 text-white placeholder-gray-300 border border-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
          />
          <motion.button
            onClick={handleUpdatePassword}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2 shadow-md"
          >
            <Key size={18} /> Update Password
          </motion.button>
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col gap-3">
          <motion.button
            onClick={handleGoToMenu}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2 shadow-lg"
          >
            <Home size={18} /> Go to Menu
          </motion.button>

          <motion.button
            onClick={handleLogout}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2 shadow-lg"
          >
            <LogOut size={18} /> Logout
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default Account;
