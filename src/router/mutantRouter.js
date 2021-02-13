const express = require('express');
const logger = require('../logger/logger')(module);
const mutantController = require('../controller/mutantController');

const router = new express.Router();

router.post('/mutant', async (req, res) => {
  try {
    let dna = req.body.dna;
    if (dna == null) {
      throw new Error('Dna is required');
    }
    if (dna.length === 0) {
      throw new Error('Dna can´t be an empty array');
    }
    for (let line of dna) {
      if (dna.length != line.length) {
        throw new Error('Length of Matrix and elements are not equal');
      }
    }

    let isMutant = await mutantController.validateMutant(dna);
    if (isMutant) {
      res.send({
        Description: 'El individuo es MUTANTE',
        isMutant: isMutant,
        Status: 'Ok',
      });
      return;
    }
    res.status(403).send({
      Description: 'El individuo es MUTANTE',
      isMutant: isMutant,
      Status: 'Bad',
    });
  } catch (e) {
    logger.error(e.message);
    res.status(400).send({ Error: e.message });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const stats = await mutantController.getStats();
    res.send(stats);
  } catch (e) {
    logger.error(e.message);
    res.status(400).send({ Error: e.message });
  }
});

module.exports = router;
