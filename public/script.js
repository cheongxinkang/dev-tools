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
    
    // 1. Update Sidebar Visuals
    document.querySelectorAll('.sidebar li').forEach(el => el.classList.remove('active-nav'));
    if(activeNavElement) activeNavElement.classList.add('active-nav');

    // 2. Fetch the HTML file
    try {
        const response = await fetch(filePath);
        if (!response.ok) throw new Error('Module not found');
        
        // 3. Get the text (HTML) from the file
        const html = await response.text();
        
        // 4. Inject it into the main container
        contentContainer.innerHTML = html;
        
    } catch (error) {
        contentContainer.innerHTML = `<h3>Error loading module</h3><p>${error.message}</p><p>Make sure you are running a local server!</p>`;
    }
}

// --- API Caller Logic (Same as before) ---
async function makeApiCall() {
    const url = document.getElementById('api-url').value;
    const method = document.getElementById('api-method').value;
    const bodyContent = document.getElementById('api-body').value;
    const responseDisplay = document.getElementById('api-response');

    responseDisplay.innerText = "Loading...";

    try {
        let options = {
            method: method,
            headers: { 'Content-Type': 'application/json' }
        };

        if ((method === 'POST' || method === 'PUT') && bodyContent) {
            try {
                JSON.parse(bodyContent); 
                options.body = bodyContent;
            } catch (e) {
                responseDisplay.innerText = "Error: Body is not valid JSON.";
                return;
            }
        }

        const response = await fetch(url, options);
        const data = await response.json();
        responseDisplay.innerText = JSON.stringify(data, null, 2); 
    } catch (error) {
        responseDisplay.innerText = "Request Failed: " + error.message;
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