// Módulo 14 · F099 · DTOs (Data Transfer Objects): la forma de los datos que ENTRAN y SALEN por la API,
// separada de la entidad interna. Requisitos: NestJS 12.5.1, @nestjs/mapped-types 12.0.1, class-validator 0.15.1.
import 'reflect-metadata';
import { Body, Controller, Get, HttpCode, Injectable, Module, NotFoundException, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { OmitType, PartialType } from '@nestjs/mapped-types';
import { IsEmail, IsString, Length } from 'class-validator';
import { createHash } from 'node:crypto';

// ENTIDAD: cómo guardamos al usuario por dentro. Tiene campos que NUNCA deben salir ni entrar por la API.
export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  passwordHash: string;
  rol: 'cliente' | 'admin';
  creadoEn: Date;
}

// DTO DE ENTRADA para crear: solo lo que el cliente puede enviar. No hay `rol` ni `id`.
export class CrearUsuarioDto {
  @IsString() @Length(2, 60)
  nombre: string;

  @IsEmail()
  email: string;

  @IsString() @Length(12, 128)
  password: string;
}

// DTO DE ENTRADA para actualizar: todo opcional y sin password (se cambia por otro endpoint).
// PartialType y OmitType copian las reglas de validación de CrearUsuarioDto: no se repiten.
export class ActualizarUsuarioDto extends PartialType(OmitType(CrearUsuarioDto, ['password'] as const)) {}

// DTO DE SALIDA: lo que el cliente ve. Se construye a mano desde la entidad (mapper explícito).
export class UsuarioRespuestaDto {
  id: number;
  nombre: string;
  email: string;
  miembroDesde: string; // renombrado y formateado: la API no tiene por qué copiar la base de datos

  static desde(u: Usuario): UsuarioRespuestaDto {
    return { id: u.id, nombre: u.nombre, email: u.email, miembroDesde: u.creadoEn.toISOString().slice(0, 10) };
  }
}

@Injectable()
export class UsuariosService {
  private readonly usuarios = new Map<number, Usuario>();

  crear(dto: CrearUsuarioDto): Usuario {
    const usuario: Usuario = {
      id: this.usuarios.size + 1,
      nombre: dto.nombre,
      email: dto.email,
      passwordHash: createHash('sha256').update(dto.password).digest('hex'), // solo ilustrativo: usa argon2/bcrypt (Módulo 20)
      rol: 'cliente', // lo decide el servidor, nunca el cuerpo de la petición
      creadoEn: new Date('2026-11-19T12:00:00Z'),
    };
    this.usuarios.set(usuario.id, usuario);
    return usuario;
  }

  actualizar(id: number, cambios: ActualizarUsuarioDto): Usuario {
    const usuario = this.buscar(id);
    Object.assign(usuario, cambios); // seguro: ValidationPipe ya quitó todo lo que no está en el DTO
    return usuario;
  }

  buscar(id: number): Usuario {
    const usuario = this.usuarios.get(id);
    if (!usuario) throw new NotFoundException(`No existe el usuario ${id}`);
    return usuario;
  }
}

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly servicio: UsuariosService) {}

  @Post()
  @HttpCode(201)
  crear(@Body() dto: CrearUsuarioDto): UsuarioRespuestaDto {
    return UsuarioRespuestaDto.desde(this.servicio.crear(dto));
  }

  @Patch(':id')
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() dto: ActualizarUsuarioDto): UsuarioRespuestaDto {
    return UsuarioRespuestaDto.desde(this.servicio.actualizar(id, dto));
  }

  @Get(':id')
  buscar(@Param('id', ParseIntPipe) id: number): UsuarioRespuestaDto {
    return UsuarioRespuestaDto.desde(this.servicio.buscar(id));
  }
}

@Module({ controllers: [UsuariosController], providers: [UsuariosService] })
export class UsuariosModule {}
