const Dna = require('./dna');
const database = require('../database/database');

jest.mock('../logger/logger', () => {
  return jest.fn().mockImplementation(() => ({
    info: jest.fn(() => 'info'),
    error: jest.fn(() => 'error'),
  }));
});

const mockDna = ['ATGCGA', 'CAGTGC', 'TTATGT', 'AGAAGG', 'CCCCTA', 'TCACTG'];

const mockDnaToSave = new Dna(mockDna, true);

const resultUpdate = {};
const resultArray = [];

describe('DNA model test ok', () => {
  beforeEach(() => {
    const db = {
      collection: jest.fn().mockImplementation(() => ({
        updateOne: jest.fn(() => Promise.resolve(resultUpdate)),
        findOne: jest.fn(() => Promise.resolve(resultUpdate)),
        find: jest.fn().mockImplementation(() => ({
          toArray: jest.fn(() => Promise.resolve(resultArray)),
        })),
        insertOne: jest.fn(() => Promise.resolve(resultUpdate)),
      })),
    };
    database.getDb = jest.fn();
    database.getDb.mockReturnValue(db);
  });

  it('Save Dna', async () => {
    const resp = await mockDnaToSave.save();
    expect(resp).toBe(resultUpdate);
  });

  it('FindAll Dna model ok', async () => {
    const resFindAll = await Dna.findAll();
    expect(resFindAll).toBe(resultArray);
  });

  it('FindDna Dna model ok', async () => {
    const resFindAll = await Dna.findDna();
    expect(resFindAll).toBe(resultUpdate);
  });
});

describe('Dna model test fail', () => {
  beforeEach(() => {
    const db = {
      collection: jest.fn().mockImplementation(() => ({
        updateOne: jest.fn(() => Promise.reject(mockDnaToSave)),
        findOne: jest.fn(() => Promise.reject(mockDnaToSave)),
        find: jest.fn().mockImplementation(() => ({
          toArray: jest.fn(() => Promise.reject(resultArray)),
        })),
      })),
    };
    database.getDb = jest.fn();
    database.getDb.mockReturnValue(db);
  });

  it('Not save Dna', async () => {
    try {
      await mockDnaToSave.save();
    } catch (err) {
      expect(err.message).toContain('Error savingDna collection');
    }
  });

  it('FindAll Dna model thrown exception', async () => {
    try {
      await Dna.findAll();
    } catch (err) {
      expect(err.message).toBe('Error retrieving all Dna collection ');
    }
  });

  it('FindOne Dna model thrown exception', async () => {
    try {
      await Dna.findDna();
    } catch (err) {
      expect(err.message).toContain('Error retrieving Dna register');
    }
  });
});
