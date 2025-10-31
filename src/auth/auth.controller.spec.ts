import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: { login: jest.Mock };

  beforeEach(async () => {
    authService = { login: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => jest.resetAllMocks());

  it('calls authService.login and returns result', async () => {
    const dto = { username: 'u', password: 'p' } as any;
    authService.login.mockResolvedValue({ access_token: 'tok', user: { id: 'u' } });

    const res = await controller.login(dto);

    expect(authService.login).toHaveBeenCalledWith(dto);
    expect(res).toEqual({ access_token: 'tok', user: { id: 'u' } });
  });
});
