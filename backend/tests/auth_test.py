import pytest
from flaskr.services.user import generate_jwt_token, get_user_by_id
from werkzeug.security import generate_password_hash

# GET /user 
def test_get_users_success(client):

    app = client.application
    with app.app_context():
        app.config['JWT_SECRET_KEY'] = 'test-secret'
        app.config['SECRET_KEY'] = 'test-secret'
        admin_token = generate_jwt_token(get_user_by_id(1))


    headers = {'Authorization': f'Bearer {admin_token}'}
    print('\n', '------------------------------------------', 'GET /api/user ')
    response = client.get("/api/user", headers=headers)
    assert response.status_code == 200

    users = response.get_json()
    assert isinstance(users, dict)
    assert len(users) >= 1
    user = users['users'][0]

    # Required top-level fields
    top_fields = [
        "id", "username", "role_id", "role", 
        "email", "skills", "tests", 
        "created_at", "updated_at", "groups"
    ]
    for field in top_fields:
        assert field in user, f"Missing user field: {field}"

    # Role object
    assert isinstance(user["role"], dict)
    for field in ["id", "name", "description", "created_at", "updated_at"]:
        assert field in user["role"], f"Missing role field: {field}"

    # Skills list
    assert isinstance(user["skills"], list)
    for skill in user["skills"]:
        assert isinstance(skill, dict)
        for field in ["id", "name", "description", "created_at", "updated_at"]:
            assert field in skill, f"Missing skill field: {field}"

    # Tests list
    assert isinstance(user["tests"], list)
    for test_item in user["tests"]:
        assert isinstance(test_item, dict)
        for field in ["id", "name", "status", "display_id"]:
            assert field in test_item, f"Missing test field: {field}"

    # Groups list
    assert isinstance(user["groups"], list)
    for group in user["groups"]:
        assert isinstance(group, dict)
        for field in ["id", "name"]:
            assert field in group, f"Missing group field: {field}"
    
    print("Status Code:", response.status_code, end='\t')
    print("Response JSON:", response.get_json()['users'][0:5])

# POST /user 
@pytest.mark.parametrize(
    "payload, expected_status, expected_keys, info", [
        # Register success: valid payload
        ({'username': 'AUSER', 'password': 'pass123', 'email': 'A@x.com', 'role_id': 1, 'skill_ids': [1]}, 201, ['message', 'user'], 'register success (valid payload)'),
        # Register failure: missing username
        ({'password': 'BUSER', 'email': 'B@x.com', 'role_id': 1}, 400, ['message'], 'register failure (miss username)'),
        # Register failure: missing password
        ({'username': 'CUSER', 'email': 'C@x.com', 'role_id': 1}, 400, ['message'], 'register failure (miss password)'),
        # Register failure: missing email
        ({'username': 'DUSER', 'password': 'charlie', 'role_id': 1}, 400, ['message'], 'register failure (missing email)'),
        # Register failure: missing role_id
        ({'username': 'EUSER', 'password': 'charlie', 'email': 'x@x.com'}, 400, ['message'], 'register failure (missing role_id)')
    ]
)
def test_register_success_fail(client, payload, expected_status, expected_keys, info):
    """
    Test user registration endpoint with JWT authorization required by code.
    :param client: Flask test client fixture
    :param admin_token: JWT token for admin user
    :param payload: JSON payload for registration request
    :param expected_status: expected HTTP status code (201 for success or 400 for failure)
    :param expected_keys: list of expected keys in response JSON
    """

    app = client.application
    with app.app_context():
        app.config['JWT_SECRET_KEY'] = 'test-secret'
        app.config['SECRET_KEY'] = 'test-secret'
        admin_token = generate_jwt_token(get_user_by_id(1))

    # Prepare Authorization header using admin token
    headers = {'Authorization': f'Bearer {admin_token}'}
    print('\n', '------------------------------------------', 'POST /api/user', info)

    # Act: send POST request to register endpoint with Authorization header
    response = client.post('/api/user', json=payload, headers=headers)

    # Assert: check status code
    assert response.status_code == expected_status
    data = response.get_json()

    # Assert: verify expected keys in JSON response
    for key in expected_keys:
        assert key in data

    # Additional validation for user object on successful register
    if expected_status == 201:
        user_obj = data['user']
        assert user_obj['username'] == payload['username']
        assert user_obj['email'] == payload['email']
    
    # Debug: print status code and response JSON
    print("Status Code:", response.status_code, end='\t')
    print("Response JSON:", response.get_json())

# DELETE /user/{user_id}
def test_delete_user_success(client):
    app = client.application
    with app.app_context():
        app.config['JWT_SECRET_KEY'] = 'test-secret'
        app.config['SECRET_KEY'] = 'test-secret'
        admin_token = generate_jwt_token(get_user_by_id(1))
    headers = {'Authorization': f'Bearer {admin_token}'}

    user_id = 6
    print('\n', '------------------------------------------', 'DELETE /api/user/{user_id}')
    response = client.delete(f"/api/user/{user_id}", headers=headers)
    assert response.status_code == 204

    # assert empty response data
    assert response.data == b'', "Expected empty response data for successful delete"

    # Debug: print status code and response JSON
    print("Status Code:", response.status_code, end='\t')

# DELETE /user/{user_id}
def test_delete_user_failed(client):
    # Cannot delete user with id 2, which is a leader of a group
    app = client.application
    with app.app_context():
        app.config['JWT_SECRET_KEY'] = 'test-secret'
        app.config['SECRET_KEY'] = 'test-secret'
        admin_token = generate_jwt_token(get_user_by_id(1))
    headers = {'Authorization': f'Bearer {admin_token}'}

    user_id = 2
    print('\n', '------------------------------------------', 'DELETE /api/user/{user_id}')
    response = client.delete(f"/api/user/{user_id}", headers=headers)
    assert response.status_code == 404, f"Expected 404 for user_id {user_id}, got {response.status_code}"

    # Debug: print status code and response JSON
    print("Status Code:", response.status_code, end='\t')
    print("Response JSON:", response.get_json())

# GET /user/{user_id}
def test_get_user_by_id_success(client):
    app = client.application
    with app.app_context():
        app.config['JWT_SECRET_KEY'] = 'test-secret'
        app.config['SECRET_KEY'] = 'test-secret'
        admin_token = generate_jwt_token(get_user_by_id(1))
    headers = {'Authorization': f'Bearer {admin_token}'}

    user_id = 7
    print('\n', '------------------------------------------', 'GET /api/user/{user_id}')
    response = client.get(f"/api/user/{user_id}", headers=headers)
    assert response.status_code == 200

    users = response.get_json()
    assert isinstance(users, dict)
    user = users['user']

    # Required top-level fields
    top_fields = [
        "id", "username", "role_id", "role", 
        "email", "skills", "tests", 
        "created_at", "updated_at", "groups"
    ]
    for field in top_fields:
        assert field in user, f"Missing user field: {field}"

    # Role object
    assert isinstance(user["role"], dict)
    for field in ["id", "name", "description", "created_at", "updated_at"]:
        assert field in user["role"], f"Missing role field: {field}"

    # Skills list
    assert isinstance(user["skills"], list)
    for skill in user["skills"]:
        assert isinstance(skill, dict)
        for field in ["id", "name", "description", "created_at", "updated_at"]:
            assert field in skill, f"Missing skill field: {field}"

    # Tests list
    assert isinstance(user["tests"], list)
    for test_item in user["tests"]:
        assert isinstance(test_item, dict)
        for field in ["id", "name", "status", "display_id"]:
            assert field in test_item, f"Missing test field: {field}"

    # Groups list
    assert isinstance(user["groups"], list)
    for group in user["groups"]:
        assert isinstance(group, dict)
        for field in ["id", "name"]:
            assert field in group, f"Missing group field: {field}"

    # Debug: print status code and response JSON
    print("Status Code:", response.status_code)
    print("Response JSON:", response.get_json())

# PUT /user/{user_id}
def test_update_user_by_id_success(client):
    app = client.application
    with app.app_context():
        app.config['JWT_SECRET_KEY'] = 'test-secret'
        app.config['SECRET_KEY'] = 'test-secret'
        admin_token = generate_jwt_token(get_user_by_id(1))
    headers = {'Authorization': f'Bearer {admin_token}'}

    # mock data
    user_id = 7 
    payload = {
        "username": "tester4",
        "email": "tester4@test.com",
        "password": generate_password_hash('tester4'),
        "role_id": 3
    }
    print('\n', '------------------------------------------', 'PUT /api/user/{user_id}')
    response = client.put(f'/api/user/{user_id}', json=payload, headers=headers)
    assert response.status_code == 200

    user = response.get_json() 
    assert isinstance(user, dict)
    assert user['message'] == 'User updated successfully'
    assert user['user']['username']==payload['username']
    assert user['user']['email']==payload['email']
    assert user['user']['role_id']==payload['role_id']

    # Debug: print status code and response JSON
    print("Status Code:", response.status_code, end='\t')
    print("Response JSON:", response.get_json())