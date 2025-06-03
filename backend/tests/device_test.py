import pytest

# Test cases for device management endpoints

# GET
@pytest.mark.parametrize(
    "device_id, expected_status, expected_keys, info", [
        (1, 200, ['id', 'name', 'device_type', 'position', 'status'], 'get device by ID 1'),
        (999, 404, ['message'], 'get non-existent device by ID 999'),
        (0, 400, ['message'], 'get device with invalid ID 0'),
        (-1, 404, ['message'], 'get device with negative ID -1'),
        (None, 404, ['message'], 'get device with None ID'),
        ('abc', 404, ['message'], 'get device with non-integer ID abc'),
    ]
)
def test_get_device(client, device_id, expected_status, expected_keys, info):
    response = client.get(f'/api/device/{device_id}')
    assert response.status_code == expected_status, f"Failed to {info}"
    if expected_status == 200:
        data = response.get_json()
        assert all(key in data for key in expected_keys), f"Response keys mismatch for {info}"

# POST
@pytest.mark.parametrize(
    "device_data, expected_status, expected_keys, info", [
        ({"name": "Test Device", "device_type_id": 1, "position": "Test Position", "status": "Available"}, 201, ['id', 'name', 'device_type', 'position', 'status'], 'create new device with valid data'),
        ({"name": "Test Device", "device_type_id": 1, "position": "Test Position", "status": "Available"}, 409, ['id', 'name', 'device_type', 'position', 'status'], 'create another device with same name'),
        ({"name": "", "device_type_id": 1, "position": "Test Position", "status": "Available"}, 400, ['message'], 'create device with empty name'),
        ({"name": "Test Device2", "device_type_id": -1, "position": "Test Position", "status": "Available"}, 400, ['message'], 'create device with invalid device_type'),
        ({"name": "Test Device3", "device_type_id": 1}, 400, ['message'], 'create device with missing position and status'),
        ({"name": "Test Device4", "device_type_id": 1, "position": "Test Position", "status": "InvalidStatus"}, 400, ['message'], 'create device with invalid status'),
        ({"name": "Test Device5", "device_type_id": 1, "status": "Available", "previous_maintenance_date": "2025-05-30T00:00:00Z"}, 201, ['id', 'name', 'device_type', 'position', 'status', 'previous_maintenance_date'], 'create new device with previous_maintenance_date'),
        ({"name": "Test Device6", "device_type_id": 1, "status": "Available", "next_maintenance_date": "2025-05-30T00:00:00Z"}, 201, ['id', 'name', 'device_type', 'position', 'status', 'next_maintenance_date'], 'create new device with next_maintenance_date'),
        ({"name": "Test Device7", "device_type_id": 1, "status": "Available", "next_maintenance_date": "2025.05.30"}, 400, ['id', 'name', 'device_type', 'position', 'status', 'next_maintenance_date'], 'create new device with wrong next_maintenance_date format'),
    ]
)
def test_create_device(client, device_data, expected_status, expected_keys, info):
    response = client.post('/api/device', json=device_data)
    assert response.status_code == expected_status, f"Failed to {info}"
    if expected_status == 201:
        data = response.get_json()
        assert all(key in data for key in expected_keys), f"Response keys mismatch for {info}"

# PUT
@pytest.mark.parametrize(
    "device_id, update_data, expected_status, expected_keys, info", [
        (1, {"name": "Updated Device", "device_type_id": 1, "position": "Updated Position", "status": "Maintaince"}, 200, ['id', 'name', 'device_type', 'position', 'status'], 'update existing device with valid data'),
        (1, {"name": "Updated Device", "device_type_id": 1, "previous_maintenance_date": "2025-05-30T00:00:00Z"}, 200, ['id', 'name', 'device_type', 'position', 'status'], 'update device with previous maintenance date'),
        (2, {"name": "Updated Device", "device_type_id": 1}, 409, ['message'], 'update device with same name as another existing device'),
        (999, {"name": "Non-existent Device"}, 404, ['message'], 'update non-existent device by ID 999'),
        (0, {"name": "Invalid ID Device"}, 404, ['message'], 'update device with invalid ID 0'),
        (-1, {"name": "Negative ID Device"}, 404, ['message'], 'update device with negative ID -1'),
        (1, {"name": ""}, 400, ['message'], 'update device with empty name'),
        (1, {"device_type_id": -1}, 400, ['message'], 'update device with invalid device_type'),
        (1, {"status": "InvalidStatus"}, 400, ['message'], 'update device with invalid status'),
    ]
)
def test_update_device(client, device_id, update_data, expected_status, expected_keys, info):
    response = client.put(f'/api/device/{device_id}', json=update_data)
    assert response.status_code == expected_status, f"Failed to {info} {response.get_data()}"
    if expected_status == 200:
        data = response.get_json()
        assert all(key in data for key in expected_keys), f"Response keys mismatch for {info}"

# DELETE
@pytest.mark.parametrize(
    "device_id, expected_status, expected_keys, info", [
        (1, 400, ['message', 'methods'], 'cannot delete device with ID 1, which is required by some methods'),
        (999, 404, ['message'], 'delete non-existent device by ID 999'),
        (0, 404, ['message'], 'delete device with invalid ID 0'),
        (-1, 404, ['message'], 'delete device with negative ID -1'),
        (None, 404, ['message'], 'delete device with None ID'),
        ('abc', 404, ['message'], 'delete device with non-integer ID abc'),
    ]
)
def test_delete_device(client, device_id, expected_status, expected_keys, info):
    response = client.delete(f'/api/device/{device_id}')
    assert response.status_code == expected_status, f"Failed to {info}"
    if expected_status == 204:
        assert response.get_data() == b'', f"Response data should be empty for {info}"
    else:
        data = response.get_json()
        assert all(key in data for key in expected_keys), f"Response keys mismatch for {info}"

def create_test_device(client, data):
    # Create a test device to use in other tests
    response = client.post('/api/device', json=data)
    assert response.status_code == 201, "Failed to create test device"
    return response.get_json()['id']

# DELETE with test device
@pytest.mark.parametrize(
    "expected_status, create_before_test, info", [
        (204, { "name": "Test Device for Deletion", "device_type_id": 1, "position": "Test Position", "status": "Available" }, 'delete existing device with test device'),
        (400, { "name": "Occupied Device", "device_type_id": 1, "position": "Test Position", "status": "Occupied" }, 'delete occupied device which cannot be deleted'),
        (400, { "name": "Reserved Device", "device_type_id": 1, "position": "Test Position", "status": "Reserved" }, 'delete reserved device which cannot be deleted'),

    ]
)
def test_delete_existing_device(client, create_before_test, expected_status, info):
    test_device = create_test_device(client, create_before_test)
    response = client.delete(f'/api/device/{test_device}')
    assert response.status_code == expected_status, f"Failed to {info}"
    if expected_status == 204:
        assert response.get_data() == b'', f"Response data should be empty for {info}"

# LIST
@pytest.mark.parametrize(
    "expected_status, info", [
        (200, 'list all devices without query params'),
    ]
)
def test_list_devices(client, expected_status, info):
    response = client.get('/api/device')
    assert response.status_code == expected_status, f"Failed to {info}"
    if expected_status == 200:
        data = response.get_json()
        assert type(data) is list, f"Response should be a list for {info}"