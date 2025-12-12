import { makeApiCall } from './api.js';
import {
    loadPresets,
    populateSavedDropdown,
    loadRequestFromHistory,
    saveRequest,
    deleteRequest
} from './storage.js';
import {
    runJsCode,
    loadJsPresets,
    populateJsDropdown,
    loadJsFromHistory,
    saveJsCode,
    deleteJsCode
} from './runner.js';

// --- GLOBAL EXPORTS ---
// Allow the HTML onclick="..." attributes to see these functions
window.makeApiCall = makeApiCall;

// API Tab Functions
window.loadRequestFromHistory = loadRequestFromHistory;
window.saveRequest = saveRequest;
window.deleteRequest = deleteRequest;

// 2. JS Tab Functions (NEW)
window.runJsCode = runJsCode;
window.loadJsFromHistory = loadJsFromHistory;
window.saveJsCode = saveJsCode;
window.deleteJsCode = deleteJsCode;

window.loadModule = loadModule; // Export itself


// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Define Defaults (API Tab)
    let fileToLoad = 'components/api-tab.html';
    let tabIdToHighlight = 'nav-api'; 

    // 2. Check LocalStorage for history
    const savedFile = localStorage.getItem('current_module_file');
    const savedTabId = localStorage.getItem('current_nav_id');

    // 3. If history exists, overwrite defaults
    if (savedFile && savedTabId) {
        fileToLoad = savedFile;
        tabIdToHighlight = savedTabId;
    }

    // 4. Find the actual HTML element
    const navElement = document.getElementById(tabIdToHighlight);

    // 5. Load (Safety Check: only if element exists)
    if (navElement) {
        loadModule(fileToLoad, navElement);
    } else {
        // Fallback if ID not found (e.g. if you changed HTML IDs later)
        const fallbackElement = document.getElementById('nav-api');
        loadModule('components/api-tab.html', fallbackElement);
    }
});

// --- NAVIGATION LOGIC ---
async function loadModule(filePath, activeNavElement) {
    const contentContainer = document.getElementById('main-content');
    
    // 1. Visual Update
    document.querySelectorAll('.sidebar li').forEach(el => el.classList.remove('active-nav'));
    if(activeNavElement) {
        activeNavElement.classList.add('active-nav');
        
        // --- NEW: Save State to Storage ---
        // Only save if the element has an ID
        if (activeNavElement.id) {
            localStorage.setItem('current_module_file', filePath);
            localStorage.setItem('current_nav_id', activeNavElement.id);
        }
    }

    // 2. Load Content
    try {
        const response = await fetch(filePath);
        if (!response.ok) throw new Error('Module not found');
        
        const html = await response.text();
        contentContainer.innerHTML = html;

        // 3. Specific Initialization
        if (filePath.includes('api-tab.html')) {
            // Need to import these from storage.js if not globally available, 
            // but we attached them to window in main.js previously, so we use window.
            // However, inside main.js we have direct access to imports.
            
            // Re-importing logic here for safety or relying on the storage.js functions
            // defined in your imports at the top of main.js
            
            // Assuming you imported these at the top of main.js:
            const { loadPresets, populateSavedDropdown } = await import('./storage.js');
            await loadPresets(); 
            populateSavedDropdown();
        }

        if (filePath.includes('js-tab.html')) {
            const { loadJsPresets, populateJsDropdown } = await import('./runner.js');
            await loadJsPresets();
            populateJsDropdown();
        }
        
    } catch (error) {
        console.error(error);
        contentContainer.innerHTML = `<h3>Error</h3><p>${error.message}</p>`;
    }
}