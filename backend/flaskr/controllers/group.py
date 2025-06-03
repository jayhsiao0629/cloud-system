from flask_restful import Resource, reqparse
from flaskr.db import get_db, Group
from flask import request

class GroupDetailResource(Resource):
    """Group detail resource for managing a single group."""
    def get(self, group_id):
        """Retrieve a group by ID.
        
        ---
        tags:
            - Group
        definitions:
            CreateGroupSchema:
                type: object
                properties:
                    name:
                        type: string
                        example: "Group Name"
                    description:
                        type: string
                        example: "Group Description"
                    leader_id:
                        type: integer
                        example: 1
            GroupResponseSchema:
                type: object
                properties:
                    id:
                        type: integer
                        example: 1
                    name:
                        type: string
                        example: "Group Name"
                    description:
                        type: string
                        example: "Group Description"
                    created_at:
                        type: string
                        format: date-time
                        example: "2023-10-01T12:00:00Z"
                    updated_at:
                        type: string
                        format: date-time
                        example: "2023-10-01T12:00:00Z"
                    memberCount:
                        type: integer
                        example: 10
                    activeTests:
                        type: integer
                        example: 5
                    leader:
                        type: object
                        properties:
                            name:
                                type: string
                                example: "John Doe"
                            id:
                                type: integer
                                example: 1
                            email:
                                type: string
                                example: "johndoe@test.com"
                    leader_id:
                        type: integer
                        example: 1
                    
        parameters:
            - name: group_id
              in: path
              type: integer
              required: true
              description: The ID of the group to retrieve.
        responses:
            200:
                description: A single group.
                schema:
                    $ref: '#/definitions/GroupResponseSchema'
            404:
                description: Group not found.
                schema:
                    type: object
                    properties:
                        message:
                            type: string
                            example: "Group not found"
        """
        db = get_db()
        group = db.session.query(Group).filter_by(id=group_id).first()
        if not group:
            return {"message": "Group not found"}, 404
        return group.serialize, 200

    def put(self, group_id):
        """Update a group by ID.
        
        ---
        tags:
            - Group
        definitions:
            UpdateGroupSchema:
                type: object
                properties:
                    name:
                        type: string
                    description:
                        type: string
        parameters:
            - name: group_id
              in: path
              type: integer
              required: true
              description: The ID of the group to update.
            - name: body
              in: body
              required: true
              schema:
                  $ref: '#/definitions/UpdateGroupSchema'
        responses:
            200:
                description: The updated group.
                schema:
                    $ref: '#/definitions/GroupResponseSchema'
            400:
                description: Bad request.
                schema:
                    type: object
                    properties:
                        message:
                            type: string
                            example: "Invalid input"
            404:
                description: Group not found.
                schema:
                    type: object
                    properties:
                        message:
                            type: string
                            example: "Group not found"
        """
        from flaskr.db import User
        db = get_db()
        group = db.session.query(Group).filter_by(id=group_id).first()
        if not group:
            return {"message": "Group not found"}, 404

        data = request.get_json()
        if not data:
            return {"message": "Invalid input"}, 400

        name = data.get("name")
        description = data.get("description")
        leader_id = data.get("leader_id")

        if name is not None:
            group.name = name
        if description is not None:
            group.description = description
        if leader_id is not None:
            leader = db.session.query(User).filter_by(id=leader_id).first()
            if not leader:
                return {"message": "Invalid leader ID."}, 400
            group.leader = leader

        db.session.add(group)
        db.session.commit()
        return group.serialize, 200

    def delete(self, group_id):
        """Delete a group by ID.
        
        ---
        tags:
            - Group
        parameters:
            - name: group_id
              in: path
              type: integer
              required: true
              description: The ID of the group to delete.
        responses:
            204:
                description: No content.
            404:
                description: Group not found.
                schema:
                    type: object
                    properties:
                        message:
                            type: string
                            example: "Group not found"
        """
        from sqlalchemy.exc import IntegrityError
        db = get_db()
        group = db.session.query(Group).filter_by(id=group_id).first()
        if not group:
            return {"message": "Group not found"}, 404

        # Check if the group is associated with any users or tests
        if group.memberCount > 0 or group.activeTests > 0:
            return {"message": "Cannot delete group with members or active tests"}, 400

        db.session.delete(group)
        db.session.commit()
        return '', 204


class GroupResource(Resource):
    """Group resource for managing groups."""
    def get(self):
        """Retrieve a list of groups.
        
        ---
        tags:
            - Group
        responses:
            200:
                description: A list of groups or a single group.
                schema:
                    type: array
                    items:
                        $ref: '#/definitions/GroupResponseSchema'
            404:
                description: No groups found.
                schema:
                    type: object
                    properties:
                        message:
                            type: string
                            example: "No groups found"
        """
        db = get_db()
        groups = db.session.query(Group).all()
        return [g.serialize for g in groups], 200

    def post(self):
        """Create a new group.
        
        ---
        tags:
            - Group
        parameters:
            - name: body
              in: body
              required: true
              schema:
                  $ref: '#/definitions/CreateGroupSchema'
        responses:
            201:
                description: The created group.
                schema:
                    $ref: '#/definitions/GroupResponseSchema'
            400:
                description: Bad request.
                schema:
                    type: object
                    properties:
                        message:
                            type: string
                            example: "Invalid input"
            409:
                description: Group already exists.
                schema:
                    type: object
                    properties:
                        message:
                            type: string
                            example: "Group already exists"
            500:
                description: Internal server error.
                schema:
                    type: object
                    properties:
                        message:
                            type: string
                            example: "Internal server error"
        """
        from flaskr.db import User
        parser = reqparse.RequestParser()
        parser.add_argument('name', type=str, trim=True, required=True, help='Name of the group is required {error_msg}')
        parser.add_argument('description', type=str, required=False, help='Description of the group {error_msg}')
        parser.add_argument('leader_id', type=int, required=True, help='ID of the group leader {error_msg}')
        db = get_db()
        args = parser.parse_args(strict=True)

        name = args.get("name")
        description = args.get("description")
        leader_id = args.get("leader_id")

        if not name:
            return {"message": "Invalid input"}, 400

        # Check if group already exists
        if db.session.query(Group).filter_by(name=name).first():
            return {"message": "Group already exists"}, 409

        # Check if leader exists
        if not db.session.query(User).filter_by(id=leader_id).first():
            return {"message": "Invalid leader ID."}, 400
        group = Group(name=name, description=description, leader_id=leader_id)
        db.session.add(group)
        db.session.commit()
        return group.serialize, 201
