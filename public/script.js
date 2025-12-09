// --- MODULE LOADING LOGIC ---

// Global variable to store presets once we fetch them
let cachedPresets = []; 

document.addEventListener('DOMContentLoaded', () => {
    const firstTab = document.querySelector('.sidebar li');
    loadModule('components/api-tab.html', firstTab);
});

async function loadModule(filePath, activeNavElement) {
    const contentContainer = document.getElementById('main-content');
    
    // UI Updates
    document.querySelectorAll('.sidebar li').forEach(el => el.classList.remove('active-nav'));
    if(activeNavElement) activeNavElement.classList.add('active-nav');

    try {
        const response = await fetch(filePath);
        if (!response.ok) throw new Error('Module not found');
        
        const html = await response.text();
        contentContainer.innerHTML = html;

        // --- SPECIFIC INIT LOGIC ---
        if (filePath.includes('api-tab.html')) {
            // 1. Fetch the presets JSON first
            await loadPresets(); 
            // 2. Then populate the dropdown
            populateSavedDropdown();
        }
        
    } catch (error) {
        contentContainer.innerHTML = `<h3>Error</h3><p>${error.message}</p>`;
    }
}

async function makeApiCall() {
    // 1. Get Elements
    const url = document.getElementById('api-url').value;
    const method = document.getElementById('api-method').value;
    const bodyContent = document.getElementById('api-body').value;
    const authHeader = document.getElementById('api-auth').value;
    
    const responseBody = document.getElementById('api-response');
    const statusDisplay = document.getElementById('status-display');

    // 2. Reset UI (Show "Loading")
    responseBody.innerText = "Loading...";
    statusDisplay.style.display = 'inline-block';
    statusDisplay.className = 'status-badge status-neutral'; // Grey
    statusDisplay.innerText = "Pending...";

    try {
        const headers = { 'Content-Type': 'application/json' };
        if (authHeader) headers['Authorization'] = authHeader;

        let options = { method: method, headers: headers };

        if ((method === 'POST' || method === 'PUT') && bodyContent) {
            try {
                JSON.parse(bodyContent);
                options.body = bodyContent;
            } catch (e) {
                statusDisplay.className = 'status-badge status-error';
                statusDisplay.innerText = "Client Error";
                responseBody.innerText = "Error: Body is not valid JSON.";
                return;
            }
        }

        // 3. Perform Request
        const response = await fetch(url, options);
        const data = await response.json();

        // 4. Update Status Badge Color
        // response.ok is true if status is 200-299
        if (response.ok) {
            statusDisplay.className = 'status-badge status-success'; // Green
        } else {
            statusDisplay.className = 'status-badge status-error';   // Red
        }

        // 5. Display Text
        statusDisplay.innerText = `Status: ${response.status} ${response.statusText}`;
        responseBody.innerText = JSON.stringify(data, null, 2);

    } catch (error) {
        // Network Errors (e.g., server offline)
        statusDisplay.className = 'status-badge status-error';
        statusDisplay.innerText = "Network Error";
        responseBody.innerText = error.message;
    }
}

// --- JS Runner Logic (Same as before) ---
function runJsCode() {
    const code = document.getElementById('js-code').value;
    const outputDiv = document.getElementById('js-output');
    
    outputDiv.innerText = ""; 

    const originalLog = console.log;
    const logs = [];

    console.log = function(...args) {
        logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' '));
        originalLog.apply(console, args);
    };

    try {
        const result = eval(code);
        if (logs.length > 0) outputDiv.innerText = logs.join('\n');
        if (result !== undefined) {
            outputDiv.innerText += (logs.length > 0 ? '\n\n' : '') + "Return: " + result;
        }
        if (logs.length === 0 && result === undefined) outputDiv.innerText = "Code executed (No output).";
    } catch (error) {
        outputDiv.innerText = "Error: " + error.message;
    } finally {
        console.log = originalLog;
    }
}

// --- SAVED REQUESTS & PRESETS LOGIC ---

// NEW: Fetch presets from the JSON file
async function loadPresets() {
    // If we already loaded them, don't fetch again (Caching)
    if (cachedPresets.length > 0) return;

    try {
        const response = await fetch('presets.json'); // Fetch local file
        cachedPresets = await response.json();        // Parse JSON
    } catch (error) {
        console.error("Failed to load presets:", error);
        cachedPresets = []; // Fallback to empty if file missing
    }
}

// Helper: Get combined list
function getAllRequests() {
    const localData = localStorage.getItem('my_saved_requests');
    const savedRequests = localData ? JSON.parse(localData) : [];
    
    return {
        presets: cachedPresets, // Use the variable, not the hardcoded const
        saved: savedRequests,
        all: [...cachedPresets, ...savedRequests]
    };
}

// Populate Dropdown
function populateSavedDropdown() {
    const dropdown = document.getElementById('saved-requests-dropdown');
    if (!dropdown) return;

    dropdown.innerHTML = '<option value="">-- Load a request --</option>';

    const { presets, saved } = getAllRequests();

    // Group 1: Presets
    if (presets.length > 0) {
        const group = document.createElement('optgroup');
        group.label = "Built-in Presets (from JSON)";
        
        presets.forEach((req, index) => {
            const option = document.createElement('option');
            option.value = index; 
            option.text = `${req.method} - ${req.name}`;
            group.appendChild(option);
        });
        dropdown.appendChild(group);
    }

    // Group 2: User Saved
    if (saved.length > 0) {
        const group = document.createElement('optgroup');
        group.label = "My Saved Requests";
        
        saved.forEach((req, index) => {
            const option = document.createElement('option');
            option.value = index + presets.length; 
            option.text = `${req.method} - ${req.name}`;
            group.appendChild(option); 
        });
        dropdown.appendChild(group);
    }
}

// Load Request (Unchanged)
function loadRequestFromHistory() {
    const dropdown = document.getElementById('saved-requests-dropdown');
    const index = dropdown.value;

    if (index === "") return;

    const { all } = getAllRequests();
    const selectedReq = all[index];

    if (selectedReq) {
        document.getElementById('api-method').value = selectedReq.method;
        document.getElementById('api-url').value = selectedReq.url;
        document.getElementById('api-auth').value = selectedReq.auth || ""; 
        document.getElementById('api-body').value = selectedReq.body || ""; 
    }
}

// Save Request (Unchanged)
function saveRequest() {
    const method = document.getElementById('api-method').value;
    const url = document.getElementById('api-url').value;
    const auth = document.getElementById('api-auth').value;
    const body = document.getElementById('api-body').value;

    if (!url) { alert("Please enter a URL first."); return; }

    const name = prompt("Name this request:");
    if (!name) return;

    const newRequest = { name, method, url, auth, body };
    
    const { saved } = getAllRequests();
    saved.push(newRequest);
    localStorage.setItem('my_saved_requests', JSON.stringify(saved));

    populateSavedDropdown();
}

// Delete Request (Unchanged)
function deleteRequest() {
    const dropdown = document.getElementById('saved-requests-dropdown');
    const index = parseInt(dropdown.value);
    
    if (isNaN(index)) { alert("Select a request first."); return; }

    const { presets, saved } = getAllRequests();

    if (index < presets.length) {
        alert("You cannot delete built-in presets.");
        return;
    }

    if(confirm("Delete this saved request?")) {
        const savedIndex = index - presets.length;
        saved.splice(savedIndex, 1);
        localStorage.setItem('my_saved_requests', JSON.stringify(saved));
        populateSavedDropdown();
        document.getElementById('api-url').value = "";
        document.getElementById('api-body').value = "";
    }
}