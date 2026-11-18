CREATE TABLE IF NOT EXISTS inventory_reservation (
    id VARCHAR(100) PRIMARY KEY,
    released BOOLEAN NOT NULL,
    release_count INT NOT NULL
);

CREATE TABLE IF NOT EXISTS compensation_job (
    id VARCHAR(100) PRIMARY KEY,
    reservation_id VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL
);
