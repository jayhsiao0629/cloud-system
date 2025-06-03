from flask_restful import Resource, reqparse

class MethodDetailResource(Resource):
    """Method detail resource for managing a single method."""

    def get(self, method_id):
        """Retrieve a method by ID.
        ---
        tags:
            - Method
        definitions:
            MethodResponseSchema:
                type: object
                properties:
                    id:
                        type: integer
                        example: 1
                    name:
                        type: string
                        example: "Method A"
                    skills:
                        type: array
                        items:
                            $ref: '#/definitions/SkillResponseSchema'
                    devices:
                        type: array
                        items:
                            $ref: '#/definitions/DeviceResponseSchema'
                    description:
                        type: string
                        example: "Method for electrical testing"
                    created_at:
                        type: string
                        format: date-time
                        example: "2023-10-01T12:00:00Z"
                    updated_at:
                        type: string
                        format: date-time
                        example: "2023-10-01T12:00:00Z"
        parameters:
            - name: method_id
              in: path
              type: integer
              required: true
              description: The ID of the method to retrieve.
        responses:
            200:
                description: A single method.
                schema:
                    $ref: '#/definitions/MethodResponseSchema'
            404:
                description: Method not found.
                schema:
                    type: object
                    properties:
                        message:
                            type: string
                            example: "Method not found"
        """
        from flaskr.db import get_db, Method
        try:
            db = get_db()
            method = db.session.query(Method).filter_by(id=method_id).first()
            if not method:
                return {"message": "Method not found"}, 404
            return method.serialize, 200
        except Exception as e:
            return {"message": str(e)}, 500
        

    def put(self, method_id):
        """Update a method by ID.
        ---
        tags:
            - Method
        definitions:
            UpdateMethodSchema:
                type: object
                properties:
                    name:
                        type: string
                    description:
                        type: string
        parameters:
            - name: method_id
              in: path
              type: integer
              required: true
              description: The ID of the method to update.
            - name: body
              in: body
              required: true
              schema:
                  $ref: '#/definitions/UpdateMethodSchema'
        responses:
            200:
                description: The updated method.
                schema:
                    $ref: '#/definitions/MethodResponseSchema'
            400:
                description: Bad request.
                schema:
                    type: object
                    properties:
                        message:
                            type: string
                            example: "Invalid input"
            404:
                description: Method not found.
                schema:
                    type: object
                    properties:
                        message:
                            type: string
                            example: "Method not found"
        """
        from flaskr.db import get_db, Method
        parser = reqparse.RequestParser()
        parser.add_argument('name', type=str, required=True, help='Name of the method')
        parser.add_argument('description', type=str, required=False, help='Description of the method')
        args = parser.parse_args()
        try:
            db = get_db()
            method = db.session.query(Method).filter_by(id=method_id).first()
            if not method:
                return {"message": "Method not found"}, 404
            if args.get('name'):
                existing_method = db.session.query(Method).filter_by(name=args['name']).first()
                if existing_method and existing_method.id != method_id:
                    return {"message": f"Method with name {args['name']} already exists"}, 409
                method.name = args['name']
            if args.get('description'):
                method.description = args['description']
            db.session.commit()
            return method.serialize, 200
        except Exception as e:
            return {"message": str(e)}, 500

    def delete(self, method_id):
        """Delete a method by ID.
        ---
        tags:
            - Method
        parameters:
            - name: method_id
              in: path
              type: integer
              required: true
              description: The ID of the method to delete.
        responses:
            204:
                description: No content.
            404:
                description: Method not found.
                schema:
                    type: object
                    properties:
                        message:
                            type: string
                            example: "Method not found"
        """
        from flaskr.db import get_db, Method
        try:
            db = get_db()
            method = db.session.query(Method).filter_by(id=method_id).first()
            if not method:
                return {"message": "Method not found"}, 404
            
            db.session.delete(method)
            db.session.commit()
            return {}, 204
        except Exception as e:
            return {"message": str(e)}, 500

class MethodResource(Resource):
    """Method resource for managing methods."""

    def get(self):
        """Retrieve a list of methods.
        ---
        tags:
            - Method
        responses:
            200:
                description: A list of methods.
                schema:
                    type: array
                    items:
                        $ref: '#/definitions/MethodResponseSchema'
            404:
                description: No methods found.
                schema:
                    type: object
                    properties:
                        message:
                            type: string
                            example: "No methods found"
        """
        from flaskr.db import get_db, Method
        try:
            db = get_db()
            methods = db.session.query(Method).all()
            if not methods:
                return {"message": "No methods found"}, 404
            return [method.serialize for method in methods], 200
        except Exception as e:
            return {"message": str(e)}, 500

    def post(self):
        """Create a new method.
        ---
        tags:
            - Method
        definitions:
            CreateMethodSchema:
                type: object
                properties:
                    name:
                        type: string
                    description:
                        type: string
        parameters:
            - name: body
              in: body
              required: true
              schema:
                  $ref: '#/definitions/CreateMethodSchema'
        responses:
            201:
                description: The created method.
                schema:
                    $ref: '#/definitions/MethodResponseSchema'
            400:
                description: Bad request.
                schema:
                    type: object
                    properties:
                        message:
                            type: string
                            example: "Invalid input"
            409:
                description: Method already exists.
                schema:
                    type: object
                    properties:
                        message:
                            type: string
                            example: "Method already exists"
        """
        from flaskr.db import get_db, Method
        parser = reqparse.RequestParser()
        parser.add_argument('name', type=str, required=True, help='Name of the method')
        parser.add_argument('description', type=str, required=False, help='Description of the method')
        args = parser.parse_args(strict=True)
        try:
            db = get_db()
            existing_method = db.session.query(Method).filter_by(name=method.name).first()
            if existing_method:
                return {"message": f"Method with (name, id) ({existing_method.name}, {existing_method.id}) already exists"}, 409
            method = Method(name=args['name'], description=args.get('description', ''))
            db.session.add(method)
            db.session.commit()
            return method.serialize, 201
        except Exception as e:
            return {"message": str(e)}, 500

