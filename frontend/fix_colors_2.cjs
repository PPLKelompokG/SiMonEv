const fs = require('fs');
const path = require('path');

function walk(dir) {
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      walk(file);
    } else if (file.endsWith('.jsx')) {
      let content = fs.readFileSync(file, 'utf8');
      let changed = false;

      // Fix DashboardKPI hardcoded light text colors
      const newContent = content
        .replace(/color:\s*['"]#f8fafc['"]/g, "color: 'var(--pk-text)'")
        .replace(/color:\s*['"]#94a3b8['"]/g, "color: 'var(--pk-text-muted)'")
        .replace(/color:\s*['"]#64748b['"]/g, "color: 'var(--pk-text-muted)'")
        .replace(/fill:\s*['"]#94a3b8['"]/g, "fill: 'var(--pk-text-muted)'")
        .replace(/fill:\s*['"]#f8fafc['"]/g, "fill: 'var(--pk-text)'");

      if (content !== newContent) {
        fs.writeFileSync(file, newContent, 'utf8');
        console.log('Updated: ' + file);
      }
    }
  });
}
walk('c:/GitHub/SiMonEv/frontend/src');
console.log('Finished updating hex colors to variables');
