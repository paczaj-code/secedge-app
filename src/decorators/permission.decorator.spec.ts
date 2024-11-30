// permission.decorator.spec.ts
import { RequirePermissions } from './permission.decorator';
import { SetMetadata } from '@nestjs/common';

jest.mock('@nestjs/common', () => ({
  SetMetadata: jest.fn(),
}));

describe('RequirePermissions', () => {
  it('should call SetMetadata with the PERMISSION_KEY and provided permissions', () => {
    const PERMISSION_KEY = 'permissions';
    const permissions = ['read', 'write'];

    RequirePermissions(...permissions);

    expect(SetMetadata).toHaveBeenCalledWith(PERMISSION_KEY, permissions);
  });

  it('should allow calling with no permissions', () => {
    const PERMISSION_KEY = 'permissions';
    const permissions: string[] = [];

    RequirePermissions(...permissions);

    expect(SetMetadata).toHaveBeenCalledWith(PERMISSION_KEY, permissions);
  });

  it('should handle a single permission', () => {
    const PERMISSION_KEY = 'permissions';
    const permissions = ['read'];

    RequirePermissions(...permissions);

    expect(SetMetadata).toHaveBeenCalledWith(PERMISSION_KEY, permissions);
  });
});
