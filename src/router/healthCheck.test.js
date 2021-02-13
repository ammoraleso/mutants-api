const express = require('express'); // import express
const healthRouter = require('./healthCheck'); //import file we are testing
const app = express(); //an instance of an express app, a 'fake' express app
const request = require('supertest');

jest.mock('../logger/logger', () => {
  return jest.fn().mockImplementation(() => ({
    info: jest.fn(() => 'info'),
    error: jest.fn(() => 'error'),
  }));
});

app.use(healthRouter); //routes

describe('Get Endpoints', () => {
  it('Response 200 /health', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toEqual(200);
  });
});
