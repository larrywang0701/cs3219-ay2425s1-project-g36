const pythonWrapperScript = `
import sys
from io import StringIO

all_input = sys.stdin.read().strip().splitlines()

for line in all_input:
    sys.stdin = StringIO(line)
    # User code will be appended below this
`

// WIP: can't seem to make this work
const javascriptWrapperScript = `
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

const inputLines = [];
rl.on('line', (line) => {
  inputLines.push(line);
});

let currentLineIndex = 0;
function readLine() {
  return inputLines[currentLineIndex++] || '';
}

rl.on('close', () => {
  // User code will be appended below this
`

export const formatRawCode = (rawCode: string, language: string) => {
    if (language === 'python3') {
        const formattedRawCode = rawCode
            .split('\n')
            .map(line => `    ${line}`) // push the rawCode 4 spaces to the right (equivalent to 1 tab)
            .join('\n')
        const combinedScript = `${pythonWrapperScript}\n${formattedRawCode}`
        return combinedScript
    }
            
    if (language === 'nodejs') { // same as javascript
        const formattedRawCode = rawCode
        .split('\n')
        .map(line => `  ${line}`) // Indent user code by 2 spaces
        .join('\n');
        
        const combinedScript = `${javascriptWrapperScript}\n${formattedRawCode}\n});`;
        return combinedScript;
    }

    return ""
    
}