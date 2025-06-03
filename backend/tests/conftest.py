import pytest
from flaskr import create_app
from flaskr.db import init_db, gen_mock_data

@pytest.fixture(scope="session")
def app(tmp_path_factory):
    db_path = tmp_path_factory.mktemp("data") / "test.db"
    database_uri = f"sqlite:///{db_path}"

    app = create_app({
        'TESTING': True,
        'SQLALCHEMY_DATABASE_URI': database_uri,
        'SQLALCHEMY_TRACK_MODIFICATIONS': False
    })

    with app.app_context():
        init_db()
        gen_mock_data()

    yield app

@pytest.fixture
def client(app):
    return app.test_client()
