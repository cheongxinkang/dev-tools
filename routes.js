const path = require('path');

// --- 1. The Dashboard Serving Function ---
function serveDashboard(req, res) {
    // We use 'path.join' to find the file safely on any OS
    const mainPagePath = path.join(__dirname, 'public', 'index.html');
    res.sendFile(mainPagePath);
}

// --- 2. The API Logic Functions ---
function handleTestApi(req, res) {
    res.json({
        message: "Hello from the modular API!",
        timestamp: new Date(),
        status: "success"
    });
}

function handleEchoApi(req, res) {
    res.json({
        message: "Data received successfully",
        receivedData: req.body
    });
}

// --- 3. EXPORT ---
// This acts like a "public interface". Only functions listed here
// can be used by server.js.
module.exports = {
    serveDashboard,
    handleTestApi,
    handleEchoApi
};