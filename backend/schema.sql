-- Schema for factors and ledger

CREATE TABLE IF NOT EXISTS factors (
  id VARCHAR(64) PRIMARY KEY,
  category VARCHAR(64),
  unit VARCHAR(32),
  value DOUBLE,
  source VARCHAR(256),
  region VARCHAR(64),
  version VARCHAR(32),
  effective_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS ledger (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id VARCHAR(128),
  type VARCHAR(64),
  amount DOUBLE,
  unit VARCHAR(32),
  meta JSON,
  kgco2e DOUBLE,
  scope VARCHAR(32),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
