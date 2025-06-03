from flask_restful import Resource, reqparse

class UserSkillResource(Resource):
    def get(self, user_id):
        """Retrieve a user's skill by user ID.
        
        ---
        tags:
            - User
            - Skill
        definitions:
            UserSkillResponseSchema:
                type: object
                properties:
                    user_id:
                        type: integer
                        example: 1
                    skill_id:
                        type: integer
                        example: 2
                    skill: 
                        $ref: '#/definitions/SkillResponseSchema'
                    created_at:
                        type: string
                        format: date-time
                        example: "2023-10-01T12:00:00Z"
                    updated_at:
                        type: string
                        format: date-time
                        example: "2023-10-01T12:00:00Z"  
        parameters:
            - name: user_id
              in: path
              type: integer
              required: true
              description: The ID of the user.
        responses:
            200:
                description: A user's skill.
                schema:
                    type: array
                    items:
                        $ref: '#/definitions/UserSkillResponseSchema'
            404:
                description: User or skill not found.
                schema:
                    type: object
                    properties:
                        message:
                            type: string
                            example: "User or skill not found"
        """
        from flaskr.db import get_db, UserSkill, User
        try:
            db = get_db()
            user = db.session.query(User).filter_by(id=user_id).first()
            if not user:
                return {"message": f"User with id {user_id} not found"}, 404
            return [us.serialize for us in user.user_skills], 200
        except Exception as e:
            return {"message": str(e)}, 500
    def post(self, user_id):
        """Assign a skill to a user.
        
        ---
        tags:
            - User
            - Skill
        definitions:
            CreateUserSkillSchema:
                type: object
                properties:
                    skill_id:
                        type: integer
                        example: 2
        parameters:
            - name: user_id
              in: path
              type: integer
              required: true
              description: The ID of the user.
            - name: body
              in: body
              required: true
              schema:
                  $ref: '#/definitions/CreateUserSkillSchema'
        responses:
            201:
                description: Skill assigned to user successfully.
                schema:
                    $ref: '#/definitions/UserSkillResponseSchema'
            400:
                description: Bad request.
                schema:
                    type: object
                    properties:
                        message:
                            type: string
                            example: "Invalid input"
        """
        parser = reqparse.RequestParser()
        parser.add_argument('skill_id', type=int, required=True, help='Skill ID is required. {error_msg}')
        args = parser.parse_args(strict=True)

        from flaskr.db import get_db, UserSkill, Skill
        try:
            db = get_db()
            skill = db.session.query(Skill).filter_by(id=args['skill_id']).first()
            if not skill:
                return {"message": "Skill not found"}, 404
            
            existing_user_skill = db.session.query(UserSkill).filter_by(user_id=user_id, skill_id=args['skill_id']).first()
            if existing_user_skill:
                return {"message": f"User with id {user_id} already has skill with id {args['skill_id']}"}, 400

            user_skill = UserSkill(user_id=user_id, skill_id=args['skill_id'])
            db.session.add(user_skill)
            db.session.commit()
            return user_skill.serialize, 201
        except Exception as e:
            return {"message": str(e)}, 400
class UserSkillDetailResource(Resource):
    def delete(self, user_id, skill_id):
        """Remove a skill from a user.
        
        ---
        tags:
            - User
            - Skill
        parameters:
            - name: user_id
              in: path
              type: integer
              required: true
              description: The ID of the user.
            - name: skill_id
              in: path
              type: integer
              required: true
              description: The ID of the skill to remove.
        responses:
            204:
                description: Skill removed from user successfully.
            404:
                description: User or skill not found.
                schema:
                    type: object
                    properties:
                        message:
                            type: string
                            example: "User or skill not found"
        """
        from flaskr.db import get_db, UserSkill
        try:
            db = get_db()
            user_skill = db.session.query(UserSkill).filter_by(user_id=user_id, skill_id=skill_id).first()
            if not user_skill:
                return {"message": f"User with id {user_id} does not have skill with id {skill_id}"}, 404
            
            db.session.delete(user_skill)
            db.session.commit()
            return '', 204
        except Exception as e:
            return {"message": str(e)}, 500