// 1. Load Environment Variables (MUST BE TOP LINE)
require('dotenv').config();

const express = require('express');
const app = express();

// 2. Use the variable (or default to 3000 if missing)
const PORT = process.env.PORT || 3000;

// Import our routes
const myRoutes = require('./routes'); 

app.use(express.json());
app.use(express.static('public'));

app.get('/',           myRoutes.serveDashboard);
app.get('/api/test',   myRoutes.handleTestApi);
app.post('/api/echo',  myRoutes.handleEchoApi);
app.get('/api/secret', myRoutes.handleProtectedApi);
app.post('/api/proxy', myRoutes.handleProxyRequest);
app.get('/api/js-files', myRoutes.handleListJsFiles);

app.listen(PORT, () => {
    console.log(`Modular Server running at http://localhost:${PORT}`);
});