from flask_restful import Resource
from flaskr.db import get_db, User, Group, BelongsToGroup
from flask import request

class BelongsToGroupResource(Resource):
    """Resource for managing group membership."""
    
    def get(self, group_id):
        """Retrieve users belonging to a specific group.
        
        ---
        tags:
            - Group
            - User
        parameters:
            - name: group_id
              in: path
              type: integer
              required: true
              description: The ID of the group to retrieve users from.
        responses:
            200:
                description: A list of users in the group.
                schema:
                    type: array
                    items:
                        $ref: '#/definitions/UserResponseSchema'
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
        memberships = db.session.query(BelongsToGroup).filter_by(group_id=group_id).all()
        if not memberships:
            return {'message': 'Group not found'}, 404
        
        return [membership.user.serialize for membership in memberships], 200
    def post(self, group_id):
        """Add a user to a specific group.
        
        ---
        tags:
            - Group
            - User
        parameters:
            - name: group_id
              in: path
              type: integer
              required: true
              description: The ID of the group to add the user to.
            - name: user_id
              in: body
              required: true
              description: The ID of the user to add to the group.
              schema:
                  type: object
                  properties:
                      user_id:
                          type: integer
                          example: 1
        responses:
            201:
                description: User added to the group successfully.
            404:
                description: Group or user not found.
                schema:
                    type: object
                    properties:
                        message:
                            type: string
                            example: "Group or user not found"
        """
        db = get_db()
        data = request.get_json()
        user_id = data.get('user_id') if data else None
        if not user_id:
            return {'message': 'Invalid input'}, 400

        group = db.session.query(Group).filter_by(id=group_id).first()
        user = db.session.query(User).filter_by(id=user_id).first()
        if not group or not user:
            return {'message': 'Group or user not found'}, 404

        # Prevent duplicate membership
        if db.session.query(BelongsToGroup).filter_by(group_id=group_id, user_id=user_id).first():
            return {'message': 'User already in group'}, 409

        membership = BelongsToGroup(user_id=user_id, group_id=group_id)
        db.session.add(membership)
        db.session.commit()
        return membership.serialize, 201
    def delete(self, group_id):
        """Remove a user from a specific group.
        
        ---
        tags:
            - Group
            - User
        parameters:
            - name: group_id
              in: path
              type: integer
              required: true
              description: The ID of the group to remove the user from.
            - name: user_id
              in: body
              required: true
              description: The ID of the user to remove from the group.
              schema:
                  type: object
                  properties:
                      user_id:
                          type: integer
                          example: 1
        responses:
            204:
                description: User removed from the group successfully.
            404:
                description: Group or user not found.
                schema:
                    type: object
                    properties:
                        message:
                            type: string
                            example: "Group or user not found"
        """
        db = get_db()
        data = request.get_json()
        user_id = data.get('user_id') if data else None
        if not user_id:
            return {'message': 'Invalid input'}, 400

        membership = db.session.query(BelongsToGroup).filter_by(group_id=group_id, user_id=user_id).first()
        if not membership:
            return {'message': 'Group or user not found'}, 404

        db.session.delete(membership)
        db.session.commit()
        return '', 204
    def put(self, group_id):
        """Update a user's group membership.
        
        ---
        tags:
            - Group
            - User
        parameters:
            - name: group_id
              in: path
              type: integer
              required: true
              description: The ID of the group to update the user in.
            - name: user_id
              in: body
              required: true
              description: The ID of the user to update in the group.
              schema:
                  type: object
                  properties:
                      user_id:
                          type: integer
                          example: 1
        responses:
            200:
                description: User's group membership updated successfully.
            404:
                description: Group or user not found.
                schema:
                    type: object
                    properties:
                        message:
                            type: string
                            example: "Group or user not found"
        """
        db = get_db()
        data = request.get_json()
        user_id = data.get('user_id') if data else None
        if not user_id:
            return {'message': 'Invalid input'}, 400

        membership = db.session.query(BelongsToGroup).filter_by(group_id=group_id, user_id=user_id).first()
        if not membership:
            return {'message': 'Group or user not found'}, 404

        # 這裡可根據需求更新 membership 的其他欄位
        db.session.commit()
        return membership.serialize, 200