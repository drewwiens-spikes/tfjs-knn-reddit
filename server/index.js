global.fetch = require('node-fetch'); // U.S.E. requires fetch
// const tf = require('@tensorflow/tfjs'); // Needed to manipulate tensors
const use = require('@tensorflow-models/universal-sentence-encoder');
const knnClassifier = require('@tensorflow-models/knn-classifier');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

(async () => {

  // Get sentence tokenizer and KNN classifier:
  const model = await use.load();
  const classifier = knnClassifier.create();
  
  // Load all training data:
  const filenames = [
    'announcements', 'AskReddit', 'funny', 'gaming', 'IAmA', 'linux',
    'pics', 'science', 'todayilearned', 'videos', 'worldnews'
  ];
  for (let i = 0; i < filenames.length; i++) {
    const filename = filenames[i];
    process.stdout.write(`Loading file ${i + 1} of ${filenames.length} (${filename})`);
    // Open JSON file:
    const items = require(`./data/${filename}.json`).data.children;
    for (let i = 0; i < items.length; i++) {
      // Encode title string with U.S.E.:
      const encoded = await model.embed(items[i].data.title);
      // Add the encoded title to the KNN classifier:
      classifier.addExample(encoded, i);
      process.stdout.write('.');
    }
    process.stdout.write('\n');
  }
  process.stdout.write('\n');

  // Start server:
  const port = 3000;
  const app = express();
  app.use(cors());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.post('/', async (req, res) => {
    console.log('BODY:', req.body);
    const encoded = await model.embed(req.body.value);
    res.json(await classifier.predictClass(encoded));
  });
  app.listen(port, () => console.log(`Example app listening on port ${port}!`))

})();
