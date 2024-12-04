import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    // const { message toLowerCase Object} = exception.getResponse();

    const responseMessage = exception.getResponse();
    const message =
      typeof responseMessage === 'string'
        ? responseMessage
        : (responseMessage as { message: string }).message[0];
    console.log(message[0] as string);
    // console.log({
    //   ...response.header('Content-Type', 'application/json; charset=utf-8'),
    // });
    response.status(status).json({
      statusCode: status,
      message: message as string,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
