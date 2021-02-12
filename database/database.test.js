require('dotenv').config();
const mongodb = require('mongodb');
const databaseCli = require('./database');

jest.mock('..//logger/logger', () => {
  return jest.fn().mockImplementation(() => ({
    info: jest.fn(() => 'info'),
    error: jest.fn(() => 'error'),
  }));
});

const { MongoClient } = mongodb;
const mockConnection = {
  client: jest.fn(),
  database: {
    value: 'connected',
  },
  topology: {
    value: true,
  },
};

describe('Get Database-Fail-Test', () => {
  it('Should not get Db', async () => {
    expect.hasAssertions();
    try {
      databaseCli.getDb();
    } catch (error) {
      const messageError = error.message;
      expect(messageError).toBe('No database found');
    }
  });
});

describe('Database-Test', () => {
  it('Should connect mongo client', async () => {
    mockConnection.client.on = jest.fn().mockImplementation(() => {
      return {};
    });
    await databaseCli.initializeMongo();
    expect(MongoClient.connect).toHaveBeenCalledTimes(1);
  });

  it('Should get Db', () => {
    const db = databaseCli.getDb();
    db.then((res) => {
      expect(res.value).toBe('connected');
    });
  });

  it('Should close db', async () => {
    await databaseCli.close();
    expect(mockConnection.client.close).toHaveBeenCalledTimes(1);
  });

  beforeEach(() => {
    MongoClient.connect = jest.fn();
    MongoClient.connect.mockResolvedValue(mockConnection.client);
    mockConnection.client.db = jest.fn();
    mockConnection.client.db.mockResolvedValue(mockConnection.database);
    mockConnection.client.close = jest.fn();
    mockConnection.client.close.mockResolvedValue({});
  });
});

describe('Database-Fail-Test', () => {
  it('Should not connect mongo client', async () => {
    MongoClient.connect.mockImplementation(() => {
      throw new Error();
    });
    await expect(databaseCli.initializeMongo()).rejects.toThrow(Error);
  });

  it('Should not close connection ', async () => {
    mockConnection.client.close = jest.fn();
    mockConnection.client.close.mockImplementation(() => {
      throw new Error();
    });
    await expect(databaseCli.close()).rejects.toThrow(Error);
  });
});
