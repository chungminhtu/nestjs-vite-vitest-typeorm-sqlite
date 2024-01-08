/* eslint-disable @typescript-eslint/no-explicit-any */
import { Repository } from 'typeorm';
import { AppController } from '../src/app.controller';
import { Product } from '../src/product/entities/product.entity';
import { ProductController } from '../src/product/product.controller';
import { ProductService } from '../src/product/product.service';
import { moduleFixture } from './vitest-setup';

describe('PetRepository e2e', () => {
  let repository: Repository<Product>;
  let controller: ProductController;
  let service: ProductService;
  let appController: AppController;

  beforeAll(async () => {
    repository = moduleFixture.get<Repository<Product>>('ProductRepository');
    controller = moduleFixture.get<ProductController>(ProductController);
    service = moduleFixture.get<ProductService>(ProductService);
    appController = moduleFixture.get<AppController>(AppController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('Should find all products', async () => {
    console.table(await repository.find());
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });
});
