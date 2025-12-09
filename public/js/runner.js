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