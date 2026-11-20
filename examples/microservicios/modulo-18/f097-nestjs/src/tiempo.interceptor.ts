// F097 · INTERCEPTOR: envuelve la ejecución del handler (antes y después). Útil para medir, transformar o cachear.
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import type { Response } from 'express';
import { Observable, map, tap } from 'rxjs';

@Injectable()
export class TiempoInterceptor implements NestInterceptor {
  intercept(contexto: ExecutionContext, siguiente: CallHandler): Observable<unknown> {
    const inicio = performance.now();
    const res = contexto.switchToHttp().getResponse<Response>();
    return siguiente.handle().pipe(
      map((datos) => ({ datos })), // DESPUÉS: envuelve la respuesta en { datos: ... }
      tap(() => res.setHeader('x-tiempo-ms', Math.round(performance.now() - inicio).toString())),
    );
  }
}
