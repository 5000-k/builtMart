const fs = require('fs');
const path = require('path');

const routesDir = './routes';

// List of route files to convert
const routeFiles = [
  'admin.routes.js',
  'cart.routes.js', 
  'category.routes.js',
  'contact.routes.js',
  'discount.routes.js',
  'notification.routes.js',
  'order.routes.js',
  'product.routes.js',
  'realTimePayment.routes.js',
  'review.routes.js',
  'settings.routes.js',
  'upload.routes.js',
  'user.routes.js',
  'wishlist.routes.js'
];

routeFiles.forEach(file => {
  const filePath = path.join(routesDir, file);
  console.log(`Converting ${file}...`);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Convert ES6 imports to CommonJS requires
    content = content.replace(/import\s+(\w+)\s+from\s+['"]([^'"]+)['"];?/g, 'const $1 = require(\'$2\');');
    
    // Convert ES6 exports to CommonJS exports
    content = content.replace(/export\s+default\s+(\w+);?/g, 'module.exports = $1;');
    
    // Convert ES6 named exports to CommonJS exports
    content = content.replace(/export\s+{\s*([^}]+)\s*};?/g, (match, p1, p2) => {
      const exports = p1.replace(/export\s+/g, '').replace(/export\s+{/g, '').replace(/}/g, '');
      const exportsArray = exports.split(',').map(e => e.trim());
      let commonjsExports = '';
      exportsArray.forEach(exp => {
        if (exp.includes('default')) {
          commonjsExports += `  ${exp.replace('export default', 'module.exports')};\n`;
        } else {
          commonjsExports += `  ${exp};\n`;
        }
      });
      return `const {${commonjsExports}} = require('./controllers/auth.controller.js');`;
    });
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Converted ${file}`);
  } catch (error) {
    console.error(`❌ Error converting ${file}:`, error);
  }
});

console.log('🔄 Route conversion complete!');
