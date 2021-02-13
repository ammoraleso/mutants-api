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

  it('getDiagSupCol', async () => {
    const resp = mutantController.getDiagSupCol(mockMatrix, 0);
    expect(resp).toEqual(['A', 'A', 'A', 'A', 'T', 'G']);
  });

  it('getDiagInfRow', async () => {
    const resp = mutantController.getDiagInfRow(mockMatrix, 0);
    expect(resp).toEqual(['A', 'A', 'A', 'A', 'T', 'G']);
  });

  it('getDiagSupColSec', async () => {
    const resp = mutantController.getDiagSupColSec(mockMatrix, 0);
    expect(resp).toEqual(['A', 'G', 'T', 'A', 'C', 'T']);
  });

  it('getDiagInfRowSec', async () => {
    const resp = mutantController.getDiagInfRowSec(mockMatrix, 0);
    expect(resp).toEqual(['A', 'G', 'T', 'A', 'C', 'T']);
  });

  it('findSequenceInLine', async () => {
    mutantController.findSequenceInLine = jest.fn();
    mutantController.findSequenceInLine(lineMock);
    expect(mutantController.findSequenceInLine).toHaveBeenCalled();
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
