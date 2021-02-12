const mongodb = require('mongodb');
const logger = require('../logger/logger')(module);

const { MongoClient } = mongodb;

require('dotenv').config();

let database;
let client;

const mongoConfig = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

const DATABASE_URL = process.env.DATABASE_CONECTION;

exports.initializeMongo = async () => {
  try {
    client = await MongoClient.connect(DATABASE_URL, mongoConfig);
    database = client.db();
    logger.info('Connection Established');
  } catch (error) {
    throw new Error(`Error initializing mongo ${error}`);
  }
};

exports.getDb = () => {
  if (!database) {
    throw new Error('No database found');
  }
  return database;
};

exports.close = async () => {
  try {
    await client.close();
    logger.info('Connection Close');
  } catch (error) {
    throw new Error('The connection could not be close');
  }
};
