const mutantController = require('./mutantController');
const database = require('../database/database');

jest.mock('../models/dna');
const Dna = require('../models/dna');

const resultArray = [];

const mockDna = ['ATGCGA', 'CAGTGC', 'TTATGT', 'AGAAGG', 'CCCCTA', 'TCACTG'];

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
  it('ValidateMutant', async () => {
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

  it('isMutant True', async () => {
    const isMutant = await mutantController.isMutant(mockMatrix);
    expect(isMutant).toBe(true);
  });

  it('isMutant False', async () => {
    const isMutant = await mutantController.isMutant(mockMatrixHuman);
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
});
