const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../src/app');
const Item = require('../src/models/item');

let server;

describe('Items API', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/crud_db_test');
    server = app.listen(3001); // Use a different port for testing
  });

  afterEach(async () => {
    await Item.deleteMany();
  });

  afterAll(async () => {
    await mongoose.connection.close();
    await server.close();
  });

  const sampleItem = {
    name: 'Test Item',
    description: 'Test Description',
    price: 99.99
  };

  describe('POST /api/items', () => {
    it('should create a new item', async () => {
      const response = await request(app)
        .post('/api/items')
        .send(sampleItem);

      expect(response.status).toBe(201);
      expect(response.body.name).toBe(sampleItem.name);
      expect(response.body.description).toBe(sampleItem.description);
      expect(response.body.price).toBe(sampleItem.price);
    });
  });

  describe('GET /api/items', () => {
    it('should retrieve all items', async () => {
      await Item.create(sampleItem);
      const response = await request(app).get('/api/items');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBe(1);
    });
  });

  describe('GET /api/items/:id', () => {
    it('should retrieve a specific item', async () => {
      const item = await Item.create(sampleItem);
      const response = await request(app).get(`/api/items/${item._id}`);

      expect(response.status).toBe(200);
      expect(response.body.name).toBe(sampleItem.name);
    });

    it('should return 404 for non-existent item', async () => {
      const response = await request(app).get(`/api/items/${new mongoose.Types.ObjectId()}`);
      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/items/:id', () => {
    it('should update an item', async () => {
      const item = await Item.create(sampleItem);
      const updatedData = { ...sampleItem, name: 'Updated Name' };
      
      const response = await request(app)
        .put(`/api/items/${item._id}`)
        .send(updatedData);

      expect(response.status).toBe(200);
      expect(response.body.name).toBe(updatedData.name);
    });
  });

  describe('DELETE /api/items/:id', () => {
    it('should delete an item', async () => {
      const item = await Item.create(sampleItem);
      const response = await request(app).delete(`/api/items/${item._id}`);

      expect(response.status).toBe(200);
      const deletedItem = await Item.findById(item._id);
      expect(deletedItem).toBeNull();
    });
  });
});
