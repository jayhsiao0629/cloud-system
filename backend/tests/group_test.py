import pytest

# Get a single group
@pytest.mark.parametrize(
    "group_id, expected_status, expected_keys, info", [
        (1, 200, ['id', 'name', 'description', 'leader', 'leader_id', 'memberCount', 'activeTests', 'created_at', 'updated_at'], 'Get group with ID 1'),
        (2, 200, ['id', 'name', 'description', 'leader', 'leader_id', 'memberCount', 'activeTests', 'created_at', 'updated_at'], 'Get group with ID 2'),
        (999, 404, ['message'], 'Get group not existing ID 999'),
        (0, 404, ['message'], 'Get invalid ID 0'),
        (-1, 404, ['message'], 'Get invalid negative ID -1'),
        ('abc', 404, ['message'], 'Get non-integer ID abc'),
    ]
)
def test_get_group(client, group_id, expected_status, expected_keys, info):
    response = client.get(f'/api/group/{group_id}')
    assert response.status_code == expected_status, f"Failed: {info}"
    data = response.get_json()
    if expected_status == 200:
        assert all(key in data for key in expected_keys), f"Returned fields error: {info}"
    else:
        assert all(key in data for key in expected_keys), f"Error message fields error: {info}"

# Create group
@pytest.mark.parametrize(
    "group_data, expected_status, expected_keys, info", [
        ({"name": "Test Group", "description": "A test group", "leader_id": 1}, 201, ['id', 'name', 'description', 'leader', 'leader_id', 'memberCount', 'activeTests', 'created_at', 'updated_at'], 'Create new group'),
        ({"name": "Test Group", "description": "A test group", "leader_id": 1}, 409, ['message'], 'Create group with duplicate name'),
        ({"name": "", "description": "No name", "leader_id": 1}, 400, ['message'], 'Name is empty'),
        ({"description": "No name", "leader_id": 1}, 400, ['message'], 'Missing name'),
        ({"name": "No Leader Group", "description": "No leader"}, 400, ['message'], 'Missing leader_id'),
        ({"name": "Invalid Leader Group", "description": "Invalid leader", "leader_id": 999}, 400, ['message'], 'Non-existent leader_id'),
        ({"name": "Invalid Leader Group", "description": "Invalid leader", "leader_id": -1}, 400, ['message'], 'Negative leader_id'),
    ]
)
def test_create_group(client, group_data, expected_status, expected_keys, info):
    response = client.post('/api/group', json=group_data)
    assert response.status_code == expected_status, f"Failed: {info}"
    data = response.get_json()
    if expected_status == 201:
        assert all(key in data for key in expected_keys), f"Returned fields error: {info}"
    else:
        assert all(key in data for key in expected_keys), f"Error message fields error: {info}"

# Update group
@pytest.mark.parametrize(
    "group_id, update_data, expected_status, expected_keys, info", [
        (1, {"name": "Updated Group", "description": "Updated desc"}, 200, ['id', 'name', 'description', 'leader', 'leader_id', 'memberCount', 'activeTests', 'created_at', 'updated_at'], 'Update group ID 1'),
        (999, {"name": "Non-existent"}, 404, ['message'], 'Update non-existent group'),
        (1, {}, 400, ['message'], 'Empty data on update'),
        (1, {"name": "Updated Group", "leader_id": 999}, 400, ['message'], 'Update with non-existent leader_id'),
        (1, {"name": "Updated Group", "leader_id": -1}, 400, ['message'], 'Update with negative leader_id'),
        (1, {"name": "Updated Group", "description": "Updated desc", "leader_id": 3}, 200, ['id', 'name', 'description', 'leader', 'leader_id', 'memberCount', 'activeTests', 'created_at', 'updated_at'], 'Update group with valid data'),
        (1, {"name": ""}, 200, ['id', 'name', 'description', 'leader', 'leader_id', 'memberCount', 'activeTests', 'created_at', 'updated_at'], 'Name is empty string'),
    ]
)
def test_update_group(client, group_id, update_data, expected_status, expected_keys, info):
    response = client.put(f'/api/group/{group_id}', json=update_data)
    assert response.status_code == expected_status, f"Failed: {info}"
    if expected_status == 200:
        data = response.get_json()
        assert all(key in data for key in expected_keys), f"Returned fields error: {info}"
    else:
        data = response.get_json()
        assert all(key in data for key in expected_keys), f"Error message fields error: {info}"

# Delete group
@pytest.mark.parametrize(
    "group_id, expected_status, expected_keys, info", [
        (1, 400, [], 'Delete group ID 1 with active tests and users'),
        (999, 404, ['message'], 'Delete non-existent group'),
        (0, 404, ['message'], 'Delete invalid ID 0'),
        (-1, 404, ['message'], 'Delete negative ID -1'),
    ]
)
def test_delete_group(client, group_id, expected_status, expected_keys, info):
    response = client.delete(f'/api/group/{group_id}')
    assert response.status_code == expected_status, f"Failed: {info}"
    if expected_status == 204:
        assert response.get_data() == b'', f"Delete success should return no content: {info}"
    else:
        data = response.get_json()
        assert all(key in data for key in expected_keys), f"Error message fields error: {info}"


def create_test_group(client, data):
    # Create a test group to use in other tests
    response = client.post('/api/group', json=data)
    assert response.status_code == 201, "Failed to create test device"
    return response.get_json()['id']

# Delete with test group
@pytest.mark.parametrize(
    "expected_status, create_before_test, info", [
        (204, {"name": "Test Group for Deletion", "description": "A group to be deleted", "leader_id": 1}, 'Delete existing group with test group'),
    ]
)
def test_delete_existing_group(client, create_before_test, expected_status, info):
    test_group = create_test_group(client, create_before_test)
    response = client.delete(f'/api/group/{test_group}')
    assert response.status_code == expected_status, f"Failed: {info}"
    if expected_status == 204:
        assert response.get_data() == b'', f"Delete success should return no content: {info}"


# Get group list
def test_list_groups(client):
    response = client.get('/api/group')
    assert response.status_code == 200, "Failed to get group list"
    data = response.get_json()
    assert type(data) is list, "Return value should be a list"
    assert all('id' in group for group in data), "Each group should have an id field"