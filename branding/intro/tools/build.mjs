// Sinh file từ core/: core/variants/index.js (danh sách kiểu, tự đọc mọi file pN-*.js), preview.html (mở thẳng bằng Chrome),
// block HyperFrames cho từng kiểu, và chép lõi + tiếng sang 2 dự án mẫu. Chạy lại mỗi khi sửa hoặc thêm kiểu trong core/.
// Dùng: node tools/build.mjs
import { readFileSync, writeFileSync, readdirSync, copyFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = p => readFileSync(join(root, p), 'utf8');
const GENERATED = '<!-- File sinh bởi tools/build.mjs từ core/. Đừng sửa tay: sửa core/ rồi chạy lại node tools/build.mjs -->';

// 1) danh sách kiểu: mọi file core/variants/pN-*.js, xếp theo số
const files = readdirSync(join(root, 'core/variants')).filter(f => /^p\d+-.+\.js$/.test(f)).sort((a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1)));
const ids = files.map(f => 'P' + parseInt(f.slice(1)));
const vars = ids.map(id => id.replace('P', 'V'));
writeFileSync(join(root, 'core/variants/index.js'),
  `// File sinh bởi tools/build.mjs: mọi kiểu trong thư mục này. Đừng sửa tay.\n${files.map((f, i) => `import ${vars[i]} from './${f}';`).join('\n')}\n\nexport const VARIANTS = [${vars.join(', ')}];\n`);

// 2) gộp ES module thành một script thường (window.PikaIntro) để nhúng vào HTML
const strip = s => s.replace(/^import [^;]*;\n/gm, '').replace(/^export /gm, '');
const CORE = `(function () {
${strip(read('core/logo-paths.js'))}
${strip(read('core/toolkit.js'))}
${files.map((f, i) => `const ${vars[i]} = (function () {\n${strip(read('core/variants/' + f)).replace(/^default /m, 'return ')}\n})();`).join('\n')}
const VARIANTS = [${vars.join(', ')}];
${strip(read('core/pika-intro.js')).replace(/^\{ VARIANTS, LOGO_PATHS \};\n/m, '')}
window.PikaIntro = { createPikaIntro, logoSVG, VARIANTS, VARIANT_IDS, COLORS, LOGO_PATHS };
})();`;

writeFileSync(join(root, 'preview.html'), read('tools/preview.template.html').replace('<!--GENERATED-->', GENERATED).replace('/*__CORE__*/', () => CORE));

// 3) block HyperFrames: mỗi kiểu một file (tiếng mỗi kiểu một mốc khác nhau)
mkdirSync(join(root, 'hyperframes'), { recursive: true });
for (const id of ids) {
  const low = id.toLowerCase();
  writeFileSync(join(root, `hyperframes/pika-intro-${low}.html`), read('tools/hyperframes-block.template.html')
    .replace('<!--GENERATED-->', GENERATED).replaceAll('__ID__', `pika-intro-${low}`).replaceAll('__VARIANT__', id)
    .replaceAll('__SOUND__', `mix-${low}.wav`).replace('/*__CORE__*/', () => CORE));
}

// 4) dự án mẫu
const copy = (from, to) => { mkdirSync(dirname(join(root, to)), { recursive: true }); copyFileSync(join(root, from), join(root, to)); };
for (const id of ids) {
  const low = id.toLowerCase();
  copy(`hyperframes/pika-intro-${low}.html`, `hyperframes/example/compositions/pika-intro-${low}.html`);
  if (existsSync(join(root, `sound/mix-${low}.wav`))) {
    copy(`sound/mix-${low}.wav`, `hyperframes/example/assets/pika-intro/mix-${low}.wav`);
    copy(`sound/mix-${low}.wav`, `remotion/example/public/pika-intro/mix-${low}.wav`);
  }
}
for (const f of ['pika-intro.js', 'pika-intro.d.ts', 'toolkit.js', 'logo-paths.js']) copy(`core/${f}`, `remotion/example/src/pika-intro/core/${f}`);
for (const f of ['index.js', ...files]) copy(`core/variants/${f}`, `remotion/example/src/pika-intro/core/variants/${f}`);
copy('remotion/PikaIntro.tsx', 'remotion/example/src/pika-intro/remotion/PikaIntro.tsx');
console.log(`built ${ids.length} kiểu (${ids.join(', ')}): preview.html, hyperframes/, 2 dự án mẫu`);
