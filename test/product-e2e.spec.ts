import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import request from 'supertest';
import { ProductModule } from '../src/modules/product/product.module';

describe('ProductModule e2e', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          autoLoadEntities: true,
          synchronize: true,
        }),
        ProductModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        validationError: {
          target: false,
        },
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('should create a new product 201', async () => {
    const newProduct = {
      product_name: 'Test Product',
      description: 'A test product description',
      stock: 100
    };

    const response = await request(app.getHttpServer())
      .post('/product')
      .send(newProduct)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.product_name).toBe(newProduct.product_name);
    expect(response.body.description).toBe(newProduct.description);
    expect(response.body.stock).toBe(newProduct.stock);
  });

  it('should get all products 200', async () => {
    const response = await request(app.getHttpServer())
      .get('/product')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should get a specific product 200', async () => {
    const newProduct = {
      product_name: 'Specific Product',
      description: 'Description for specific product',
      stock: 50
    };

    const createResponse = await request(app.getHttpServer())
      .post('/product')
      .send(newProduct)
      .expect(201);

    const productId = createResponse.body.id;

    const getResponse = await request(app.getHttpServer())
      .get(`/product/${productId}`)
      .expect(200);

    expect(getResponse.body).toHaveProperty('id', productId);
    expect(getResponse.body.product_name).toBe(newProduct.product_name);
    expect(getResponse.body.description).toBe(newProduct.description);
    expect(getResponse.body.stock).toBe(newProduct.stock);
  });

  it('should update a product 200', async () => {
    const newProduct = {
      product_name: 'Original Product',
      description: 'Original description',
      stock: 25
    };

    const createResponse = await request(app.getHttpServer())
      .post('/product')
      .send(newProduct)
      .expect(201);

    const productId = createResponse.body.id;

    const updatedProduct = {
      product_name: 'Updated Product',
      description: 'Updated description',
      stock: 75
    };

    const updateResponse = await request(app.getHttpServer())
      .patch(`/product/${productId}`)
      .send(updatedProduct)
      .expect(200);

    expect(updateResponse.body).toHaveProperty('id', productId);
    expect(updateResponse.body.product_name).toBe(updatedProduct.product_name);
    expect(updateResponse.body.description).toBe(updatedProduct.description);
    expect(updateResponse.body.stock).toBe(updatedProduct.stock);
  });

  it('should delete a product 204', async () => {
    const newProduct = {
      product_name: 'Product to Delete',
      description: 'This product will be deleted',
      stock: 10
    };

    const createResponse = await request(app.getHttpServer())
      .post('/product')
      .send(newProduct)
      .expect(201);

    const productId = createResponse.body.id;

    await request(app.getHttpServer())
      .delete(`/product/${productId}`)
      .expect(204);

    await request(app.getHttpServer())
      .get(`/product/${productId}`)
      .expect(404);
  });

  it('should return 400 when creating a product with missing required fields', async () => {
    const invalidProduct = { product_name: 'Invalid Product' };
    await request(app.getHttpServer())
      .post('/product')
      .send(invalidProduct)
      .expect(400);
  });

  it('should return 400 when creating a product with invalid data types', async () => {
    const invalidProduct = {
      product_name: '',
      description: '',
      stock: 'invalid'
    };
    await request(app.getHttpServer())
      .post('/product')
      .send(invalidProduct)
      .expect(400);
  });

  it('should return 404 when getting a non-existent product', async () => {
    await request(app.getHttpServer())
      .get('/product/9999')
      .expect(404);
  });

  it('should return 404 when updating a non-existent product', async () => {
    const updatedProduct = {
      product_name: 'Updated Name',
      description: 'Updated description'
    };

    await request(app.getHttpServer())
      .patch('/product/9999')
      .send(updatedProduct)
      .expect(404);
  });

  it('should return 404 when deleting a non-existent product', async () => {
    await request(app.getHttpServer())
      .delete('/product/9999')
      .expect(404);
  });

  it('should create a product with minimal required fields 201', async () => {
    const minimalProduct = {
      product_name: 'Minimal Product',
      description: 'Minimal description'
    };

    const response = await request(app.getHttpServer())
      .post('/product')
      .send(minimalProduct)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.product_name).toBe(minimalProduct.product_name);
    expect(response.body.description).toBe(minimalProduct.description);
    expect(response.body.stock).toBeNull();
  });

  it('should update only some fields of a product 200', async () => {
    const newProduct = {
      product_name: 'Partial Update Product',
      description: 'Original description',
      stock: 30
    };

    const createResponse = await request(app.getHttpServer())
      .post('/product')
      .send(newProduct)
      .expect(201);

    const productId = createResponse.body.id;

    const partialUpdate = { product_name: 'Partially Updated Product' };

    const updateResponse = await request(app.getHttpServer())
      .patch(`/product/${productId}`)
      .send(partialUpdate)
      .expect(200);

    expect(updateResponse.body).toHaveProperty('id', productId);
    expect(updateResponse.body.product_name).toBe(partialUpdate.product_name);
    expect(updateResponse.body.description).toBe(newProduct.description);
    expect(updateResponse.body.stock).toBe(newProduct.stock);
  });
});
