import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, resolve, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const required = ['PROJECT_BRIEF','REQUIREMENTS','DESIGN_SYSTEM','TECHNICAL_ARCHITECTURE',
  'INTERACTION_DESIGN','HISTORICAL_DATA_PLAN','HISTORICAL_SOURCES','DEVELOPMENT_PLAN',
  'TASK_BOARD','TEST_PLAN','REPORT_OUTLINE','GIT_WORKFLOW','SKILLS'];
const expected = ['frontend-design','ui-ux-pro-max','cinematic-scroll-storytelling','web-design-guidelines'];
const read = path => readFileSync(join(root, path), 'utf8');
for (const name of required) assert(read(`docs/${name}.md`).trim().length > 150, `Missing/empty ${name}`);
for (const file of ['AGENTS.md','.gitignore','README.md']) assert(read(file).trim(), `Missing ${file}`);

const markdown = ['README.md','AGENTS.md', ...readdirSync(join(root, 'docs'))
  .filter(name => name.endsWith('.md')).map(name => `docs/${name}`)];
let links = 0;
for (const file of markdown) {
  const text = read(file);
  assert(!text.includes('\uFFFD'), `Invalid Unicode in ${file}`);
  for (const match of text.matchAll(/\[[^\]\n]*\]\(([^)\n]+)\)/g)) {
    const target = match[1].split('#')[0];
    if (!target || /^(https?:|mailto:)/.test(target)) continue;
    assert(existsSync(resolve(root, dirname(file), decodeURIComponent(target))), `${file}: broken link ${target}`);
    links++;
  }
}

const installed = readdirSync(join(root, '.agents/skills'), { withFileTypes:true })
  .filter(entry => entry.isDirectory()).map(entry => entry.name).sort();
assert.deepEqual(installed, [...expected].sort(), 'Unexpected/missing project Skill');
const provenance = JSON.parse(read('docs/skills-provenance.json'));
assert.deepEqual(provenance.skills.map(skill => skill.name).sort(), [...expected].sort());
let hashedFiles = 0;
for (const skill of provenance.skills) {
  const manifest = read(`${skill.installPath}/SKILL.md`);
  assert(manifest.startsWith('---'), `Missing frontmatter: ${skill.name}`);
  assert(new RegExp(`^name: ${skill.name}$`, 'm').test(manifest.replaceAll('\r','')), `Wrong name: ${skill.name}`);
  assert(/^description: .+/m.test(manifest), `Missing description: ${skill.name}`);
  const actual = [];
  const walk = folder => { for (const entry of readdirSync(folder, {withFileTypes:true})) {
    const full=join(folder,entry.name);
    assert(!entry.isSymbolicLink(), `Unexpected symlink: ${full}`);
    if(entry.isDirectory()) walk(full);
    else actual.push(relative(join(root,skill.installPath),full).replaceAll('\\','/'));
  }};
  walk(join(root, skill.installPath));
  assert.deepEqual(actual.sort(), skill.files.map(file=>file.path).sort(), `Unrecorded files: ${skill.name}`);
  for (const file of skill.files) {
    const bytes = readFileSync(join(root, skill.installPath, file.path));
    assert.equal(bytes.length, file.bytes);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), file.sha256, `Hash mismatch: ${skill.name}/${file.path}`);
    hashedFiles++;
  }
}

const discovery = JSON.parse(read('docs/skills-discovery.json'));
assert.deepEqual(discovery.skills.map(skill=>skill.name).sort(), [...expected].sort());
assert.equal(discovery.errors.length, 0);
assert(discovery.skills.every(skill=>skill.scope==='repo' && skill.enabled===true));
const days = [...read('docs/DEVELOPMENT_PLAN.md').matchAll(/^\| D(\d+) \|/gm)].map(match=>Number(match[1]));
assert.deepEqual(days, Array.from({length:14},(_,index)=>index+1));
for (const pattern of ['node_modules/','dist/','.env','.env.*','!.env.example','.DS_Store','Thumbs.db','*.log']) {
  assert(read('.gitignore').split(/\r?\n/).includes(pattern), `Missing ignore rule: ${pattern}`);
}
for(const forbidden of ['package.json','src','node_modules','dist']) {
  assert(!existsSync(join(root,forbidden)), `Preparation scope exceeded: ${forbidden}`);
}
console.log(`PASS: ${required.length} required docs; ${links} local links; 4 repo Skills; ${hashedFiles} file hashes; 14-day plan; ignore rules; preparation scope.`);
console.log('LIMITATION: website not scaffolded; browser/build/performance tests not run; Python search smoke test pending.');
