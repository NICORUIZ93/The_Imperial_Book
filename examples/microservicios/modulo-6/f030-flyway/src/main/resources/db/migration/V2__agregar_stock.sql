-- V2: cambio compatible hacia atrás (columna nueva con valor por defecto).
ALTER TABLE productos ADD COLUMN stock INTEGER NOT NULL DEFAULT 0;
UPDATE productos SET stock = 10 WHERE sku = 'CAF-1';
