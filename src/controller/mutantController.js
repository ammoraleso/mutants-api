const logger = require('../logger/logger')(module);
const Dna = require('../models/dna');
const Transaction = require('../models/transaction');

let counterSequence = 0;
let lettesOfDna = ['A', 'T', 'G', 'C'];

class mutantController {
  static async validateMutant(dna) {
    try {
      logger.info('DNA to validate: ' + dna);
      let matrix = this.convertToMatrix(dna);
      let isMutant = await this.isMutant(matrix);
      logger.info('Is it mutant? ' + isMutant);
      const dnaToSave = new Dna(dna, isMutant);
      await dnaToSave.save();
      logger.info('DNA stored in db');
      return isMutant;
    } catch (e) {
      logger.error(
        'Error when try to validate if the dna belong to mutant ' + e
      );
      throw new Error(
        'Error when try to validate if the dna belong to mutant ' + e
      );
    }
  }

  /**
   * Loop each String of dna object and create a temporal array to add it in the final array
   * @param {array in 1D} dna
   */
  static convertToMatrix(dna) {
    let matrix = [];
    dna.forEach((line) => {
      let tmpArray = [];
      for (let i = 0; i <= line.length - 1; i++) {
        if (lettesOfDna.includes(line[i])) {
          tmpArray.push(line[i]);
        } else {
          throw new Error('Letter is not allowed for dna');
        }
      }
      matrix.push(tmpArray);
    });
    return matrix;
  }

  /**
   * Validate if the dna belong to mutant or not
   * @param {Matrix to validate} matrix
   */
  static async isMutant(matrix) {
    counterSequence = 0;
    await matrix.map((col, i) => this.getLinesWithSequence(matrix, i));
    logger.info(counterSequence);
    return counterSequence > 1 ? true : false;
  }

  /**
   * Get Number of lines (Horizontal, Vertical, Diagonal) that have the sequence of 4 letters
   * and update counterSequence value
   * @param {Matrix to iterate} matrix
   * @param {Index of the iteration} index
   */
  static getLinesWithSequence(matrix, index) {
    let counterColumn = 0;
    let counterRow = 0;
    let rest = 0;
    let line = [];

    //Get Diagonal line to count letters
    line = this.getDiagSupCol(matrix, index);
    this.findSequenceInLine(line);
    line = this.getDiagSupColSec(matrix, index);
    this.findSequenceInLine(line);
    if (index > 0) {
      line = this.getDiagInfRow(matrix, index);
      this.findSequenceInLine(line);
      line = this.getDiagInfRowSec(matrix, index);
      this.findSequenceInLine(line);
    }

    // Because always i'm comparing with the next register.
    for (let i = 0; i <= matrix.length - 2; i++) {
      rest = matrix.length - i;
      if (rest < 4 && counterColumn === 0 && counterRow === 0) {
        break;
      }

      counterColumn =
        matrix[i][index] === matrix[i + 1][index] ? counterColumn + 1 : 0;
      counterRow =
        matrix[index][i] === matrix[index][i + 1] ? counterRow + 1 : 0;

      //Because if counterColum or CounterRow are 3 is becase it have the same letters in 4 positions
      if (counterColumn === 3) {
        counterColumn = 0;
        counterSequence++;
      }
      if (counterRow === 3) {
        counterRow = 0;
        counterSequence++;
      }
    }
  }

  static getDiagSupCol(matrix, nCol) {
    let line = [];
    for (let i = 0; i <= matrix.length - nCol - 1; i++) {
      line.push(matrix[i][i + nCol]);
    }
    return line;
  }

  static getDiagInfRow(matrix, nRow) {
    let line = [];

    for (let i = 0; i <= matrix.length - nRow - 1; i++) {
      line.push(matrix[i + nRow][i]);
    }
    return line;
  }

  static getDiagSupColSec(matrix, nCol) {
    let line = [];
    for (let i = 0; i <= matrix.length - nCol - 1; i++) {
      line.push(matrix[i][matrix.length - nCol - i - 1]);
    }
    return line;
  }

  static getDiagInfRowSec(matrix, nRow) {
    let line = [];

    for (let i = 0; i <= matrix.length - nRow - 1; i++) {
      line.push(matrix[i + nRow][matrix.length - i - 1]);
    }
    return line;
  }

  /**
   * Count if the line have the sequence of 4 letters and update counterSequence value
   * @param {Line to validate} line
   */
  static findSequenceInLine(line) {
    let rest = 0;
    let counter = 0;
    if (line.length < 4) {
      return;
    }
    for (let i = 0; i <= line.length - 2; i++) {
      rest = line.length - i;
      if (rest < 4 && counter === 0) {
        break;
      }
      //Just 1 row to evaluate
      counter = line[i][0] === line[i + 1][0] ? counter + 1 : 0;
      if (counter === 3) {
        counter = 0;
        counterSequence++;
      }
    }
  }
  
  //TODO Crear tabla de conteo
  static async getStats() {
    let dnaStats = await Dna.findAll();
    let stats = {Description : "No hay individuos en la base de datos"};
    if (dnaStats != null && dnaStats.length != 0) {
      const counterMutants = dnaStats.filter((item) => {
        return item.isMutant === true;
      }).length;
      const counterHumans = dnaStats.filter((item) => {
        return item.isMutant === false;
      }).length;

      let ratio = counterMutants / counterHumans;
      stats = {
        count_mutant_dna: counterMutants,
        count_hummans_dna: counterHumans,
        ratio: ratio,
      };
    }
    return stats;
  }
}

module.exports = mutantController;
