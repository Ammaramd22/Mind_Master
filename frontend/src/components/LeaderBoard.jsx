//frontend/src/components/LeaderBoard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Trophy, Medal, Crown, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Leaderboard = () => {
  const [scores, setScores] = useState([]);
  const navigate = useNavigate();

  const fetchLeaderboard = async () => {
    try {
      const res = await axios.get("http://localhost:5000/leaderboard");
      setScores(res.data);
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-950 via-indigo-900 to-purple-900 overflow-hidden text-white">
      {/* Floating background */}
      {[...Array(25)].map((_, i) => (
        <motion.span
          key={i}
          className="absolute text-white text-opacity-25 font-extrabold select-none"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            fontSize: `${Math.random() * 2 + 1.5}rem`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.3, 0.8, 0.3],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: Math.random() * 6 + 5,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        >
          {["+", "-", "×", "÷", "π", "√", "Σ"][Math.floor(Math.random() * 7)]}
        </motion.span>
      ))}

      <motion.div
        className="z-10 w-full max-w-2xl mx-4 bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-8 backdrop-blur-2xl"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-extrabold flex items-center gap-3 text-yellow-300 drop-shadow-lg">
            <Trophy className="w-8 h-8" /> Leaderboard
          </h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate("/menu")}
            className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-semibold shadow-lg"
          >
            <Home size={16} /> Menu
          </motion.button>
        </div>

        {/* Scores */}
        {scores.length === 0 ? (
          <p className="text-center text-gray-300 mt-8">No scores yet...</p>
        ) : (
          <ol className="space-y-3">
            {scores
              .sort((a, b) => b.score - a.score)
              .slice(0, 10)
              .map((item, index) => (
                <motion.li
                  key={index}
                  whileHover={{ scale: 1.03 }}
                  className={`flex justify-between items-center p-4 rounded-2xl shadow-md ${
                    index === 0
                      ? "bg-yellow-400/20 border border-yellow-400/50"
                      : index === 1
                      ? "bg-gray-300/20 border border-gray-300/50"
                      : index === 2
                      ? "bg-amber-700/20 border border-amber-600/50"
                      : "bg-white/10 border border-white/20"
                  }`}
                >
                  <div className="flex items-center gap-3 font-semibold text-lg">
                    {index === 0 && (
                      <Crown className="text-yellow-400 w-6 h-6" />
                    )}
                    {index === 1 && <Medal className="text-gray-300 w-6 h-6" />}
                    {index === 2 && <Medal className="text-amber-600 w-6 h-6" />}
                    <span>{index + 1}.</span>
                    <span>{item.name}</span>
                  </div>
                  <motion.span
                    className="text-blue-300 font-bold text-xl"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    {item.score}
                  </motion.span>
                </motion.li>
              ))}
          </ol>
        )}
      </motion.div>
    </div>
  );
};

export default Leaderboard;
