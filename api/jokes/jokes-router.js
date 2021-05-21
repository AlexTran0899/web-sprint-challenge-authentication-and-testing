// do not make changes to this file
const router = require('express').Router();
const jokes = require('./jokes-data');
const checker = require('../middleware/restricted')

router.get('/', (req, res, next) => {
  res.status(200).json(jokes)
});

module.exports = router;
