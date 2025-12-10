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
    const authHeader = req.headers['authorization'];

    // READ FROM ENVIRONMENT VARIABLE
    // We expect the header to be "Bearer " + the secret key
    const expectedToken = `Bearer ${process.env.API_SECRET_KEY}`;

    if (authHeader === expectedToken) {
        res.json({
            status: "Success",
            message: "You have accessed the secret data!",
            secretData: [100, 200, 300]
        });
    } else {
        res.status(401).json({
            status: "Unauthorized",
            message: "Access Denied. Invalid Token."
        });
    }
}

// --- NEW: Proxy Function ---
async function handleProxyRequest(req, res) {
    // 1. Unpack the "instructions" sent from the frontend
    const { targetUrl, method, headers, body } = req.body;

    console.log(`[Proxy] Forwarding ${method} request to: ${targetUrl}`);

    try {
        // 2. The Server makes the actual request to the outside world
        const response = await fetch(targetUrl, {
            method: method,
            headers: headers || {},
            // Only attach body if it's not GET or HEAD
            body: (method !== 'GET' && method !== 'HEAD') ? body : undefined
        });

        // 3. Get the response text (we use text() so we don't crash if it's not JSON)
        const responseText = await response.text();
        
        // 4. Try to parse it as JSON to make it pretty, otherwise keep as string
        let responseData;
        try {
            responseData = JSON.parse(responseText);
        } catch (e) {
            responseData = responseText;
        }

        // 5. Send the result back to your frontend
        res.json({
            status: response.status,
            statusText: response.statusText,
            data: responseData
        });

    } catch (error) {
        console.error("Proxy Error:", error.message);
        res.status(500).json({
            status: 500,
            statusText: "Proxy Error",
            data: error.message
        });
    }
}

// Update Exports
module.exports = {
    serveDashboard,
    handleTestApi,
    handleEchoApi,
    handleProtectedApi,
    handleProxyRequest // <--- Don't forget this!
};