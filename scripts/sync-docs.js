const fs = require('fs');
const path = require('path');

const DOCS_DIR = path.join(process.cwd(), 'docs');
const OUTPUT_FILE = path.join(process.cwd(), 'maven-dataset.json');

function walk(dir) {
  let results = [];

  for (const file of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else if (file.endsWith('.md') || file.endsWith('.mdx')) {
      results.push(fullPath);
    }
  }

  return results;
}

function cleanMarkdown(content) {
  return content
    .replace(/^---[\s\S]*?---/, '')       // remove front matter
    .replace(/import .* from .*/g, '')    // remove MDX imports
    .replace(/<[^>]+>/g, '')             // remove basic JSX/HTML
    .trim();
}

const files = walk(DOCS_DIR);

const dataset = files.map(file => {
  const raw = fs.readFileSync(file, 'utf8');
  const relativePath = path.relative(process.cwd(), file);

  return {
    title: path.basename(file).replace(/\.(md|mdx)$/, ''),
    source_path: relativePath,
    content: cleanMarkdown(raw),
    updated_at: new Date().toISOString()
  };
});

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(dataset, null, 2));

console.log(`Exported ${dataset.length} docs to ${OUTPUT_FILE}`);
