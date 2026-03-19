const https = require("https");

const RENDER_URL = "https://mess-management-system-q6us.onrender.com/api/health";

function keepAlive() {
  https.get(RENDER_URL, (res) => {
    console.log(`[Keep-alive] Status: ${res.statusCode}`);
  }).on("error", (err) => {
    console.error("[Keep-alive] Error:", err.message);
  });
}

// Ping every 14 minutes (840000 ms)
setInterval(keepAlive, 14 * 60 * 1000);

module.exports = keepAlive;
