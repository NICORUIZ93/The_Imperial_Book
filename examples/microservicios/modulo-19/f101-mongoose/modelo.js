// Módulo 15 · F101 · MongoDB + Mongoose: el ESQUEMA y el MODELO de un producto del catálogo.
// Requisitos: Node.js 26.13.1 LTS, mongoose 9.12.2 (trae el driver mongodb 7.x). MongoDB 9.0.8 con Docker Compose.
import mongoose from 'mongoose';

const { Schema } = mongoose;

// El esquema es el «formulario» que Mongoose exige ANTES de enviar nada a MongoDB (MongoDB por sí solo no exige forma).
const productoSchema = new Schema(
  {
    sku: { type: String, required: true, unique: true, uppercase: true, trim: true }, // unique crea un ÍNDICE único
    nombre: { type: String, required: [true, 'El nombre es obligatorio'], minlength: 3 },
    precio: { type: Number, required: true, min: [0, 'El precio no puede ser negativo'] },
    stock: { type: Number, default: 0, min: 0 },
    etiquetas: { type: [String], default: [] },
    // Documento EMBEBIDO: vive dentro del producto, se lee y se escribe con él (no hay JOIN).
    proveedor: {
      nombre: { type: String, required: true },
      pais: { type: String, default: 'CO' },
    },
  },
  {
    timestamps: true, // añade createdAt y updatedAt
    strict: 'throw', // un campo que no está en el esquema es un ERROR (por defecto se descarta en silencio)
  },
);

// Índice compuesto para la consulta más frecuente del catálogo: «productos con esta etiqueta, del más barato al más caro».
productoSchema.index({ etiquetas: 1, precio: 1 });

// Propiedad virtual: se calcula al leer, no se guarda.
productoSchema.virtual('agotado').get(function () {
  return this.stock === 0;
});

export const Producto = mongoose.model('Producto', productoSchema); // colección «productos»
