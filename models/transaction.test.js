const Transaction = require('./transaction');
const database = require('../database/database');

jest.mock('../logger/logger', () => {
  return jest.fn().mockImplementation(() => ({
    info: jest.fn(() => 'info'),
    error: jest.fn(() => 'error'),
  }));
});

const mockTransaction = new Transaction('/Test');

const resultUpdate = {};
const resultArray = [];

describe('Transaction model test ok', () => {
  beforeEach(() => {
    const db = {
      collection: jest.fn().mockImplementation(() => ({
        find: jest.fn().mockImplementation(() => ({
          toArray: jest.fn(() => Promise.resolve(resultArray)),
        })),
        insertOne: jest.fn(() => Promise.resolve(resultUpdate)),
      })),
    };
    database.getDb = jest.fn();
    database.getDb.mockReturnValue(db);
  });

  it('Save Transaction', async () => {
    const resp = await mockTransaction.save();
    expect(resp).toBe(resultUpdate);
  });

  it('FindAll Transaction model ok', async () => {
    const resFindAll = await Transaction.findAll();
    expect(resFindAll).toBe(resultArray);
  });
});

describe('Transaction model test fail', () => {
  beforeEach(() => {
    const db = {
      collection: jest.fn().mockImplementation(() => ({
        insertOne: jest.fn(() => Promise.reject(mockTransaction)),
        find: jest.fn().mockImplementation(() => ({
          toArray: jest.fn(() => Promise.reject(resultArray)),
        })),
      })),
    };
    database.getDb = jest.fn();
    database.getDb.mockReturnValue(db);
  });

  it('Not save Transaction', async () => {
    try {
      await mockTransaction.save();
    } catch (err) {
      expect(err.message).toContain('Error saving a transaction');
    }
  });

  it('FindAll sailing model thrown exception', async () => {
    try {
      await Transaction.findAll();
    } catch (err) {
      expect(err.message).toContain(
        'Error retrieving all transaction collection '
      );
    }
  });
});
