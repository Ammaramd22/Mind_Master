// frontend/src/components/Menu.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Brain, Trophy, User, Power } from "lucide-react";

const Menu = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  // Symbols
  const floatingSymbols = [
    "+", "-", "×", "÷", "π", "√", "Σ",
    "?", "!", "Ω", "∞", "Δ", "Φ", "⚛", "★", "♞", "♛", "⚙", "🧠"
  ];

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-950 via-indigo-900 to-purple-900 overflow-hidden text-white">
      {/*  Floating animated background symbols */}
      {[...Array(40)].map((_, i) => (
        <motion.span
          key={i}
          className="absolute text-white text-opacity-25 font-extrabold select-none pointer-events-none"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            fontSize: `${Math.random() * 2 + 1.5}rem`,
          }}
          animate={{
            y: [0, -25, 0],
            opacity: [0.2, 0.8, 0.2],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: Math.random() * 6 + 5,
            repeat: Infinity,
            delay: Math.random() * 3,
          }}
        >
          {floatingSymbols[Math.floor(Math.random() * floatingSymbols.length)]}
        </motion.span>
      ))}

      {/* Main Menu */}
      <motion.div
        className="z-10 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl p-12 max-w-md w-full flex flex-col gap-6 items-center text-center"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {/* Title */}
        <h1 className="text-5xl font-extrabold text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
          ⚡ Mind<span className="text-blue-400">Master</span>
        </h1>
        <p className="text-gray-200 text-sm italic mb-4">
          Test your logic. Challenge your mind. Rule the storm.
        </p>

        {/* Menu Buttons */}
        <div className="flex flex-col gap-4 w-full">
          {[
            {
              label: "Play Game",
              color: "from-blue-500 to-indigo-600",
              icon: <Brain className="w-5 h-5" />,
              path: "/game",
            },
            {
              label: "Leaderboard",
              color: "from-green-500 to-emerald-600",
              icon: <Trophy className="w-5 h-5" />,
              path: "/leaderboard",
            },
            {
              label: "Account",
              color: "from-yellow-500 to-amber-600",
              icon: <User className="w-5 h-5" />,
              path: "/account",
            },
          ].map((btn, idx) => (
            <motion.button
              key={idx}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate(btn.path)}
              className={`bg-gradient-to-r ${btn.color} text-white px-5 py-4 rounded-2xl flex items-center justify-center gap-2 text-lg font-semibold shadow-lg transition-all duration-300`}
            >
              {btn.icon} {btn.label}
            </motion.button>
          ))}

          {/* Quit Button */}
          <motion.button
            whileHover={{ scale: 1.06, rotate: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="bg-gradient-to-r from-red-600 to-rose-700 text-white px-5 py-4 rounded-2xl flex items-center justify-center gap-2 text-lg font-semibold shadow-lg"
          >
            <Power className="w-5 h-5" /> Quit Game
          </motion.button>
        </div>

        {/* Subtext */}
        <motion.p
          className="text-sm text-gray-300 mt-3"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ repeat: Infinity, duration: 3 }}
        >
          🧩 New puzzles every challenge – Math • Trivia • Logic • Knowledge
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Menu;
