from flask_restful import Resource, reqparse
from flask import request, current_app

class TestDetailResource(Resource):
    """Test detail resource for managing a single test."""

    def get(self, test_id):
        """Retrieve a test by ID.
<h3>Note</h3>
You must provide a valid `test_id` to retrieve a test. 
A `test_id` is a unique identifier for the test, which can be an integer.
<h3>The use of `display_id`</h3>
For now, `display_id` is not used in any URL endpoints. That is, you cannot retrieve a test by `display_id` directly.
        ---
        tags:
            - Test
        definitions:
            TestResponseSchema:
                type: object
                properties:
                    id:
                        type: integer
                        example: 1
                    name:
                        type: string
                        example: "Test Name"
                    display_id:
                        type: string
                        example: "T-0001"
                        pattern: "^[A-Za-z0-9-_.]+$"
                        description: "Unique identifier for the test, can be A-Z, a-z, 0-9, and special characters"
                    status:
                        type: string
                        enum: ["Pending", "InProgress", "Completed", "Failed", "Cancelled"]
                        example: "Pending"
                    method:
                        $ref: '#/definitions/MethodResponseSchema'
                    group_id:
                        type: integer
                        example: 1
                    method_id:
                        type: integer
                        example: 1
                    method:
                        $ref: '#/definitions/MethodResponseSchema'
                    users:
                        type: array
                        items:
                            type: object
                            properties:
                                id:
                                    type: integer
                                    example: 1
                                username:
                                    type: string
                                    example: "testuser"
                    test_reports:
                        type: array
                        items:
                            type: object
                            properties:
                                id:
                                    type: integer
                                    example: 1       
                    description:
                        type: string
                        example: "Test description"
                    created_at:
                        type: string
                        format: date-time
                    updated_at:
                        type: string
                        format: date-time
        parameters:
            - name: test_id
              in: path
              type: integer
              required: true
              description: The ID of the test to retrieve.
        responses:
            200:
                description: A single test.
                schema:
                    $ref: '#/definitions/TestResponseSchema'
            404:
                description: Test not found.
                schema:
                    type: object
                    properties:
                        message:
                            type: string
                            example: "Test not found"
        """
        from flaskr.db import get_db, Test
        try:
            db = get_db()
            test = db.session.query(Test).filter_by(id=test_id).first()
            if not test:
                return {"message": "Test not found"}, 404
            return test.serialize, 200
        except Exception as e:
            return {"message": str(e)}, 500
        
    def put(self, test_id):
        """Update a test by ID.
        ---
        tags:
            - Test
        parameters:
            - name: test_id
              in: path
              type: integer
              required: true
              description: The ID of the test to update.
            - name: body
              in: body
              required: true
              schema:
                $ref: '#/definitions/CreateTestSchema'
        responses:
            200:
                description: The updated test.
                schema:
                    $ref: '#/definitions/TestResponseSchema'
            400:
                description: Bad request.
                schema:
                    type: object
                    properties:
                        message:
                            type: string
                            example: "Invalid input"
            404:
                description: Test not found.
                schema:
                    type: object
                    properties:
                        message:
                            type: string
                            example: "Test not found"
        """
        from flaskr.db import get_db, Test, TestStatusEnum
        parser = reqparse.RequestParser()
        parser.add_argument('name', type=str, trim=True, required=False, help='Test name is required {error_msg}')
        parser.add_argument('display_id', type=str, trim=True, required=False, help='Display ID is required {error_msg}')
        parser.add_argument('status', type=TestStatusEnum, required=False, help='Status is required {error_msg}')
        parser.add_argument('group_id', type=int, required=False, help='Group ID is required {error_msg}')
        parser.add_argument('method_id', type=int, required=False, help='Method ID is required {error_msg}')
        parser.add_argument('description', type=str, required=False, help='Description of the test {error_msg}')
        

        try:
            args = parser.parse_args(strict=True)
            db = get_db()
            test = db.session.query(Test).filter_by(id=test_id).first()
            if not test:
                return {"message": "Test not found"}, 404
            for key in args.keys():
                if args[key] is not None:
                    setattr(test, key, args[key])
            db.session.commit()
            return test.serialize, 200
        except Exception as e:
            if 'UniqueViolation' in str(e):
                return {"message": f"Test with display_id: {args['display_id']} already exists in group"}, 409
            elif 'Invalid input' in str(e):
                return {"message": "Invalid input"}, 400
            else:
                return {"message": str(e)}, 500

    def delete(self, test_id):
        """Delete a test by ID.
        ---
        tags:
            - Test
        parameters:
            - name: test_id
              in: path
              type: integer
              required: true
              description: The ID of the test to delete.
        responses:
            204:
                description: No content.
            404:
                description: Test not found.
        """
        from flaskr.db import get_db, Test
        try:
            db = get_db()
            test = db.session.query(Test).filter_by(id=test_id).first()
            if not test:
                return {"message": "Test not found"}, 404
            db.session.delete(test)
            db.session.commit()
            return '', 204
        except Exception as e:
            return {"message": str(e)}, 500


class TestResource(Resource):
    """Test resource for managing tests."""

    def get(self):
        """Retrieve a list of tests.
        ---
        tags:
            - Test
        parameters:
            - name: assigned
              in: query
              type: boolean
              required: false
              description: Whether to filter tests that are assigned to users.
            - name: group_id
              in: query
              type: integer
              required: false
              description: The ID of the group to filter tests by.
            - name: method_id
              in: query
              type: integer
              required: false
              description: The ID of the method to filter tests by.
            - name: status
              in: query
              type: string
              required: false
              description: The status of the tests to filter by.
              enum: ["Pending", "InProgress", "Completed", "Failed", "Cancelled"]
            - name: display_id
              in: query
              type: string
              required: false
              description: The display ID of the tests to filter by.
            - name: name
              in: query
              type: string
              required: false
              description: The name of the tests to filter by.
            - name: order_by
              in: query
              type: string
              required: false
              description: The field to order the tests by.
              enum: ["created_at", "updated_at"]
            - name: order
              in: query
              type: string
              required: false
              description: The order of the tests.
              enum: ["asc", "desc"]
        responses:
            200:
                description: A list of tests.
                schema:
                    type: array
                    items:
                        $ref: '#/definitions/TestResponseSchema'
        """
        from flaskr.db import get_db, Test
        args = request.args
        try:
            db = get_db()
            q = db.session.query(Test)
            if args.get('group_id'):
                q = q.filter(Test.group_id == args['group_id'])
            if args.get('method_id'):
                q = q.filter(Test.method_id == args['method_id'])
            if args.get('status'):
                q = q.filter(Test.status == args['status'])
            if args.get('display_id'):
                q = q.filter(Test.display_id == args['display_id'])
            if args.get('name'):
                q = q.filter(Test.name.ilike(f"%{args['name']}%"))
            if args.get('order_by', 'created_at') == 'created_at':
                q = q.order_by(Test.created_at.desc() if args.get('order', 'desc') == 'desc' else Test.created_at)
            elif args.get('order_by') == 'updated_at':
                q = q.order_by(Test.updated_at.desc() if args.get('order', 'desc') == 'desc' else Test.updated_at)
            if args.get('assigned') is not None:
                from flaskr.db import AssignedTest
                if args.get('assigned').lower() == 'true':
                    q = q.join(AssignedTest).filter(AssignedTest.user_id.isnot(None))
                else:
                    q = q.outerjoin(AssignedTest).filter(AssignedTest.user_id.is_(None))
            tests = q.all()
            return [test.serialize for test in tests], 200
        except Exception as e:
            return {"message": str(e)}, 500

    def post(self):
        """Create a new test.
<h2>Display ID (display_id)</h2>
`display_id` is a unique identifier for the test, which can include alphanumeric characters and special characters like hyphens, underscores, and periods.
It is used to uniquely identify a test within a group.
<h3>Unique `display_id` within a group</h3>
Each `display_id` must be unique within a group. If a test with the same `display_id` already exists in the group, an error will be returned.
<h3>Use in URL</h3>
For now, `display_id` is not used in any URL endpoints.
        ---
        tags:
            - Test
        definitions:
            CreateTestSchema:
                type: object
                properties:
                    name:
                        type: string
                        example: "Test Name"
                    display_id:
                        type: string
                        example: "T-0001"
                        pattern: "^[A-Za-z0-9-_.]+$"
                        description: "Unique identifier for the test, can be A-Z, a-z, 0-9, and special characters"
                    status:
                        type: string
                        enum: ["Pending", "InProgress", "Completed", "Failed", "Cancelled"]
                        example: "Pending"
                    group_id:
                        type: integer
                        example: 1
                    method_id:
                        type: integer
                        example: 1
                    description:
                        type: string
                        example: "Test description"
        parameters:
            - name: body
              in: body
              required: true
              schema:
                  $ref: '#/definitions/CreateTestSchema'
        responses:
            201:
                description: The created test.
                schema:
                    $ref: '#/definitions/TestResponseSchema'
            400:
                description: Bad request.
                schema:
                    type: object
                    properties:
                        message:
                            type: string
                            example: "Invalid input"
            409:
                description: Test already exists.
                schema:
                    type: object
                    properties:
                        message:
                            type: string
                            example: "Test already exists"
        """
        from flaskr.db import get_db, Test, TestStatusEnum
        parser = reqparse.RequestParser()
        parser.add_argument('name', type=str, required=True, help='Test name is required')
        parser.add_argument('display_id', type=str, required=True, help='Display ID is required')
        parser.add_argument('status', type=TestStatusEnum, required=True, help='Status is required. {error_msg}')
        parser.add_argument('group_id', type=int, required=True, help='Group ID is required')
        parser.add_argument('method_id', type=int, required=True, help='Method ID is required')
        parser.add_argument('description', type=str)
        args = parser.parse_args(strict=True)
        current_app.logger.info(f"Creating test with args: {args}")
        try:
            db = get_db()
            test = Test(
                name=args['name'],
                display_id=args['display_id'],
                status=TestStatusEnum(args['status']),
                group_id=args['group_id'],
                method_id=args['method_id'],
                description=args.get('description')
            )
            db.session.add(test)
            db.session.commit()
            return test.serialize, 201
        except Exception as e:
            if 'UniqueViolation' in str(e):
                return {"message": f"Test unique_id: {args['display_id']} already exists in group"}, 409
            elif 'Invalid input' in str(e):
                return {"message": "Invalid input"}, 400
            else:
                return {"message": str(e)}, 500