const fs = require('fs');
const path = require('path');

const toolsDir = path.join(__dirname, '..', 'src', 'app');
const dirs = fs.readdirSync(toolsDir).filter(d => {
  const layoutPath = path.join(toolsDir, d, 'layout.tsx');
  return fs.existsSync(layoutPath) && d !== '(routes)' && !d.startsWith('_');
});

for (const dir of dirs) {
  const layoutPath = path.join(toolsDir, dir, 'layout.tsx');
  let content = fs.readFileSync(layoutPath, 'utf8');
  
  if (content.includes('BreadcrumbList')) {
    console.log(`SKIP ${dir} (already has breadcrumbs)`);
    continue;
  }

  // Get tool name from metadata title
  const titleMatch = content.match(/title:\s*['"`]([^'"`|]+?)(?:\s*[\-|]|\s*\|)/);
  const toolName = titleMatch ? titleMatch[1].trim() : dir.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
  
  const breadcrumb = `{
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://sherutools.com' },
      { '@type': 'ListItem', position: 2, name: '${toolName.replace(/'/g, "\\'")}', item: 'https://sherutools.com/${dir}' },
    ],
  }`;

  // Check if jsonLd is an array
  if (content.includes('const jsonLd = [')) {
    // Add to existing array
    content = content.replace('const jsonLd = [', `const jsonLd = [\n  ${breadcrumb},`);
  } else if (content.includes('const jsonLd =')) {
    // Convert single object to array with breadcrumb
    content = content.replace(/const jsonLd = ({[\s\S]*?});/, `const jsonLd = [${breadcrumb}, $1];`);
    // Update stringify if needed
    content = content.replace('JSON.stringify(jsonLd)', 'JSON.stringify(jsonLd)');
  } else {
    // No jsonLd exists, add breadcrumb script tag before {children}
    const breadcrumbScript = `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(${breadcrumb}) }} />\n      `;
    content = content.replace('{children}', `${breadcrumbScript}{children}`);
  }

  fs.writeFileSync(layoutPath, content);
  console.log(`OK ${dir} -> "${toolName}"`);
}
