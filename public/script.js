// --- Module Loading Logic ---

// Load the default tab when the page opens
document.addEventListener('DOMContentLoaded', () => {
    // Select the first list item in the sidebar
    const firstTab = document.querySelector('.sidebar li');
    // Load that specific file
    loadModule('components/api-tab.html', firstTab);
});

async function loadModule(filePath, activeNavElement) {
    const contentContainer = document.getElementById('main-content');
    
    // ... (Your existing UI update code) ...
    document.querySelectorAll('.sidebar li').forEach(el => el.classList.remove('active-nav'));
    if(activeNavElement) activeNavElement.classList.add('active-nav');

    try {
        const response = await fetch(filePath);
        if (!response.ok) throw new Error('Module not found');
        
        const html = await response.text();
        contentContainer.innerHTML = html;

        // --- NEW CODE HERE ---
        // Check if we just loaded the API tab, if so, initialize the dropdown
        if (filePath.includes('api-tab.html')) {
            populateSavedDropdown();
        }
        // ---------------------
        
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

// --- SAVED REQUESTS LOGIC ---

// 1. Save the current form to LocalStorage
function saveRequest() {
    // Get current values
    const method = document.getElementById('api-method').value;
    const url = document.getElementById('api-url').value;
    const auth = document.getElementById('api-auth').value;
    const body = document.getElementById('api-body').value;

    if (!url) { alert("Please enter a URL first."); return; }

    // Ask user for a name
    const name = prompt("Name this request (e.g., 'Get User Profile'):");
    if (!name) return;

    // Create request object
    const newRequest = { name, method, url, auth, body };

    // Get existing list from LocalStorage
    const existingData = localStorage.getItem('my_saved_requests');
    let requests = existingData ? JSON.parse(existingData) : [];

    // Add new request and save back
    requests.push(newRequest);
    localStorage.setItem('my_saved_requests', JSON.stringify(requests));

    // Refresh the dropdown UI
    populateSavedDropdown();
}

// 2. Populate the Dropdown with saved items
function populateSavedDropdown() {
    const dropdown = document.getElementById('saved-requests-dropdown');
    if (!dropdown) return; // Guard clause in case we aren't on the API tab

    // Clear existing options (except the first one)
    dropdown.innerHTML = '<option value="">-- Load a saved request --</option>';

    const existingData = localStorage.getItem('my_saved_requests');
    if (existingData) {
        const requests = JSON.parse(existingData);
        
        requests.forEach((req, index) => {
            const option = document.createElement('option');
            option.value = index; // Use the array index as the ID
            option.text = `${req.method} - ${req.name}`;
            dropdown.appendChild(option);
        });
    }
}

// 3. Load the selected request into the form
function loadRequestFromHistory() {
    const dropdown = document.getElementById('saved-requests-dropdown');
    const index = dropdown.value;

    if (index === "") return; // User selected the default prompt

    const existingData = localStorage.getItem('my_saved_requests');
    const requests = JSON.parse(existingData);
    const selectedReq = requests[index];

    // Fill the form fields
    document.getElementById('api-method').value = selectedReq.method;
    document.getElementById('api-url').value = selectedReq.url;
    document.getElementById('api-auth').value = selectedReq.auth;
    document.getElementById('api-body').value = selectedReq.body;
}

// 4. Delete the selected request
function deleteRequest() {
    const dropdown = document.getElementById('saved-requests-dropdown');
    const index = dropdown.value;
    
    if (index === "") { alert("Select a request to delete first."); return; }

    if(confirm("Are you sure you want to delete this saved request?")) {
        const existingData = localStorage.getItem('my_saved_requests');
        let requests = JSON.parse(existingData);
        
        // Remove item at specific index
        requests.splice(index, 1);
        
        // Save back to storage
        localStorage.setItem('my_saved_requests', JSON.stringify(requests));
        
        // Refresh UI
        populateSavedDropdown();
        
        // Clear inputs
        document.getElementById('api-url').value = "";
        document.getElementById('api-body').value = "";
    }
}