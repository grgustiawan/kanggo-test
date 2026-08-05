#!/bin/bash
set -e

echo "Executing schema.sql with DELIMITER support..."
mysql -u root -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE" -e "source /tmp/schema.sql"
echo "Schema initialization complete."
