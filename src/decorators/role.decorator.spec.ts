import 'reflect-metadata';
import { SetMetadata } from '@nestjs/common';
import { Roles } from './role.decorator';

jest.mock('@nestjs/common', () => ({
  SetMetadata: jest.fn(),
}));

describe('Roles Decorator', () => {
  it('should call SetMetadata with the correct parameters', () => {
    const roles = ['admin', 'user'];
    Roles(...roles);

    expect(SetMetadata).toHaveBeenCalledWith('roles', roles);
  });
});
