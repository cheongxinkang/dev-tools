let cachedFileList = [];

// --- 1. PRESET & STORAGE LOGIC ---

export async function loadJsPresets() {
    // fetch the LIST of filenames from our Node server
    try {
        const response = await fetch('/api/js-files');
        cachedFileList = await response.json();
    } catch (error) {
        console.error("Failed to load file list:", error);
        cachedFileList = [];
    }
}

function getAllJs() {
    const localData = localStorage.getItem('my_saved_js');
    const savedJs = localData ? JSON.parse(localData) : [];
    
    return {
        files: cachedFileList, // Array of strings: ["01-vars.js", "02-loops.js"]
        saved: savedJs         // Array of objects: [{name: "My Test", code: "..."}]
    };
}

export function populateJsDropdown() {
    const dropdown = document.getElementById('js-saved-dropdown');
    if (!dropdown) return;

    dropdown.innerHTML = '<option value="">-- Select Code --</option>';
    const { files, saved } = getAllJs();

    // Group 1: Files from Server (Textbook)
    if (files.length > 0) {
        const group = document.createElement('optgroup');
        group.label = "Textbook Files (Server)";
        
        files.forEach((filename, index) => {
            const option = document.createElement('option');
            // We use a prefix 'FILE:' to distinguish files from local saves
            option.value = 'FILE:' + filename; 
            option.text = filename;
            group.appendChild(option);
        });
        dropdown.appendChild(group);
    }

    // Group 2: My Saved Code (Local Storage)
    if (saved.length > 0) {
        const group = document.createElement('optgroup');
        group.label = "My Local Notes";
        
        saved.forEach((item, index) => {
            const option = document.createElement('option');
            // We use a prefix 'LOCAL:' and the index
            option.value = 'LOCAL:' + index; 
            option.text = item.name;
            group.appendChild(option); 
        });
        dropdown.appendChild(group);
    }
}

export async function loadJsFromHistory() {
    const dropdown = document.getElementById('js-saved-dropdown');
    const value = dropdown.value;
    const textArea = document.getElementById('js-code');

    if (value === "") return;

    // CHECK: Is it a Server File or a Local Save?
    if (value.startsWith('FILE:')) {
        // It's a file! Fetch the text content.
        const filename = value.replace('FILE:', '');
        try {
            textArea.value = "// Loading...";
            const response = await fetch(`/sicpjs-code/${filename}`);
            const codeText = await response.text();
            textArea.value = codeText;
        } catch (e) {
            textArea.value = "// Error loading file.";
        }
    } 
    else if (value.startsWith('LOCAL:')) {
        // It's local storage.
        const index = parseInt(value.replace('LOCAL:', ''));
        const { saved } = getAllJs();
        if (saved[index]) {
            textArea.value = saved[index].code;
        }
    }
}

// ... saveJsCode and deleteJsCode remain largely the same ...
// Just ensure you handle the new getAllJs structure if you modify them.
// Below is a quick update to deleteJsCode to handle the protection:

export function deleteJsCode() {
    const dropdown = document.getElementById('js-saved-dropdown');
    const value = dropdown.value;
    
    if (!value) { alert("Select a snippet first."); return; }

    if (value.startsWith('FILE:')) {
        alert("You cannot delete Server Files from the browser.\nGo to your 'public/textbook-code' folder to delete this file.");
        return;
    }

    if(confirm("Delete this saved snippet?")) {
        const index = parseInt(value.replace('LOCAL:', ''));
        const { saved } = getAllJs();
        
        saved.splice(index, 1);
        localStorage.setItem('my_saved_js', JSON.stringify(saved));
        
        populateJsDropdown();
        document.getElementById('js-code').value = "";
    }
}

// Ensure saveJsCode is exported and uses getAllJs correctly (it likely works as is from previous step)
export function saveJsCode() {
    const code = document.getElementById('js-code').value;
    if (!code) { alert("Write some code first."); return; }

    const name = prompt("Name this snippet:");
    if (!name) return;

    const newItem = { name, code };
    const { saved } = getAllJs(); // This function now returns { files, saved }
    
    saved.push(newItem);
    localStorage.setItem('my_saved_js', JSON.stringify(saved));
    populateJsDropdown();
}

export function runJsCode() {
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