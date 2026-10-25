process.env.NEXT_OUTPUT = 'export';
const { execSync } = require('child_process');

try {
  console.log('Building static export (output: "export")...');
  execSync('npx next build', { stdio: 'inherit', env: process.env });
  console.log('✓ Static export built successfully to /out');
} catch (error) {
  process.exit(1);
}
