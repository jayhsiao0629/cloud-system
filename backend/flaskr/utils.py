from flask_jwt_extended import get_jwt_identity, get_jwt, verify_jwt_in_request

def jwt_identity_matches_user_id(*args, **opt):
    """
    Decorator to check if the JWT identity matches the user_id in the request.
    If they do not match, return a 401 Unauthorized response.
    """
    def decorator(func):
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()

            id = get_jwt_identity()
            user_id = opt.get('user_id') or kwargs.get(opt.get('user_id_key', 'user_id'))

            if id != str(user_id):
                return {'message': 'Unauthorized'}, 401
            result = func(*args, **kwargs)
            return result
        return wrapper
    return decorator

def role_required(*args, **kwargs):
    """
    Decorator to check if the JWT role_id matches the specified role_id.
    If they do not match, return a 401 Unauthorized response.

    example usage:
    ```python
    @role_required(role_ids=[1, 2])
    def foo():
        pass
    ```
    
    example usage:
    ```python
    @role_required([1, 2])
    def foo():
        pass
    ```

    example usage:
    ```python
    @role_required(1)
    def foo():
        pass
    ```
    """
    def decorator(func):
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()

            if 'role_id' not in claims:
                return {'message': 'Unauthorized'}, 401
            if isinstance(args[0], int):
                role_ids = [args[0]]
            elif isinstance(args[0], list):
                role_ids = args[0]
            elif 'role_ids' in kwargs:
                role_ids = kwargs['role_ids']
            
            if all([claims['role_id'] != str(role_id) for role_id in role_ids]):
                return {'message': 'Unauthorized'}, 401
            
            result = func(*args, **kwargs)
            return result
        return wrapper
    return decorator

def admin_required(func):
    """
    Decorator to check if the JWT role_id is 1 (admin).
    If it is not, return a 401 Unauthorized response.
    """
    return role_required(1)(func)

def user_required(func):
    """
    Decorator to check if the JWT role_id is 2 (user).
    If it is not, return a 401 Unauthorized response.
    """
    return role_required(2)(func)
