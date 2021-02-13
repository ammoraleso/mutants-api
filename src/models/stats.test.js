const Stats = require('./stats');
const database = require('../database/database');

jest.mock('../logger/logger', () => {
  return jest.fn().mockImplementation(() => ({
    info: jest.fn(() => 'info'),
    error: jest.fn(() => 'error'),
  }));
});

const mockStats = new Stats(3, 4);
const mockStatsOther = new Stats(3, 0);

const resultUpdate = {};
const resultArray = [];

describe('Stats model test ok', () => {
  beforeEach(() => {
    const db = {
      collection: jest.fn().mockImplementation(() => ({
        updateOne: jest.fn(() => Promise.resolve(resultUpdate)),
        find: jest.fn().mockImplementation(() => ({
          toArray: jest.fn(() => Promise.resolve(resultArray)),
        })),
        insertOne: jest.fn(() => Promise.resolve(resultUpdate)),
      })),
    };
    database.getDb = jest.fn();
    database.getDb.mockReturnValue(db);
  });

  it('Save Stats', async () => {
    const resp = await mockStats.save();
    expect(resp).toBe(resultUpdate);
  });

  it('FindAll Stats model ok', async () => {
    const resFindAll = await Stats.findAll();
    expect(resFindAll).toBe(resultArray);
  });
});

describe('Dna model test fail', () => {
  beforeEach(() => {
    const db = {
      collection: jest.fn().mockImplementation(() => ({
        updateOne: jest.fn(() => Promise.reject(mockStats)),
        find: jest.fn().mockImplementation(() => ({
          toArray: jest.fn(() => Promise.reject(resultArray)),
        })),
      })),
    };
    database.getDb = jest.fn();
    database.getDb.mockReturnValue(db);
  });

  it('Not save Stats', async () => {
    try {
      await mockStats.save();
    } catch (err) {
      expect(err.message).toContain('Error stats collection');
    }
  });

  it('FindAll Stats model thrown exception', async () => {
    try {
      await Stats.findAll();
    } catch (err) {
      expect(err.message).toBe('Error retrieving all Stats collection ');
    }
  });
});
