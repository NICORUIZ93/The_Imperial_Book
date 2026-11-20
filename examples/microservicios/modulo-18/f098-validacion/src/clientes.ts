// Módulo 14 · F098 · Validación con class-validator (en NestJS 12.5.1).
// Requisitos: class-validator 0.15.1, class-transformer 0.5.1, @nestjs/common 12.5.1. Compila con npm run build.
import 'reflect-metadata';
import { Body, Controller, HttpCode, Module, Post, ValidationPipe } from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsEmail, IsIn, IsInt, IsOptional, IsString, Length, Min, ValidateNested } from 'class-validator';

export class DireccionDto {
  @IsString() @Length(3, 80)
  calle: string;

  @IsString()
  ciudad: string;
}

// Las reglas viven como DECORADORES sobre las propiedades de una clase.
export class ClienteNuevoDto {
  @IsString() @Length(2, 60, { message: 'nombre: entre 2 y 60 caracteres' })
  nombre: string;

  @IsEmail({}, { message: 'email inválido' })
  email: string;

  @Type(() => Number) @IsInt() @Min(18, { message: 'debe ser mayor de edad' }) // @Type: "30" → 30 con transform
  edad: number;

  @IsOptional() @IsIn(['basico', 'pro'])
  plan?: 'basico' | 'pro';

  @IsOptional() @ValidateNested() @Type(() => DireccionDto) // valida también el objeto anidado
  direccion?: DireccionDto;
}

@Controller('clientes')
export class ClientesController {
  @Post()
  @HttpCode(201)
  crear(@Body() cliente: ClienteNuevoDto) {
    // Si llegamos aquí, `cliente` ya es una instancia de ClienteNuevoDto válida.
    return { recibido: cliente, esInstancia: cliente instanceof ClienteNuevoDto };
  }
}

@Module({ controllers: [ClientesController] })
export class ClientesModule {}

// La pipe GLOBAL que activa class-validator en todos los @Body(), @Query() y @Param().
export const tuberiaDeValidacion = new ValidationPipe({
  whitelist: true,            // borra las propiedades sin decorador…
  forbidNonWhitelisted: true, // …o mejor: responde 400 si llegan (p. ej. "rol": "admin")
  transform: true,            // convierte el JSON plano en instancia de la clase y aplica @Type
});
