import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../entities/user/user.entity';
import * as bcrypt from 'bcrypt';

/**
 * Explicit AuthService unit tests
 *
 * These tests focus on two public behaviors:
 *  - validateUser(username, password): returns User | null
 *  - login(LoginDto): returns { access_token, user } or throws Unauthorized
 *
 * We mock the user repository and JwtService so tests are deterministic.
 */
describe('AuthService (explicit tests)', () => {
  let service: AuthService;
  let userRepo: { findOne: jest.Mock };
  let jwtService: { sign: jest.Mock };

  beforeEach(async () => {
    userRepo = { findOne: jest.fn() };
    jwtService = { sign: jest.fn().mockReturnValue('signed-token') };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => jest.resetAllMocks());

  // ---------- validateUser tests ----------
  describe('validateUser()', () => {
    it('returns the User when credentials are correct and user is active', async () => {
      // Arrange
      const plain = 'pass123';
      const hashed = await bcrypt.hash(plain, 1); // low rounds for speed in tests
  const mockUser = { id: 'u1', username: 'user1', password: hashed, isActive: true, roles: [] } as unknown as User;
      userRepo.findOne.mockResolvedValue(mockUser);

      // Act
      const result = await service.validateUser('user1', plain);

      // Assert
      expect(result).not.toBeNull();
      expect((result as User).username).toBe('user1');
    });

    it('returns null when the user does not exist', async () => {
      userRepo.findOne.mockResolvedValue(null);
      const result = await service.validateUser('noone', 'x');
      expect(result).toBeNull();
    });

    it('returns null when the user is inactive', async () => {
      const hashed = await bcrypt.hash('p', 1);
      userRepo.findOne.mockResolvedValue({ username: 'u', password: hashed, isActive: false });
      const result = await service.validateUser('u', 'p');
      expect(result).toBeNull();
    });

    it('returns null when the password is incorrect', async () => {
      const hashed = await bcrypt.hash('other', 1);
      userRepo.findOne.mockResolvedValue({ username: 'u2', password: hashed, isActive: true });
      const result = await service.validateUser('u2', 'wrong');
      expect(result).toBeNull();
    });
  });

  // ---------- login tests ----------
  describe('login()', () => {
    it('throws when credentials are invalid (no user)', async () => {
      userRepo.findOne.mockResolvedValue(null);
      const badLogin = { username: 'nope', password: 'x' } as unknown as import('./dto/login.dto').LoginDto;
      await expect(service.login(badLogin)).rejects.toThrow();
    });

    it('returns token and user payload when credentials are valid', async () => {
      // Arrange: a valid admin user
      const hashed = await bcrypt.hash('admin123', 1);
      const mockUser: any = {
        id: 'uuid-admin',
        username: 'admin',
        email: 'admin@sgl.com',
        password: hashed,
        isActive: true,
        roles: [{ name: 'Admin' }],
      };
      userRepo.findOne.mockResolvedValue(mockUser);

      const goodLogin = { username: 'admin', password: 'admin123' } as unknown as import('./dto/login.dto').LoginDto;

      // Act
      const res = await service.login(goodLogin);

      // Assert: jwtService.sign was called with payload containing user id and username
      expect(jwtService.sign).toHaveBeenCalledTimes(1);
      const payload = (jwtService.sign as jest.Mock).mock.calls[0][0];
      expect(payload).toMatchObject({ sub: 'uuid-admin', username: 'admin' });

      // Response shape and user fields
      expect(res).toHaveProperty('access_token', 'signed-token');
      expect(res).toHaveProperty('user');
      expect(res.user).toMatchObject({ id: 'uuid-admin', username: 'admin', email: 'admin@sgl.com' });
    });
  });
});
