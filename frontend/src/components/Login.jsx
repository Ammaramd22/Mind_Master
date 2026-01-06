// frontend/src/components/Login.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { Brain, LogIn, Lock, Mail } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/auth/login", {
        email,
        password,
      });
      localStorage.setItem("token", res.data.token);
      navigate("/menu");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-950 via-indigo-900 to-purple-900 overflow-hidden text-white">
      {/* Floating symbols */}
      {[...Array(25)].map((_, i) => (
        <motion.span
          key={i}
          className="absolute text-white text-opacity-20 font-bold select-none"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            fontSize: `${Math.random() * 1.5 + 1}rem`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.2, 0.7, 0.2],
          }}
          transition={{
            duration: Math.random() * 6 + 4,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        >
          {["+", "-", "×", "÷", "π", "√", "Σ"][Math.floor(Math.random() * 7)]}
        </motion.span>
      ))}

      {/* Login card */}
      <motion.div
        className="z-10 w-full max-w-sm mx-4 bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8 backdrop-blur-lg"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <Brain className="text-blue-400 w-8 h-8" />
          <h2 className="text-3xl font-extrabold">MindMaster</h2>
        </div>

        <p className="text-center text-gray-300 mb-6">
          Enter your credentials to access the game.
        </p>

        {error && (
          <motion.p
            className="text-red-400 text-center mb-4 font-semibold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {error}
          </motion.p>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-3 py-2 rounded-lg text-black outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-3 py-2 rounded-lg text-black outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2"
          >
            <LogIn size={18} /> Login
          </motion.button>
        </form>

        {/* Register link */}
        <p className="mt-4 text-center text-sm text-gray-300">
          No account?{" "}
          <Link to="/register" className="text-blue-400 font-semibold">
            Register
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
