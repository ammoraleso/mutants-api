const mutantController = require('./mutantController');
const database = require('../database/database');

jest.mock('../models/dna');
const Dna = require('../models/dna');

jest.mock('../models/stats');
const Stats = require('../models/stats');

jest.mock('../logger/logger', () => {
  return jest.fn().mockImplementation(() => ({
    info: jest.fn(() => 'info'),
    error: jest.fn(() => 'error'),
  }));
});

const resultArray = [];

const mockDna = ['ATGCGA', 'CAGTGC', 'TTATGT', 'AGAAGG', 'CCCCTA', 'TCACTG'];
const mockBadDna = ['ATGCGM', 'CAGTGC', 'TTATGT', 'AGAAGG', 'CCCCTA', 'TCACTG'];
const mockDnaToSave = new Dna(mockDna, true);

const dna = ['ATGCGA', 'CAGTGC', 'TTATGT', 'AGAAGG', 'CCCCTA', 'TCACTG'];
const mockMatrix = [
  ['A', 'T', 'G', 'C', 'G', 'A'],
  ['C', 'A', 'G', 'T', 'G', 'C'],
  ['T', 'T', 'A', 'T', 'G', 'T'],
  ['A', 'G', 'A', 'A', 'G', 'G'],
  ['C', 'C', 'C', 'C', 'T', 'A'],
  ['T', 'C', 'A', 'C', 'T', 'G'],
];

const mockMatrixTwoDiagsSup = [
  ['A', 'T', 'G', 'C', 'G', 'A'],
  ['C', 'A', 'T', 'T', 'G', 'C'],
  ['T', 'T', 'A', 'T', 'G', 'T'],
  ['A', 'G', 'A', 'A', 'T', 'G'],
  ['C', 'C', 'C', 'C', 'T', 'A'],
  ['T', 'C', 'A', 'C', 'T', 'G'],
];

const mockMatrixTwoDiagsSupSec = [
  ['A', 'T', 'G', 'C', 'A', 'A'],
  ['C', 'T', 'G', 'A', 'A', 'C'],
  ['T', 'T', 'A', 'A', 'G', 'T'],
  ['A', 'A', 'A', 'A', 'T', 'G'],
  ['C', 'C', 'C', 'C', 'T', 'A'],
  ['T', 'C', 'A', 'C', 'T', 'G'],
];

const mockMatrixTwoDiagsInfSec = [
  ['A', 'T', 'G', 'C', 'C', 'A'],
  ['C', 'T', 'G', 'A', 'A', 'C'],
  ['T', 'T', 'A', 'A', 'C', 'T'],
  ['A', 'A', 'A', 'C', 'T', 'G'],
  ['C', 'A', 'C', 'C', 'T', 'A'],
  ['T', 'C', 'A', 'C', 'T', 'G'],
];

const mockMatrixTwoDiagsInfMain = [
  ['A', 'T', 'G', 'C', 'G', 'A'],
  ['C', 'A', 'T', 'T', 'G', 'C'],
  ['T', 'C', 'A', 'C', 'G', 'T'],
  ['A', 'G', 'C', 'A', 'T', 'G'],
  ['C', 'C', 'T', 'C', 'T', 'A'],
  ['T', 'C', 'A', 'C', 'T', 'G'],
];

const mockMatrixHuman = [
  ['A', 'T', 'G', 'C', 'G', 'A'],
  ['C', 'A', 'G', 'T', 'A', 'C'],
  ['T', 'T', 'G', 'T', 'G', 'T'],
  ['A', 'G', 'A', 'A', 'G', 'G'],
  ['C', 'C', 'C', 'T', 'T', 'A'],
  ['T', 'C', 'A', 'C', 'T', 'G'],
];

const lineMock = ['A', 'T', 'G', 'C', 'G', 'A'];

describe('Controller test', () => {
  it('Validate is mutant true without stats', async () => {
    Stats.save = jest.fn();
    Stats.save.mockImplementation(() => {
      Promise.resolve(true);
    });
    Stats.findAll.mockReturnValue([]);
    const mockStaticMethod = jest.fn();
    mockStaticMethod.mockReturnValue(mockDnaToSave);
    Dna.save = mockStaticMethod.bind(Dna);
    const resp = await mutantController.validateMutant(dna);
    expect(resp).toBe(true);
  });

  it('Validate is mutant true with stats', async () => {
    Stats.save = jest.fn();
    Stats.save.mockImplementation(() => {
      Promise.resolve(true);
    });
    Stats.findAll.mockReturnValue([
      { count_humans_dna: 1, count_mutants_dna: 1 },
    ]);
    const mockStaticMethod = jest.fn();
    mockStaticMethod.mockReturnValue(mockDnaToSave);
    Dna.save = mockStaticMethod.bind(Dna);
    const resp = await mutantController.validateMutant(dna);
    expect(resp).toBe(true);
  });

  it('conver To matrix', () => {
    const matrix = mutantController.convertToMatrix(dna);
    expect(matrix).toMatchObject(mockMatrix);
  });

  it('conver To matrix fail', () => {
    try {
      const matrix = mutantController.convertToMatrix(mockBadDna);
    } catch (err) {
      expect(err.message).toContain('Letter is not allowed for dna');
    }
  });

  it('isMutant false', async () => {
    Stats.save = jest.fn();
    Stats.save.mockImplementation(() => {
      Promise.resolve(true);
    });
    Stats.findAll.mockReturnValue([]);
    const isMutant = await mutantController.isMutant(mockMatrixHuman);
    expect(isMutant).toBe(false);
  });

  it('isMutant True', async () => {
    Stats.save = jest.fn();
    Stats.save.mockImplementation(() => {
      Promise.resolve(true);
    });
    Stats.findAll.mockReturnValue([]);
    const isMutant = await mutantController.isMutant(mockMatrix);
    expect(isMutant).toBe(true);
  });

  it('isMutant True two diagonals main sup', async () => {
    Stats.save = jest.fn();
    Stats.save.mockImplementation(() => {
      Promise.resolve(true);
    });
    Stats.findAll.mockReturnValue([]);
    const isMutant = await mutantController.isMutant(mockMatrixTwoDiagsSup);
    expect(isMutant).toBe(true);
  });

  it('isMutant True two diagonals sec sup', async () => {
    Stats.save = jest.fn();
    Stats.save.mockImplementation(() => {
      Promise.resolve(true);
    });
    Stats.findAll.mockReturnValue([]);
    const isMutant = await mutantController.isMutant(mockMatrixTwoDiagsSupSec);
    expect(isMutant).toBe(true);
  });

  it('isMutant True two diagonals main inf', async () => {
    Stats.save = jest.fn();
    Stats.save.mockImplementation(() => {
      Promise.resolve(true);
    });
    Stats.findAll.mockReturnValue([]);
    const isMutant = await mutantController.isMutant(mockMatrixTwoDiagsInfMain);
    expect(isMutant).toBe(true);
  });

  it('isMutant True two diagonals sec inf', async () => {
    Stats.save = jest.fn();
    Stats.save.mockImplementation(() => {
      Promise.resolve(true);
    });
    Stats.findAll.mockReturnValue([]);
    const isMutant = await mutantController.isMutant(mockMatrixTwoDiagsInfSec);
    expect(isMutant).toBe(true);
  });

  it('isMutant False', async () => {
    Stats.save = jest.fn();
    Stats.save.mockImplementation(() => {
      Promise.resolve(true);
    });
    Stats.findAll.mockReturnValue([
      { count_humans_dna: 1, count_mutants_dna: 1 },
    ]);
    const isMutant = await mutantController.isMutant(mockMatrixHuman);
    expect(isMutant).toBe(false);
  });

  it('saveStats without find all registers and whith existin DNA', async () => {
    Stats.save = jest.fn();
    Stats.save.mockImplementation(() => {
      Promise.resolve(true);
    });
    Stats.findAll.mockReturnValue([]);
    Dna.findDna.mockReturnValue(mockDnaToSave);
    const isMutant = await mutantController.saveStats(dna, false);
    expect(isMutant).toBe(false);
  });

  it('saveStats without find all registers and whithout existin DNA', async () => {
    Stats.save = jest.fn();
    Stats.save.mockImplementation(() => {
      Promise.resolve(true);
    });
    Stats.findAll.mockReturnValue([]);
    Dna.findDna.mockReturnValue(null);
    const isMutant = await mutantController.saveStats(dna, false);
    expect(isMutant).toBe(true);
  });

  it('saveStats without find all registers and whithout existin DNA', async () => {
    Stats.save = jest.fn();
    Stats.save.mockImplementation(() => {
      Promise.resolve(true);
    });
    Stats.findAll.mockReturnValue([]);
    Dna.findDna.mockReturnValue(null);
    const isMutant = await mutantController.saveStats(dna, true);
    expect(isMutant).toBe(true);
  });

  it('saveStats with find all registers and whith existin DNA no mutant', async () => {
    Stats.save = jest.fn();
    Stats.save.mockImplementation(() => {
      Promise.resolve(true);
    });
    Dna.findDna.mockReturnValue(null);
    Stats.findAll.mockReturnValue([
      { count_humans_dna: 1, count_mutants_dna: 1 },
    ]);
    const isMutant = await mutantController.saveStats(dna, false);
    expect(isMutant).toBe(true);
  });

  it('saveStats with find all registers and whith existin DNA mutant', async () => {
    Stats.save = jest.fn();
    Stats.save.mockImplementation(() => {
      Promise.resolve(true);
    });
    Dna.findDna.mockReturnValue(null);
    Stats.findAll.mockReturnValue([
      { count_humans_dna: 1, count_mutants_dna: 1 },
    ]);
    const isMutant = await mutantController.saveStats(dna, true);
    expect(isMutant).toBe(true);
  });

  it('saveStats with find all registers and whith existin DNA', async () => {
    Stats.save = jest.fn();
    Stats.save.mockImplementation(() => {
      Promise.resolve(true);
    });
    Dna.findDna.mockReturnValue(mockDnaToSave);
    Stats.findAll.mockReturnValue(null);
    const isMutant = await mutantController.saveStats(dna, false);
    expect(isMutant).toBe(false);
  });

  it('getLinesWithSequence', async () => {
    mutantController.getLinesWithSequence = jest.fn();
    mutantController.getLinesWithSequence(mockMatrix, 0);
    expect(mutantController.getLinesWithSequence).toHaveBeenCalled();
  });

  it('ValidateMutant throw error', async () => {
    try {
      mutantController.convertToMatrix = jest.fn();
      mutantController.convertToMatrix.mockImplementation(() => {
        Promise.reject(mockDna);
      });
      const resp = await mutantController.validateMutant(dna);
    } catch (err) {
      expect(err.message).toContain(
        'Error when try to validate if the dna belong to mutant'
      );
    }
  });

  it('get Stats without result', async () => {
    Stats.findAll = jest.fn();
    Stats.findAll.mockReturnValue([]);
    const isMutant = await mutantController.getStats();
    expect(isMutant).toEqual({
      Description: 'No hay individuos para analizar',
    });
  });

  it('get Stats with result', async () => {
    Stats.findAll = jest.fn();
    Stats.findAll.mockReturnValue([
      {
        count_mutants_dna: 1,
        count_humans_dna: 1,
        ratio: 1,
      },
    ]);
    const isMutant = await mutantController.getStats();
    expect(isMutant).toEqual({
      count_mutants_dna: 1,
      count_humans_dna: 1,
      ratio: 1,
    });
  });
});
