const express = require('express');
const Transaction = require('../models/transaction');
const logger = require('../logger/logger')(module);

const router = new express.Router();

router.get('/getTransactions', async (req, res) => {
  try {
    const allTransaction = await Transaction.findAll();
    res.send(allTransaction);
  } catch (error) {
    logger.error(error.message);
    res.status(401).send(error.message);
  }
});

module.exports = router;
