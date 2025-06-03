from datetime import datetime, timedelta

class DeviceReservationError(Exception):
    """Custom exception for device reservation errors."""
    def __init__(self, message, details=None):
        super().__init__(message)
        self.message = message
        self.details = details if details else {}
    
    def __str__(self):
        return f"{self.message} - {self.details}"

def is_reservation_conflict(
    device_id: int,
    start_time: datetime,
    duration: int
) -> tuple[bool, list]:
    """Check if a device is already reserved during the specified time.
    
    @return tuple: (bool, list)
        - bool: True if conflicts, False if there are conflicts.
        - list: List of conflicting reservations if any.
    """
    # This function would typically query the database to check for conflicts.
    # For now, we return a mock response.
    from flaskr.db import get_db, DeviceReservation
    db = get_db()
    reservations = db.session.query(
        DeviceReservation
    ).filter(
        DeviceReservation.device_id == device_id,
        DeviceReservation.start_time < start_time + timedelta(minutes=duration),
        DeviceReservation.end_time > start_time
    ).all()
    
    return len(reservations) != 0, reservations  # Returns True if no conflicts found

def create_device_reservation(
    device_id: int,
    user_id: int,
    test_id: int,
    start_time: datetime,
    duration: int
):
    """Create a new device reservation."""
    # This function would typically interact with the database to create a reservation.
    # For now, we return a mock response.
    from flaskr.db import get_db, DeviceReservation

    db = get_db()
    conflict, conflicted_reservations = is_reservation_conflict(device_id, start_time, duration)
    if conflict:
        raise DeviceReservationError(
            "Device is already reserved during this time.",
            details={
                "device_id": device_id,
                "start_time": start_time.isoformat(),
                "duration": duration,
                "conflicted_reservations": [r.serialize for r in conflicted_reservations]
            })
    if duration <= 0:
        raise DeviceReservationError(
            "Invalid duration.",
            details={
                "duration": duration
            }
        )
    
    reservation = DeviceReservation(
        device_id=device_id,
        user_id=user_id,
        test_id=test_id,
        start_time=start_time,
        end_time=start_time + timedelta(minutes=duration),
    )
    db.session.add(reservation)
    db.session.commit()
    return reservation  

def update_device_reservation(
    reservation_id: int,
    start_time: datetime = None,
    duration: int = None
):
    """Update an existing device reservation."""
    # This function would typically interact with the database to update a reservation.
    # For now, we return a mock response.
    from flaskr.db import get_db, DeviceReservation

    db = get_db()
    reservation = db.session.query(DeviceReservation).filter_by(id=reservation_id).first()
    if not reservation:
        raise ValueError("Device reservation not found", {"reservation_id": reservation_id})
    
    if start_time:
        reservation.start_time = start_time
    if duration:
        reservation.duration = duration

    conflict, conflicted_reservations = is_reservation_conflict(
        reservation.device_id,
        reservation.start_time,
        reservation.duration
    )

    if conflict:
        raise ValueError("Device is already reserved during this time.", {
            "device_id": reservation.device_id,
            "start_time": reservation.start_time.isoformat(),
            "duration": reservation.duration,
            "conflicted_reservations": [r.serialize for r in conflicted_reservations]
        })
    db.session.add(reservation)
    db.session.commit()
    return reservation

def delete_device_reservation(reservation_id: int):
    """Delete a device reservation."""
    # This function would typically interact with the database to delete a reservation.
    # For now, we return a mock response.
    from flaskr.db import get_db, DeviceReservation

    db = get_db()
    reservation = db.session.query(DeviceReservation).filter_by(id=reservation_id).first()
    if not reservation:
        raise ValueError("Device reservation not found", {"reservation_id": reservation_id})
    
    db.session.delete(reservation)
    db.session.commit()
    return

def get_device_reservation_by_id(reservation_id: int):
    """Retrieve a device reservation by ID."""
    # This function would typically interact with the database to retrieve a reservation.
    # For now, we return a mock response.
    from flaskr.db import get_db, DeviceReservation

    db = get_db()
    reservation = db.session.query(DeviceReservation).filter_by(id=reservation_id).first()
    if not reservation:
        raise ValueError("Device reservation not found", {"reservation_id": reservation_id})
    
    return reservation

def list_device_reservations(
    device_id: int = None,
    user_id: int = None,
    test_id: int = None,
    from_time: datetime = None,
    to_time: datetime = None,
    group_id: int = None
):
    """List device reservations with optional filters."""
    # This function would typically interact with the database to list reservations.
    # For now, we return a mock response.
    from flaskr.db import get_db, DeviceReservation

    db = get_db()
    query = db.session.query(DeviceReservation).join(DeviceReservation.user)

    if device_id:
        query = query.filter(DeviceReservation.device_id == device_id)
    if user_id:
        query = query.filter(DeviceReservation.user_id == user_id)
    if test_id:
        query = query.filter(DeviceReservation.test_id == test_id)
    if from_time:
        query = query.filter(DeviceReservation.start_time >= from_time)
    if to_time:
        query = query.filter(DeviceReservation.start_time <= to_time)
    if group_id:
        query = query.join(DeviceReservation.test).filter_by(group_id=group_id)

    return query.all()
