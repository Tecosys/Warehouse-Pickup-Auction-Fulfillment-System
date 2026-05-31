const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'src');

function walkDir(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(walkDir(filePath));
        } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
            results.push(filePath);
        }
    });
    return results;
}

const files = walkDir(targetDir);
let changedFiles = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // 1. Replace inside backticks first: `http://localhost:5000/api/something` -> `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/something`
    // We use a unique placeholder to avoid double replacement.
    content = content.replace(/`http:\/\/localhost:5000\/api/g, '`__API_PLACEHOLDER__');
    
    // 2. Replace single quotes: 'http://localhost:5000/api/something' -> `__API_PLACEHOLDER__/something`
    content = content.replace(/'http:\/\/localhost:5000\/api([^']*)'/g, '`__API_PLACEHOLDER__$1`');

    // 3. Replace double quotes: "http://localhost:5000/api/something" -> `__API_PLACEHOLDER__/something`
    content = content.replace(/"http:\/\/localhost:5000\/api([^"]*)"/g, '`__API_PLACEHOLDER__$1`');

    // 4. Finally, replace placeholder with the actual VITE_API_URL logic
    content = content.replace(/__API_PLACEHOLDER__/g, '${import.meta.env.VITE_API_URL || \'http://localhost:5000/api\'}');

    if (original !== content) {
        fs.writeFileSync(file, content, 'utf8');
        changedFiles++;
    }
});

console.log(`Updated ${changedFiles} files.`);
