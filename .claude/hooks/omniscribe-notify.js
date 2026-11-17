const fs = require('fs');
const path = require('path');
const os = require('os');
let data = '';
process.stdin.on('data', c => data += c);
process.stdin.on('end', () => {
  const dir = path.join(os.tmpdir(), 'omniscribe-hooks');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `${Date.now()}-${process.pid}.json`), data);
});
