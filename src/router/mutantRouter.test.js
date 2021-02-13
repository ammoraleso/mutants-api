const express = require('express'); // import express
const mutantRouter = require('./mutantRouter'); //import file we are testing
const app = express(); //an instance of an express app, a 'fake' express app
const request = require('supertest');

jest.mock('../controller/mutantController');
const mutantController = require('../controller/mutantController');

app.use(require('body-parser').json());
app.use(mutantRouter); //routes

describe('Post Endpoints', () => {
  beforeEach(() => {
    mutantController.validateMutant.mockReturnValue(true);
  });

  it('Response 200 /mutant', async () => {
    const res = await request(app)
      .post('/mutant')
      .type('json')
      .send({
        dna: ['ATGCGA', 'CAGTGC', 'TTATGT', 'AGAAGG', 'CCCCTA', 'TCACTG'],
      });
    expect(res.statusCode).toEqual(200);
  });

  it('Response 400 /mutant', async () => {
    const res = await request(app).post('/mutant').type('json').send();
    expect(res.statusCode).toEqual(400);
  });

  it('Response 400 /mutant', async () => {
    const res = await request(app)
      .post('/mutant')
      .type('json')
      .send({
        dna: ['ATFFGCGA', 'CAGTGC', 'TTATGT', 'AGAAGG', 'CCCCTA', 'TCACTG'],
      });
    expect(res.statusCode).toEqual(400);
  });

  it('Response 400 /mutant', async () => {
    const res = await request(app)
      .post('/mutant')
      .type('json')
      .send({ dna: '' });
    expect(res.statusCode).toEqual(400);
  });

  it('Response 403 /mutant', async () => {
    mutantController.validateMutant.mockReturnValue(false);
    const res = await request(app)
      .post('/mutant')
      .type('json')
      .send({
        dna: ['ATGCGA', 'CAGTGC', 'TTATGT', 'AGAAGG', 'CCCCTA', 'TCACTG'],
      });
    expect(res.statusCode).toEqual(403);
  });

  it('Response 200 /stats', async () => {
    const res = await request(app).get('/stats');
    expect(res.statusCode).toEqual(200);
  });

  it('Response 200 /stats', async () => {
    mutantController.getStats.mockImplementation(() => {
      throw new Error('Error');
    });
    const res = await request(app).get('/stats');
    expect(res.statusCode).toEqual(400);
  });
});
