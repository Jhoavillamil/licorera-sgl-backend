import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: { getAllAndOverride: jest.Mock };

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() };
    guard = new RolesGuard(reflector as unknown as Reflector);
  });

  it('allows when no roles are required', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);

    const ctx = {
      getHandler: () => {},
      getClass: () => {},
      switchToHttp: () => ({ getRequest: () => ({}) }),
    } as unknown as ExecutionContext;

    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('denies when user missing or roles not array', () => {
    reflector.getAllAndOverride.mockReturnValue(['Admin']);

    const ctx = {
      getHandler: () => {},
      getClass: () => {},
      switchToHttp: () => ({ getRequest: () => ({}) }),
    } as unknown as ExecutionContext;

    expect(guard.canActivate(ctx)).toBe(false);
  });

  it('allows when user has required role', () => {
    reflector.getAllAndOverride.mockReturnValue(['Admin']);

    const ctx = {
      getHandler: () => {},
      getClass: () => {},
      switchToHttp: () => ({ getRequest: () => ({ user: { roles: ['Admin', 'User'] } }) }),
    } as unknown as ExecutionContext;

    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('denies when user does not have required role', () => {
    reflector.getAllAndOverride.mockReturnValue(['Owner']);

    const ctx = {
      getHandler: () => {},
      getClass: () => {},
      switchToHttp: () => ({ getRequest: () => ({ user: { roles: ['User'] } }) }),
    } as unknown as ExecutionContext;

    expect(guard.canActivate(ctx)).toBe(false);
  });
});
