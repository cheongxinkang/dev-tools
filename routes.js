const path = require('path');
const fs = require('fs'); // <--- NEW

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
const { targetUrl, method, headers, body } = req.body;

    console.log(`[Proxy] Forwarding ${method} request to: ${targetUrl}`);

    try {
        const response = await fetch(targetUrl, {
            method: method,
            headers: headers || {},
            body: (method !== 'GET' && method !== 'HEAD') ? body : undefined
        });

        // --- NEW: SAFETY PARSING LOGIC ---
        // Get content-length header to guess size
        const size = response.headers.get('content-length');
        const MAX_AUTO_PARSE = 1024 * 1024; // 1MB limit for server-side parsing

        let responseData;
        
        // If it's huge, don't parse it. Just send it as a string.
        if (size && parseInt(size) > MAX_AUTO_PARSE) {
             console.log(`[Proxy] Response too large (${size} bytes). Skipping JSON parse.`);
             responseData = await response.text(); // Keep as raw string
        } else {
            // Normal handling
            const text = await response.text();
            try {
                responseData = JSON.parse(text);
            } catch (e) {
                responseData = text;
            }
        }

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

// --- NEW: List JS Files ---
function handleListJsFiles(req, res) {
    const directoryPath = path.join(__dirname, 'public', 'sicpjs-code');

    // Read directory contents
    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            console.error("Could not list files:", err);
            return res.status(500).json({ error: "Unable to scan directory" });
        }

        // Filter to only show .js files
        const jsFiles = files.filter(file => file.endsWith('.js'));
        
        res.json(jsFiles);
    });
}

// Update Exports
module.exports = {
    serveDashboard,
    handleTestApi,
    handleEchoApi,
    handleProtectedApi,
    handleProxyRequest, // <--- Don't forget this!
    handleListJsFiles
};