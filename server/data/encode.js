global.fetch = require('node-fetch'); // U.S.E. requires fetch
const use = require('@tensorflow-models/universal-sentence-encoder');
const fs = require('fs');
const path = require('path');

(async () => {

  // Get U.S.E. model:
  const model = await use.load();

  // Load all training data:
  const filenames = [
    'AskReddit', 'funny', 'gaming', 'IAmA', 'linux', 'pics',
    'science', 'todayilearned', 'videos', 'worldnews'
  ];
  const encoded = [];
  for (let label = 0; label < filenames.length; label++) {
    const filename = filenames[label];
    process.stdout.write(`Loading file ${label + 1} of ${filenames.length} (${filename})`);
    const titles = require(`./${filename}.json`).data.children.map(itm => itm.data.title);
    for (let idx = 0; idx < titles.length; idx++) {
      process.stdout.write('.');
      // Embed title string as number[] with U.S.E.:
      encoded.push([ label, await (await model.embed(titles[idx])).data() ]);
    }
    process.stdout.write('\n');
  }

  // Write encoded titles to file:
  console.log('Writing JSON file...');
  fs.writeFileSync(path.join(__dirname, 'encoded.json'), JSON.stringify(encoded));
  console.log('Done.');
  process.exit();

})();
