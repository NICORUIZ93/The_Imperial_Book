// F097 · GUARD: decide SI la petición puede llegar al controller (true/false). Corre antes que interceptores y pipes.
import { CanActivate, ExecutionContext, Injectable, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';

export const ROLES = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES, roles); // decorador propio: @Roles('admin')

@Injectable()
export class RolGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {} // inyectado por Nest

  canActivate(contexto: ExecutionContext): boolean {
    const requeridos = this.reflector.getAllAndOverride<string[] | undefined>(ROLES, [contexto.getHandler(), contexto.getClass()]);
    if (!requeridos) return true; // la ruta no pide rol
    const rol = contexto.switchToHttp().getRequest<Request>().header('x-rol');
    return rol !== undefined && requeridos.includes(rol); // false → 403 Forbidden automático
  }
}
