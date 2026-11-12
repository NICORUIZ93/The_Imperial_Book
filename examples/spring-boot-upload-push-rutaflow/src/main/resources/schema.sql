CREATE TABLE uploads (
    id VARCHAR(36) PRIMARY KEY,
    storage_key VARCHAR(36) NOT NULL UNIQUE,
    media_type VARCHAR(32) NOT NULL,
    byte_count BIGINT NOT NULL,
    width INT NOT NULL,
    height INT NOT NULL
);
