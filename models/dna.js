const database = require('../database/database');
const Transaction = require('./transaction');
const logger = require('../logger/logger')(module);

class Dna {
  constructor(dna, isMutant) {
    this.dna = dna;
    this.isMutant = isMutant;
  }

  async save() {
    try {
      const db = database.getDb();
      const dnaCollection = db.collection('dna');
      const dbOp = await dnaCollection.updateOne(
        { dna: this.dna },
        { $set: this },
        { upsert: true }
      );
      const transaction = new Transaction('/isMutant');
      await transaction.save();
      return dbOp;
    } catch (error) {
      logger.error(`Error saving a dna ${this.dna} ${error.message}`);
      throw Error(`Error savingDna collection ${error}`);
    }
  }

  static async findAll() {
    const db = database.getDb();
    let dbOp;
    try {
      dbOp = await db.collection('dna').find().toArray();
      return dbOp;
    } catch (error) {
      logger.error(`Error retrieving all Dna collection ${error.message}`);
      throw Error(`Error retrieving all Dna collection ${error}`);
    }
  }
}

module.exports = Dna;
