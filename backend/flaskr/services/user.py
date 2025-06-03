import traceback
from werkzeug.security import check_password_hash, generate_password_hash
from flask import current_app, g
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy import or_

def validate_skills(skills):
    """Validate skills to ensure they are in the correct format."""
    if not isinstance(skills, list):
        raise ValueError("Skills must be a list")
    for skill in skills:
        if not isinstance(skill, int):
            raise ValueError(f"Invalid skill ID: {skill}. Skill IDs must be integers.")


def create(username, password, email, role_id, skill_ids=[]):
    """Create a new user."""
    from flaskr.db import get_db, User
    db = get_db()
    try:
        if skill_ids:
            from flaskr.db import UserSkill
            validate_skills(skill_ids)
            user_skills = [UserSkill(skill_id=sid) for sid in skill_ids]
        user = User(username=username, password=generate_password_hash(password), email=email, role_id=role_id, user_skills=user_skills)

        db.session.add(user)
        db.session.commit()
        return user
    except IntegrityError as e:
        raise ValueError(f"User already exists {str(e)}")
    except SQLAlchemyError as e:
        db.session.rollback()
        raise ValueError(f"Database error: {str(e)}")
    except ValueError as e:
        db.session.rollback()
        raise ValueError(f"Validation error: {str(e)}")
    except Exception as e:
        db.session.rollback()
        raise ValueError(f"An error occurred: {str(e)}")

def get_user_by_id(user_id: int):
    """Get a user by ID."""
    from flaskr.db import get_db, User, UserSkill
    db = get_db()
    user = db.session.query(User).filter_by(id=user_id).first()
    if user is None:
        raise ValueError("User not found")
    return user

def get_user_by_username(username):
    """Get a user by username."""
    from flaskr.db import get_db, User
    db = get_db()
    user = db.session.query(User).filter_by(username=username).first()
    if user is None:
        raise ValueError("User not found")
    return user
def update_user(user_id, username=None, password=None, email=None, role_id=None, skill_ids=None):
    """Update a user."""
    from flaskr.db import get_db, User
    db = get_db()
    user = db.session.query(User).filter_by(id=user_id).first()
    if user is None:
        raise ValueError("User not found")
    
    if username:
        user.username = username
    if password:
        user.password = generate_password_hash(password)
    if email:
        user.email = email
    if role_id:
        user.role_id = role_id
    if skill_ids is not None:
        from flaskr.db import UserSkill, Skill
        validate_skills(skill_ids)
        existing_skill_ids = [uk.skill_id for uk in user.user_skills]
        # Remove skills that are not in the new list
        to_remove = set(existing_skill_ids) - set(skill_ids)
        if to_remove:
            current_app.logger.info(f"Removing skills {to_remove} from user {user.id}")
            for skill_id in to_remove:
                us = db.session.query(UserSkill).filter_by(user_id=user.id, skill_id=skill_id).first()
                if us:
                    user.user_skills.remove(us)
                    db.session.delete(us)

        # Add new skills
        for skill_id in skill_ids:
            if skill_id not in existing_skill_ids:
                us = UserSkill(user_id=user.id, skill_id=skill_id)
                user.skills.append(us)
                db.session.add(us)
    db.session.add(user)
    try:
        db.session.commit()
    except IntegrityError as e:
        db.session.rollback()
        current_app.logger.error(f"Integrity error during user update: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        raise ValueError(f"User update failed due to integrity error: {str(e)}")
    except SQLAlchemyError as e:
        db.session.rollback()
        raise ValueError(f"Database error: {str(e)}")
    return user
def delete_user(user_id):
    """Delete a user."""
    from flaskr.db import get_db, User, Group
    db = get_db()
    user = db.session.query(User).filter_by(id=user_id).first()
    if user is None:
        raise ValueError("User not found")

    # check if user leads any groups
    leadership = db.session.query(Group).filter_by(leader_id=user_id).first()

    if leadership:
        raise ValueError(f"Cannot delete user who is a leader of a group. Please reassign the group leader of group `{leadership.name}`(id: {leadership.id}) before deleting this user.")

    
    db.session.delete(user)
    db.session.commit()
    return True
def authenticate(username, password):
    """Authenticate a user."""
    from flaskr.db import get_db, User
    db = get_db()
    user = db.session.query(User).filter_by(username=username).first()
    if user is None or not check_password_hash(user.password, password):
        return None
    user.last_login = db.func.now()  # Update last login time
    db.session.commit()
    return user
def get_all_users(query=None):
    """Get all users."""
    from flaskr.db import get_db, User
    db = get_db()
    q = db.session.query(User)
    if query:
        filter_conditions = or_(
            User.username.ilike(f"%{query}%"),
            User.email == f"{query}"
        )
        q = q.filter(filter_conditions)
    return q.all()

def generate_jwt_token(user, expires_delta=None):
    """Generate a JWT token for the user.
    
    :param user: The user object for whom the token is generated.
    :param expires_delta: Optional timedelta for token expiration. See flask_jwt_extended.create_access_token documentation for details.
    """
    from flask import current_app
    from datetime import datetime, timedelta
    from flask_jwt_extended import create_access_token

    if user:
        token = create_access_token(
            identity=str(user.id), 
            expires_delta=expires_delta,
            additional_claims={'role_id': user.role_id})
        return token
    else:
        raise ValueError("User not found")