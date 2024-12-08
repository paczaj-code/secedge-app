import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleGuard } from './role.quard';
import { AuthService } from '../auth.service';
import { Role } from '../../enums/role.enum';

describe('RoleGuard', () => {
  let roleGuard: RoleGuard;
  let reflector: Reflector;
  let authService: AuthService;

  beforeEach(() => {
    reflector = new Reflector();
    authService = {
      verifyAccessToken: jest.fn(),
    } as unknown as AuthService;
    roleGuard = new RoleGuard(reflector, authService);
  });

  function createExecutionContext(headers: {
    [key: string]: string;
  }): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          headers,
        }),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext;
  }

  it('should return false if no token is provided', () => {
    const context = createExecutionContext({});
    expect(roleGuard.canActivate(context)).toBe(false);
  });

  it('should return false if token verification fails', () => {
    jest.spyOn(authService, 'verifyAccessToken').mockImplementation(() => {
      throw new Error('Invalid token');
    });
    const context = createExecutionContext({
      authorization: 'Bearer invalidToken',
    });
    expect(roleGuard.canActivate(context)).toBe(false);
  });

  it('should return false if user does not have sufficient role', () => {
    jest
      .spyOn(authService, 'verifyAccessToken')
      .mockReturnValue({ role: Role.OFFICER });
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.ADMIN]);

    const context = createExecutionContext({
      authorization: 'Bearer validToken',
    });
    expect(roleGuard.canActivate(context)).toBe(true);
  });

  it('should return true if user has sufficient role', () => {
    jest
      .spyOn(authService, 'verifyAccessToken')
      .mockReturnValue({ role: Role.ADMIN });
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.OFFICER]);

    const context = createExecutionContext({
      authorization: 'Bearer validToken',
    });
    expect(roleGuard.canActivate(context)).toBe(false);
  });
});
