// the fs here is not node fs but the provided virtual one
import fs from './virtual-fs.js';

function registerAFMFonts(ctx) {
  ctx.keys().forEach(key => {
    console.log('registering AFM font', key);
    const match = key.match(/([^/]*\.afm$)/);
    if (match) {
      // afm files must be stored on data path
      console.log('writing AFM font', match[0]);
      fs.writeFileSync(`data/${match[0]}`, ctx(key));
    }
  });
}

console.log('registering AFM fonts');
console.log(require.context('pdfkit/js/data', false, /Helvetica.*\.afm$/))
// register AFM fonts distributed with pdfkit
// is good practice to register only required fonts to avoid the bundle size increase too much
registerAFMFonts(require.context('pdfkit/js/data', false, /Helvetica.*\.afm$/));