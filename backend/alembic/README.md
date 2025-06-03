# Alembic Generic single-database configuration.

This is a generic single-database configuration for Alembic, which is a database migration tool for SQLAlchemy. It is designed to work with a single database connection and can be used to manage schema migrations in a straightforward manner.

Documentation for Alembic can be found at [Alembic Documentation](https://alembic.sqlalchemy.org/en/latest/).

## Shortcuts
- `alembic upgrade head`: Upgrade the database to the latest revision.
- `alembic downgrade -1`: Downgrade the database to the previous revision.
- `alembic revision --autogenerate -m "message"`: Create a new migration script with the specified message.
- `alembic history`: Show the history of migrations.
- `alembic current`: Show the current revision of the database.
- `alembic show <revision>`: Show the details of a specific revision.
- `alembic edit <revision>`: Edit a specific revision script.
- `alembic heads`: Show the current heads of the database.
- `alembic branches`: Show the current branches of the database.