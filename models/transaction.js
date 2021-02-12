const database = require('../database/database');
const logger = require('../logger/logger')(module);

class Transaction {
  constructor(transaction) {
    this.transaction = transaction;
    this.date = new Date();
  }

  async save() {
    try {
      const db = database.getDb();
      const transactionCollection = db.collection('transaction');
      const dbOp = await transactionCollection.insertOne(this);
      return dbOp;
    } catch (error) {
      logger.error(`Error saving a transaction ${this.transaction} ${error.message}`);
      throw Error(`Error saving a transaction ${error}`);
    }
  }

  static async findAll() {
    const db = database.getDb();
    let dbOp;
    try {
      dbOp = await db.collection('transaction').find().toArray();
      return dbOp;
    } catch (error) {
      logger.error(
        `Error retrieving all transaction collection ${error.message}`
      );
      throw Error(`Error retrieving all transaction collection ${error}`);
    }
  }
}

module.exports = Transaction;
