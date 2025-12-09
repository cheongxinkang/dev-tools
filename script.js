// --- Navigation Logic ---
function showTab(tabId) {
    // 1. Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(el => {
        el.style.display = 'none';
    });

    // 2. Remove 'active-nav' class from all sidebar items
    document.querySelectorAll('.sidebar li').forEach(el => {
        el.classList.remove('active-nav');
    });

    // 3. Show the selected tab
    document.getElementById(tabId).style.display = 'block';
    
    // 4. Highlight the correct sidebar button (optional visual polish)
    // Finding the sidebar item based on the onclick attribute for simplicity
    const navItems = document.querySelectorAll('.sidebar li');
    if(tabId === 'api-tab') navItems[0].classList.add('active-nav');
    if(tabId === 'js-tab') navItems[1].classList.add('active-nav');
}

// --- API Caller Logic ---
async function makeApiCall() {
    const url = document.getElementById('api-url').value;
    const method = document.getElementById('api-method').value;
    const bodyContent = document.getElementById('api-body').value;
    const responseDisplay = document.getElementById('api-response');

    responseDisplay.innerText = "Loading...";

    try {
        // Prepare configuration for fetch
        let options = {
            method: method,
            headers: { 'Content-Type': 'application/json' }
        };

        // If method is POST or PUT, add the body
        if ((method === 'POST' || method === 'PUT') && bodyContent) {
            // Check if valid JSON
            try {
                JSON.parse(bodyContent); 
                options.body = bodyContent;
            } catch (e) {
                responseDisplay.innerText = "Error: Body is not valid JSON.";
                return;
            }
        }

        // Perform the API call
        const response = await fetch(url, options);
        const data = await response.json();

        // Display result neatly formatted
        responseDisplay.innerText = JSON.stringify(data, null, 2); 
    } catch (error) {
        responseDisplay.innerText = "Request Failed: " + error.message;
    }
}

// --- JS Runner Logic ---
function runJsCode() {
    const code = document.getElementById('js-code').value;
    const outputDiv = document.getElementById('js-output');
    
    outputDiv.innerText = ""; // Clear previous output

    // We need to capture console.log to show it in our div
    const originalLog = console.log;
    const logs = [];

    // Override console.log
    console.log = function(...args) {
        // Convert all arguments to strings and join them
        logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' '));
        // Still log to the real browser console for debugging
        originalLog.apply(console, args);
    };

    try {
        // DANGEROUS IN PRODUCTION: eval() executes the string as code.
        // For a local playground, this is acceptable.
        const result = eval(code);

        // If there were console logs, show them
        if (logs.length > 0) {
            outputDiv.innerText = logs.join('\n');
        } 
        // If there is a return value that isn't undefined, show it
        if (result !== undefined) {
            outputDiv.innerText += (logs.length > 0 ? '\n\n' : '') + "Return: " + result;
        }
        if (logs.length === 0 && result === undefined) {
             outputDiv.innerText = "Code executed (No output).";
        }

    } catch (error) {
        outputDiv.innerText = "Error: " + error.message;
    } finally {
        // Restore original console.log so we don't break the browser
        console.log = originalLog;
    }
}