export async function makeApiCall() {
    const url = document.getElementById('api-url').value;
    const method = document.getElementById('api-method').value;
    const bodyContent = document.getElementById('api-body').value;
    const authHeader = document.getElementById('api-auth').value;
    
    const responseBody = document.getElementById('api-response');
    const statusDisplay = document.getElementById('status-display');

    responseBody.innerText = "Loading...";
    statusDisplay.style.display = 'inline-block';
    statusDisplay.className = 'status-badge status-neutral'; 
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

        const response = await fetch(url, options);
        const data = await response.json();

        if (response.ok) {
            statusDisplay.className = 'status-badge status-success';
        } else {
            statusDisplay.className = 'status-badge status-error'; 
        }

        statusDisplay.innerText = `Status: ${response.status} ${response.statusText}`;
        responseBody.innerText = JSON.stringify(data, null, 2);

    } catch (error) {
        statusDisplay.className = 'status-badge status-error';
        statusDisplay.innerText = "Network Error";
        responseBody.innerText = error.message;
    }
}