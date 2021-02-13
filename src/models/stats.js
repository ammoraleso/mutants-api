const database = require('../database/database');
const Transaction = require('./transaction');
const logger = require('../logger/logger')(module);

class Dna {
  constructor(count_mutants_dna, count_humans_dna) {
    this.id = 1;
    this.count_mutants_dna = count_mutants_dna;
    this.count_humans_dna = count_humans_dna;
    if (count_humans_dna === 0) {
      this.ratio = 1;
    } else {
      this.ratio = count_mutants_dna / count_humans_dna;
    }
  }

  async save() {
    try {
      const db = database.getDb();
      const dnaCollection = db.collection('stats');
      const dbOp = await dnaCollection.updateOne(
        { id: this.id },
        { $set: this },
        { upsert: true }
      );
      const transaction = new Transaction('/stats');
      await transaction.save();
      return dbOp;
    } catch (error) {
      logger.error(`Error saving a stats ${this.dna} ${error.message}`);
      throw Error(`Error stats collection ${error}`);
    }
  }

  static async findAll() {
    const db = database.getDb();
    let dbOp;
    try {
      dbOp = await db.collection('stats').find().toArray();
      return dbOp;
    } catch (error) {
      logger.error(`Error retrieving all Stats collection ${error.message}`);
      throw Error(`Error retrieving all Stats collection ${error}`);
    }
  }
}

module.exports = Dna;
