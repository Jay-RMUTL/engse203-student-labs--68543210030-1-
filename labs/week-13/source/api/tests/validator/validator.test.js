import { describe, test, expect } from 'vitest';
import request from 'supertest';
import express from 'express';
import { validateRequestData } from '../../src/validators/requestValidator.js';
const app = express();
app.use(express.json());
app.post('/test', validateRequestData, (req, res) => {
  res.status(200).json({ message: 'Success' });
});

describe('Boundary Value Testing for Request Validator', () => {
  
  // ทดสอบขอบสูงสุดของ Amount (Max = 1000)
  test('should pass when amount is exactly at maximum boundary (1000)', async () => {
    const res = await request(app)
      .post('/test')
      .send({ title: 'Valid Title', amount: 1000 });
    
    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toEqual('Success');
  });

  test('should fail when amount exceeds maximum boundary (1001)', async () => {
    const res = await request(app)
      .post('/test')
      .send({ title: 'Valid Title', amount: 1001 });
    
    expect(res.statusCode).toEqual(400);
    expect(res.body.errors).toBeDefined();
  });

  // ทดสอบขอบต่ำสุดของ Amount (Min = 1)
  test('should pass when amount is at minimum boundary (1)', async () => {
    const res = await request(app)
      .post('/test')
      .send({ title: 'Valid Title', amount: 1 });
    
    expect(res.statusCode).toEqual(200);
  });

  test('should fail when amount is below minimum boundary (0)', async () => {
    const res = await request(app)
      .post('/test')
      .send({ title: 'Valid Title', amount: 0 });
    
    expect(res.statusCode).toEqual(400);
  });

});