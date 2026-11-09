create table pedido_importado (
    referencia varchar(40) primary key,
    importe decimal(12, 2) not null
);

create table batch_resumen (total integer not null);
