from typing import overload
from flask_restful import Resource, reqparse
import functools
from flask import (
    Blueprint, flash, g, redirect, render_template, request, session, url_for, jsonify
)
from flask import current_app

from ..db import get_db
from ..services.user import (
    create, delete_user, get_all_users, 
    authenticate, get_user_by_id, update_user,
    generate_jwt_token
)
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from logging import getLogger
import traceback
# from flaskr.utils import jwt_identity_matches_user_id, role_required

logger = getLogger(__name__)

class UserResource(Resource):
    def __init__(self):
        self.parser = reqparse.RequestParser()
        self.parser.add_argument(
            'username', type=str, required=True, help='Username cannot be blank')
        self.parser.add_argument(
            'password', type=str, required=True, help='Password cannot be blank')
        self.parser.add_argument(
            'email', type=str, required=True, help='Email cannot be blank')
        self.parser.add_argument(
            'role_id', type=int, required=True, help='Role ID cannot be blank')
        self.parser.add_argument(
            'skill_ids', type=list, location='json', required=False,
            help='List of skills for the user {error_msg}'
        )
    @jwt_required()
    def post(self):
        """
        This examples uses FlaskRESTful Resource
        It works also with swag_from, schemas and spec_dict
        
        ---
        tags:
          - User
        definitions:
          CreateUserSchema: 
            type: object
            properties:
              username:
                type: string
                example: johndoe
              password:
                type: string
                example: password123
              email:
                type: string
                example: admin@test.com
              role_id:
                type: integer
                example: 1
              skill_ids:
                type: array
                items:
                  type: integer
                  example: 1
          UpdateUserSchema:
            type: object
            properties:
              username:
                type: string
                example: johndoe
              password:
                type: string
                example: password123
              email:
                type: string
                example: admin@test.com
              role_id:
                type: integer
                example: 1
              skill_ids:
                type: array
                items:
                  type: integer
                  example: 1
          UserResponseSchema:
            type: object
            properties:
              id:
                type: integer
                example: 1
              username:
                type: string
                example: johndoe
              password:
                type: string
                example: password123
              skills:
                type: array
                items:
                  $ref: '#/definitions/SkillResponseSchema'
              email:
                type: string
                example: admin@test.com
              role_id:
                type: integer
                example: 1
              role:
                $ref: '#/definitions/RoleResponseSchema'
              tests:
                type: array
                items:
                  type: object
                  properties:
                    id:
                      type: integer
                      example: 1
                    name:
                      type: string
                      example: "Test Method"
                    display_id:
                      type: string
                      example: "T-0001"
                    status:
                      type: string
                      enum: ["Pending", "In Progress", "Completed", "Failed", "Cancelled"]
                      example: "Pending"
              created_at:
                type: string
                format: date-time
                example: 2023-10-01T12:00:00Z
              updated_at:
                type: string
                format: date-time
                example: 2023-10-01T12:00:00Z
          SkillResponseSchema:
            type: object
            properties:
              id:
                type: integer
                example: 1
              name:
                type: string
                example: "Test Skill"
              description:
                type: string
                example: "A skill for testing purposes"
              created_at:
                type: string
                format: date-time
              updated_at:
                type: string
                format: date-time
          RoleResponseSchema:
            type: object
            properties:
              id: 
                type: integer
                example: 1
              name:
                type: string
                example: "Admin"
        consumes:
          - application/json
        produces:
          - application/json
        parameters:
          - in: body
            name: user
            type: object
            required: true
            schema:
              $ref: '#/definitions/CreateUserSchema'
            description: User object to be created
        responses:
          201:
            description: User created successfully
            schema:
                $ref: '#/definitions/UserResponseSchema'
        """
        args = self.parser.parse_args(strict=True)
        try:
            user = create(
                args['username'], args['password'], args['email'], args['role_id'], args['skill_ids'])
            return {'message': 'User created successfully', 'user': user.serialize}, 201
        except ValueError as e:
            return {'message': str(e)}, 400
        except Exception as e:
            current_app.logger.error(f"Error creating user: {e} {traceback.format_exc()}")
            return {'message': 'Internal server error'}, 500

    @jwt_required()
    def get(self):
        """
        List all users

<h3>Authentication</h3>
This endpoint requires a valid JWT token to access. The token should be included in the `Authorization` header as a Bearer token.

<h3>Use of `search` query parameter</h3>
**TD;RL:** Search for username is blurred, search for email is exact match. \n\n
This endpoint allows you to filter users by their username or email using the `search` query parameter.
For privacy and security reasons, only if the email is fully matched, it will be returned in the response.

        ---
        tags:
          - User
        consumes:
          - application/json
        produces:
          - application/json
        parameters:
          - in: query
            name: search
            type: string
            required: false
            description: Search term to filter users by username or email
        responses:
          200:
            description: A list of users
            schema:
              type: array
              items:
                $ref: '#/definitions/UserResponseSchema'
          401:
            description: Unauthorized
            schema:
              type: object
              properties:
                msg:
                  type: string
                  example: Missing Authorization Header
        """
        current_app.logger.info(f"Fetching users with args")
        try:
            users = get_all_users(query=request.args.get('search', None))
            current_app.logger.info(f"Fetched users: {users}")
            if users:
                return {'users': [u.serialize for u in users]}, 200
            else:
                return {'message': 'No users found'}, 404

        except Exception as e:
            logger.error(f"Error fetching user: {str(e)}")
            return {'message': 'Internal server error'}, 500

class UserDetailResource(Resource):
    def __init__(self):
        self.parser = reqparse.RequestParser()
        self.parser.add_argument(
            'username', type=str, required=False, help='Username cannot be blank')
        self.parser.add_argument(
            'password', type=str, required=False, help='Password cannot be blank')
        self.parser.add_argument(
            'email', type=str, required=False, help='Email cannot be blank')
        self.parser.add_argument(
            'role_id', type=int, required=False, help='Role ID cannot be blank')
        self.parser.add_argument(
            'skill_ids', type=list, location='json', required=False,
            help='List of skill IDs for the user {error_msg}'
        )
    @jwt_required()
    def put(self, user_id: int):
        """
        Update a user

<h3>Relations Handling</h3>
For skills, tests, and other relations, this endpoint does not handle them directly.
Please use the specific endpoints for those relations.
If you want to update the user's skills, you need to use the `/users/<user_id>/skills` endpoint.
If you want to update the user's tests, you need to use the `/users/<user_id>/tests` endpoint.

        ---
        tags:
          - User
        consumes:
          - application/json
        produces:
          - application/json
        parameters:
          - in: path
            name: user_id
            type: integer
            required: true
            description: ID of the user to update
          - in: body
            name: user
            type: object
            required: true
            schema: 
              $ref: '#/definitions/UpdateUserSchema'
        responses:
          200:
            description: User updated successfully
            schema:
              $ref: '#/definitions/UserResponseSchema'
          401:
            description: Unauthorized
            schema:
              type: object
              properties:
                message:
                  type: string
                  example: Unauthorized
          404:
            description: User not found
            schema:
              type: object
              properties:
                message:
                  type: string
                  example: User not found
          400:
            description: Bad request
            schema:
              type: object
              properties:
                message:
                  type: string
                  example: Invalid input
        """
        args = self.parser.parse_args(strict=True)
        try:
            if all(arg is None for arg in args.values()):
                return {'message': 'No fields to update'}, 400
            claims = get_jwt()
            current_user_id = get_jwt_identity()
            role_id = claims.get('role_id', None)
            if type(current_user_id) is not int:
                current_user_id = int(current_user_id)
            if current_user_id != user_id:
                if role_id is None or role_id != 1:
                  return {'message': 'Unauthorized'}, 401
            user = update_user(
                user_id,
                username=args['username'],
                password=args['password'],
                email=args['email'],
                role_id=args['role_id'],
                skill_ids=args.get('skill_ids')
            )
            return {'message': 'User updated successfully', 'user': user.serialize}, 200

        except ValueError as e:
            return {'message': str(e)}, 404
        except Exception as e:
            logger.error(f"Error updating user: {str(e)}")
            logger.error(traceback.format_exc())
            return {'message': 'Internal server error'}, 500
    
    @jwt_required()
    def get(self, user_id: int):
        """
        Get a user by ID
        ---
        tags:
          - User
        consumes:
          - application/json
        produces:
          - application/json
        parameters:
          - in: path
            name: user_id
            type: integer
            required: true
            description: ID of the user to fetch
        responses:
          200:
            description: User found
            schema:
              $ref: '#/definitions/UserResponseSchema'
          404:
            description: User not found
        """
        current_app.logger.info(f"Fetching user with id {user_id}")
        try:
            user = get_user_by_id(user_id)
            return {'user': user.serialize}, 200
        except ValueError as e:
            return {'message': str(e)}, 404
        except Exception as e:
            logger.error(f"Error fetching user: {str(e)}")
            return {'message': 'Internal server error'}, 500
    
    @jwt_required()
    def delete(self, user_id: int):
        """
        Delete a user
        ---
        tags:
          - User
        consumes:
          - application/json
        produces:
          - application/json
        parameters:
          - in: path
            name: user_id
            type: integer
            required: true
            description: ID of the user to delete
        responses:
          204:
            description: User deleted successfully
            schema:
              type: object
              properties:
                message:
                  type: string
                  example: User deleted successfully
          404:
            description: User not found
            schema:
              type: object
              properties:
                message:
                  type: string
                  example: User not found
        """
        try:
            delete_user(user_id)
            return '', 204
        except ValueError as e:
            return {'message': str(e)}, 404
        except Exception as e:
            logger.error(f"Error deleting user: {str(e)}")
            return {'message': 'Internal server error'}, 500

class UserLoginResource(Resource):
    def __init__(self):
        self.parser = reqparse.RequestParser()
        self.parser.add_argument(
            'username', type=str, required=True, help='Username cannot be blank')
        self.parser.add_argument(
            'password', type=str, required=True, help='Password cannot be blank')

    def post(self):
        """
        User login
        ---
        tags:
          - auth
        consumes:
          - application/json
        produces:
          - application/json
        parameters:
          - in: body
            name: user
            type: object
            required: true
            schema:
              type: object
              properties:
                username:
                  type: string
                  example: johndoe
                password:
                  type: string
                  example: password123
        responses:
          200:
            description: Login successful
            schema:
              type: object
              properties:
                message:
                  type: string
                  example: Login successful
                user_id:
                  type: integer
                  example: 1
          401:
            description: Invalid credentials
            schema:
              type: object
              properties:
                message:
                  type: string
                  example: Invalid credentials
        """
        args = self.parser.parse_args()
        try:
            user = authenticate(args['username'], args['password'])
            token = generate_jwt_token(user)
            return {'message': 'Login successful', 'user_id': user.id, 'access_token': token}, 200
        except ValueError as e:
            logger.warning(f"Login failed for user {args['username']}: {str(e)}")
            return {'message': str(e)}, 401
        except Exception as e:
            logger.error(f"Error during login: {str(e)}")
            return {'message': 'Internal server error'}, 500
