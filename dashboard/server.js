const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Get file tree
app.get('/api/files', (req, res) => {
  const workspacePath = '/data/workspace';
  const excludeDirs = ['node_modules', '.git', 'skills', 'dashboard', '.openclaw'];
  
  function getTree(dir, prefix = '') {
    const items = [];
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        if (excludeDirs.includes(entry.name) || entry.name.startsWith('.')) continue;
        
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.relative(workspacePath, fullPath);
        
        if (entry.isDirectory()) {
          items.push({
            name: entry.name,
            path: relativePath,
            type: 'directory',
            children: getTree(fullPath, prefix + entry.name + '/')
          });
        } else {
          items.push({
            name: entry.name,
            path: relativePath,
            type: 'file'
          });
        }
      }
    } catch (err) {
      console.error('Error reading directory:', dir, err);
    }
    return items;
  }
  
  res.json(getTree(workspacePath));
});

// Read file content
app.get('/api/file/*', (req, res) => {
  const filePath = req.params[0];
  const fullPath = path.join('/data/workspace', filePath);
  
  // Security: prevent directory traversal
  if (!fullPath.startsWith('/data/workspace/')) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  try {
    const ext = path.extname(filePath).toLowerCase();
    const isText = ['.md', '.txt', '.json', '.js', '.ts', '.html', '.css', '.yaml', '.yml', '.xml', '.py', '.sh', '.sql'].includes(ext);
    
    if (isText) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      res.json({ content, isText: true });
    } else {
      res.json({ isText: false, message: 'Binary file - preview not available' });
    }
  } catch (err) {
    res.status(404).json({ error: 'File not found' });
  }
});

// ZENDA routes
app.get('/zenda', (req, res) => {
  res.sendFile(path.join(__dirname, '../zenda/prototype.html'));
});

app.get('/zenda/customer', (req, res) => {
  res.sendFile(path.join(__dirname, '../zenda/customer_view.html'));
});

app.listen(PORT, () => {
  console.log(`🦞 Dashboard running on port ${PORT}`);
  console.log(`⚡ ZENDA available at /zenda`);
});
