import os
from flask import Flask, render_template, request, g, Response
from sqlalchemy import URL
from flasgger import Swagger
import werkzeug
import time
from flaskr import db
from flask_restful import Api
from flask_jwt_extended import JWTManager

from flaskr.controllers import (
    auth, group, belongs_to_group, test,
    device, test_report, assigned_test, method,
    skill, device_reservation,
    device_type, user_skill, dashboard
)

from prometheus_client import (
    CollectorRegistry,
    PlatformCollector,
    ProcessCollector,
    Counter,
    Histogram,
    Gauge,
    generate_latest,
    CONTENT_TYPE_LATEST,
)


def create_app(test_config=None):
    # create Flask
    app = Flask(__name__, instance_relative_config=True)

    registry = CollectorRegistry()
    # 自動收集 Python process & 主機瞭解的指標（如 CPU / Memory）
    PlatformCollector(registry=registry)
    ProcessCollector(registry=registry)

    # (1) 後端所有 endpoint 的請求計數 (method, endpoint, http_status)
    REQUEST_COUNT = Counter(
        'flaskr_request_count_total',
        'Flaskr Request Count',
        ['method', 'endpoint', 'http_status'],
        registry=registry
    )

    # (2) 後端所有 endpoint 的延遲秒數 Histogram
    REQUEST_LATENCY = Histogram(
        'flaskr_request_latency_seconds',
        'Flaskr Request latency',
        ['endpoint'],
        registry=registry
    )

    @app.before_request
    def _start_timer():
        g.start_time = time.time()

    @app.after_request
    def _record_request_data(response):
        latency = time.time() - g.start_time
        endpoint = request.endpoint or 'unknown'
        status_code = response.status_code

        # 記錄計數與延遲
        REQUEST_COUNT.labels(
            method=request.method,
            endpoint=endpoint,
            http_status=status_code
        ).inc()
        REQUEST_LATENCY.labels(endpoint=endpoint).observe(latency)

        return response
    
    @app.route('/metrics')
    def metrics():
        resp = generate_latest(registry)
        return Response(resp, mimetype=CONTENT_TYPE_LATEST)
    
    # configure the app
    api = Api(app)
    jwt = JWTManager(app)
    logger = app.logger

    if test_config is None:
        # load the instance config, if it exists, when not testing
        app.config.from_pyfile('../config.py', silent=True)
    else:
        # load the test config if passed in
        app.config.from_mapping(test_config)
    app.config.from_prefixed_env()

    swagger = Swagger(app, template=swagger_template)
    db.init_app(app)
    jwt.init_app(app)
    api.add_resource(auth.UserResource, '/api/user')
    api.add_resource(auth.UserDetailResource, '/api/user/<int:user_id>')
    api.add_resource(auth.UserLoginResource, '/api/login')
    api.add_resource(group.GroupResource, '/api/group')
    api.add_resource(group.GroupDetailResource, '/api/group/<int:group_id>')
    api.add_resource(belongs_to_group.BelongsToGroupResource, '/api/group/<int:group_id>/user')
    api.add_resource(test.TestResource, '/api/test')
    api.add_resource(test.TestDetailResource, '/api/test/<int:test_id>')
    api.add_resource(device.DeviceResource, '/api/device')
    api.add_resource(device.DeviceDetailResource, '/api/device/<int:device_id>')
    api.add_resource(test_report.TestReportResource, '/api/test/<int:test_id>/report')
    api.add_resource(test_report.TestReportDetailResource, '/api/test/report/<int:report_id>')
    api.add_resource(assigned_test.AssignedTestByUserResource, '/api/user/<int:user_id>/test')
    api.add_resource(assigned_test.AssignedTestByTestResource, '/api/test/<int:test_id>/user')
    api.add_resource(method.MethodResource, '/api/method')
    api.add_resource(method.MethodDetailResource, '/api/method/<int:method_id>')
    api.add_resource(skill.SkillResource, '/api/skill')
    api.add_resource(skill.SkillDetailResource, '/api/skill/<int:skill_id>')
    api.add_resource(user_skill.UserSkillResource, '/api/user/<int:user_id>/skill')
    api.add_resource(user_skill.UserSkillDetailResource, '/api/user/<int:user_id>/skill/<int:skill_id>')
    api.add_resource(device_reservation.DeviceReservationResource, '/api/device/reservation')
    api.add_resource(device_reservation.DeviceReservationDetailResource, '/api/device/reservation/<int:reservation_id>')
    api.add_resource(device_type.DeviceTypeResource, '/api/device/type')

    # register dashboard blueprint
    app.register_blueprint(dashboard.dashboard_bp, url_prefix='/api/dashboard')

    # ensure the instance folder exists
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    # a simple page that says hello
    @app.route('/hello')
    def hello():
        return 'Hello, World!'
    
    @app.route('/')
    def index():
        with open(os.path.join(os.path.dirname(__file__), 'templates', 'index.html'), 'r') as f:
            content = f.read()
        return render_template("layout.html", content=content)

    @app.route('/readme')
    def readme():
        import markdown
        with open('README.md', 'r') as f:
            content = f.read()
        content = markdown.markdown(content)
        return render_template("layout.html", content=content)

    @app.errorhandler(werkzeug.exceptions.BadRequest)
    def handle_bad_request(e):
        return {"message": "Bad Request"}, 400
    
    @app.errorhandler(werkzeug.exceptions.NotFound)
    def handle_bad_request(e):
        return {"message": "404 Not Found"}, 404

    return app


swagger_template = {
    "swagger": "2.0",
    "info": {
        "title": "2025 NYCU Cloud Native Final Project API Docs",
        "description": "## API Documentation for 2025 NYCU Cloud Native Final Project API \n\n\n To utilize authorized endpoints, you need to log in first and obtain a JWT token. \n\n Use the [/api/login](#/auth/post_login) endpoint to log in and get the token. \n\n Then, include the token in the Authorization header of your requests to authorized endpoints. \n\nExample: `Authorization: Bearer {token}`",
        "contact": {
            "responsibleOrganization": "",
            "responsibleDeveloper": "crescendoCat",
            "email": "c.crescendo.cat@gmail.com",
        },
        # "termsOfService": "XYZ .com",
        "version": "1.0"
    },
    "basePath": "/api",  # base bash for blueprint registration
    "schemes": [
        "http",
        "https"
    ],
    "securityDefinitions": {
        "Bearer": {
            "type": "apiKey",
            "name": "Authorization",
            "in": "header",
            "description": "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\". \n\nGet a token by logging with `/api/login` endpoint and using the returned token in the Authorization header. \n\n Note that you should manually add the `Bearer` prefix to the token in the Authorization header. \n\nExample: `Bearer {token}`"
        }
    },
    "security": [
        {
            "Bearer": []
        }
    ]
}

__all__ = ['create_app',
    'services'
    'db',
    'auth',
    'models',
    'utils',
]