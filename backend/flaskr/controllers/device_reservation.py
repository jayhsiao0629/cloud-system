from flask_restful import Resource, reqparse, inputs
from ..services.device_reservation import (
    create_device_reservation, get_device_reservation_by_id, 
    update_device_reservation, delete_device_reservation,
    list_device_reservations, DeviceReservationError
)
from datetime import datetime

class DeviceReservationDetailResource(Resource):
    """DeviceReservation detail resource for managing a single device reservation."""

    def get(self, reservation_id):
        """Retrieve a device reservation by ID.
        ---
        tags:
            - DeviceReservation
        definitions:
            DeviceReservationResponseSchema:
                type: object
                properties:
                    id:
                        type: integer
                        example: 1
                    device_id:
                        type: integer
                        example: 2
                    device:
                        $ref: '#/definitions/DeviceResponseSchema'
                    user_id:
                        type: integer
                        example: 3
                    user:
                        type: object
                        properties:
                            id:
                                type: integer
                                example: 3
                            username:
                                type: string
                                example: "johndoe"
                    test_id:
                        type: integer
                        example: 4
                    start_time:
                        type: string
                        format: date-time
                        example: "2023-10-01T12:00:00Z"
                    duration:
                        type: integer
                        example: 60
                    created_at:
                        type: string
                        format: date-time
                        example: "2023-10-01T12:00:00Z"
                    updated_at:
                        type: string
                        format: date-time
                        example: "2023-10-01T12:00:00Z"
        parameters:
            - name: id
              in: path
              type: integer
              required: true
              description: The ID of the device reservation to retrieve.
        responses:
            200:
                description: A single device reservation.
                schema:
                    $ref: '#/definitions/DeviceReservationResponseSchema'
            404:
                description: Device reservation not found.
                schema:
                    type: object
                    properties:
                        message:
                            type: string
                            example: "Device reservation not found"
        """
        from flaskr.db import get_db, DeviceReservation
        try:
            return get_device_reservation_by_id(reservation_id).serialize, 200
        except Exception as e:
            return {"message": str(e)}, 500

    def put(self, reservation_id):
        """Update a device reservation by ID.
        ---
        tags:
            - DeviceReservation
        definitions:
            UpdateDeviceReservationSchema:
                type: object
                properties:
                    start_time:
                        type: string
                        format: date-time
                    duration:
                        type: integer
        parameters:
            - name: id
              in: path
              type: integer
              required: true
              description: The ID of the device reservation to update.
            - name: body
              in: body
              required: true
              schema:
                  $ref: '#/definitions/UpdateDeviceReservationSchema'
        responses:
            200:
                description: The updated device reservation.
                schema:
                    $ref: '#/definitions/DeviceReservationResponseSchema'
            400:
                description: Bad request.
                schema:
                    type: object
                    properties:
                        message:
                            type: string
                            example: "Invalid input"
            404:
                description: Device reservation not found.
                schema:
                    type: object
                    properties:
                        message:
                            type: string
                            example: "Device reservation not found"
        """
        from flaskr.db import get_db, DeviceReservation
        parser = reqparse.RequestParser()
        parser.add_argument('start_time', type=str, required=False, help='Start time of the reservation')
        parser.add_argument('duration', type=int, required=False, help='Duration of the reservation in minutes')
        args = parser.parse_args()

        try:
            reservation = update_device_reservation(
                reservation_id, 
                start_time=args.get('start_time'), 
                duration=args.get('duration')
            )
            return reservation.serialize, 200
        except Exception as e:
            return {"message": str(e)}, 500

    def delete(self, reservation_id):
        """Delete a device reservation by ID.
        ---
        tags:
            - DeviceReservation
        parameters:
            - name: id
              in: path
              type: integer
              required: true
              description: The ID of the device reservation to delete.
        responses:
            204:
                description: No content.
            404:
                description: Device reservation not found.
                schema:
                    type: object
                    properties:
                        message:
                            type: string
                            example: "Device reservation not found"
        """
        try:
            delete_device_reservation(reservation_id)
            return {}, 204
        except ValueError as e:
            return {"message": str(e)}, 404
        except Exception as e:
            return {"message": str(e)}, 500

class DeviceReservationResource(Resource):
    """DeviceReservation resource for managing device reservations."""

    def get(self):
        """Retrieve a list of device reservations.
        ---
        tags:
            - DeviceReservation
        parameters:
            - name: device_id
              in: query
              type: integer
              required: false
              description: Filter by device ID.
            - name: user_id
              in: query
              type: integer
              required: false
              description: Filter by user ID.
            - name: test_id
              in: query
              type: integer
              required: false
              description: Filter by test ID.
            - name: from_time
              in: query
              type: string
              format: date-time
              required: false
              description: Filter reservations starting from this time.
            - name: to_time
              in: query
              type: string
              format: date-time
              required: false
              description: Filter reservations ending before this time.
            - name: group_id
              in: query
              type: integer
              required: false
              description: Filter by group ID.
        responses:
            200:
                description: A list of device reservations.
                schema:
                    type: array
                    items:
                        $ref: '#/definitions/DeviceReservationResponseSchema'
            404:
                description: No device reservations found.
                schema:
                    type: object
                    properties:
                        message:
                            type: string
                            example: "No device reservations found"
        """
        from flask import request
        args = request.args.to_dict()
        try:
            from_time = datetime.fromisoformat(args.get('from_time')) if args.get('from_time') else None
            to_time = datetime.fromisoformat(args.get('to_time')) if args.get('to_time') else None
            reservations = list_device_reservations(
                device_id=args.get('device_id'),
                user_id=args.get('user_id'),
                test_id=args.get('test_id'),
                from_time=from_time,
                to_time=to_time,
                group_id=args.get('group_id')
            )
            if not reservations:
                return {"message": "No device reservations found"}, 404
            return [res.serialize for res in reservations], 200
        except ValueError as e:
            return {"message": str(e)}, 400
        except Exception as e:
            return {"message": str(e)}, 500

    def post(self):
        """Create a new device reservation.
<h3>Note</h3>
Note that the start_time must be in ISO 8601 format (e.g., "2023-10-01T12:00:00Z") and the duration is in minutes.
If you want to specify a timezone, you can use the format "2023-10-01T12:00:00+02:00" for UTC+2.\n
<h3>Using Taiwan Timezone</h3>
For example, to reserve a device for 60 minutes starting from Taiwan time (UTC+8), you would use "2023-10-01T20:00:00+08:00".
        ---
        tags:
            - DeviceReservation
            
        definitions:
            CreateDeviceReservationSchema:
                type: object
                properties:
                    device_id:
                        type: integer
                        example: 1
                    user_id:
                        type: integer
                        example: 2
                    test_id:
                        type: integer
                        example: 3
                    start_time:
                        type: string
                        format: date-time
                        description: Start time of the reservation, must be in ISO 8601 format
                    duration:
                        type: integer
                        example: 60
                        description: Duration of the reservation in minutes
        parameters:
            - name: body
              in: body
              required: true
              schema:
                  $ref: '#/definitions/CreateDeviceReservationSchema'
        responses:
            201:
                description: The created device reservation.
                schema:
                    $ref: '#/definitions/DeviceReservationResponseSchema'
            400:
                description: Bad request.
                schema:
                    type: object
                    properties:
                        message:
                            type: string
                            example: "Invalid input"
            409:
                description: Device is already reserved during this time.
                schema:
                    type: object
                    properties:
                        message:
                            type: string
                            example: "Device is already reserved during this time."
                        details:
                            type: object
                            properties:
                                device_id:
                                    type: integer
                                    example: 1
                                start_time:
                                    type: string
                                    format: date-time
                                duration:
                                    type: integer
                                    example: 60
                                conflicted_reservations:
                                    type: array
                                    items:
                                        $ref: '#/definitions/DeviceReservationResponseSchema'
        """
        parser = reqparse.RequestParser()
        parser.add_argument('device_id', type=int, required=True, help='ID of the device')
        parser.add_argument('user_id', type=int, required=True, help='ID of the user')
        parser.add_argument('test_id', type=int, required=False, help='ID of the test')
        parser.add_argument('start_time', type=str, required=True, help='Start time of the reservation')
        parser.add_argument('duration', type=int, required=True, help='Duration of the reservation in minutes')
        args = parser.parse_args()
        from flask import current_app
        logger = current_app.logger
        logger.info(f"start_time: {args.get('start_time')}, typeof start_time: {type(args.get('start_time'))}")
        try:
            reservation = create_device_reservation(
                device_id=args.get('device_id'),
                user_id=args.get('user_id'),
                test_id=args.get('test_id'),
                start_time=inputs.datetime_from_iso8601(args.get('start_time')),
                duration=args.get('duration')
            )
            return reservation.serialize, 201
        except DeviceReservationError as e:
            return {"message": e.message,
                    "details": e.details
                    }, 409
        except ValueError as e:
            return {"message": str(e)}, 400
        except Exception as e:
            logger.error(f"Error creating device reservation: {str(e)}")
            # log the exception stack trace
            import traceback
            logger.error(traceback.format_exc())
            return {"message": str(e)}, 500