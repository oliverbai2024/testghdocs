const fs = require('fs');

const datasetPath = 'maven-dataset.json';

if (!fs.existsSync(datasetPath)) {
  throw new Error('maven-dataset.json not found. Run sync-docs.js first.');
}

const webAppUrl = process.env.GOOGLE_DOC_WEBAPP_URL;
const secret = process.env.GOOGLE_DOC_SYNC_SECRET;

if (!webAppUrl || !secret) {
  throw new Error('Missing GOOGLE_DOC_WEBAPP_URL or GOOGLE_DOC_SYNC_SECRET.');
}

async function main() {
  const dataset = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));

  const response = await fetch(`${webAppUrl}?secret=${encodeURIComponent(secret)}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      documents: dataset
    })
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(`Google Doc sync failed: ${response.status} ${text}`);
  }

  console.log(text);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
