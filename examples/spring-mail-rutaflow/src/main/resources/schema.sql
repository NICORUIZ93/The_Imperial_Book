CREATE TABLE envio (
    envio_id UUID PRIMARY KEY,
    referencia VARCHAR(80) NOT NULL UNIQUE
);

CREATE TABLE correo_outbox (
    event_id UUID PRIMARY KEY,
    envio_id UUID NOT NULL REFERENCES envio(envio_id),
    destinatario VARCHAR(320) NOT NULL,
    asunto VARCHAR(200) NOT NULL,
    cuerpo VARCHAR(2000) NOT NULL,
    intentos INT NOT NULL DEFAULT 0,
    next_attempt_at TIMESTAMP WITH TIME ZONE NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE,
    dead_lettered_at TIMESTAMP WITH TIME ZONE,
    last_error VARCHAR(120)
);
