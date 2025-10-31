import { Test, TestingModule } from '@nestjs/testing';
import { UsersService, CreateUserDto, UpdateUserDto } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../entities/user/user.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('UsersService', () => {
  let service: UsersService;
  let userRepo: {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };

  beforeEach(async () => {
    userRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: userRepo,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('findByEmail', () => {
    it('devuelve usuario cuando existe el email', async () => {
      const mockUser = { id: '1', email: 'test@test.com', roles: [] };
      userRepo.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@test.com');

      expect(result).toBe(mockUser);
      expect(userRepo.findOne).toHaveBeenCalledWith({
        where: { email: 'test@test.com' },
        relations: ['roles'],
      });
    });

    it('devuelve null cuando el email no existe', async () => {
      userRepo.findOne.mockResolvedValue(null);

      const result = await service.findByEmail('noexiste@test.com');

      expect(result).toBeNull();
    });
  });

  describe('createUser', () => {
    it('crea usuario cuando los datos son válidos', async () => {
      const dto: CreateUserDto = {
        username: 'newuser',
        email: 'new@test.com',
        password: 'pass123',
      };

      userRepo.findOne.mockResolvedValue(null);
      const hashedPassword = await bcrypt.hash(dto.password, 10);
      const mockCreatedUser = { ...dto, password: hashedPassword, id: '1' };
      
      userRepo.create.mockReturnValue(mockCreatedUser);
      userRepo.save.mockResolvedValue(mockCreatedUser);

      const result = await service.createUser(dto);

      expect(result).toEqual(mockCreatedUser);
      expect(userRepo.create).toHaveBeenCalledWith({
        ...dto,
        isActive: true,
        password: expect.any(String), // hash
      });
    });

    it('lanza ConflictException si el email ya existe', async () => {
      const dto: CreateUserDto = {
        username: 'test',
        email: 'exists@test.com',
        password: 'pass',
      };

      userRepo.findOne.mockResolvedValue({ id: '1', email: dto.email });

      await expect(service.createUser(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('updateUser', () => {
    it('actualiza usuario existente', async () => {
      const userId = '1';
      const dto: UpdateUserDto = {
        email: 'updated@test.com',
      };

      const existingUser = {
        id: userId,
        email: 'old@test.com',
        roles: [],
      };

      userRepo.findOne.mockResolvedValue(existingUser);
      userRepo.save.mockImplementation(user => user);

      const result = await service.updateUser(userId, dto);

      expect(result.email).toBe(dto.email);
      expect(userRepo.save).toHaveBeenCalled();
    });

    it('no modifica el hash de contraseña si no se pasa password en el DTO', async () => {
      const userId = '2';
      const dto: UpdateUserDto = {
        email: 'another@test.com',
      };

      const existingUser = {
        id: userId,
        email: 'old2@test.com',
        password: await bcrypt.hash('somepass', 10),
        roles: [],
      };

      userRepo.findOne.mockResolvedValue(existingUser);
      userRepo.save.mockImplementation(user => user);

      const previousHash = existingUser.password;

      const result = await service.updateUser(userId, dto);

      expect(result.email).toBe(dto.email);
      expect(result.password).toBe(previousHash);
    });

    it('hashea nueva contraseña al actualizar', async () => {
      const userId = '1';
      const newPassword = 'newpass123';
      const dto: UpdateUserDto = {
        password: newPassword,
      };

      const existingUser = {
        id: userId,
        password: await bcrypt.hash('oldpass', 10),
        roles: [],
      };

      userRepo.findOne.mockResolvedValue(existingUser);
      userRepo.save.mockImplementation(user => user);

      // Guardar el hash anterior para compararlo después (el objeto `existingUser` se muta en el servicio)
      const previousPasswordHash = existingUser.password;

      const result = await service.updateUser(userId, dto);

      expect(result.password).toBeDefined();
      // Comparar con el hash anterior almacenado
      expect(result.password).not.toBe(previousPasswordHash);
      expect(result.password).not.toBe(newPassword);

      // Verificar que la nueva contraseña fue hasheada correctamente
      const isValidPassword = await bcrypt.compare(newPassword, result.password);
      expect(isValidPassword).toBe(true);
    });

    it('lanza NotFoundException si el usuario no existe', async () => {
      userRepo.findOne.mockResolvedValue(null);

      await expect(
        service.updateUser('999', { email: 'x@x.com' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('softDelete', () => {
    it('marca usuario como inactivo', async () => {
      const userId = '1';
      const mockUser = {
        id: userId,
        isActive: true,
      };

      userRepo.findOne.mockResolvedValue(mockUser);
      userRepo.save.mockImplementation(user => user);

      await service.softDelete(userId);

      expect(userRepo.save).toHaveBeenCalledWith({
        ...mockUser,
        isActive: false,
      });
    });

    it('lanza NotFoundException si el usuario no existe', async () => {
      userRepo.findOne.mockResolvedValue(null);

      await expect(service.softDelete('999')).rejects.toThrow(NotFoundException);
    });
  });
});