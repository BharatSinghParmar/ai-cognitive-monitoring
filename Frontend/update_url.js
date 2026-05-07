const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            replaceInDir(filePath);
        } else if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
            const content = fs.readFileSync(filePath, 'utf8');
            if (content.includes('http://localhost:5000')) {
                const newContent = content.replace(/http:\/\/localhost:5000/g, 'http://localhost:5001');
                fs.writeFileSync(filePath, newContent, 'utf8');
                console.log(`Updated ${filePath}`);
            }
        }
    }
}

replaceInDir('./src');
