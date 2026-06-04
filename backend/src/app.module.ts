import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CategoriesModule } from './categories/categories.module';
import { TasksModule } from './tasks/tasks.module';
import { User } from './users/user.entity';
import { UsersModule } from './users/users.module';

const shouldConnectToDatabase =
  Boolean(process.env.DATABASE_URL) || process.env.ENABLE_DATABASE === 'true';

const databaseImports = shouldConnectToDatabase
  ? [
      TypeOrmModule.forRootAsync({
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => {
          const databaseUrl =
            configService.get<string>('DATABASE_URL') ??
            configService.get<string>('LOCAL_DATABASE_URL');

          if (!databaseUrl) {
            throw new Error('DATABASE_URL or LOCAL_DATABASE_URL is required.');
          }

          return {
            type: 'postgres' as const,
            url: databaseUrl,
            entities: [User],
            retryAttempts: 1,
            synchronize: configService.get('DB_SYNCHRONIZE') !== 'false',
          };
        },
      }),
    ]
  : [];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ...databaseImports,
    UsersModule,
    CategoriesModule,
    TasksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
