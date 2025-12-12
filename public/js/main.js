import { makeApiCall } from './api.js';
import { runJsCode } from './runner.js';
import { 
    loadPresets, 
    populateSavedDropdown, 
    loadRequestFromHistory, 
    saveRequest, 
    deleteRequest 
} from './storage.js';

// --- GLOBAL EXPORTS ---
// Allow the HTML onclick="..." attributes to see these functions
window.makeApiCall = makeApiCall;
window.runJsCode = runJsCode;
window.loadRequestFromHistory = loadRequestFromHistory;
window.saveRequest = saveRequest;
window.deleteRequest = deleteRequest;
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
        
    } catch (error) {
        contentContainer.innerHTML = `<h3>Error</h3><p>${error.message}</p>`;
    }
}