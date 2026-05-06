const fs = require('fs');
let content = fs.readFileSync('App.tsx', 'utf-8');

function extractPanel(matchStr) {
  const identifier = matchStr;
  const index = content.indexOf(identifier);
  if (index === -1) return null;
  const start = content.lastIndexOf('<RetroPanel', index);
  const endStr = '</RetroPanel>';
  const end = content.indexOf(endStr, index) + endStr.length;
  const panel = content.substring(start, end);
  content = content.substring(0, start) + content.substring(end);
  return panel;
}

const profilePanel = extractPanel("title={isUltrakillMode ? 'SUBJECT_DATA' : 'Profile'}");

if (profilePanel) {
  const leftColStartStr = '          <div className="lg:col-span-3 space-y-6 flex flex-col order-2 lg:order-1">\n';
  const insertionIndex = content.indexOf(leftColStartStr) + leftColStartStr.length;
  content = content.substring(0, insertionIndex) + '            ' + profilePanel + '\n\n' + content.substring(insertionIndex);
  fs.writeFileSync('App.tsx', content, 'utf-8');
  console.log("Moved profile.");
} else {
  console.log("Could not find profile.");
}
