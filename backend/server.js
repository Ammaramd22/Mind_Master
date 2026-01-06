//backend/serevr.js
require("dotenv").config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const fetch = require('node-fetch');
const User = require('./models/User');
const Score = require('./models/Score');

const app = express();

// Load environment variables
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;
const MONGO_URI = process.env.MONGO_URI;

app.use(cors());
app.use(express.json());

// Connect MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));


// ---------------- AUTH ----------------

// Register
app.post('/auth/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: 'Email and password required' });

  const existing = await User.findOne({ email });
  if (existing)
    return res.status(400).json({ error: 'Email already registered' });

  const hash = await bcrypt.hash(password, 10);

  const user = await User.create({ email, passwordHash: hash });

  const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
    expiresIn: '7d',
  });

  res.json({ token, email: user.email });
});

// Login
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: 'Email and password required' });

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ error: 'Invalid credentials' });

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return res.status(400).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
    expiresIn: '7d',
  });

  res.json({ token, email: user.email });
});


// ---------------- UPDATE EMAIL / PASSWORD ----------------

app.put('/auth/update-email', authMiddleware, async (req, res) => {
  const { newEmail } = req.body;

  if (!newEmail)
    return res.status(400).json({ error: 'New email is required' });

  try {
    const existing = await User.findOne({ email: newEmail });
    if (existing)
      return res.status(400).json({ error: 'Email already in use' });

    await User.findByIdAndUpdate(req.user.id, { email: newEmail });

    const token = jwt.sign(
      { id: req.user.id, email: newEmail },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ success: true, token, email: newEmail });
  } catch (err) {
    console.error('Update email error:', err);
    res.status(500).json({ error: 'Failed to update email' });
  }
});

app.put('/auth/update-password', authMiddleware, async (req, res) => {
  const { newPassword } = req.body;

  if (!newPassword)
    return res.status(400).json({ error: 'New password is required' });

  if (newPassword.length < 6)
    return res.status(400).json({ error: 'Password must be at least 6 characters' });

  try {
    const hash = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(req.user.id, { passwordHash: hash });
    res.json({ success: true });
  } catch (err) {
    console.error('Update password error:', err);
    res.status(500).json({ error: 'Failed to update password' });
  }
});


// ---------------- MIDDLEWARE ----------------

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Missing authorization' });

  const token = auth.split(' ')[1];

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}


// ---------------- LEADERBOARD ----------------

app.get('/leaderboard', async (req, res) => {
  const top = await Score.find()
    .sort({ score: -1 })
    .limit(50)
    .populate('user');

  res.json(top.map(s => ({ name: s.user.email, score: s.score })));
});

app.post('/leaderboard', authMiddleware, async (req, res) => {
  const { score } = req.body;

  if (typeof score !== 'number')
    return res.status(400).json({ error: 'Score must be a number' });

  await Score.create({ user: req.user.id, score });

  res.json({ success: true });
});


// ---------------- PUZZLE API ----------------
app.get("/api/puzzle", async (req, res) => {
  try {
    const response = await fetch("https://marcconrad.com/uob/heart/api.php", {
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    const data = await response.json();

    if (!data || !data.question) {
      return res.status(500).json({ error: "Invalid puzzle data" });
    }

    // --- Base variables ---
    let mathQuestion = data.question;
    let mathSolution = data.solution;
    let hint = "💡 Focus your mind!";
    let mode = "normal";
    let choices = [];

    //  fun game modes
    const battleTypes = [
      "addBoost",
      "heartCount",
      "multiplyMadness",
      "triviaChallenge",
      "riddleMode",
      "wordScramble",
    ];
    mode = battleTypes[Math.floor(Math.random() * battleTypes.length)];

    switch (mode) {
      case "addBoost": {
        const add = Math.floor(Math.random() * 10) + 1;
        mathQuestion = `⚔️ Attack Mode! Original puzzle: ${data.question}. Add ${add} to its solution to strike harder!`;
        mathSolution = Number(data.solution) + add;
        hint = "💡 Add the boost value to the solution!";
        break;
      }

      case "heartCount": {
        const heartsCount = (data.question.match(/❤️/g) || []).length;
        const gain = Math.floor(Math.random() * 5) + 2;
        mathQuestion = `💖 Healing Round! You found ${heartsCount} hearts. Combine them with ${gain} magic hearts. Total hearts?`;
        mathSolution = heartsCount + gain;
        hint = "💡 Count carefully!";
        break;
      }

      case "multiplyMadness": {
        const mult = Math.floor(Math.random() * 4) + 2;
        mathQuestion = `🔥 Power Surge! Puzzle power: "${data.question}". Multiply the solution by ${mult} for your ultimate strike!`;
        mathSolution = Number(data.solution) * mult;
        hint = "💡 Multiply the original solution by the factor!";
        break;
      }

      case "triviaChallenge": {
        const triviaRes = await fetch("https://opentdb.com/api.php?amount=1&type=multiple");
        const triviaData = await triviaRes.json();
        const qObj = triviaData.results[0];

        mathQuestion = `🎮 Trivia Challenge! ${qObj.question}`;
        mathSolution = qObj.correct_answer;
        hint = "💡 Pick the right answer!";
        choices = [qObj.correct_answer, ...qObj.incorrect_answers].sort(() => Math.random() - 0.5);
        break;
      }

      case "riddleMode": {
        const riddles = [
          { q: "🧩 What has keys but can’t open locks?", a: "Piano" },
          { q: "🔍 What gets wetter the more it dries?", a: "Towel" },
          { q: "🌕 I’m tall when I’m young and short when I’m old. What am I?", a: "Candle" },
          { q: "🕰️ What has hands but can’t clap?", a: "Clock" },
          { q: "🌧️ What can you catch but not throw?", a: "A cold" },
          { q: "🗣️ What speaks without a mouth and hears without ears?", a: "An echo" },
          { q: "🚪 What kind of room has no doors or windows?", a: "A mushroom" },
          { q: "📦 What can be broken but never held?", a: "A promise" },
          { q: "🌬️ I go up and down but never move. What am I?", a: "Stairs" },
          { q: "🎒 The more you take, the more you leave behind. What are they?", a: "Footsteps" },
          { q: "🔥 What can fill a room but takes up no space?", a: "Light" },
          { q: "🧊 What melts but never gets wet?", a: "A shadow" },
          { q: "🪞 What reflects but never speaks?", a: "A mirror" },
          { q: "🎈 What has a neck but no head?", a: "A bottle" }

        ];
        const r = riddles[Math.floor(Math.random() * riddles.length)];
        mathQuestion = `🧠 Riddle Time! ${r.q}`;
        mathSolution = r.a;
        hint = "💡 Think outside the box!";
        break;
      }

      case "wordScramble": {
        const words = ["dragon", "castle", "wizard", "magic", "sword", "puzzle", "battle",
          "knight", "quest", "shield", "goblin", "phoenix", "dungeon",
          "alchemy", "portal", "treasure", "monster", "kingdom",
          "crystal", "scroll", "riddle", "unicorn", "mystic", "enchanted",
          "shadow", "ember", "rune"];
        const word = words[Math.floor(Math.random() * words.length)];
        const scrambled = word.split("").sort(() => Math.random() - 0.5).join("");
        mathQuestion = `🔤 Word Scramble! Unscramble this: **${scrambled.toUpperCase()}**`;
        mathSolution = word;
        hint = "💡 Rearrange the letters to form a word!";
        break;
      }

      default:
        break;
    }

    // XP and Gold rewards
    const xpReward = Math.floor(Math.random() * 40) + 10;
    const goldReward = Math.floor(Math.random() * 20) + 5;

    const textSize = "2em";

    res.json({
      mode,
      question: mathQuestion,
      solution: mathSolution,
      hint,
      xpReward,
      goldReward,
      carrots: data.carrots || 0,
      textSize,
      ...(mode === "triviaChallenge" ? { choices } : {}),
    });

  } catch (err) {
    console.error("Puzzle fetch error:", err);
    res.status(500).json({ error: "Failed to fetch puzzle" });
  }
});

// ---------------- SERVER ----------------

app.listen(PORT, () =>
  console.log(`Backend running on http://localhost:${PORT}`)
);
