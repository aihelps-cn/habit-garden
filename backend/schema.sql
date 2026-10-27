CREATE TABLE IF NOT EXISTS users (
 id CHAR(36) PRIMARY KEY,
 username VARCHAR(40) NOT NULL UNIQUE,
 password_hash VARCHAR(255) NOT NULL,
 name VARCHAR(40) NOT NULL,
 avatar VARCHAR(32) NOT NULL DEFAULT '🌱',
 role ENUM('parent','child') NOT NULL,
 balance BIGINT NOT NULL DEFAULT 0,
 auto_submit BOOLEAN NOT NULL DEFAULT TRUE,
 created_at DATETIME(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS sessions (
 token_hash CHAR(64) PRIMARY KEY,
 user_id CHAR(36) NOT NULL,
 expires_at DATETIME(3) NULL,
 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
 INDEX (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS family_links (
 child_id CHAR(36) NOT NULL,
 parent_id CHAR(36) NOT NULL,
 created_at DATETIME(3) NOT NULL,
 PRIMARY KEY (child_id,parent_id),
 FOREIGN KEY (child_id) REFERENCES users(id),
 FOREIGN KEY (parent_id) REFERENCES users(id),
 INDEX (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS invitations (
 code_hash CHAR(64) PRIMARY KEY,
 child_id CHAR(36) NOT NULL,
 expires_at DATETIME(3) NOT NULL,
 used_at DATETIME(3),
 FOREIGN KEY (child_id) REFERENCES users(id),
 INDEX (child_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS tasks (
 id CHAR(36) PRIMARY KEY,
 child_id CHAR(36) NOT NULL,
 name VARCHAR(60) NOT NULL,
 icon VARCHAR(32) NOT NULL,
 category VARCHAR(20) NOT NULL,
 points INT NOT NULL,
 note VARCHAR(200) NOT NULL DEFAULT '',
 active BOOLEAN NOT NULL DEFAULT TRUE,
 updated_by CHAR(36) NOT NULL,
 created_at DATETIME(3) NOT NULL,
 FOREIGN KEY (child_id) REFERENCES users(id),
 FOREIGN KEY (updated_by) REFERENCES users(id),
 CONSTRAINT positive_task_points CHECK (points > 0),
 INDEX (child_id,active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS checkins (
 id CHAR(36) PRIMARY KEY,
 child_id CHAR(36) NOT NULL,
 task_id CHAR(36) NOT NULL,
 day DATE NOT NULL,
 task_name VARCHAR(60) NOT NULL,
 icon VARCHAR(32) NOT NULL,
 points INT NOT NULL,
 note VARCHAR(500) NOT NULL DEFAULT '',
 status ENUM('draft','pending','approved','rejected') NOT NULL DEFAULT 'draft',
 submission_mode ENUM('manual','auto') NULL,
 submitted_at DATETIME(3),
 review_deadline DATETIME(3),
 reviewed_at DATETIME(3),
 reviewed_by CHAR(36),
 review_reason VARCHAR(300) NOT NULL DEFAULT '',
 auto_approved BOOLEAN NOT NULL DEFAULT FALSE,
 created_at DATETIME(3) NOT NULL,
 FOREIGN KEY (child_id) REFERENCES users(id),
 FOREIGN KEY (task_id) REFERENCES tasks(id),
 FOREIGN KEY (reviewed_by) REFERENCES users(id),
 UNIQUE KEY daily_task (task_id,day),
 INDEX due_review (status,review_deadline),
 INDEX due_submit (status,day),
 INDEX child_history (child_id,created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS rewards (
 id CHAR(36) PRIMARY KEY,
 child_id CHAR(36) NOT NULL,
 name VARCHAR(60) NOT NULL,
 icon VARCHAR(32) NOT NULL,
 type ENUM('reward','cash') NOT NULL,
 cost INT NOT NULL,
 note VARCHAR(200) NOT NULL DEFAULT '',
 active BOOLEAN NOT NULL DEFAULT TRUE,
 updated_by CHAR(36) NOT NULL,
 created_at DATETIME(3) NOT NULL,
 FOREIGN KEY (child_id) REFERENCES users(id),
 FOREIGN KEY (updated_by) REFERENCES users(id),
 CONSTRAINT positive_reward_cost CHECK (cost > 0),
 INDEX (child_id,active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS orders (
 id CHAR(36) PRIMARY KEY,
 child_id CHAR(36) NOT NULL,
 reward_id CHAR(36) NOT NULL,
 title VARCHAR(100) NOT NULL,
 icon VARCHAR(32) NOT NULL,
 type ENUM('reward','cash') NOT NULL,
 cost INT NOT NULL,
 status ENUM('pending','fulfilled','cancelled') NOT NULL DEFAULT 'pending',
 request_key CHAR(36) NOT NULL UNIQUE,
 created_at DATETIME(3) NOT NULL,
 handled_at DATETIME(3),
 handled_by CHAR(36),
 FOREIGN KEY (child_id) REFERENCES users(id),
 FOREIGN KEY (reward_id) REFERENCES rewards(id),
 FOREIGN KEY (handled_by) REFERENCES users(id),
 INDEX (child_id,created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS ledger (
 id CHAR(36) PRIMARY KEY,
 child_id CHAR(36) NOT NULL,
 amount INT NOT NULL,
 balance_after BIGINT NOT NULL,
 title VARCHAR(200) NOT NULL,
 kind ENUM('checkin','adjust','redeem','refund') NOT NULL,
 source_key VARCHAR(100) NOT NULL UNIQUE,
 actor_id CHAR(36),
 created_at DATETIME(3) NOT NULL,
 FOREIGN KEY (child_id) REFERENCES users(id),
 FOREIGN KEY (actor_id) REFERENCES users(id),
 INDEX (child_id,created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
