let cachedPresets = []; 

export async function loadPresets() {
    if (cachedPresets.length > 0) return;
    try {
        // Note: path is relative to index.html, so 'presets.json' works
        const response = await fetch('presets.json'); 
        cachedPresets = await response.json();
    } catch (error) {
        console.error("Failed to load presets:", error);
        cachedPresets = [];
    }
}

function getAllRequests() {
    const localData = localStorage.getItem('my_saved_requests');
    const savedRequests = localData ? JSON.parse(localData) : [];
    return {
        presets: cachedPresets,
        saved: savedRequests,
        all: [...cachedPresets, ...savedRequests]
    };
}

export function populateSavedDropdown() {
    const dropdown = document.getElementById('saved-requests-dropdown');
    if (!dropdown) return;

    dropdown.innerHTML = '<option value="">-- Load a request --</option>';
    const { presets, saved } = getAllRequests();

    if (presets.length > 0) {
        const group = document.createElement('optgroup');
        group.label = "Built-in Presets";
        presets.forEach((req, index) => {
            const option = document.createElement('option');
            option.value = index; 
            option.text = `${req.method} - ${req.name}`;
            group.appendChild(option);
        });
        dropdown.appendChild(group);
    }

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

export function loadRequestFromHistory() {
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

export function saveRequest() {
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

export function deleteRequest() {
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