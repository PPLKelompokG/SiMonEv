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
      
      content = content.replace(/color:\s*'(?:white|#fff|#ffffff)'/g, "color: 'var(--pk-text)'");
      content = content.replace(/color:\s*"(?:white|#fff|#ffffff)"/g, "color: 'var(--pk-text)'");
      
      content = content.replace(/background:\s*'var\(--pk-primary\)',[^}]*color:\s*'var\(--pk-text\)'/g, match => match.replace("color: 'var(--pk-text)'", "color: '#ffffff'"));
      
      content = content.replace(/color=[\"']#fff[\"']/g, "color='var(--pk-text)'");
      content = content.replace(/color=[\"']white[\"']/g, "color='var(--pk-text)'");
      
      fs.writeFileSync(file, content, 'utf8');
    }
  });
}
walk('c:/GitHub/SiMonEv/frontend/src');
console.log('Fixed text colors');
