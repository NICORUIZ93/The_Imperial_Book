-- MySQL 9.7: AUTO_INCREMENT, InnoDB y utf8mb4_0900_ai_ci (ignora mayúsculas y tildes al comparar).
CREATE TABLE productos (
    id          BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    sku         VARCHAR(20)  NOT NULL UNIQUE,
    nombre      VARCHAR(80)  NOT NULL,
    stock       INT          NOT NULL DEFAULT 0,
    actualizado TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;
