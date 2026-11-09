create table pedido_importado (
    referencia varchar(40) primary key,
    importe decimal(12, 2) not null
);

create table batch_resumen (total integer not null);

create table batch_rechazo (causa varchar(120) not null);

create table restart_demo (referencia varchar(40) primary key);
