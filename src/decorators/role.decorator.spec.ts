import 'reflect-metadata';
import { SetMetadata } from '@nestjs/common';
import { Role } from './role.decorator';

jest.mock('@nestjs/common', () => ({
  SetMetadata: jest.fn(),
}));

describe('Roles Decorator', () => {
  it('should call SetMetadata with the correct parameters', () => {
    const roles = ['admin', 'user'];
    Role(...roles);

    expect(SetMetadata).toHaveBeenCalledWith('roles', roles);
  });
});
