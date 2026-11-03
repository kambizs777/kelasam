// copies the web app (../app or ./app-src) into www/
const fs = require('fs'), path = require('path');
const src = fs.existsSync(path.join(__dirname, 'app')) ? path.join(__dirname, 'app') : path.join(__dirname, '..', 'app');
fs.rmSync(path.join(__dirname, 'www'), { recursive: true, force: true });
fs.cpSync(src, path.join(__dirname, 'www'), { recursive: true });
fs.rmSync(path.join(__dirname, 'www', 'sw.js'), { force: true });
console.log('www ready from', src);
