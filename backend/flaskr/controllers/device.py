from flask_restful import Resource, reqparse
from flask import request, current_app
from flaskr.db import db, Device
import traceback

class DeviceDetailResource(Resource):
    """Device detail resource for managing a single device."""

    def get(self, device_id):
        """Retrieve a device by ID.
        ---
        tags:
            - Device
        definitions:
            DeviceResponseSchema:
                type: object
                properties:
                    device_id:
                        type: integer
                        example: 1
                    name:
                        type: string
                        example: "Device A"
                    device_type:
                        type: object
                        properties:
                            id:
                                type: integer
                                example: 1
                            name:
                                type: string
                                example: "Electrical Device"
                            description:
                                type: string
                                example: "Device for electrical testing"
                            created_at:
                                type: string
                                format: date-time
                            updated_at:
                                type: string
                                format: date-time
                    status:
                        type: string
                        example: "Available"
                        enum: ['Available', 'Reserved', 'Occupied', 'Error', 'Maintaince']
                    description:
                        type: string
                        example: "Device for electrical testing"
                    created_at:
                        type: string
                        format: date-time
                        example: "2023-10-01T12:00:00Z"
                    updated_at:
                        type: string
                        format: date-time
                        example: "2023-10-01T12:00:00Z"
                    previous_maintenance_date:
                        type: string
                        format: date-time
                    next_maintenance_date:
                        type: string
                        format: date-time
                    position:
                        type: string
                        example: "Rack 1, Slot 2"
        parameters:
            - name: device_id
              in: path
              type: integer
              required: true
              description: The ID of the device to retrieve.
        responses:
            200:
                description: A single device.
                schema:
                    $ref: '#/definitions/DeviceResponseSchema'
            404:
                description: Device not found.
                schema:
                    type: object
                    properties:
                        message:
                            type: string
                            example: "Device not found"
        """
        from flaskr.db import get_db, Device
        db = get_db()
        if not device_id:
            return {"message": "Device ID is required"}, 400
        device = db.session.query(Device).filter_by(id=device_id).first()
        if not device:
            return {"message": "Device not found"}, 404
        return device.serialize, 200

    def put(self, device_id):
        """Update a device by ID.
        ---
        tags:
            - Device
        definitions:
            UpdateDeviceSchema:
                type: object
                properties:
                    name:
                        type: string
                    status:
                        type: string
                        enum: ['Available', 'Reserved', 'Occupied', 'Error', 'Maintaince']
                    description:
                        type: string
                    previous_maintenance_date:
                        type: string
                        format: date-time
                    next_maintenance_date:
                        type: string
                        format: date-time
                    position:
                        type: string
                        example: "Rack 1, Slot 2"

        parameters:
            - name: device_id
              in: path
              type: integer
              required: true
              description: The ID of the device to update.
            - name: body
              in: body
              required: true
              schema:
                  $ref: '#/definitions/UpdateDeviceSchema'
        responses:
            200:
                description: The updated device.
                schema:
                    $ref: '#/definitions/DeviceResponseSchema'
            400:
                description: Bad request.
                schema:
                    type: object
                    properties:
                        message:
                            type: string
                            example: "Invalid input"
            404:
                description: Device not found.
                schema:
                    type: object
                    properties:
                        message:
                            type: string
                            example: "Device not found"
        """
        from flaskr.db import get_db, Device, DeviceStatusEnum, DeviceType
        parser = reqparse.RequestParser()
        parser.add_argument('name', type=str, required=False, help='Device name {error_msg}', trim=True)
        parser.add_argument('status', type=DeviceStatusEnum, trim=True, required=False, help='Device status {error_msg}', choices=list(DeviceStatusEnum))
        parser.add_argument('device_type_id', type=int, required=False, help='Device type ID {error_msg}')
        parser.add_argument('description', type=str, required=False, help='Device description {error_msg}')
        parser.add_argument('previous_maintenance_date', type=str, required=False, help='Previous maintenance date in ISO format {error_msg}')
        parser.add_argument('next_maintenance_date', type=str, required=False, help='Next maintenance date in ISO format {error_msg}')
        parser.add_argument('position', type=str, trim=True, required=False, help='Device position {error_msg}')
        args = parser.parse_args(strict=True)
        
        db = get_db()
        device = db.session.query(Device).filter_by(id=device_id).first()
        if not device:
            return {"message": "Device not found"}, 404
        
        for key in args.keys():
            value = args.get(key)
            if value is None:
                continue
            if key in ['previous_maintenance_date', 'next_maintenance_date'] and value:
                from flask_restful import inputs
                value = inputs.datetime_from_iso8601(value)
            if key == 'name':
                if not value or value.strip() == '':
                    return {"message": "Device name could not be empty"}, 400
                exists = db.session.query(Device).filter(Device.name == value.strip(), Device.id != device_id).first()
                if exists:
                    return {"message": f"Device with name `{value}` already exists"}, 409
            if key == 'device_type_id':
                device_type = db.session.query(DeviceType).filter_by(id=args.get('device_type_id')).first()
                if not device_type:
                    return {"message": f"Device type of id: {args.get('device_type_id')} not found"}, 400

            setattr(device, key, value)
        db.session.commit()
        return device.serialize, 200

    def delete(self, device_id):
        """Delete a device by ID.
        ---
        tags:
            - Device
        parameters:
            - name: device_id
              in: path
              type: integer
              required: true
              description: The ID of the device to delete.
        responses:
            204:
                description: No content.
            404:
                description: Device not found.
                schema:
                    type: object
                    properties:
                        message:
                            type: string
                            example: "Device not found"
            400:
                description: Bad request.
                schema:
                    type: object
                    properties:
                        message:
                            type: string
                            example: "Cannot delete device that is reserved or occupied"
        """
        from flaskr.db import get_db, Device, AllowedDevice
        db = get_db()
        device = db.session.query(Device).filter_by(id=device_id).first()
        if not device:
            return {"message": "Device not found"}, 404

        # Check if the device is reserved or occupied
        if device.status in ['Reserved', 'Occupied']:
            return {"message": "Cannot delete device that is reserved or occupied"}, 400
        # Check if the device is related to any existing methods 
        allowed_device = db.session.query(AllowedDevice).filter_by(device_id=device_id).all()
        if allowed_device and len(allowed_device) > 0:
            return {"message": "Cannot delete device that is related to existing methods",
                    "methods": [d.method.serialize for d in allowed_device]
                    }, 400

        db.session.delete(device)
        db.session.commit()
        return '', 204


class DeviceResource(Resource):
    """Device resource for managing devices."""

    def get(self):
        """Retrieve a list of devices.
        ---
        tags:
            - Device
        responses:
            200:
                description: A list of devices.
                schema:
                    type: array
                    items:
                        $ref: '#/definitions/DeviceResponseSchema'
            404:
                description: No devices found.
                schema:
                    type: object
                    properties:
                        message:
                            type: string
                            example: "No devices found"
        """
        from flaskr.db import get_db, Device
        db = get_db()
        devices = db.session.query(Device).all()
        return [device.serialize for device in devices], 200
        
    def post(self):
        """Create a new device.
        ---
        tags:
            - Device
        consumes:
          - application/json
          - application/x-www-form-urlencoded
        definitions:
            CreateDeviceSchema:
                type: object
                properties:
                    name:
                        type: string
                        example: "Device A"
                    device_type_id:
                        type: integer
                        example: 1
                    status:
                        type: string
                        example: "Available"
                        enum: ['Available', 'Reserved', 'Occupied', 'Error', 'Maintaince']
                    description:
                        type: string
                        example: "Device for electrical testing"
                    previous_maintenance_date:
                        type: string
                        format: date-time
                        example: "2023-09-01T12:00:00Z"
                    next_maintenance_date:
                        type: string
                        format: date-time
                        example: "2023-10-01T12:00:00Z"
                    position:
                        type: string
                        example: "Rack 1, Slot 2"
        parameters:
            - name: body
              in: body
              required: true
              schema:
                  $ref: '#/definitions/CreateDeviceSchema'
        responses:
            201:
                description: The created device.
                schema:
                    $ref: '#/definitions/DeviceResponseSchema'
            400:
                description: Bad request.
                schema:
                    type: object
                    properties:
                        message:
                            type: string
                            example: "Invalid input"
            409:
                description: Device already exists.
                schema:
                    type: object
                    properties:
                        message:
                            type: string
                            example: "Device already exists"
        """
        parser = reqparse.RequestParser()
        parser.add_argument('name', type=str, trim=True, required=True, help='Device name is required')
        parser.add_argument('device_type_id', type=int, required=True, help='Device type ID is required')
        parser.add_argument('status', type=str, required=True, help='Device status is required')
        parser.add_argument('description', type=str, required=False, default='', help='Device description')
        parser.add_argument('previous_maintenance_date', type=str, required=False, help='Previous maintenance date in ISO format')
        parser.add_argument('next_maintenance_date', type=str, required=False, help='Next maintenance date in ISO format')
        parser.add_argument('position', type=str, required=False, default='', help='Device position')
        args = parser.parse_args(strict=True)
        from flaskr.db import get_db, Device, DeviceType, DeviceStatusEnum
        from flask_restful import inputs
        db = get_db()
        try:
            name = args.get('name').strip()
            if not name or name == '':
                return {"message": "Device name is required"}, 400
            exists = db.session.query(Device).filter_by(name=name).first()
            if exists:
                return {"message": f"Device with name `{name}` already exists"}, 409
            device_type = db.session.query(DeviceType).filter_by(id=args.get('device_type_id')).first()
            if not device_type:
                return {"message": f"Device type of id: {args.get('device_type_id')} not found"}, 400
            try:
                status = DeviceStatusEnum(args.get('status'))
            except ValueError:
                return {"message": f"Invalid device status: {args.get('status')}"}, 400
            if args.get('previous_maintenance_date'):
                
                previous_maintenance_date = inputs.datetime_from_iso8601(args.get('previous_maintenance_date'))
            if args.get('next_maintenance_date'):
                next_maintenance_date = inputs.datetime_from_iso8601(args.get('next_maintenance_date'))
            device = Device(
                name=name,
                device_type_id=args.get('device_type_id'),
                status=status,
                description=args.get('description', ''),
                position=args.get('position', '')
            )
            if args.get('previous_maintenance_date'):
                device.previous_maintenance_date = previous_maintenance_date
            if args.get('next_maintenance_date'):
                device.next_maintenance_date = next_maintenance_date
            db.session.add(device)
            db.session.commit()
        except ValueError as e:
            return {"message": str(e)}, 400
        return device.serialize, 201
