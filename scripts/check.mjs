import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../dist');
const htmlFiles = [];
const errors = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const target = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(target);
    else if (entry.name.endsWith('.html') && !/^naver.*\.html$/i.test(entry.name)) htmlFiles.push(target);
  }
}
walk(root);

const titles = new Map();
const localTargets = new Set();
for (const file of htmlFiles) {
  const rel = path.relative(root, file).replaceAll('\\','/');
  const urlPath = rel === 'index.html' ? '/' : rel === '404.html' ? '/404.html' : `/${rel.replace(/index\.html$/, '')}`;
  localTargets.add(urlPath);
}

for (const file of htmlFiles) {
  const rel = path.relative(root, file).replaceAll('\\','/');
  const html = fs.readFileSync(file, 'utf8');
  if (/양산|물금/.test(html)) errors.push(`${rel}: old regional copy remains`);
  const title = html.match(/<title>(.*?)<\/title>/s)?.[1];
  if (!title) errors.push(`${rel}: missing title`);
  else if (titles.has(title) && rel !== '404.html') errors.push(`${rel}: duplicate title with ${titles.get(title)}`);
  else titles.set(title, rel);
  if (rel !== '404.html') {
    if (!/<meta name="description"/.test(html)) errors.push(`${rel}: missing description`);
    if (!/<link rel="canonical"/.test(html)) errors.push(`${rel}: missing canonical`);
    const h1Count = (html.match(/<h1[\s>]/g) || []).length;
    if (h1Count !== 1) errors.push(`${rel}: expected one h1, found ${h1Count}`);
  }
  for (const block of html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)) {
    try { JSON.parse(block[1]); } catch { errors.push(`${rel}: invalid JSON-LD`); }
  }
  for (const match of html.matchAll(/href="(\/[^"#?]*)"/g)) {
    const href = match[1];
    if (href.includes('.')) continue;
    const normalized = href.endsWith('/') ? href : `${href}/`;
    if (!localTargets.has(normalized) && href !== '/') errors.push(`${rel}: broken local link ${href}`);
  }
}

const required = [
  'sitemap.xml','rss.xml','robots.txt','llms.txt','humans.txt','manifest.webmanifest',
  'videos/changwon-desktop.mp4','videos/changwon-desktop.webm','videos/changwon-mobile.mp4','videos/changwon-mobile.webm',
  'videos/sangnam-desktop.mp4','videos/sangnam-desktop.webm','videos/sangnam-mobile.mp4','videos/sangnam-mobile.webm',
  'videos/jungdong-desktop.mp4','videos/jungdong-desktop.webm','videos/jungdong-mobile.mp4','videos/jungdong-mobile.webm',
  'images/changwon/hero-poster.webp','images/sangnam/hero-poster.webp','images/jungdong/hero-poster.webp',
  'icons/brand-mark.svg','icons/favicon.svg',
];
for (const asset of required) if (!fs.existsSync(path.join(root,asset))) errors.push(`missing ${asset}`);

const hubFiles = ['index.html','sangnam/index.html','jungdong/index.html'];
for (const hubFile of hubFiles) {
  const html = fs.readFileSync(path.join(root,hubFile),'utf8');
  const schemas = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map((m)=>JSON.parse(m[1]));
  const itemList = schemas.find((s)=>s['@type']==='ItemList');
  if (!itemList || itemList.itemListElement?.length !== 6) errors.push(`${hubFile}: six-item ItemList missing`);
  else {
    for (const item of itemList.itemListElement) {
      if (item['@type'] !== 'ListItem' || !item.name || !item.image || !item.url || !item.position) errors.push(`${hubFile}: ItemList item does not match Naver direct ListItem form`);
    }
  }
  if (!schemas.some((s)=>s['@type']==='VideoObject')) errors.push(`${hubFile}: VideoObject missing`);
  if (!html.includes('site-header-overlay')) errors.push(`${hubFile}: overlay header missing`);
  if (!html.includes('<video class="hero-video"')) errors.push(`${hubFile}: full video hero missing`);
  if (html.includes('MedicalClinic')) errors.push(`${hubFile}: publisher mode must not claim MedicalClinic`);
}

const imageFiles = [
  ...['choice','acne','pigmentation','lifting','injectable','access'].map((x)=>`images/changwon/${x}.webp`),
  ...['acne','pigmentation','lifting','injectable','skinbooster','access'].map((x)=>`images/sangnam/${x}.webp`),
  ...['choice','acne','pigmentation','lifting','injectable','dermatology'].map((x)=>`images/jungdong/${x}.webp`),
];
const hashes = new Set();
for (const rel of imageFiles) {
  const file = path.join(root,rel);
  if (!fs.existsSync(file)) { errors.push(`missing ${rel}`); continue; }
  hashes.add(createHash('sha256').update(fs.readFileSync(file)).digest('hex'));
}
if (hashes.size !== 18) errors.push(`expected 18 unique regional carousel images, found ${hashes.size}`);

const sitemap = fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');
const sitemapCount = (sitemap.match(/<url>/g)||[]).length;
if (sitemapCount !== 34) errors.push(`expected 34 sitemap URLs, found ${sitemapCount}`);
const rss = fs.readFileSync(path.join(root,'rss.xml'),'utf8');
if ((rss.match(/<item>/g)||[]).length !== 8) errors.push('expected 8 RSS items');
if (!rss.includes('<content:encoded>')) errors.push('RSS full content is missing');
const robots = fs.readFileSync(path.join(root,'robots.txt'),'utf8');
if (!robots.includes('Sitemap: https://xn--vb0bq3eb8co9n65d4y2b.com/sitemap.xml')) errors.push('robots sitemap URL is wrong');

const cssFiles = fs.readdirSync(path.join(root,'assets')).filter((n)=>n.endsWith('.css'));
const jsFiles = fs.readdirSync(path.join(root,'assets')).filter((n)=>n.endsWith('.js'));
if (cssFiles.length !== 1 || jsFiles.length !== 1) errors.push('fingerprinted CSS/JS count is unexpected');

if (errors.length) {
  console.error(`Check failed with ${errors.length} issue(s):`);
  errors.forEach((e)=>console.error(`- ${e}`));
  process.exit(1);
}
console.log(`Check passed: ${htmlFiles.length} HTML files, 34 indexable URLs, 3 six-item ItemLists, 18 unique carousel images, 8 full-content RSS entries and 3 full-screen video heroes.`);
