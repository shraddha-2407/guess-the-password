const express = require('express');
const router = express.Router();
const NodeCache = require( "node-cache" );

const myCache = new NodeCache();

function generatePassword(range, outputCount) {
  let arr = [];
  let result = [];
  for (let i = 0; i <= range; i+=1) {
    arr.push(i);
  }

  for (let i = 0; i < outputCount; i+=1) {
    const random = Math.floor(Math.random() * (range - i));
    result.push(arr[random]);
    arr[random] = arr[range - i];
  }
  return result;
}

function shufflePassword(password) {
  const array = password.split('');
  var currentIndex = array.length, temporaryValue, randomIndex;
  // While there remain elements to shuffle...
  while (currentIndex !== 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array.join('');
}

/* GET users listing. */
router.get('/new-password', function(req, res, next) {
  const range = 9; // digits 0-9
  const outputCount = 8; // length of password
  const password = generatePassword(range, outputCount).join('');
  const hint = shufflePassword(password);
  myCache.set('entry', {
    hint: hint,
    password: password
  });

  res.status(200).json({ 
    hint: hint 
  });
});

router.post('/verify-password', (req, res) => {
  let response = {};
  const hint = req.body.hint;
  const answer = req.body.answer;
  
  let password;
  const persistedEntry = myCache.get('entry');

  if (!persistedEntry) {
    res.status(404);
  }

  if (!persistedEntry.hint) {
    res.status(404);
  }

  if (persistedEntry.hint === hint) {
    password = persistedEntry.password;
    if (!password) {
      res.status(404);
    }
  } else {
    res.status(404);
  }

  const highlight = password.split('').filter((num, index) => num === answer.split('')[index]);
  const correct = password.split('').length === highlight.length;
  if (correct) {
    response = { correct: correct, answer: answer, hint: hint };
    myCache.del('entry');
  } else {
    response = { correct: correct, answer: answer, highlight: highlight, hint: hint };
  }
  res.status(200).json(response);
});

module.exports = router;
