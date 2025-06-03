from flask_restful import Resource, reqparse

class DeviceTypeResource(Resource):
    """DeviceType resource for managing device types."""

    def get(self):
        """Retrieve all device types.
        ---
        tags:
            - DeviceType
            - Device
        definitions:
            DeviceTypeResponseSchema:
                type: object
                properties:
                    id:
                        type: integer
                        example: 1
                    name:
                        type: string
                        example: "Multimeter"
                    description:
                        type: string
                        example: "Device for measuring voltage, current, and resistance"
                    created_at:
                        type: string
                        format: date-time
                        example: "2023-10-01T12:00:00Z"
        responses:
            200:
                description: A list of device types.
                schema:
                    type: array
                    items:
                        $ref: '#/definitions/DeviceTypeResponseSchema'
        """
        from flaskr.db import get_db, DeviceType
        try:
            db = get_db()
            device_types = db.session.query(DeviceType).all()
            return [dt.serialize for dt in device_types], 200
        except Exception as e:
            return {"message": str(e)}, 500
