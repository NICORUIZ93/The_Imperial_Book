// F099 · Error común: agregas un campo al DTO pero OLVIDAS su decorador. Con whitelist + forbidNonWhitelisted,
// class-validator no lo conoce y lo rechaza aunque esté escrito en la clase.
// Ejecuta: npm run build && node dist/f099-dtos/src/error-comun.js
import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { IsString } from 'class-validator';

class ClienteDto {
  @IsString()
  nombre: string;

  telefono: string; // ❌ sin decorador: para class-validator esta propiedad no existe
}

const tuberia = new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true });
try {
  await tuberia.transform({ nombre: 'Ana', telefono: '3001234567' }, { type: 'body', metatype: ClienteDto });
} catch (error) {
  console.log(JSON.stringify((error as { getResponse(): unknown }).getResponse()));
}
