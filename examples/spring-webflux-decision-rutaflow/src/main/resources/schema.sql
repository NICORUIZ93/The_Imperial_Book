CREATE TABLE IF NOT EXISTS delivery (
  tracking_code VARCHAR(40) PRIMARY KEY,
  status VARCHAR(30) NOT NULL
);

MERGE INTO delivery (tracking_code, status) KEY (tracking_code)
VALUES ('RF-001', 'IN_ROUTE');
