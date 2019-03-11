global.fetch = require('node-fetch'); // U.S.E. requires fetch
const tf = require('@tensorflow/tfjs'); // Needed to manipulate tensors
const use = require('@tensorflow-models/universal-sentence-encoder');
const knnClassifier = require('@tensorflow-models/knn-classifier');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

(async () => {

  // Get sentence tokenizer and KNN classifier:
  const classifier = knnClassifier.create();
  const model = await use.load();

  // Add titles to KNN classifier:
  console.log('Loading encoded titles...');
  require('./encoded.json').forEach(([label, row]) => {
    classifier.addExample(tf.tensor1d(row), label);
  });

  // Start server:
  const port = 3000;
  const app = express();
  app.use(cors());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.post('/', async (req, res) => {
    console.log('BODY:', req.body);
    const encoded = await model.embed(req.body.value);
    res.json(await classifier.predictClass(encoded, 3));
  });
  app.listen(port, () => console.log(`Example app listening on port ${port}!`))

})();
