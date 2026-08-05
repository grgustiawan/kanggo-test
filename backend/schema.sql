CREATE DATABASE IF NOT EXISTS task_management_system
    CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE task_management_system;

SET NAMES utf8mb4;

-- =====================================================================
-- 1. ORGANIZATIONS
-- =====================================================================
CREATE TABLE organizations (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    uuid            CHAR(36) NOT NULL DEFAULT (UUID()),
    name            VARCHAR(150) NOT NULL,
    slug            VARCHAR(150) NOT NULL,
    status          ENUM(
        'active',
        'suspended',
        'inactive'
    ) NOT NULL DEFAULT 'active',
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at      TIMESTAMP NULL DEFAULT NULL,
    UNIQUE KEY uq_organizations_slug (slug),
    UNIQUE KEY uq_organizations_uuid (uuid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- 2. USERS
-- =====================================================================
CREATE TABLE users (
    id                  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    organization_id     BIGINT UNSIGNED NOT NULL,
    email               VARCHAR(190) NOT NULL,
    password_hash       VARCHAR(255) NOT NULL,
    name           VARCHAR(150) NOT NULL,
    status              ENUM(
        'active',
        'inactive',
        'suspended',
        'deleted'
    ) NOT NULL DEFAULT 'active',
    is_email_verified   TINYINT(1) NOT NULL DEFAULT 1,
    last_login_at       TIMESTAMP NULL DEFAULT NULL,
    last_login_ip       VARCHAR(45) NULL,
    created_by          BIGINT UNSIGNED NULL,
    updated_by          BIGINT UNSIGNED NULL,
    created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at          TIMESTAMP NULL DEFAULT NULL,
    UNIQUE KEY uq_users_org_email (organization_id, email),
    KEY idx_users_org (organization_id),
    KEY idx_users_status (status),
    CONSTRAINT fk_users_org FOREIGN KEY (organization_id) REFERENCES organizations(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- 3. RBAC: roles, permissions, pivot
-- =====================================================================
CREATE TABLE roles (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    organization_id BIGINT UNSIGNED NULL, 
    code            VARCHAR(60) NOT NULL,
    name            VARCHAR(100) NOT NULL,
    description     VARCHAR(255) NULL,
    is_system       TINYINT(1) NOT NULL DEFAULT 0,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_roles_org_code (organization_id, code),
    CONSTRAINT fk_roles_org FOREIGN KEY (organization_id) REFERENCES organizations(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE permissions (
    id          SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code        VARCHAR(100) NOT NULL,      -- 'task.read', 'task.create', 'task.update', 'task.delete'
    module      VARCHAR(60) NOT NULL,
    description VARCHAR(255) NULL,
    UNIQUE KEY uq_permissions_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE role_permissions (
    role_id       INT UNSIGNED NOT NULL,
    permission_id SMALLINT UNSIGNED NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    CONSTRAINT fk_rp_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    CONSTRAINT fk_rp_permission FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE user_roles (
    user_id         BIGINT UNSIGNED NOT NULL,
    role_id         INT UNSIGNED NOT NULL,
    organization_id BIGINT UNSIGNED NOT NULL,
    assigned_by     BIGINT UNSIGNED NULL,
    assigned_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role_id),
    KEY idx_user_roles_org (organization_id),
    CONSTRAINT fk_ur_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_ur_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- 4. TASK
-- =====================================================================
CREATE TABLE tasks (
    id               CHAR(36) NOT NULL DEFAULT (UUID()),
    organization_id  BIGINT UNSIGNED NOT NULL,
    task_number      VARCHAR(50) NOT NULL,
    title            VARCHAR(500) NOT NULL,
    description      MEDIUMTEXT NULL,
    status ENUM(
        'pending',
        'in_progress',
        'done'
    ) NOT NULL DEFAULT 'pending',
    priority ENUM(
        'low',
        'medium',
        'high'
    ) NOT NULL DEFAULT 'medium',
    deadline          DATETIME NULL,
    user_id           BIGINT UNSIGNED NOT NULL,
    created_by        BIGINT UNSIGNED NULL,
    updated_by        BIGINT UNSIGNED NULL,
    deleted_by        BIGINT UNSIGNED NULL,
    created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at        DATETIME NULL,
    PRIMARY KEY (id, created_at),
    UNIQUE KEY uq_tasks_number (organization_id, task_number, created_at),
    KEY idx_tasks_org_status (organization_id, status, created_at),
    KEY idx_tasks_org_priority_status (organization_id, priority, status),
    KEY idx_tasks_user_status (user_id, status, created_at),
    KEY idx_tasks_deadline (organization_id, deadline),
    KEY idx_tasks_deleted (organization_id, deleted_at, created_at),
    KEY idx_tasks_created (organization_id, created_at),
    
    FULLTEXT KEY ft_tasks_title_desc (title) WITH PARSER ngram,

    CONSTRAINT chk_deadline CHECK (deadline IS NULL OR deadline >= created_at),
    CONSTRAINT fk_tasks_org FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT fk_tasks_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_tasks_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_tasks_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_tasks_deleted_by FOREIGN KEY (deleted_by) REFERENCES users(id)ON DELETE SET NULL
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- 5. AUDIT LOGS
-- =====================================================================
CREATE TABLE audit_logs (
    id              BIGINT UNSIGNED AUTO_INCREMENT,
    organization_id BIGINT UNSIGNED NOT NULL,
    entity_type     VARCHAR(60) NOT NULL,    -- 'task','user'
    entity_id       VARCHAR(36) NOT NULL,    -- users.id (as string) atau tasks.id (UUID)
    action          ENUM('insert','update','delete','restore') NOT NULL,
    actor_id        BIGINT UNSIGNED NULL,    
    actor_ip        VARCHAR(45) NULL,
    old_values      JSON NULL,
    new_values      JSON NULL,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id, created_at),
    KEY idx_audit_entity (entity_type, entity_id, created_at),
    KEY idx_audit_org (organization_id, created_at),
    KEY idx_audit_actor (actor_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
PARTITION BY RANGE (TO_DAYS(created_at)) (
    PARTITION p202601 VALUES LESS THAN (TO_DAYS('2026-02-01')),
    PARTITION p202602 VALUES LESS THAN (TO_DAYS('2026-03-01')),
    PARTITION p202603 VALUES LESS THAN (TO_DAYS('2026-04-01')),
    PARTITION p202604 VALUES LESS THAN (TO_DAYS('2026-05-01')),
    PARTITION p202605 VALUES LESS THAN (TO_DAYS('2026-06-01')),
    PARTITION p202606 VALUES LESS THAN (TO_DAYS('2026-07-01')),
    PARTITION p202607 VALUES LESS THAN (TO_DAYS('2026-08-01')),
    PARTITION p202608 VALUES LESS THAN (TO_DAYS('2026-09-01')),
    PARTITION p202609 VALUES LESS THAN (TO_DAYS('2026-10-01')),
    PARTITION p202610 VALUES LESS THAN (TO_DAYS('2026-11-01')),
    PARTITION p202611 VALUES LESS THAN (TO_DAYS('2026-12-01')),
    PARTITION p202612 VALUES LESS THAN (TO_DAYS('2027-01-01')),
    PARTITION p_future VALUES LESS THAN (MAXVALUE)
);

-- =====================================================================
-- 6. ATOMIC TASK NUMBER GENERATOR & ATOMIC TASK INSERT
-- =====================================================================
CREATE TABLE IF NOT EXISTS task_number_sequences (
    organization_id BIGINT UNSIGNED NOT NULL,
    last_number     BIGINT UNSIGNED NOT NULL DEFAULT 0,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                        ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (organization_id),
    CONSTRAINT fk_tns_org FOREIGN KEY (organization_id) REFERENCES organizations(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP PROCEDURE IF EXISTS sp_next_task_number;
DROP PROCEDURE IF EXISTS sp_create_task;

DELIMITER $$

CREATE PROCEDURE sp_next_task_number(
    IN  p_organization_id BIGINT UNSIGNED,
    OUT p_task_number     VARCHAR(50)
)
BEGIN
    DECLARE v_next_number BIGINT UNSIGNED;

    INSERT INTO task_number_sequences (organization_id, last_number)
    VALUES (p_organization_id, LAST_INSERT_ID(1))
    ON DUPLICATE KEY UPDATE last_number = LAST_INSERT_ID(last_number + 1);

    SET v_next_number = LAST_INSERT_ID();

    -- Format: TSK-{organization_id}-{urutan 12 digit, zero-padded}
    SET p_task_number = CONCAT('TSK-', p_organization_id, '-', LPAD(v_next_number, 12, '0'));
END$$

CREATE PROCEDURE sp_create_task(
    IN  p_organization_id BIGINT UNSIGNED,
    IN  p_title           VARCHAR(500),
    IN  p_description     MEDIUMTEXT,
    IN  p_priority        ENUM('low','medium','high'),
    IN  p_deadline        DATETIME,
    IN  p_user_id         BIGINT UNSIGNED,
    IN  p_created_by      BIGINT UNSIGNED,
    OUT p_task_id         CHAR(36),
    OUT p_task_number     VARCHAR(50)
)
BEGIN
    DECLARE v_new_id CHAR(36);
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    SET v_new_id = UUID();

    SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
    START TRANSACTION;

        CALL sp_next_task_number(p_organization_id, p_task_number);

        INSERT INTO tasks (
            id, organization_id, task_number, title, description,
            status, priority, deadline, user_id, created_by
        ) VALUES (
            v_new_id, p_organization_id, p_task_number, p_title, p_description,
            'pending', COALESCE(p_priority, 'medium'), p_deadline, p_user_id, p_created_by
        );

    COMMIT;

    SET p_task_id = v_new_id;
END$$

DELIMITER ;
 
-- =====================================================================
-- 7. AUDIT TRIGGERS: users & tasks -> audit_logs
-- =====================================================================
DROP TRIGGER IF EXISTS trg_users_after_insert;
DROP TRIGGER IF EXISTS trg_users_after_update;
DROP TRIGGER IF EXISTS trg_users_after_delete;
DROP TRIGGER IF EXISTS trg_tasks_after_insert;
DROP TRIGGER IF EXISTS trg_tasks_after_update;
DROP TRIGGER IF EXISTS trg_tasks_after_delete;
 
DELIMITER $$
 
-- =====================================================================
-- 7.1 TRIGGER USERS
-- =====================================================================
CREATE TRIGGER trg_users_after_insert
AFTER INSERT ON users
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (
        organization_id, entity_type, entity_id, action,
        actor_id, actor_ip, old_values, new_values
    ) VALUES (
        NEW.organization_id, 'user', CAST(NEW.id AS CHAR), 'insert',
        @audit_actor_id, @audit_actor_ip,
        NULL,
        JSON_OBJECT(
            'id', NEW.id,
            'organization_id', NEW.organization_id,
            'email', NEW.email,
            'name', NEW.name,
            'status', NEW.status,
            'is_email_verified', NEW.is_email_verified,
            'last_login_at', NEW.last_login_at,
            'last_login_ip', NEW.last_login_ip,
            'created_by', NEW.created_by,
            'updated_by', NEW.updated_by,
            'created_at', NEW.created_at,
            'updated_at', NEW.updated_at,
            'deleted_at', NEW.deleted_at
        )
    );
END$$
 
CREATE TRIGGER trg_users_after_update
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
    DECLARE v_action VARCHAR(10);
 
    IF OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL THEN
        SET v_action = 'delete';
    ELSEIF OLD.deleted_at IS NOT NULL AND NEW.deleted_at IS NULL THEN
        SET v_action = 'restore';
    ELSE
        SET v_action = 'update';
    END IF;
 
    INSERT INTO audit_logs (
        organization_id, entity_type, entity_id, action,
        actor_id, actor_ip, old_values, new_values
    ) VALUES (
        NEW.organization_id, 'user', CAST(NEW.id AS CHAR), v_action,
        @audit_actor_id, @audit_actor_ip,
        JSON_OBJECT(
            'id', OLD.id,
            'organization_id', OLD.organization_id,
            'email', OLD.email,
            'name', OLD.name,
            'status', OLD.status,
            'is_email_verified', OLD.is_email_verified,
            'last_login_at', OLD.last_login_at,
            'last_login_ip', OLD.last_login_ip,
            'created_by', OLD.created_by,
            'updated_by', OLD.updated_by,
            'created_at', OLD.created_at,
            'updated_at', OLD.updated_at,
            'deleted_at', OLD.deleted_at,
            'password_changed', (OLD.password_hash <> NEW.password_hash)
        ),
        JSON_OBJECT(
            'id', NEW.id,
            'organization_id', NEW.organization_id,
            'email', NEW.email,
            'name', NEW.name,
            'status', NEW.status,
            'is_email_verified', NEW.is_email_verified,
            'last_login_at', NEW.last_login_at,
            'last_login_ip', NEW.last_login_ip,
            'created_by', NEW.created_by,
            'updated_by', NEW.updated_by,
            'created_at', NEW.created_at,
            'updated_at', NEW.updated_at,
            'deleted_at', NEW.deleted_at,
            'password_changed', (OLD.password_hash <> NEW.password_hash)
        )
    );
END$$
 
CREATE TRIGGER trg_users_after_delete
AFTER DELETE ON users
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (
        organization_id, entity_type, entity_id, action,
        actor_id, actor_ip, old_values, new_values
    ) VALUES (
        OLD.organization_id, 'user', CAST(OLD.id AS CHAR), 'delete',
        @audit_actor_id, @audit_actor_ip,
        JSON_OBJECT(
            'id', OLD.id,
            'organization_id', OLD.organization_id,
            'email', OLD.email,
            'name', OLD.name,
            'status', OLD.status,
            'is_email_verified', OLD.is_email_verified,
            'last_login_at', OLD.last_login_at,
            'last_login_ip', OLD.last_login_ip,
            'created_by', OLD.created_by,
            'updated_by', OLD.updated_by,
            'created_at', OLD.created_at,
            'updated_at', OLD.updated_at,
            'deleted_at', OLD.deleted_at
        ),
        NULL
    );
END$$
 
-- =====================================================================
-- 7.2 TRIGGER TASKS
-- =====================================================================
CREATE TRIGGER trg_tasks_after_insert
AFTER INSERT ON tasks
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (
        organization_id, entity_type, entity_id, action,
        actor_id, actor_ip, old_values, new_values
    ) VALUES (
        NEW.organization_id, 'task', NEW.id, 'insert',
        @audit_actor_id, @audit_actor_ip,
        NULL,
        JSON_OBJECT(
            'id', NEW.id,
            'organization_id', NEW.organization_id,
            'task_number', NEW.task_number,
            'title', NEW.title,
            'description', NEW.description,
            'status', NEW.status,
            'priority', NEW.priority,
            'deadline', NEW.deadline,
            'user_id', NEW.user_id,
            'created_by', NEW.created_by,
            'updated_by', NEW.updated_by,
            'deleted_by', NEW.deleted_by,
            'created_at', NEW.created_at,
            'updated_at', NEW.updated_at,
            'deleted_at', NEW.deleted_at
        )
    );
END$$
 
CREATE TRIGGER trg_tasks_after_update
AFTER UPDATE ON tasks
FOR EACH ROW
BEGIN
    DECLARE v_action VARCHAR(10);
 
    IF OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL THEN
        SET v_action = 'delete';
    ELSEIF OLD.deleted_at IS NOT NULL AND NEW.deleted_at IS NULL THEN
        SET v_action = 'restore';
    ELSE
        SET v_action = 'update';
    END IF;
 
    INSERT INTO audit_logs (
        organization_id, entity_type, entity_id, action,
        actor_id, actor_ip, old_values, new_values
    ) VALUES (
        NEW.organization_id, 'task', NEW.id, v_action,
        @audit_actor_id, @audit_actor_ip,
        JSON_OBJECT(
            'id', OLD.id,
            'organization_id', OLD.organization_id,
            'task_number', OLD.task_number,
            'title', OLD.title,
            'description', OLD.description,
            'status', OLD.status,
            'priority', OLD.priority,
            'deadline', OLD.deadline,
            'user_id', OLD.user_id,
            'created_by', OLD.created_by,
            'updated_by', OLD.updated_by,
            'deleted_by', OLD.deleted_by,
            'created_at', OLD.created_at,
            'updated_at', OLD.updated_at,
            'deleted_at', OLD.deleted_at
        ),
        JSON_OBJECT(
            'id', NEW.id,
            'organization_id', NEW.organization_id,
            'task_number', NEW.task_number,
            'title', NEW.title,
            'description', NEW.description,
            'status', NEW.status,
            'priority', NEW.priority,
            'deadline', NEW.deadline,
            'user_id', NEW.user_id,
            'created_by', NEW.created_by,
            'updated_by', NEW.updated_by,
            'deleted_by', NEW.deleted_by,
            'created_at', NEW.created_at,
            'updated_at', NEW.updated_at,
            'deleted_at', NEW.deleted_at
        )
    );
END$$
 
CREATE TRIGGER trg_tasks_after_delete
AFTER DELETE ON tasks
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (
        organization_id, entity_type, entity_id, action,
        actor_id, actor_ip, old_values, new_values
    ) VALUES (
        OLD.organization_id, 'task', OLD.id, 'delete',
        @audit_actor_id, @audit_actor_ip,
        JSON_OBJECT(
            'id', OLD.id,
            'organization_id', OLD.organization_id,
            'task_number', OLD.task_number,
            'title', OLD.title,
            'description', OLD.description,
            'status', OLD.status,
            'priority', OLD.priority,
            'deadline', OLD.deadline,
            'user_id', OLD.user_id,
            'created_by', OLD.created_by,
            'updated_by', OLD.updated_by,
            'deleted_by', OLD.deleted_by,
            'created_at', OLD.created_at,
            'updated_at', OLD.updated_at,
            'deleted_at', OLD.deleted_at
        ),
        NULL
    );
END$$
 
DELIMITER ;

-- =====================================================================
-- 8. PARTITION AUTO-MAINTENANCE
-- =====================================================================
CREATE TABLE IF NOT EXISTS partition_maintenance_log (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    table_name      VARCHAR(64) NOT NULL,
    partition_name  VARCHAR(64) NOT NULL,   
    boundary_date   DATE NOT NULL,          
    executed_sql    TEXT NOT NULL,        
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_pml_table (table_name, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP PROCEDURE IF EXISTS sp_ensure_future_partitions;

DELIMITER $$

CREATE PROCEDURE sp_ensure_future_partitions(
    IN p_table_name   VARCHAR(64),
    IN p_months_ahead INT UNSIGNED
)
proc_block: BEGIN
    DECLARE v_db_name              VARCHAR(64);
    DECLARE v_last_partition       VARCHAR(64);
    DECLARE v_last_year            INT;
    DECLARE v_last_month           INT;
    DECLARE v_last_boundary        DATE;
    DECLARE v_target_boundary      DATE;
    DECLARE v_new_boundary_date    DATE;
    DECLARE v_new_partition_name   VARCHAR(64);
    DECLARE v_new_upper_bound      DATE;
    DECLARE v_has_future_partition INT DEFAULT 0;
    DECLARE v_sql                  TEXT;

    SET v_db_name = DATABASE();

    SELECT COUNT(*) INTO v_has_future_partition
    FROM information_schema.PARTITIONS
    WHERE TABLE_SCHEMA = v_db_name
      AND TABLE_NAME    = p_table_name
      AND PARTITION_NAME = 'p_future';

    IF v_has_future_partition = 0 THEN
        INSERT INTO partition_maintenance_log (table_name, partition_name, boundary_date, executed_sql)
        VALUES (p_table_name, 'SKIPPED', CURDATE(), 'Table has no p_future partition to reorganize');
        LEAVE proc_block;
    END IF;

    SELECT PARTITION_NAME INTO v_last_partition
    FROM information_schema.PARTITIONS
    WHERE TABLE_SCHEMA = v_db_name
      AND TABLE_NAME    = p_table_name
      AND PARTITION_NAME REGEXP '^p[0-9]{6}$'
    ORDER BY PARTITION_NAME DESC
    LIMIT 1;

    IF v_last_partition IS NULL THEN
        SET v_last_boundary = DATE_FORMAT(CURDATE(), '%Y-%m-01');
    ELSE
        SET v_last_year  = CAST(SUBSTRING(v_last_partition, 2, 4) AS UNSIGNED);
        SET v_last_month = CAST(SUBSTRING(v_last_partition, 6, 2) AS UNSIGNED);
        SET v_last_boundary = DATE_ADD(
            STR_TO_DATE(CONCAT(v_last_year, '-', v_last_month, '-01'), '%Y-%m-%d'),
            INTERVAL 1 MONTH
        );
    END IF;

    SET v_target_boundary = DATE_ADD(
        DATE_FORMAT(CURDATE(), '%Y-%m-01'),
        INTERVAL (p_months_ahead + 1) MONTH
    );

    WHILE v_last_boundary < v_target_boundary DO
        SET v_new_boundary_date  = v_last_boundary;
        SET v_new_partition_name = CONCAT('p', DATE_FORMAT(v_new_boundary_date, '%Y%m'));
        SET v_new_upper_bound    = DATE_ADD(v_new_boundary_date, INTERVAL 1 MONTH);

        IF NOT EXISTS (
            SELECT 1 FROM information_schema.PARTITIONS
            WHERE TABLE_SCHEMA = v_db_name
              AND TABLE_NAME = p_table_name
              AND PARTITION_NAME = v_new_partition_name
        ) THEN
            SET v_sql = CONCAT(
                'ALTER TABLE `', v_db_name, '`.`', p_table_name, '` ',
                'REORGANIZE PARTITION p_future INTO (',
                'PARTITION ', v_new_partition_name, ' VALUES LESS THAN (TO_DAYS(', QUOTE(v_new_upper_bound), ')), ',
                'PARTITION p_future VALUES LESS THAN MAXVALUE)'
            );

            SET @pmt_sql = v_sql;
            PREPARE stmt FROM @pmt_sql;
            EXECUTE stmt;
            DEALLOCATE PREPARE stmt;

            INSERT INTO partition_maintenance_log (table_name, partition_name, boundary_date, executed_sql)
            VALUES (p_table_name, v_new_partition_name, v_new_upper_bound, v_sql);
        END IF;

        SET v_last_boundary = DATE_ADD(v_last_boundary, INTERVAL 1 MONTH);
    END WHILE;
END proc_block $$

DELIMITER ;

DROP PROCEDURE IF EXISTS sp_run_partition_maintenance;

DELIMITER $$

CREATE PROCEDURE sp_run_partition_maintenance()
BEGIN
    DECLARE v_err_msg TEXT DEFAULT NULL;

    tasks_block: BEGIN
        DECLARE CONTINUE HANDLER FOR SQLEXCEPTION
        BEGIN
            GET DIAGNOSTICS CONDITION 1 v_err_msg = MESSAGE_TEXT;
            INSERT INTO partition_maintenance_log (table_name, partition_name, boundary_date, executed_sql)
            VALUES ('tasks', 'ERROR', CURDATE(), v_err_msg);
        END;
        CALL sp_ensure_future_partitions('tasks', 3);
    END tasks_block;

    audit_logs_block: BEGIN
        DECLARE CONTINUE HANDLER FOR SQLEXCEPTION
        BEGIN
            GET DIAGNOSTICS CONDITION 1 v_err_msg = MESSAGE_TEXT;
            INSERT INTO partition_maintenance_log (table_name, partition_name, boundary_date, executed_sql)
            VALUES ('audit_logs', 'ERROR', CURDATE(), v_err_msg);
        END;
        CALL sp_ensure_future_partitions('audit_logs', 3);
    END audit_logs_block;
END $$

DELIMITER ;

DROP EVENT IF EXISTS evt_partition_maintenance;

CREATE EVENT evt_partition_maintenance
ON SCHEDULE EVERY 1 MONTH
STARTS (DATE_ADD(DATE_FORMAT(CURDATE(), '%Y-%m-01'), INTERVAL 1 MONTH) + INTERVAL 2 HOUR)
ON COMPLETION PRESERVE
ENABLE
DO
    CALL sp_run_partition_maintenance();


CALL sp_run_partition_maintenance();