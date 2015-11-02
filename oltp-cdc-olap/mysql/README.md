Database setup and configuration for CDC dataflow demo

### Install MySQL (one time)
```bash
brew install mysql
mysql -V  # Verify the MySQL installation
```

### Initializing Database (one time)
```bash
unset TMPDIR
# mysql_install_db --defaults-file=./mysql/my.cnf --verbose --user=`whoami`
mysql_install_db --verbose --user=`whoami` --basedir="$(brew --prefix mysql)"  --datadir=./mysql/data
```

### Run MySQL
```bash
mysqld --defaults-file=./mysql/my.cnf # start
mysqladmin -u root -p shutdown  # stop
```

#### Setup Security (for Production) (one time)
```bash
mysql_secure_installation
```

#### Grant permissions for maxwell (one time)
```sql
mysql -u root -p 
mysql> GRANT ALL on maxwell.* to 'maxwell'@'%' identified by 'XXXXXX';
mysql> GRANT SELECT, REPLICATION CLIENT, REPLICATION SLAVE on *.* to 'maxwell'@'%';
# or for running maxwell locally:
mysql> GRANT SELECT, REPLICATION CLIENT, REPLICATION SLAVE on *.* to 'maxwell'@'localhost' identified by 'XXXXXX';
mysql> GRANT ALL on maxwell.* to 'maxwell'@'localhost';
```

#### MySQL Command Line Tool
```sql
mysql -u root -p 
SHOW DATABASES; # List all existing databases.
SELECT DISTINCT User FROM mysql.user;  #List all MySQL / MariaDB users.
SHOW VARIABLES WHERE Variable_Name LIKE "%dir"; #  see Env
DROP DATABASE maxwell;
DROP TABLE test.guests;
```