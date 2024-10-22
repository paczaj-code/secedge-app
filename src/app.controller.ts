import { Controller, Get } from '@nestjs/common';

/**
 * The AppController class handles incoming HTTP requests related to the application's API.
 * It is annotated with the @Controller decorator, indicating that it is a NestJS controller
 * that listens for requests at the specified route.
 *
 * This class is intended to centralize and manage various endpoints and related logic for
 * the application's functionalities.
 */
@Controller('')
export class AppController {
  @Get('/')
  sss() {
    return 'ok';
  }
}
