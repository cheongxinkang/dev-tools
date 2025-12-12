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
    const firstTab = document.querySelector('.sidebar li');
    loadModule('components/api-tab.html', firstTab);
});

// --- NAVIGATION LOGIC ---
async function loadModule(filePath, activeNavElement) {
    const contentContainer = document.getElementById('main-content');
    
    document.querySelectorAll('.sidebar li').forEach(el => el.classList.remove('active-nav'));
    if(activeNavElement) activeNavElement.classList.add('active-nav');

    try {
        const response = await fetch(filePath);
        if (!response.ok) throw new Error('Module not found');
        
        const html = await response.text();
        contentContainer.innerHTML = html;

        // Specific Initialization
        if (filePath.includes('api-tab.html')) {
            await loadPresets(); 
            populateSavedDropdown();
        }

        // CASE B: JS TAB (NEW)
        if (filePath.includes('js-tab.html')) {
            await loadJsPresets();
            populateJsDropdown();
        }
        
    } catch (error) {
        contentContainer.innerHTML = `<h3>Error</h3><p>${error.message}</p>`;
    }
}