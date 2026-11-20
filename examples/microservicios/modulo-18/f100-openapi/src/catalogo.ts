// Módulo 14 · F100 · OpenAPI/Swagger con @nestjs/swagger 12.1.2 (enfoque code-first: el contrato sale del código).
// Requisitos: NestJS 12.5.1, @nestjs/swagger 12.1.2, class-validator 0.15.1. Compila con npm run build.
import 'reflect-metadata';
import { Body, Controller, Get, HttpCode, Injectable, Module, NotFoundException, Param, ParseIntPipe, Post, ValidationPipe, type INestApplication } from '@nestjs/common';
import { ApiBadRequestResponse, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiProperty, ApiTags, DocumentBuilder, SwaggerModule, type OpenAPIObject } from '@nestjs/swagger';
import { IsIn, IsInt, IsString, Length, Min } from 'class-validator';

// @ApiProperty describe cada campo en el documento OpenAPI; class-validator lo valida en ejecución.
export class CrearProductoDto {
  @ApiProperty({ example: 'Teclado mecánico', minLength: 2, maxLength: 80 })
  @IsString() @Length(2, 80)
  nombre: string;

  @ApiProperty({ example: 250000, minimum: 1, description: 'Precio en pesos, sin decimales' })
  @IsInt() @Min(1)
  precio: number;

  @ApiProperty({ enum: ['hardware', 'software'], example: 'hardware' })
  @IsIn(['hardware', 'software'])
  categoria: 'hardware' | 'software';
}

export class ProductoDto extends CrearProductoDto {
  @ApiProperty({ example: 1 })
  id: number;
}

export class ErrorDto {
  @ApiProperty({ example: 404 }) statusCode: number;
  @ApiProperty({ example: 'No existe el producto 99' }) message: string;
  @ApiProperty({ example: 'Not Found' }) error: string;
}

@Injectable()
export class CatalogoService {
  private readonly productos = new Map<number, ProductoDto>([[1, { id: 1, nombre: 'Teclado mecánico', precio: 250000, categoria: 'hardware' }]]);
  buscar(id: number): ProductoDto {
    const p = this.productos.get(id);
    if (!p) throw new NotFoundException(`No existe el producto ${id}`);
    return p;
  }
  crear(dto: CrearProductoDto): ProductoDto {
    const p = { id: this.productos.size + 1, ...dto };
    this.productos.set(p.id, p);
    return p;
  }
}

@ApiTags('productos') // agrupa las operaciones en la interfaz de Swagger UI
@Controller('productos')
export class CatalogoController {
  constructor(private readonly catalogo: CatalogoService) {}

  @Get(':id')
  @ApiOkResponse({ type: ProductoDto, description: 'El producto' })
  @ApiNotFoundResponse({ type: ErrorDto, description: 'No existe' })
  buscar(@Param('id', ParseIntPipe) id: number): ProductoDto {
    return this.catalogo.buscar(id);
  }

  @Post()
  @HttpCode(201)
  @ApiCreatedResponse({ type: ProductoDto })
  @ApiBadRequestResponse({ description: 'Datos inválidos' })
  crear(@Body() dto: CrearProductoDto): ProductoDto {
    return this.catalogo.crear(dto);
  }
}

@Module({ controllers: [CatalogoController], providers: [CatalogoService] })
export class CatalogoModule {}

// Construye el documento OpenAPI 3 leyendo los decoradores de los controllers y DTOs.
export function documentoOpenApi(app: INestApplication): OpenAPIObject {
  const config = new DocumentBuilder()
    .setTitle('Catálogo')
    .setDescription('API de productos del curso Microservicios de Cero a Maestro')
    .setVersion('1.0.0')
    .build();
  return SwaggerModule.createDocument(app, config);
}

export function configurar(app: INestApplication): void {
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  // Swagger UI en /docs y el JSON en /docs-json (el YAML en /docs-yaml).
  SwaggerModule.setup('docs', app, () => documentoOpenApi(app));
}
