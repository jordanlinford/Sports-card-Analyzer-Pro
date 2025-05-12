const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'src', 'pages', 'PublicDisplayCase.tsx');

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

// Check if timeout is already added
if (content.includes('Recovery timeout reached')) {
  console.log('Timeout already exists in the file');
  process.exit(0);
}

// Find the auto-recovery useEffect
const autoRecoveryPattern = /console\.log\("Display case not found, attempting auto-recovery"\);([\s\S]*?)ensurePublicDisplayCase/;
const match = content.match(autoRecoveryPattern);

if (match) {
  // Add timeout code
  const timeoutCode = `
      // Set a timeout to prevent hanging in recovery state
      const timeoutId = setTimeout(() => {
        console.log("Recovery timeout reached - stopping recovery");
        setIsRecovering(false);
      }, 5000); // 5 second timeout
      
      `;
  
  // Replace the content
  content = content.replace(
    autoRecoveryPattern,
    `console.log("Display case not found, attempting auto-recovery");${timeoutCode}ensurePublicDisplayCase`
  );
  
  // Add clearTimeout to then block
  content = content.replace(
    /.then\(success => {/g,
    '.then(success => {\n          clearTimeout(timeoutId); // Clear the timeout if we get a response'
  );
  
  // Add clearTimeout to catch block
  content = content.replace(
    /.catch\(error => {/g,
    '.catch(error => {\n          clearTimeout(timeoutId); // Clear the timeout if we get an error'
  );
  
  // Write the file back
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Added timeout to PublicDisplayCase.tsx');
} else {
  console.log('Could not find the auto-recovery code pattern');
} 