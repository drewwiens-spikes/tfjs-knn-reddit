global.fetch = require('node-fetch'); // U.S.E. requires fetch
const use = require('@tensorflow-models/universal-sentence-encoder');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const rpn = require('request-promise-native');

(async () => {

  // Get U.S.E. model:
  const model = await use.load();

  // Load all training data:
  const subreddits = [
    'AskReddit', 'funny', 'gaming', 'IAmA', 'linux', 'pics',
    'science', 'todayilearned', 'videos', 'worldnews'
  ];
  const encoded = [];
  for (let label = 0; label < subreddits.length; label++) {
    const subreddit = subreddits[label];
    process.stdout.write(`Loading subreddit ${label + 1} of ${subreddits.length} (${subreddit})`);
    const json = await rpn({ uri: `https://www.reddit.com/r/${subreddit}.json`, json: true });
    const titles = json.data.children.map(itm => itm.data.title);
    for (let idx = 0; idx < titles.length; idx++) {
      process.stdout.write('.');
      // Embed title string as number[] with U.S.E.:
      encoded.push([ label, _.flatten(await (await model.embed(titles[idx])).array()) ]);
    }
    process.stdout.write('\n');
  }

  // Write encoded titles to file:
  console.log('Writing JSON file...');
  fs.writeFileSync(path.join(__dirname, 'encoded.json'), JSON.stringify(encoded));
  console.log('Done.');
  process.exit();

})();
