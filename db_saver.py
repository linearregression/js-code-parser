import logging
import sqlite3 as lite

class DbSaver:

    def __init__(self, db_name):
        self.db_name = db_name
        self.ensure_ddl()

    def ensure_ddl(self):

        con = lite.connect(self.db_name)

        with con:
            cur = con.cursor()
            cur.execute('SELECT SQLITE_VERSION()')

            data = cur.fetchone()

            cur.execute("CREATE TABLE IF NOT EXISTS code(codeid INTEGER PRIMARY KEY AUTOINCREMENT,"
                        " app VARCHAR(10), filename VARCHAR(20))")

            cur.execute("CREATE TABLE IF NOT EXISTS uses(usesid INTEGER PRIMARY KEY AUTOINCREMENT,"
                        " codeid INTEGER, module VARCHAR(20))")

            cur.execute("CREATE TABLE IF NOT EXISTS conf(confid INTEGER PRIMARY KEY AUTOINCREMENT, "
                        "app VARCHAR(10), conffile VARCHAR(20), shortcut VARCHAR(10), filename VARCHAR(20))")

            cur.close()

            logging.info("SQLite version: {version}, ensured schema is in place".format(version=data[0]))

    def fetch_modules(self, app_name):
        con = lite.connect(self.db_name)

        with con:
            cur = con.cursor()
            sql = "SELECT DISTINCT u.module " \
                  "FROM uses u, code c " \
                  "WHERE c.app = '{app}' " \
                  "AND u.codeid = c.codeid " \
                  "ORDER BY u.module".format(app=app_name)

            cur.execute(sql)

            rows = cur.fetchall()

            logging.debug("sql: {sql} fetched {num_rows} rows".format(sql=sql, num_rows=len(rows)))

            cur.close()

            return [modules[0] for modules in rows]

    def fetch_shortcuts(self, app_name):
        con = lite.connect(self.db_name)

        with con:
            cur = con.cursor()
            cur.execute("SELECT DISTINCT shortcut "
                        "FROM conf f "
                        "WHERE conffile = 'null' "
                        "AND app = '{app_name}'"
                        "ORDER BY shortcut "
                        .format(app_name=app_name))

            rows = cur.fetchall()

            return [row[0] for row in rows]

    def _save_rows(self, table, sql, arr_dicts):
        con = lite.connect(self.db_name)

        with con:
            cur = con.cursor()
            for entry in arr_dicts:
                cur.execute(sql.format(**entry))

            logging.debug("inserting {total_rows} rows in {table} ".format(total_rows=len(arr_dicts), table=table))

            cur.close()

    def save_conf(self, conf_entries):
        sql = "INSERT INTO conf(app, conffile, shortcut, filename) " \
              "VALUES('{app}', '{conffile}', '{shortcut}', '{filename}')"

        self._save_rows('conf', sql, conf_entries)

    def save_dependencies(self, app_name, config_defines):
        code_sql = "INSERT INTO code(app, filename) VALUES('{app_name}', '{filename}') "
        uses_sql = "INSERT INTO uses(codeid, module) VALUES('{codeid}', '{module}')"
        conf_sql = "INSERT INTO conf(app, conffile, shortcut, filename) " \
                   "VALUES('{app_name}', '{conffile}', '{shortcut}', '{filename}')"

        con = lite.connect(self.db_name)

        with con:
            cur = con.cursor()

            for filename in config_defines:
                logging.debug("processing filename: {filename}".format(filename=filename))
                cur.execute(code_sql.format(app_name=app_name, filename=filename))
                codeid = cur.lastrowid

                for entry in config_defines[filename]:
                    if entry['type'] == 'shortcut':
                        # logging.debug("file: {filename} entry: {entry}".format(filename=filename, entry=entry))
                        cur.execute(conf_sql.format(app_name=app_name, conffile=filename,
                                                    shortcut=entry['name'], filename=entry['value']))
                    else:
                        cur.execute(uses_sql.format(codeid=codeid, module=entry['name']))

            cur.close()
