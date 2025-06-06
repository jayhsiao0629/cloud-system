# Flask Backend

This is the Flask-based backend of the whole project.  

## Features
- **MVC-Service Architecture**: Follows the Model-Controller-Service (MCS) pattern, omitting the View layer for a backend focused solely on API responses.
- **Interactive API Documentation**: Provides Swagger-based API docs using the Flasgger package.
- **Object-Oriented RESTful APIs**: Utilizes the `flask_restful` package for clean, class-based endpoint development.
- **Centralized Data Models**: All database tables (models) are defined in `db.py`.
- **Service Layer**: The `flaskr/services/` directory contains business logic and service classes, promoting separation of concerns.
- **Controller Layer**: The `flaskr/controllers/` directory contains route handlers.

## Development

We recommend using [VS Code Dev Containers](https://code.visualstudio.com/docs/devcontainers/containers) for a consistent and isolated development environment.

### Getting Started

1. **Open the project in VS Code.**
2. **Reopen in Dev Container** when prompted.

If not prompted, make sure VS code are opened in the `backend` directory. You can do this by running the following commands in your terminal:
```bash
cd backend
code .
```
 and use the command palette (`Ctrl+Shift+P` or `Cmd+Shift+P` on macOS) to select **Dev Containers: Reopen in Container**.
3. **Wait for the container to build**. This may take a few minutes on the first run as it installs all dependencies.

### Running the Backend

Inside the dev container, start the Flask development server with:

```bash
flask --app flaskr run --debug
```

- The backend will reload automatically on code changes.
- All required dependencies are pre-installed in the dev container.
- The Swagger UI for API documentation is automatically available at the http://localhost:5000/apidocs endpoint.

### Initializing database

Ensure that the `FLASK_APP` environment variable is set to `flaskr` to enable custom Flask commands:

```bash
export FLASK_APP=flaskr
```

To initialize the database, run the following command inside the dev container:

```bash
flask init-db
```

This will create all necessary tables as defined in `db.py`. For development and testing purposes, you can also populate the database with sample data using:

```bash
flask gen-mock-data
```

This command inserts mock records to help you get started quickly.

### Cleaning Up the Database

To remove all tables and reset the database, run the following command inside the dev container:

```bash
flask clear-db
```

### Database Management with Alembic
For managing database migrations, this project uses Alembic.
- For more information on how to use Alembic, refer to the [Alembic documentation](https://alembic.sqlalchemy.org/en/latest/).  
- For more information on the Alembic configuration, refer to the [alembic/README.md](alembic/README.md).

#### Upgrade Migration
To upgrade the database to the latest migration without losing data, run:
```bash
alembic upgrade head  # Upgrade to the latest migration
```

#### Downgrade Migration
To downgrade the database to the previous migration, run:
```bash
alembic downgrade -1  # Downgrade to the previous migration
```

#### Create a New Migration


> **Important**: Before running any autogenerated migrations, review the [Alembic autogenerate documentation](https://alembic.sqlalchemy.org/en/latest/autogenerate.html) to understand how autogeneration works and its limitations.

Alembic is already configured to work with the `db.py` models. After making changes to the models, you can create a new migration script that reflects those changes.
To do this, simply run:
```bash
alembic revision --autogenerate -m "Your migration message here"
```

> **Note**: Ensure that you have the `alembic` package installed in your dev container. It is included in the `requirements.txt` file.




This will drop all tables as defined in `db.py`, allowing you to start with a clean slate.

## Step-by-Step: Creating a New API Endpoint

Follow this tutorial to add a new API endpoint to your Flask backend.

### 1. Entry Point: `flaskr/__init__.py`

This file initializes your Flask app and registers controllers (resources).  
Open `flaskr/__init__.py` and ensure it looks like this:

```python
from flask import Flask
from flask_restful import Api
from flaskr.controllers.post import ControllerResource

def create_app():
    app = Flask(__name__)
    api = Api(app)
    api.add_resource(ControllerResource, '/posts', '/posts/<int:post_id>')
    return app
```

### 2. Create a Controller File

Suppose you want to add APIs for managing blog posts (the "post" resource) in your application.

Create a new file: `flaskr/controllers/post.py`.

### 3. Import Required Services

At the top of `post.py`, import the service functions you'll use:

```python
from flask_restful import Resource, reqparse
from flaskr.services.post import create, get_post_by_id, get_posts_by_user
```

### 4. Define the Controller Class

Implement the controller as a class inheriting from `Resource`:

```python
class ControllerResource(Resource):
    def get(self, post_id=None):
        parser = reqparse.RequestParser()
        parser.add_argument('user_id', type=int, location='args')
        args = parser.parse_args()
        if post_id:
            post = get_post_by_id(post_id)
            if post:
                return post, 200
            return {'message': 'Post not found'}, 404
        elif args['user_id']:
            posts = get_posts_by_user(args['user_id'])
            return posts, 200
        else:
            return {'message': 'Missing parameters'}, 400

    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument('user_id', type=int, required=True)
        parser.add_argument('content', type=str, required=True)
        args = parser.parse_args()
        new_post = create(args['user_id'], args['content'])
        return new_post, 201
```

### 5. Register the Controller

Make sure the controller is registered in your app (see step 1).

### 6. Test the Endpoint

- Start the server:  
  ```bash
  flask --app flaskr run --debug
  ```
- Use Swagger UI at [http://localhost:5000/apidocs](http://localhost:5000/apidocs) or tools like `curl`/Postman to test your new `/posts` endpoint.


## Project Structure

```
.
├── flaskr/                # Flask application package
│   ├── controllers/       # Route handlers (controllers)
│   ├── services/          # Business logic and service classes
|   └── db.py              # Model definitions
├── tests/                 # Test suite
├── requirements.txt
├── Dockerfile             # Dockerfile for backend container
├── config.py              # Flask configuration
└── README.md
```

## Best Practices

- Use the dev container for all development tasks.
- Commit changes frequently.
- Run tests before pushing.

## Configuration

### Production Usage
Configuration can passed via environment variables:

The flask built-in configurations can be set using prefix `FLASK_`:
- `FLASK_ENV`: Set to `production` for production mode.
- `FLASK_DEBUG`: Set to `0` to disable debug mode.
- `FLASK_SQLALCHEMY_DATABASE_URI`: Set to your production database URI.

Database URI can also be set using the `DATABASE_URI` environment variable. 