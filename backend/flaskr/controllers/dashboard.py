from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta

dashboard_bp = Blueprint('dashboard', __name__)

# Mock functions to fetch statistics (replace with real DB queries)
def get_total_tests_completed(group_id, start=None, end=None):
    from flaskr.db import Test, get_db, TestStatusEnum
    db = get_db()
    tests = db.session.query(Test).filter_by(
        group_id=group_id, status=TestStatusEnum.Completed
    )
    if start:
        tests = tests.filter(Test.created_at >= start)
    if end:
        tests = tests.filter(Test.created_at <= end)
    return tests.count()  # Count of completed tests

def get_active_users(group_id, start=None, end=None):
    from flaskr.db import get_db, BelongsToGroup, User
    db = get_db()
    q = db.session.query(BelongsToGroup).filter_by(group_id=group_id).join(BelongsToGroup.user)
    if start:
        q.filter(User.created_at >= start)
    if end:
        q.filter(User.created_at <= end)
    return q.count()  # Count of active users in the group

def get_available_devices(group_id):
    from flaskr.db import Device, get_db, DeviceStatusEnum
    db = get_db()
    devices = db.session.query(Device).filter_by(status=DeviceStatusEnum.Available)
    # Count of available devices in the group
    return {
        'available': devices.count(),  
        'total': db.session.query(Device).count()
    }

def get_test_time(group_id, start=None, end=None):
    from flaskr.db import DeviceReservation, get_db, Test
    db = get_db()
    q = db.session.query(DeviceReservation).join(DeviceReservation.test).join(Test.group).filter_by(id=group_id)
    if start:
        q = q.filter(DeviceReservation.start_time >= start)
    if end:
        q = q.filter(DeviceReservation.end_time <= end)
    reservations = q.all()
    if not reservations:
        return {
            'total_duration': 0,
            'avg_duration': 0,
            'max_duration': 0,
            'max_duration_reservation': None,
            'min_duration': 0,
            'min_duration_reservation': None,
            'std_duration': 0,
            'reservations_count': 0
        }
    # Total duration in minutes
    total_duration = sum(res.duration for res in reservations) 
    # Average duration in minutes
    count = len(reservations)
    avg_duration = total_duration / count if count > 0 else 0
    # Maximum duration in minutes
    max_duration_reservation = max(reservations, key=lambda r: r.duration, default=None)
    max_duration = max_duration_reservation.duration if max_duration_reservation else 0
    # Minimum duration in minutes
    min_duration_reservation = min(reservations, key=lambda r: r.duration, default=None)
    min_duration = min_duration_reservation.duration if min_duration_reservation else 0
    # Standard deviation of durations
    durations = [res.duration for res in reservations]
    if len(durations) > 1:
        variance = sum((x - avg_duration) ** 2 for x in durations) / (len(durations) - 1)
        std_duration = variance ** 0.5
    else:
        std_duration = 0
    return {
        'total_duration': total_duration,
        'avg_duration': avg_duration,
        'max_duration': max_duration,
        'max_duration_reservation': max_duration_reservation.serialize if max_duration_reservation else None,
        'min_duration': min_duration,
        'min_duration_reservation': min_duration_reservation.serialize if min_duration_reservation else None,
        'std_duration': std_duration,
        'reservations_count': count
    }

def get_device_status():
    from flaskr.db import Device, get_db, DeviceStatusEnum
    db = get_db()
    devices = db.session.query(Device).all()
#    Available='Available'
    # Reserved='Reserved'
    # Occupied='Occupied'
    # Error='Error'
    # Maintaince='Maintaince' # TODO: corret the spelling to Maintenance

    status_counts = {
        'available': 0,
        'reserved': 0,
        'occupied': 0,
        'maintenance': 0,
        'broken': 0
    }
    for device in devices:
        if device.status == DeviceStatusEnum.Available:
            status_counts['available'] += 1
        elif device.status == DeviceStatusEnum.Occupied:
            status_counts['occupied'] += 1
        elif device.status == DeviceStatusEnum.Maintaince:
            status_counts['maintenance'] += 1
        elif device.status == DeviceStatusEnum.Error:
            status_counts['broken'] += 1
        elif device.status == DeviceStatusEnum.Reserved:
            status_counts['reserved'] += 1
    return status_counts

def parse_time_range(time_range):
    now = datetime.now()
    if time_range == 'week':
        start = now - timedelta(days=7)
    elif time_range == 'month':
        start = now - timedelta(days=30)
    else:
        start = None
    return start, now

@dashboard_bp.route('/<int:group_id>', methods=['GET'])
def dashboard(group_id):
    """Get dashboard statistics for a group.
    <h3>Statistic Unit</h3>
    Duration is in minutes, counts are integers.

    ---
    tags:
        - Dashboard
    parameters:
        - in: path
          name: group_id
          schema:
            type: integer
          required: true
          description: The ID of the group to get statistics for.
        - in: query
          name: compare_time_range
          schema:
            type: string
            enum: [week, month]
          required: false
          description: If provided, compares statistics for the given time range (week or month) with the previous period.
    responses:
        200:
            description: Dashboard statistics
            schema:
                type: object
                properties:
                    total_tests_completed:
                        type: integer
                    active_users:
                        type: integer
                    available_devices:
                        type: integer
                    test_time:
                        type: integer
                        description: Total test time in minutes
                
    """
    compare_time_range = request.args.get('compare_time_range')
    if compare_time_range:
        # Compare current period with previous period
        start, end = parse_time_range(compare_time_range)
        prev_start = start - (end - start)
        prev_end = start

        current_stats = {
            "total_tests_completed": get_total_tests_completed(group_id, start, end),
            "active_users": get_active_users(group_id, start, end),
            "available_devices": get_available_devices(group_id),
            "test_time": get_test_time(group_id, start, end),
        }
        previous_stats = {
            "total_tests_completed": get_total_tests_completed(group_id, prev_start, prev_end),
            "active_users": get_active_users(group_id, prev_start, prev_end),
            "available_devices": get_available_devices(group_id),
            "test_time": get_test_time(group_id, prev_start, prev_end)
        }
        return jsonify({
            "current": current_stats,
            "previous": previous_stats,
            "compare_time_range": compare_time_range,
            "device_status": get_device_status()
        })
    else:
        stats = {
            "total_tests_completed": get_total_tests_completed(group_id),
            "active_users": get_active_users(group_id),
            "available_devices": get_available_devices(group_id),
            "test_time": get_test_time(group_id),
            "device_status": get_device_status()
        }
        return jsonify(stats)