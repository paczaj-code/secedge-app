import { UuidValidationPipePipe } from './uuid-validation-pipe.pipe';
import { HttpException, HttpStatus } from '@nestjs/common'; // Added imports for HttpException and HttpStatus

describe('UuidValidationPipePipe', () => {
  let pipe: UuidValidationPipePipe;

  beforeEach(() => {
    pipe = new UuidValidationPipePipe();
  });

  it('should be defined', () => {
    expect(pipe).toBeDefined();
  });

  it('should return the value if it is a valid UUID', () => {
    const validUuid = '123e4567-e89b-12d3-a456-426614174000';
    const transformedValue = pipe.transform(validUuid, {
      type: 'param',
    } as any);
    expect(transformedValue).toBe(validUuid);
  });

  it('should throw HttpException if the value is not a valid UUID', () => {
    const invalidUuid = 'invalid-uuid';
    try {
      pipe.transform(invalidUuid, { type: 'param' } as any);
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect(error.message).toBe('Validation failed: given UUId is invalid');
      expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
    }
  });
});
