from flask_restful import Resource, reqparse

class AssignedTestByUserResource(Resource):
    """Resource for managing assigned tests by user."""

    def get(self, user_id):
        """Retrieve all assigned tests for a user.
        ---
        tags:
            - AssignedTest
            - User
            - Test
        definitions:
            AssignedTestResponseSchema:
                type: object
                properties:
                    test_id:
                        type: integer
                    user_id:
                        type: integer
                    status:
                        type: string
                    created_at:
                        type: string
                        format: date-time
                    updated_at:
                        type: string
                        format: date-time
        parameters:
            - name: user_id
              in: path
              type: integer
              required: true
              description: The user ID.
        responses:
            200:
                description: A list of assigned tests for the user.
                schema:
                    type: array
                    items:
                        $ref: '#/definitions/AssignedTestResponseSchema'
            404:
                description: No assigned tests found for this user.
                schema:
                    type: object
                    properties:
                        message:
                            type: string
                            example: "No assigned tests found for this user"
        """
        from flaskr.db import get_db, AssignedTest
        try:
            db = get_db()
            assigned_tests = db.session.query(AssignedTest).filter_by(user_id=user_id).all()
            if not assigned_tests:
                return {"message": "No assigned tests found for this user"}, 404
            return [at.test.serialize for at in assigned_tests], 200
        except Exception as e:
            return {"message": str(e)}, 500

    def post(self, user_id):
        """Assign a new test to a user.
        ---
        tags:
            - AssignedTest
            - User
            - Test
        definitions:
            CreateAssignedTestByUserSchema:
                type: object
                properties:
                    test_id:
                        type: integer
                    status:
                        type: string
        parameters:
            - name: user_id
              in: path
              type: integer
              required: true
              description: The user ID.
            - name: body
              in: body
              required: true
              schema:
                  $ref: '#/definitions/CreateAssignedTestByUserSchema'
        responses:
            201:
                description: The created assigned test.
                schema:
                    $ref: '#/definitions/AssignedTestResponseSchema'
            400:
                description: Bad request.
                schema:
                    type: object
                    properties:
                        message:
                            type: string
                            example: "Invalid input"
            409:
                description: Assigned test already exists.
                schema:
                    type: object
                    properties:
                        message:
                            type: string
                            example: "Assigned test already exists"
        """
        parser = reqparse.RequestParser()
        parser.add_argument('test_id', type=int, required=True, help='Test ID is required')
        parser.add_argument('status', type=str, required=True, help='Status is required')
        args = parser.parse_args(strict=True)
        from flaskr.db import get_db, AssignedTest
        try:
            db = get_db()
            assigned_test = AssignedTest(
                user_id=user_id,
                test_id=args['test_id'],
                status=args['status']
            )
            db.session.add(assigned_test)
            db.session.commit()
            return assigned_test.serialize, 201
        except Exception as e:
            if 'UNIQUE constraint failed' in str(e):
                return {"message": "Assigned test already exists"}, 409
            return {"message": str(e)}, 500
        

class AssignedTestByTestResource(Resource):
    """Resource for managing assigned users by test ID."""

    def get(self, test_id):
        """Retrieve all assigned users for a test.
        ---
        tags:
            - AssignedTest
            - Test
        parameters:
            - name: test_id
              in: path
              type: integer
              required: true
              description: The test ID.
        responses:
            200:
                description: A list of assigned users for the test.
                schema:
                    type: array
                    items:
                        $ref: '#/definitions/UserResponseSchema'
            404:
                description: No assigned users found for this test.
                schema:
                    type: object
                    properties:
                        message:
                            type: string
                            example: "No assigned users found for this test"
        """
        from flaskr.db import get_db, AssignedTest
        try:
            db = get_db()
            assigned_tests = db.session.query(AssignedTest).filter_by(test_id=test_id).all()
            return [at.user.serialize for at in assigned_tests], 200
        except Exception as e:
            return {"message": str(e)}, 500
        

    def post(self, test_id):
        """Assign a user to a test.
        ---
        tags:
            - AssignedTest
            - Test
        definitions:
            CreateAssignedTestByTestSchema:
                type: object
                properties:
                    user_id:
                        type: integer
        parameters:
            - name: test_id
              in: path
              type: integer
              required: true
              description: The test ID.
            - name: body
              in: body
              required: true
              schema:
                  $ref: '#/definitions/CreateAssignedTestByTestSchema'
        responses:
            201:
                description: The created assigned test.
                schema:
                    $ref: '#/definitions/AssignedTestResponseSchema'
            400:
                description: Bad request.
                schema:
                    type: object
                    properties:
                        message:
                            type: string
                            example: "Invalid input"
            409:
                description: Assigned test already exists.
                schema:
                    type: object
                    properties:
                        message:
                            type: string
                            example: "Assigned test already exists"
        """
        parser = reqparse.RequestParser()
        parser.add_argument('user_id', type=int, required=True, help='User ID is required')
        args = parser.parse_args(strict=True)
        from flaskr.db import get_db, AssignedTest
        try:
            db = get_db()
            assigned_test = AssignedTest(
                test_id=test_id,
                user_id=args['user_id'],
            )
            db.session.add(assigned_test)
            db.session.commit()
            return assigned_test.serialize, 201
        except Exception as e:
            if 'UNIQUE constraint failed' in str(e):
                return {"message": "Assigned test already exists"}, 409
            return {"message": str(e)}, 500

