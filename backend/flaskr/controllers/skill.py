from flask_restful import Resource, reqparse

class SkillResource(Resource):
    """Skill resource for managing skills."""
    def get(self):
        """Retrieve all skills.
        ---
        tags:
            - Skill
        definitions:
            SkillResponseSchema:
                type: object
                properties:
                    id:
                        type: integer
                        example: 1
                    name:
                        type: string
                        example: "Electrical Testing"
                    description:
                        type: string
                        example: "Skill for performing electrical tests"
                    created_at:
                        type: string
                        format: date-time
                        example: "2023-10-01T12:00:00Z"
        responses:
            200:
                description: A list of skills.
                schema:
                    type: array
                    items:
                        $ref: '#/definitions/SkillResponseSchema'
        """
        from flaskr.db import get_db, Skill
        try:
            db = get_db()
            skills = db.session.query(Skill).all()
            return [skill.serialize for skill in skills], 200
        except Exception as e:
            return {"message": str(e)}, 500
        
    def post(self):
        """Create a new skill.
        ---
        tags:
            - Skill
        parameters:
            - name: body
              in: body
              required: true
              schema:
                  type: object
                  properties:
                      name:
                          type: string
                          example: "Electrical Testing"
                      description:
                          type: string
                          example: "Skill for performing electrical tests"
        responses:
            201:
                description: The created skill.
                schema:
                    $ref: '#/definitions/SkillResponseSchema'
            400:
                description: Bad request.
                schema:
                    type: object
                    properties:
                        message:
                            type: string
                            example: "Invalid input"
        """
        from flaskr.db import get_db, Skill
        parser = reqparse.RequestParser()
        parser.add_argument('name', type=str, required=True, help='Name of the skill is required')
        parser.add_argument('description', type=str, required=False, default='', help='Description of the skill')
        try:
            data = parser.parse_args()
            db = get_db()
            if not data or 'name' not in data:
                return {"message": "Invalid input"}, 400
            
            skill = Skill(name=data['name'], description=data.get('description', ''))
            db.session.add(skill)
            db.session.commit()
            return skill.serialize, 201
        except Exception as e:
            return {"message": str(e)}, 500
        except ValueError as ve:
            return {"message": str(ve)}, 400
class SkillDetailResource(Resource):
    """Skill detail resource for managing a specific skill."""
    def get(self, skill_id):
        """Retrieve a specific skill by ID.
        ---
        tags:
            - Skill
        parameters:
            - name: skill_id
              in: path
              type: integer
              required: true
              description: The ID of the skill to retrieve
        responses:
            200:
                description: The requested skill.
                schema:
                    $ref: '#/definitions/SkillResponseSchema'
            404:
                description: Skill not found.
                schema:
                    type: object
                    properties:
                        message:
                            type: string
                            example: "Skill not found"
        """
        from flaskr.db import get_db, Skill
        parser = reqparse.RequestParser()
        skill_id = int(skill_id)
        if not skill_id or skill_id <= 0:
            return {"message": "Invalid skill ID"}, 400
        try:
            db = get_db()
            skill = db.session.query(Skill).filter(Skill.id == skill_id).first()
            if not skill:
                return {"message": "Skill not found"}, 404
            return skill.serialize, 200
        except Exception as e:
            return {"message": str(e)}, 500
    def put(self, skill_id):
        """Update a skill by ID.
        ---
        tags:
            - Skill
        parameters:
            - name: skill_id
              in: path
              type: integer
              required: true
              description: The ID of the skill to update.
            - name: body
              in: body
              required: true
              schema:
                  type: object
                  properties:
                      name:
                          type: string
                          example: "Updated Skill Name"
                      description:
                          type: string
                          example: "Updated description of the skill"
        responses:
            200:
                description: The updated skill.
                schema:
                    $ref: '#/definitions/SkillResponseSchema'
            400:
                description: Bad request.
                schema:
                    type: object
                    properties:
                        message:
                            type: string
                            example: "Invalid input"
            404:
                description: Skill not found.
                schema:
                    type: object
                    properties:
                        message:
                            type: string
                            example: "Skill not found"
        """
        from flaskr.db import get_db, Skill
        parser = reqparse.RequestParser()
        parser.add_argument('name', type=str, required=True, help='Name of the skill is required')
        parser.add_argument('description', type=str, required=False, default='', help='Description of the skill')
        try:
            data = parser.parse_args()
            db = get_db()
            skill = db.session.query(Skill).filter(Skill.id == skill_id).first()
            if not skill:
                return {"message": "Skill not found"}, 404
            
            skill.name = data['name']
            skill.description = data.get('description', '')
            db.session.commit()
            return skill.serialize, 200
        except Exception as e:
            return {"message": str(e)}, 500
        except ValueError as ve:
            return {"message": str(ve)}, 400
    def delete(self, skill_id):
        """Delete a skill by ID.
        ---
        tags:
            - Skill
        parameters:
            - name: skill_id
              in: path
              type: integer
              required: true
              description: The ID of the skill to delete.
        responses:
            204:
                description: No content.
            404:
                description: Skill not found.
                schema:
                    type: object
                    properties:
                        message:
                            type: string
                            example: "Skill not found"
        """
        from flaskr.db import get_db, Skill
        try:
            db = get_db()
            skill = db.session.query(Skill).filter(Skill.id == skill_id).first()
            if not skill:
                return {"message": "Skill not found"}, 404
            
            db.session.delete(skill)
            db.session.commit()
            return '', 204
        except Exception as e:
            return {"message": str(e)}, 500
        except ValueError as ve:
            return {"message": str(ve)}, 400
