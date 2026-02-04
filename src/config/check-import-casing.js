// check-import-casing.js
import fs from 'fs';
import path from 'path';

const projectRoot = path.resolve('./src'); // adjust if needed

function fileExistsCaseSensitive(filePath) {
  const dir = path.dirname(filePath);
  const fileName = path.basename(filePath);

  if (!fs.existsSync(dir)) return false;

  // check if the filename matches exactly
  const filesInDir = fs.readdirSync(dir);
  return filesInDir.some(f => f === fileName);
}

function checkImports(dir) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      checkImports(fullPath);
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      const content = fs.readFileSync(fullPath, 'utf8');

      const importRegex = /import\s+.*?\s+from\s+['"](.*?)['"]/g;
      let match;
      while ((match = importRegex.exec(content)) !== null) {
        let importPath = match[1];

        if (!importPath.startsWith('.')) continue; // skip node_modules

        // resolve the directory of import
        const importFullPath = path.resolve(path.dirname(fullPath), importPath);

        // possible extensions
        const extensions = ['', '.js', '.jsx', '/index.js', '/index.jsx'];
        const found = extensions.some(ext => fileExistsCaseSensitive(importFullPath + ext));

        if (!found) {
          console.log(
            `⚠️  Case mismatch or missing file in ${fullPath}: "${importPath}"`
          );
        }
      }
    }
  });
}

checkImports(projectRoot);
