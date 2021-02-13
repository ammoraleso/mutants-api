const express = require('express'); // import express
const transactionRouter = require('./transactionRouter'); //import file we are testing
const app = express(); //an instance of an express app, a 'fake' express app
const request = require('supertest');

jest.mock('../models/transaction');
const Transaction = require('../models/transaction');

jest.mock('../logger/logger', () => {
  return jest.fn().mockImplementation(() => ({
    info: jest.fn(() => 'info'),
    error: jest.fn(() => 'error'),
  }));
});

app.use(transactionRouter); //routes

describe('Post Endpoints', () => {
  beforeEach(() => {
    Transaction.findAll.mockImplementation(() => {
      {
      }
    });
  });

  it('Response 200 /transactions', async () => {
    const res = await request(app).get('/transactions');
    expect(res.statusCode).toEqual(200);
  });
});

describe('Post Endpoints', () => {
  beforeEach(() => {
    Transaction.findAll.mockImplementation(() => {
      throw new Error('Error');
    });
  });

  it('Response 401 /transactions', async () => {
    const res = await request(app).get('/transactions');
    expect(res.statusCode).toEqual(401);
  });
});
