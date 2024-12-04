import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ConfigModule } from '@nestjs/config';
import ormConfig from './config/orm.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeederModule } from './seeder/seeder.module';
import { SitesModule } from './sites/sites.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { JwtService } from '@nestjs/jwt';
/**
 * The AppModule class is the main entry point of the application.
 * It imports and configures various modules necessary for the application to function.
 *
 * The ServeStaticModule is configured to serve static files from the frontend directory.
 *
 * The ConfigModule is used to load and manage environment variables.
 * It is set to be global, so its configuration will be accessible throughout the application.
 *
 * The TypeOrmModule is configured for database access.
 * It uses different configurations based on the current environment (development or production).
 *
 * The AppModule also registers controllers and providers needed by the application.
 *
 * Controllers:
 * - AppController: Handles incoming requests and returns responses.
 *
 * Providers:
 * - AppService: Provides methods and functionalities used by the controller.
 */
@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'frontend', 'browser'),
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [ormConfig],
      expandVariables: true,
      envFilePath:
        process.env.NODE_ENV !== 'production'
          ? `${process.env.NODE_ENV}.env`
          : '.env',
    }),
    TypeOrmModule.forRoot(ormConfig()),
    SeederModule,
    SitesModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
