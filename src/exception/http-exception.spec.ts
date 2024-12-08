// http-exception.spec.ts
import { HttpExceptionFilter } from './http-exception.filter';
import { ArgumentsHost, HttpException } from '@nestjs/common';
import { Response } from 'express';

describe('HttpExceptionFilter', () => {
  let httpExceptionFilter: HttpExceptionFilter;
  let mockArgumentsHost: ArgumentsHost;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    httpExceptionFilter = new HttpExceptionFilter();
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: () => mockResponse,
        getRequest: () => ({ url: '/test-url' }),
      }),
    } as unknown as ArgumentsHost;
  });

  it('should return correct JSON response given an error message string', () => {
    const exception = new HttpException('Test error', 400);
    httpExceptionFilter.catch(exception, mockArgumentsHost);
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: 400,
      message: 'Test error',
      timestamp: expect.any(String),
      path: '/test-url',
    });
  });

  it('should return correct JSON response given an error object', () => {
    const exception = new HttpException({ message: ['Test error'] }, 400);
    httpExceptionFilter.catch(exception, mockArgumentsHost);
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: 400,
      message: 'Test error',
      timestamp: expect.any(String),
      path: '/test-url',
    });
  });
});
