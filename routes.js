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

// --- New Protected API Function ---
function handleProtectedApi(req, res) {
    // 1. Read the header from the request
    const authHeader = req.headers['authorization'];

    // 2. Check if the password is correct (Simple check)
    if (authHeader === 'Bearer secret-password-123') {
        res.json({
            status: "Success",
            message: "You have accessed the secret data!",
            secretData: [100, 200, 300]
        });
    } else {
        // 3. Reject the request if wrong/missing token
        res.status(401).json({
            status: "Unauthorized",
            message: "Access Denied. You need the correct token."
        });
    }
}

// Update exports to include the new function
module.exports = {
    serveDashboard,
    handleTestApi,
    handleEchoApi,
    handleProtectedApi // <--- Add this
};