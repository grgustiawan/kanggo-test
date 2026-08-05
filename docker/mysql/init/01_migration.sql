CREATE TABLE `organizations` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`uuid` char(36) NOT NULL DEFAULT (UUID()),
	`name` varchar(150) NOT NULL,
	`slug` varchar(150) NOT NULL,
	`status` enum('active','suspended','inactive') NOT NULL DEFAULT 'active',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `organizations_id` PRIMARY KEY(`id`),
	CONSTRAINT `uq_organizations_slug` UNIQUE(`slug`),
	CONSTRAINT `uq_organizations_uuid` UNIQUE(`uuid`)
);
CREATE TABLE `users` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`organization_id` bigint unsigned NOT NULL,
	`email` varchar(190) NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	`name` varchar(150) NOT NULL,
	`status` enum('active','inactive','suspended','deleted') NOT NULL DEFAULT 'active',
	`is_email_verified` tinyint NOT NULL DEFAULT 1,
	`last_login_at` timestamp,
	`last_login_ip` varchar(45),
	`created_by` bigint unsigned,
	`updated_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `uq_users_org_email` UNIQUE(`organization_id`,`email`)
);
CREATE TABLE `permissions` (
	`id` smallint unsigned AUTO_INCREMENT NOT NULL,
	`code` varchar(100) NOT NULL,
	`module` varchar(60) NOT NULL,
	`description` varchar(255),
	CONSTRAINT `permissions_id` PRIMARY KEY(`id`),
	CONSTRAINT `uq_permissions_code` UNIQUE(`code`)
);
CREATE TABLE `role_permissions` (
	`role_id` int unsigned NOT NULL,
	`permission_id` smallint unsigned NOT NULL,
	CONSTRAINT `role_permissions_role_id_permission_id_pk` PRIMARY KEY(`role_id`,`permission_id`)
);
CREATE TABLE `roles` (
	`id` int unsigned AUTO_INCREMENT NOT NULL,
	`organization_id` bigint unsigned,
	`code` varchar(60) NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` varchar(255),
	`is_system` tinyint NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `roles_id` PRIMARY KEY(`id`),
	CONSTRAINT `uq_roles_org_code` UNIQUE(`organization_id`,`code`)
);
CREATE TABLE `user_roles` (
	`user_id` bigint unsigned NOT NULL,
	`role_id` int unsigned NOT NULL,
	`organization_id` bigint unsigned NOT NULL,
	`assigned_by` bigint unsigned,
	`assigned_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_roles_user_id_role_id_pk` PRIMARY KEY(`user_id`,`role_id`)
);
CREATE TABLE `task_number_sequences` (
	`organization_id` bigint unsigned NOT NULL,
	`last_number` bigint unsigned NOT NULL DEFAULT 0,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `task_number_sequences_organization_id` PRIMARY KEY(`organization_id`)
);
CREATE TABLE `tasks` (
	`id` char(36) NOT NULL DEFAULT (UUID()),
	`organization_id` bigint unsigned NOT NULL,
	`task_number` varchar(50) NOT NULL,
	`title` varchar(500) NOT NULL,
	`description` mediumtext,
	`status` enum('pending','in_progress','done') NOT NULL DEFAULT 'pending',
	`priority` enum('low','medium','high') NOT NULL DEFAULT 'medium',
	`deadline` datetime,
	`user_id` bigint unsigned NOT NULL,
	`created_by` bigint unsigned,
	`updated_by` bigint unsigned,
	`deleted_by` bigint unsigned,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` datetime,
	CONSTRAINT `tasks_id_created_at_pk` PRIMARY KEY(`id`,`created_at`),
	CONSTRAINT `uq_tasks_number` UNIQUE(`organization_id`,`task_number`,`created_at`)
);
CREATE TABLE `audit_logs` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`organization_id` bigint unsigned NOT NULL,
	`entity_type` varchar(60) NOT NULL,
	`entity_id` varchar(36) NOT NULL,
	`action` enum('insert','update','delete','restore') NOT NULL,
	`actor_id` bigint unsigned,
	`actor_ip` varchar(45),
	`old_values` json,
	`new_values` json,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `audit_logs_id_created_at_pk` PRIMARY KEY(`id`,`created_at`)
);
CREATE TABLE `partition_maintenance_log` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`table_name` varchar(64) NOT NULL,
	`partition_name` varchar(64) NOT NULL,
	`boundary_date` date NOT NULL,
	`executed_sql` text NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `partition_maintenance_log_id` PRIMARY KEY(`id`)
);
ALTER TABLE `users` ADD CONSTRAINT `users_organization_id_organizations_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `role_permissions` ADD CONSTRAINT `role_permissions_role_id_roles_id_fk` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `role_permissions` ADD CONSTRAINT `role_permissions_permission_id_permissions_id_fk` FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `roles` ADD CONSTRAINT `roles_organization_id_organizations_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_roles` ADD CONSTRAINT `user_roles_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_roles` ADD CONSTRAINT `user_roles_role_id_roles_id_fk` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `task_number_sequences` ADD CONSTRAINT `task_number_sequences_organization_id_organizations_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tasks` ADD CONSTRAINT `tasks_organization_id_organizations_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tasks` ADD CONSTRAINT `tasks_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tasks` ADD CONSTRAINT `tasks_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tasks` ADD CONSTRAINT `tasks_updated_by_users_id_fk` FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tasks` ADD CONSTRAINT `tasks_deleted_by_users_id_fk` FOREIGN KEY (`deleted_by`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `idx_users_org` ON `users` (`organization_id`);--> statement-breakpoint
CREATE INDEX `idx_users_status` ON `users` (`status`);--> statement-breakpoint
CREATE INDEX `idx_user_roles_org` ON `user_roles` (`organization_id`);--> statement-breakpoint
CREATE INDEX `idx_tasks_org_status` ON `tasks` (`organization_id`,`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_tasks_org_priority_status` ON `tasks` (`organization_id`,`priority`,`status`);--> statement-breakpoint
CREATE INDEX `idx_tasks_user_status` ON `tasks` (`user_id`,`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_tasks_deadline` ON `tasks` (`organization_id`,`deadline`);--> statement-breakpoint
CREATE INDEX `idx_tasks_deleted` ON `tasks` (`organization_id`,`deleted_at`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_tasks_created` ON `tasks` (`organization_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_audit_entity` ON `audit_logs` (`entity_type`,`entity_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_audit_org` ON `audit_logs` (`organization_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_audit_actor` ON `audit_logs` (`actor_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_pml_table` ON `partition_maintenance_log` (`table_name`,`created_at`);
-- =====================================================================
-- ADDITIONAL CONFIGURATIONS
-- =====================================================================

-- Add CHECK constraint for tasks deadline
ALTER TABLE `tasks` ADD CONSTRAINT `chk_deadline` CHECK (deadline IS NULL OR deadline >= created_at);

-- Add FULLTEXT index for tasks title and description
ALTER TABLE `tasks` ADD FULLTEXT INDEX `ft_tasks_title_desc` (title) WITH PARSER ngram;

-- Set table engine and charset
ALTER TABLE `tasks` ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
ALTER TABLE `audit_logs` ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- PARTITIONING
-- =====================================================================

-- Partition tasks table by created_at (monthly)
ALTER TABLE `tasks` PARTITION BY RANGE (TO_DAYS(created_at)) (
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
    PARTITION p_future VALUES LESS THAN MAXVALUE
);

-- Partition audit_logs table by created_at (monthly)
ALTER TABLE `audit_logs` PARTITION BY RANGE (TO_DAYS(created_at)) (
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
    PARTITION p_future VALUES LESS THAN MAXVALUE
);

-- =====================================================================
-- STORED PROCEDURES: TASK NUMBER GENERATION
-- =====================================================================

DROP PROCEDURE IF EXISTS sp_next_task_number;
DROP PROCEDURE IF EXISTS sp_create_task;

DELIMITER 

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

    SET p_task_number = CONCAT('TSK-', p_organization_id, '-', LPAD(v_next_number, 12, '0'));
END

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
END

DELIMITER ;

-- =====================================================================
-- AUDIT TRIGGERS: users & tasks
-- =====================================================================

DROP TRIGGER IF EXISTS trg_users_after_insert;
DROP TRIGGER IF EXISTS trg_users_after_update;
DROP TRIGGER IF EXISTS trg_users_after_delete;
DROP TRIGGER IF EXISTS trg_tasks_after_insert;
DROP TRIGGER IF EXISTS trg_tasks_after_update;
DROP TRIGGER IF EXISTS trg_tasks_after_delete;

DELIMITER 

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
END

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
END

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
END

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
END

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
END

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
END

DELIMITER ;

-- =====================================================================
-- PARTITION MAINTENANCE PROCEDURES
-- =====================================================================

DROP PROCEDURE IF EXISTS sp_ensure_future_partitions;
DROP PROCEDURE IF EXISTS sp_run_partition_maintenance;

DELIMITER ``

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
      AND PARTITION_NAME REGEXP '^p[0-9]{6}``'
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
END proc_block ``

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
END ``

DELIMITER ;

-- =====================================================================
-- EVENT SCHEDULER
-- =====================================================================

DROP EVENT IF EXISTS evt_partition_maintenance;

CREATE EVENT evt_partition_maintenance
ON SCHEDULE EVERY 1 MONTH
STARTS (DATE_ADD(DATE_FORMAT(CURDATE(), '%Y-%m-01'), INTERVAL 1 MONTH) + INTERVAL 2 HOUR)
ON COMPLETION PRESERVE
ENABLE
DO
    CALL sp_run_partition_maintenance();

-- =====================================================================
-- INITIAL PARTITION SETUP
-- =====================================================================

CALL sp_run_partition_maintenance();
