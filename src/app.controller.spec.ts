import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });

  describe('getProtected', () => {
    it('should return "Esta ruta está protegida con JWT"', () => {
      expect(appController.getProtected()).toBe('Esta ruta está protegida con JWT');
    });
  });

  describe('getAdminOnly', () => {
    it('should return "Esta ruta solo es accesible para administradores"', () => {
      expect(appController.getAdminOnly()).toBe('Esta ruta solo es accesible para administradores');
    });
  });
});
