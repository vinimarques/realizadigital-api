#!/bin/bash
cd "$(dirname "$0")"

if [ "$1" = "test" ]; then
	vmDatabases=$(find ./database/test_fixtures -name "*.sql" -exec basename {} .sql ";")
else
	vmDatabases=$(cat config.yml | grep dbname: | head -n 1 | sed -e 's/.*dbname: \(.*\)/\1/')
fi

for vmDatabase in $vmDatabases; do
	echo "+ Flushing database ${vmDatabase}"
	echo "DROP SCHEMA IF EXISTS \`${vmDatabase}\`;" > /tmp/flush-db.sql
	echo "CREATE SCHEMA IF NOT EXISTS \`${vmDatabase}\` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;" >> /tmp/flush-db.sql
	mysql -u root -proot < /tmp/flush-db.sql
	rm -f /tmp/flush-db.sql

	echo "+ Loading database structure and fixtures"

	if [ -f database/structure.sql ]; then
		mysql -u root -proot --database="${vmDatabase}" < database/structure.sql
	fi

	if [ -f database/migrations.sql ]; then
		mysql -u root -proot --database="${vmDatabase}" < database/migrations.sql
	fi

	if [ "$1" = "test" ]; then
		mysql -u root -proot --database="${vmDatabase}" < database/test_fixtures/${vmDatabase}.sql
	elif [ -f database/fixtures.sql ]; then
		mysql -u root -proot --database="${vmDatabase}" < database/fixtures.sql
	fi
done;

echo "+ Flushing REDIS"
redis-cli FLUSHALL
