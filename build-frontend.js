const fs = require('fs').promises;
const path = require('path');

async function buildFrontend() {
    console.log('Building frontend for nginx deployment...');
    
    try {
        // Create dist directory
        const distDir = path.join(__dirname, 'dist');
        await fs.mkdir(distDir, { recursive: true });
        
        // Copy frontend files
        const publicDir = path.join(__dirname, 'public');
        const files = ['index.html', 'style.css', 'script.js'];
        
        for (const file of files) {
            const sourcePath = path.join(publicDir, file);
            const destPath = path.join(distDir, file);
            
            try {
                await fs.copyFile(sourcePath, destPath);
                console.log(`Copied ${file} to dist/`);
            } catch (error) {
                console.error(`Error copying ${file}:`, error);
            }
        }
        
        console.log('Frontend build complete!');
        console.log('Files are ready in dist/ for nginx deployment');
        console.log('To deploy: cp -r dist/* /var/www/html/');
        
    } catch (error) {
        console.error('Build failed:', error);
        process.exit(1);
    }
}

buildFrontend();
