# dev-tools
A simple frontend for API calls and Javascript coding

# Set-up
Here are the instructions to get this running. You will need to use your computer's Terminal (Mac/Linux) or Command Prompt/PowerShell (Windows).

Prerequisite
Ensure you have Node.js installed. You can check by typing node -v in your terminal. If you get an error, download it from nodejs.org.

Step 1: Setup the Folder
Create a new folder named my-dashboard-app.

Inside it, create the package.json and server.js files with the code above.

Create a folder named public.

Move your previous index.html, style.css, script.js and the components folder inside public.

Create a .env file with
"""
# Server Configuration
PORT=3000
# Security Secrets
API_SECRET_KEY=
"""

Create a sample presets.json in public/
"""
[
    {
      "name": "Server Health Check",
      "method": "GET",
      "url": "http://localhost:3000/api/test",
      "auth": "",
      "body": ""
    },
    {
      "name": "Echo Data (POST)",
      "method": "POST",
      "url": "http://localhost:3000/api/echo",
      "auth": "",
      "body": "{\n  \"message\": \"Hello Server!\",\n  \"id\": 123\n}"
    },
    {
      "name": "Secret Area (With Token)",
      "method": "GET",
      "url": "http://localhost:3000/api/secret",
      "auth": "Bearer secret-password-123",
      "body": ""
    }
]
"""

Step 2: Install Dependencies
Open your terminal, navigate to your project folder, and run:

Bash

npm install
This command reads your package.json and downloads express automatically.

Step 3: Run the Server
In your terminal, run:

Bash

node server.js
You should see a message: Server running at http://localhost:3000

Step 4: Use the Dashboard
Open your browser and go to http://localhost:3000.

Your Modular Dashboard should load perfectly!