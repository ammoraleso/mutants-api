const express = require('express');
const logger = require('../logger/logger')(module);

const router = new express.Router();

router.get('/health', async (req, res) => {
  res.send({ Status: 'Up', description: 'Api is running' });
});

module.exports = router;
