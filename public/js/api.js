export async function makeApiCall() {
    const targetUrl = document.getElementById('api-url').value;
    const method = document.getElementById('api-method').value;
    const bodyContent = document.getElementById('api-body').value;
    const authHeader = document.getElementById('api-auth').value;

    const responseBody = document.getElementById('api-response');
    const statusDisplay = document.getElementById('status-display');

    // UI Updates
    responseBody.innerText = "Loading via Proxy...";
    statusDisplay.style.display = 'inline-block';
    statusDisplay.className = 'status-badge status-neutral';
    statusDisplay.innerText = "Sending to Backend...";

    try {
        // 1. Prepare the Headers for the TARGET API
        const targetHeaders = { 'Content-Type': 'application/json' };
        if (authHeader) targetHeaders['Authorization'] = authHeader;

        // 2. Prepare the Body for the TARGET API
        let targetBody = undefined;
        if ((method === 'POST' || method === 'PUT') && bodyContent) {
            // Validation check only
            try { JSON.parse(bodyContent); }
            catch (e) {
                alert("Invalid JSON in body");
                return;
            }
            targetBody = bodyContent;
        }

        // 3. SEND TO OUR NODE SERVER (THE PROXY)
        // We always use POST to talk to our proxy, regardless of the target method
        const response = await fetch('/api/proxy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                targetUrl: targetUrl,
                method: method,
                headers: targetHeaders,
                body: targetBody
            })
        });

        const result = await response.json();

        // 4. Update UI with the result from the proxy
        if (result.status >= 200 && result.status < 300) {
            statusDisplay.className = 'status-badge status-success';
        } else {
            statusDisplay.className = 'status-badge status-error';
        }

        statusDisplay.innerText = `Status: ${result.status} ${result.statusText}`;

        // --- NEW: SAFETY DISPLAY LOGIC ---
        const content = typeof result.data === 'object'
            ? JSON.stringify(result.data, null, 2)
            : String(result.data);

        // Limit: 50,000 characters (approx 50KB)
        const MAX_DISPLAY_LENGTH = 50000;

        if (content.length > MAX_DISPLAY_LENGTH) {
            // 1. Show Preview
            const preview = content.substring(0, MAX_DISPLAY_LENGTH);
            responseBody.innerText = preview + "\n\n... [RESPONSE TRUNCATED DUE TO SIZE] ...";

            // 2. Add Download Link (Dynamic)
            const blob = new Blob([content], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const downloadLink = document.createElement('a');
            downloadLink.href = url;
            downloadLink.download = "response_full.json";
            downloadLink.innerText = "⚠️ Response is too large. Click here to download full JSON.";
            downloadLink.style.display = "block";
            downloadLink.style.marginTop = "10px";
            downloadLink.style.color = "#3498db";
            downloadLink.style.fontWeight = "bold";

            // Append link after the pre tag (need to ensure we don't duplicate it)
            const existingLink = responseBody.parentNode.querySelector('#download-link');
            if (existingLink) existingLink.remove();

            downloadLink.id = "download-link";
            responseBody.parentNode.insertBefore(downloadLink, responseBody);

        } else {
            // Small enough to show safely
            responseBody.innerText = content;

            // Remove old download link if it exists
            const existingLink = responseBody.parentNode.querySelector('#download-link');
            if (existingLink) existingLink.remove();
        }

    } catch (error) {
        statusDisplay.className = 'status-badge status-error';
        statusDisplay.innerText = "Proxy Connection Failed";
        responseBody.innerText = error.message;
    }
}