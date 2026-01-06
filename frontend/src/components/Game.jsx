//frontend/src/components/Game.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Timer, Heart, Award, LogOut } from "lucide-react";

const Game = () => {
  const navigate = useNavigate();
  const [puzzle, setPuzzle] = useState(null);
  const [answer, setAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [timer, setTimer] = useState(30);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [showEffect, setShowEffect] = useState(false);
  const [popup, setPopup] = useState(null);
  const [xp, setXp] = useState(0);
  const [gold, setGold] = useState(0);
  const [level, setLevel] = useState(1);
  const [combo, setCombo] = useState(0);

  const token = localStorage.getItem("token");

  const fetchPuzzle = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/puzzle");
      setPuzzle(res.data);
      setTimer(30);
      setAnswer("");
      setLoading(false);
    } catch (err) {
      console.error("Puzzle fetch error:", err);
      setMessage("Failed to load puzzle.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPuzzle();
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          setLives((l) => l - 1);
          triggerPopup("⏰", "Time’s up! Lost a life!");
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (xp >= 100) {
      setLevel((lvl) => lvl + 1);
      setXp(0);
      setLives((l) => l + 1);
      triggerPopup("🎉", `Level Up! Welcome to Level ${level + 1}! +1 ❤️`);
    }
  }, [xp]);

  const triggerPopup = (emoji, text) => {
    setPopup({ emoji, text });
    setTimeout(() => setPopup(null), 2000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!puzzle || puzzle.mode === "triviaChallenge") return;

    const userInput = answer.trim();

    //riddles/scrambles
    let isCorrect = false;
    if (puzzle.mode === "riddleMode" || puzzle.mode === "wordScramble") {
      isCorrect =
        userInput.toLowerCase() === String(puzzle.solution).toLowerCase();
    } else {
      let userAnswer;
      try {
        if (/^[0-9+\-*/()\s]+$/.test(userInput)) {
          userAnswer = Function(`return ${userInput}`)();
        } else throw new Error("Invalid input");
      } catch {
        triggerPopup("❌", "Invalid input!");
        return;
      }
      isCorrect = Number(userAnswer) === Number(puzzle.solution);
    }

    if (isCorrect) {
      const gainedXP = puzzle.xpReward || 10;
      const gainedGold = puzzle.goldReward || 5;

      setScore((s) => s + 10);
      setXp((x) => x + gainedXP + combo * 2);
      setGold((g) => g + gainedGold);
      setCombo((c) => c + 1);
      setMessage(`✅ Correct! +${gainedXP} XP, +${gainedGold} Gold`);
      setShowEffect(true);
      triggerPopup("🌟", "Great job!");

      setTimeout(() => setShowEffect(false), 1000);
      setTimeout(() => fetchPuzzle(), 1200);
    } else {
      setLives((l) => l - 1);
      setCombo(0);
      triggerPopup("💔", "Wrong answer!");
      setMessage("❌ Wrong! Try again!");
    }
  };

  const handleTriviaAnswer = (opt) => {
    if (!puzzle || puzzle.mode !== "triviaChallenge") return;

    if (opt === puzzle.solution) {
      const gainedXP = puzzle.xpReward || 10;
      const gainedGold = puzzle.goldReward || 5;

      setScore((s) => s + 10);
      setXp((x) => x + gainedXP + combo * 2);
      setGold((g) => g + gainedGold);
      setCombo((c) => c + 1);
      triggerPopup("🎯", "Perfect choice!");
      setMessage(`✅ Correct! +${gainedXP} XP, +${gainedGold} Gold`);
      setShowEffect(true);
      setTimeout(() => setShowEffect(false), 1000);
      setTimeout(() => fetchPuzzle(), 1200);
    } else {
      setLives((l) => l - 1);
      setCombo(0);
      triggerPopup("❌", "Oops! Try again!");
      setMessage("❌ Wrong!");
    }
  };

  const handleQuit = async () => {
    if (token) {
      await axios.post(
        "http://localhost:5000/leaderboard",
        { score },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    }
    navigate("/menu");
  };

  // Game over screen
  if (lives <= 0)
    return (
      <motion.div
        className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-red-900 via-black to-black text-white text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.h2
          className="text-5xl font-extrabold mb-4 drop-shadow-xl"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          💀 Game Over
        </motion.h2>
        <p className="text-2xl mb-4">Score: {score}</p>
        <p className="text-lg mb-6">Level: {level}</p>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleQuit}
          className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-xl text-lg font-semibold shadow-lg"
        >
          Return to Menu
        </motion.button>
      </motion.div>
    );

  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-b from-blue-900 to-indigo-900 text-white text-2xl font-bold">
        🌩 Loading puzzle...
      </div>
    );

  // Main Game UI
  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-b from-indigo-950 via-purple-900 to-blue-950 text-white overflow-hidden p-4">
      {/* Background sparkles */}
      {[...Array(25)].map((_, i) => (
        <motion.span
          key={i}
          className="absolute text-white text-opacity-20 font-extrabold select-none"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            fontSize: `${Math.random() * 2.5 + 1.5}rem`,
          }}
          animate={{
            y: [0, -25, 0],
            opacity: [0.2, 0.6, 0.2],
            rotate: [0, 15, -15, 0],
          }}
          transition={{
            duration: Math.random() * 8 + 6,
            repeat: Infinity,
            delay: Math.random() * 4,
          }}
        >
          {["+", "?", "⚡", "π", "√", "🧠", "🎲", "Σ", "🌟"][
            Math.floor(Math.random() * 9)
          ]}
        </motion.span>
      ))}

      {/* Popup notification */}
      <AnimatePresence>
        {popup && (
          <motion.div
            key="popup"
            initial={{ opacity: 0, scale: 0.5, y: -50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -30 }}
            transition={{ duration: 0.4, type: "spring" }}
            className="fixed top-1/2 left-1/2 z-[9999] transform -translate-x-1/2 -translate-y-1/2 bg-white/20 border border-white/40 px-8 py-6 rounded-3xl text-3xl font-extrabold text-white shadow-[0_0_30px_rgba(255,255,255,0.4)] backdrop-blur-2xl"
          >
            <motion.span
              initial={{ scale: 0.5, rotate: -10 }}
              animate={{ scale: 1.2, rotate: 0 }}
              transition={{ yoyo: Infinity, duration: 0.6 }}
              className="mr-2"
            >
              {popup.emoji}
            </motion.span>
            {popup.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Game Container */}
      <motion.div
        className="z-10 w-full max-w-7xl h-[88vh] bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-8 backdrop-blur-2xl flex flex-col"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-5xl font-extrabold tracking-wide flex items-center gap-3 drop-shadow-lg">
            ⚡ MindMaster
          </h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleQuit}
            className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-xl flex items-center gap-2 font-semibold shadow-lg text-lg"
          >
            <LogOut size={20} /> Quit
          </motion.button>
        </div>

        {/* Stats */}
        <div className="flex justify-around mb-6 text-base sm:text-lg gap-6 font-semibold">
          <div className="flex flex-col items-center">
            <Timer className="text-yellow-400" size={28} />
            <span>{timer}s</span>
          </div>
          <div className="flex flex-col items-center">
            <Heart className="text-red-400" size={28} />
            <span>{lives}</span>
          </div>
          <div className="flex flex-col items-center">
            <Award className="text-green-400" size={28} />
            <span>{score}</span>
          </div>
        </div>

        {/* XP/Gold/Combo Bar */}
        <motion.div
          className="flex justify-around mb-8 font-semibold text-yellow-300 gap-4"
          animate={{ opacity: [0.8, 1, 0.8] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <div className="flex flex-col items-center w-1/3">
            <span>✨ XP: {xp}/100</span>
            <div className="w-full h-3 bg-yellow-400/30 rounded-full mt-1 overflow-hidden">
              <motion.div
                className="h-3 bg-yellow-400 rounded-full"
                animate={{ width: `${(xp / 100) * 100}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>
          <div>💰 Gold: {gold}</div>
          <div>🔥 Combo: x{combo}</div>
        </motion.div>

        {/* Puzzle  Answer UI */}
        <div className="flex-1 flex gap-6 overflow-hidden">
          {/* Puzzle Display */}
          {puzzle && (
            <motion.div
              className={`flex-1 border border-white/30 rounded-2xl p-6 shadow-lg overflow-y-auto backdrop-blur-lg transition-all duration-500 ${
                puzzle.mode === "riddleMode"
                  ? "bg-purple-800/30"
                  : puzzle.mode === "wordScramble"
                  ? "bg-green-800/30"
                  : puzzle.mode === "triviaChallenge"
                  ? "bg-yellow-800/30"
                  : "bg-black/20"
              }`}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <div className="text-center mb-6">
                <h2
                  className="text-4xl font-extrabold mb-2 drop-shadow-lg"
                  style={{
                    color:
                      puzzle.mode === "riddleMode"
                        ? "#f9c6ff"
                        : puzzle.mode === "wordScramble"
                        ? "#b5ffb5"
                        : puzzle.mode === "triviaChallenge"
                        ? "#ffe083"
                        : "#ffffff",
                  }}
                >
                  {puzzle.mode === "riddleMode"
                    ? "🧠 Riddle Mode!"
                    : puzzle.mode === "wordScramble"
                    ? "🔤 Word Scramble!"
                    : puzzle.mode === "triviaChallenge"
                    ? "🎮 Trivia Challenge!"
                    : "🧩 Challenge!"}
                </h2>
                <p className="opacity-80 text-base">{puzzle.hint}</p>
              </div>

              {(() => {
                const urlMatch = puzzle.question.match(
                  /https?:\/\/\S+\.(png|jpg|jpeg|gif)/i
                );
                const fontSize = puzzle.textSize || "2em";

                if (urlMatch) {
                  return (
                    <div className="flex flex-col items-center text-center">
                      <img
                        src={urlMatch[0]}
                        alt="Puzzle"
                        className="rounded-xl border border-white/30 shadow-md mx-auto max-h-72 mb-4"
                      />
                      <p
                        className="text-white opacity-90 font-semibold"
                        style={{ fontSize }}
                      >
                        {puzzle.question.replace(urlMatch[0], "").trim()}
                      </p>
                    </div>
                  );
                } else {
                  return (
                    <motion.p
                      className="text-center font-extrabold text-white"
                      style={{ fontSize }}
                      dangerouslySetInnerHTML={{ __html: puzzle.question }}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.4 }}
                    ></motion.p>
                  );
                }
              })()}
            </motion.div>
          )}

          {/* Answer  */}
          <div className="w-1/3 flex flex-col justify-center">
            {puzzle?.mode === "triviaChallenge" ? (
              <div className="grid grid-cols-1 gap-4 mb-4">
                {puzzle.choices.map((opt, idx) => (
                  <motion.button
                    key={idx}
                    onClick={() => handleTriviaAnswer(opt)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-5 py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold text-lg shadow-md"
                  >
                    {opt}
                  </motion.button>
                ))}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <motion.input
                  type="text"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="w-full px-5 py-4 text-2xl rounded-2xl text-white font-bold shadow-inner focus:outline-none focus:ring-4 focus:ring-blue-500/50 placeholder-gray-500"
                  placeholder="Type your answer..."
                  whileFocus={{ scale: 1.02 }}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 px-8 py-4 rounded-2xl text-white font-bold text-xl shadow-lg"
                >
                  Submit
                </motion.button>
              </form>
            )}
            {message && (
              <p
                className={`mt-5 text-center font-semibold text-lg ${
                  message.includes("✅")
                    ? "text-green-400 drop-shadow-md"
                    : "text-red-400"
                }`}
              >
                {message}
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Game;
