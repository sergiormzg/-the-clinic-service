import { readFileSync, writeFileSync } from 'node:fs';

const file = 'main.jsx';
const source = readFileSync(file, 'utf8');
const marker = "const LOGO_DATA_URL = 'data:image/jpeg;base64,";
const start = source.indexOf(marker);

if (start === -1) {
  console.log('Embedded logo not found; no changes applied.');
  process.exit(0);
}

const end = source.indexOf("'", start + marker.length);
if (end === -1) {
  throw new Error('Could not locate embedded logo ending quote.');
}

const before = source.slice(0, start);
const after = source.slice(end + 1);
const cleaned = before + "const LOGO_DATA_URL = '/logo-the-clinic.jpg'" + after;
writeFileSync(file, cleaned, 'utf8');
console.log('Removed embedded logo from build source.');
