require('dotenv').config();
const cors = require("cors");
const express = require('express');
const { RtcTokenBuilder, RtcRole } = require('agora-token');

const allowedOrigins = [
  "http://localhost:5173",
  "https://video-chat-game-production-2448.up.railway.app",

];

const http = require('http');

const APP_ID = process.env.APP_ID;
const APP_CERTIFICATE = process.env.APP_CERTIFICATE;
const PORT = process.env.PORT || 8080;

// Initialize Express app
const app = express();

const nocache = (req, res, next) => {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next();
};

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed"));
    }
  },
  credentials: true,
}));

app.get('/access_token', nocache, (req, res) => {
    const channelName = req.query.channel;
    const uid = req.query.uid || 0;
    const role = RtcRole.PUBLISHER;
    const expirationTimeInSeconds = 3600;

    if (!channelName) {
        return res.status(400).json({ error: 'Channel name is required' });
    }

    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    try {
        const token = RtcTokenBuilder.buildTokenWithUid(
            APP_ID,
            APP_CERTIFICATE,
            channelName,
            uid,
            role,
            privilegeExpiredTs
        );
        return res.json({ token });
    } catch (error) {
        console.error('Error generating token:', error);
        return res.status(500).json({ error: 'Failed to generate token' });
    }
});

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

console.log("APP_ID:", APP_ID);
console.log("APP_CERTIFICATE:", APP_CERTIFICATE);

app.get("/", (req, res) => {
  res.send("Server is running!");
});

