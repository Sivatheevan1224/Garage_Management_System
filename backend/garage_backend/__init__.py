# mysql-connector-python doesn't need to be installed as MySQLdb for some backends,
# but if we use the default mysql backend, it expects MySQLdb.
# So we can keep it empty if we use 'mysql.connector.django' in settings.
