const logger = require('../logger/logger')(module);
const Dna = require('../models/dna');
const Stats = require('../models/stats');

let counterSequence = 0;
let lettesOfDna = ['A', 'T', 'G', 'C'];

class mutantController {
  static async validateMutant(dna) {
    try {
      logger.info('DNA to validate: ' + dna);
      let matrix = this.convertToMatrix(dna);
      let isMutant = await this.isMutant(matrix);
      logger.info('Is it mutant? ' + isMutant);
      //Before to save to know if we need to add stats
      await this.saveStats(dna, isMutant);
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
    let isMutant = counterSequence > 1 ? true : false;
    return isMutant;
  }

  /**
   * Get Number of lines (Horizontal, Vertical, Diagonal) that have the sequence of 4 letters
   * and update counterSequence value
   * @param {Matrix to iterate} matrix
   * @param {Index of the iteration} index
   */
  static getLinesWithSequence(matrix, index) {
    this.getDiagCount(matrix, index);
    this.getRowColCount(matrix, index);
  }

  static getDiagCount(matrix, index) {
    let restDiag = 0;
    let counterSupDerSeq = 0;
    let counterSupIzqSeq = 0;
    let counterInfDerSeq = 0;
    let counterInfIzqSeq = 0;

    for (let i = 0; i <= matrix.length - index - 2; i++) {
      restDiag = matrix.length - i - index;
      if (i === 0 && restDiag < 4) {
        return;
      }
      if (counterSequence > 1) {
        return;
      }
      if (
        restDiag < 4 &&
        counterSupDerSeq === 0 &&
        counterSupIzqSeq === 0 &&
        counterInfDerSeq === 0 &&
        counterInfIzqSeq === 0
      ) {
        break;
      }
      counterSupDerSeq =
        matrix[i][i + index] === matrix[i + 1][i + index + 1]
          ? counterSupDerSeq + 1
          : 0;

      counterSupIzqSeq =
        matrix[i][matrix.length - index - i - 1] ===
        matrix[i + 1][matrix.length - index - i - 2]
          ? counterSupIzqSeq + 1
          : 0;

      if (index > 0) {
        logger.info();
        counterInfDerSeq =
          matrix[i + index][i] === matrix[i + 1 + index][i + 1]
            ? counterInfDerSeq + 1
            : 0;

        counterInfIzqSeq =
          matrix[i + index][matrix.length - i - 1] ===
          matrix[i + index + 1][matrix.length - i - 2]
            ? counterInfIzqSeq + 1
            : 0;
      }

      if (counterSupDerSeq === 3) {
        counterSupDerSeq = 0;
        counterSequence++;
      }
      if (counterSupIzqSeq === 3) {
        counterSupIzqSeq = 0;
        counterSequence++;
      }

      if (counterInfDerSeq === 3) {
        counterInfDerSeq = 0;
        counterSequence++;
      }
      if (counterInfIzqSeq === 3) {
        counterInfIzqSeq = 0;
        counterSequence++;
      }
    }
  }

  static getRowColCount(matrix, index) {
    let counterColumn = 0;
    let counterRow = 0;
    let rest = 0;
    if (counterSequence > 1) {
      return;
    }

    // Because always i'm comparing with the next register.
    for (let i = 0; i <= matrix.length - 2; i++) {
      rest = matrix.length - i;
      if (counterSequence > 1) {
        return;
      }
      if (rest < 4 && counterColumn === 0 && counterRow === 0) {
        break;
      }

      counterColumn =
        matrix[i][index] === matrix[i + 1][index] ? counterColumn + 1 : 0;
      counterRow =
        matrix[index][i] === matrix[index][i + 1] ? counterRow + 1 : 0;

      //Because if counterColum or CounterRow are 3 is becase it have the same letters in 4 positions
      if (counterColumn === 3) {
        logger.error('Column Add new register');
        counterColumn = 0;
        counterSequence++;
      }
      if (counterRow === 3) {
        logger.error('Row Add new register');
        counterRow = 0;
        counterSequence++;
      }
    }
  }

  static async saveStats(dna, isMutant) {
    let dnaFound = await Dna.findDna(dna);
    if (dnaFound !== null) {
      return false;
    }
    let stats = await Stats.findAll();

    if (stats.length === 0) {
      if (isMutant) {
        stats = new Stats(1, 0);
      } else {
        stats = new Stats(0, 1);
      }
    } else {
      if (isMutant) {
        stats = new Stats(
          stats[0].count_mutants_dna + 1,
          stats[0].count_humans_dna
        );
      } else {
        stats = new Stats(
          stats[0].count_mutants_dna,
          stats[0].count_humans_dna + 1
        );
      }
    }
    await stats.save();
    return true;
  }

  //Avoid find all to DNA
  static async getStats() {
    let stats = await Stats.findAll();
    if (stats.length === 0) {
      return { Description: 'No hay individuos para analizar' };
    }
    stats = {
      count_mutants_dna: stats[0].count_mutants_dna,
      count_humans_dna: stats[0].count_humans_dna,
      ratio: stats[0].ratio,
    };
    return stats;
  }
}

module.exports = mutantController;
