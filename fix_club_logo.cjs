const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'services', 'clubSearch.ts');
let code = fs.readFileSync(file, 'utf8');

// The standard MediaWiki Commons logo is sometimes returned as an SVG without a width/height, 
// or an SVG which fails to render in canvas without dimensions. 
// Another issue is Wikidata often returns a high resolution PNG or SVG. 
// When using `url` from SPARQL, it's the raw file URL. 
// It's usually `http://commons.wikimedia.org/wiki/Special:FilePath/filename`
// Which redirects to the real image.
// We can fetch it, but `Special:FilePath` also accepts a `width` parameter to get a thumbnail! 

code = code.replace(
  "logoUrl: b.logo ? b.logo.value : null,",
  "logoUrl: b.logo ? b.logo.value + '?width=400' : null," // Request a 400px thumbnail which is usually a PNG instead of SVG, which is safer for canvas!
);

fs.writeFileSync(file, code);
