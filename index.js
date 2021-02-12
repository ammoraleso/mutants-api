const express = require('express');
const logger = require('./logger/logger')(module);
const mutantRouter = require('./router/mutantRouter');
const transactionRouter = require('./router/transactionRouter');
const healthCheck = require('./router/healthCheck');
const database = require('./database/database');

const app = express();

const port = process.env.PORT || 3000;

app.use(express.json());
app.use(mutantRouter);
app.use(transactionRouter);
app.use(healthCheck);

app.listen(port, async () => {
  try {
    logger.info(`initialize Mongo`);
    await database.initializeMongo();
  } catch (e) {
    logger.error(e.message);
  }
  logger.info(`Server is up on ${port}`);
});
