import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy, JwtPayload } from './jwt.strategy';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../entities/user/user.entity';
import { Repository } from 'typeorm';
import { UnauthorizedException } from '@nestjs/common';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let userRepo: { findOne: jest.Mock };

  beforeEach(async () => {
    userRepo = { findOne: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: ConfigService, useValue: { get: () => 'test-secret' } },
        { provide: getRepositoryToken(User), useValue: userRepo },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  afterEach(() => jest.resetAllMocks());

  it('returns user payload when user exists and is active', async () => {
    const mockUser: any = {
      id: 'u1',
      username: 'alice',
      email: 'a@x.com',
      isActive: true,
      roles: [{ name: 'User' }],
    };
    userRepo.findOne.mockResolvedValue(mockUser);

    const payload: JwtPayload = { sub: 'u1', username: 'alice', roles: ['User'] };
    const res = await strategy.validate(payload);

    expect(res).toMatchObject({ id: 'u1', username: 'alice', email: 'a@x.com', roles: ['User'] });
  });

  it('throws UnauthorizedException when user not found', async () => {
    userRepo.findOne.mockResolvedValue(null);

    const payload: JwtPayload = { sub: 'no', username: 'x', roles: [] };

    await expect(strategy.validate(payload)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('throws UnauthorizedException when user is inactive', async () => {
    userRepo.findOne.mockResolvedValue({ id: 'u2', isActive: false, roles: [] });

    const payload: JwtPayload = { sub: 'u2', username: 'u2', roles: [] };
    await expect(strategy.validate(payload)).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
