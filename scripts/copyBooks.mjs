import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const src = path.join(root, 'books');
const dest = path.join(root, 'public', 'books');

const TEXT_EXTS = ['.md', '.txt', '.json'];

function copyDir(srcDir, destDir) {
  fs.mkdirSync(destDir, { recursive: true });
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else if (TEXT_EXTS.some(ext => entry.name.toLowerCase().endsWith(ext))) {
      // Copia apenas arquivos de texto (.md, .txt, .json)
      // PNGs ficam em public/books/ diretamente (rastreados no git)
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log('📚 Copiando books/ → public/books/ ...');
copyDir(src, dest);
console.log('✅ Pronto!');
