const express = require('express');
const app = express();
const PORT = 3000;

// Import our new logic file
// Note: We use './' to tell Node to look in the current folder
const myRoutes = require('./routes'); 

// Middleware
app.use(express.json());
app.use(express.static('public'));

// --- ROUTES ---
// We connect the URL to the function imported from myRoutes
app.get('/',           myRoutes.serveDashboard);
app.get('/api/test',   myRoutes.handleTestApi);
app.post('/api/echo',  myRoutes.handleEchoApi);
app.get('/api/secret',    myRoutes.handleProtectedApi);

// --- STARTUP ---
app.listen(PORT, () => {
    console.log(`Modular Server running at http://localhost:${PORT}`);
});