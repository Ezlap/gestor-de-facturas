import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthController } from './health.controller';
import { FacturasModule } from './facturas/facturas.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync ({
      inject: [ConfigService],
      useFactory: (c: ConfigService) => ({
        type: 'mssql',
        host: c.get('DB_HOST'),
        port: Number(c.get('DB_PORT')),
        username: c.get('DB_USER'),
        password: c.get('DB_PASSWORD'),
        database: c.get('DB_NAME'),
        autoLoadEntities: true,
        synchronize: false,
        options: { encrypt: false, trustServerCertificate: true },
      }),
    }),
    FacturasModule
  ],
  controllers: [HealthController],
})
export class AppModule {}
