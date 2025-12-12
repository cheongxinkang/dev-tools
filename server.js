// 1. Load Environment Variables (MUST BE TOP LINE)
require('dotenv').config();
const express = require('express');
const path = require('path');

const livereload = require("livereload");
const connectLivereload = require("connect-livereload");

const app = express();
const PORT = process.env.PORT || 3000;
const myRoutes = require('./routes'); 

// Only run this in development mode, not production
if (process.env.NODE_ENV !== 'production') {
    // Create a helper server that watches the 'public' folder
    const liveReloadServer = livereload.createServer();
    liveReloadServer.watch(path.join(__dirname, 'public'));

    // When the browser connects, refresh the page to ensure it's synced
    liveReloadServer.server.once("connection", () => {
        setTimeout(() => {
            liveReloadServer.refresh("/");
        }, 100);
    });

    // Add the middleware: This injects a hidden script into your HTML
    app.use(connectLivereload());
}

app.use(express.json({ limit: '50mb' }));
app.use(express.static('public'));

// --- ROUTES ---
app.get('/',           myRoutes.serveDashboard);
app.get('/api/test',   myRoutes.handleTestApi);
app.post('/api/echo',  myRoutes.handleEchoApi);
app.get('/api/secret', myRoutes.handleProtectedApi);
app.post('/api/proxy', myRoutes.handleProxyRequest);
app.get('/api/js-files', myRoutes.handleListJsFiles);

app.listen(PORT, () => {
    console.log(`Modular Server running at http://localhost:${PORT}`);
});