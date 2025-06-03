from flask_restful import Resource, reqparse
from flask import request
from flaskr.db import db, TestReport
from ..services.test_report import (
    create_report,
    get_report_by_id,
    get_reports_by_test_id,
    update_report,
    delete_report,
    ReportExistsError
)
import traceback

class TestReportDetailResource(Resource):
    """TestReport detail resource for managing a single test report."""

    def get(self, report_id):
        """Retrieve a test report by ID.

        ---
        tags:
            - TestReport
        definitions:
            TestReportResponseSchema:
                type: object
                properties:
                    id:
                        type: integer
                        example: 1
                    user_id:
                        type: integer
                        example: 2
                    test_id:
                        type: integer
                        example: 3
                    created_at:
                        type: string
                        format: date-time
                        example: "2023-10-01T12:00:00Z"
                    updated_at:
                        type: string
                        format: date-time
                        example: "2023-10-01T12:00:00Z"
                    content:
                        type: string
                        example: "Test report content"
        parameters:
            - name: report_id
              in: path
              type: integer
              required: true
              description: The ID of the test report to retrieve.
        responses:
            200:
                description: A single test report.
                schema:
                    $ref: '#/definitions/TestReportResponseSchema'
            404:
                description: Test report not found.
                schema:
                    type: object
                    properties:
                        message:
                            type: string
                            example: "Test report not found"
        """
        report = get_report_by_id(report_id)
        if not report:
            return {"message": "Test report not found"}, 404
        return report.serialize, 200

    def put(self, report_id):
        """Update a test report by ID.

        ---
        tags:
            - TestReport
        definitions:
            UpdateTestReportSchema:
                type: object
                properties:
                    content:
                        type: string
                        example: "Updated content of the test report"
                    review_status:
                        type: string
                        enum: ['Pending', 'Approved', 'Rejected']
                        example: 'Approved'
                    review_comment:
                        type: string
                        example: 'Updated review comment'
        parameters:
            - name: report_id
              in: path
              type: integer
              required: true
              description: The ID of the test report to update.
            - name: body
              in: body
              required: true
              schema:
                  $ref: '#/definitions/UpdateTestReportSchema'
        responses:
            200:
                description: The updated test report.
                schema:
                    $ref: '#/definitions/TestReportResponseSchema'
            400:
                description: Bad request.
                schema:
                    type: object
                    properties:
                        message:
                            type: string
                            example: "Invalid input"
            404:
                description: Test report not found.
                schema:
                    type: object
                    properties:
                        message:
                            type: string
                            example: "Test report not found"
        """
        parser = reqparse.RequestParser()
        parser.add_argument('content', type=str, help='Content of the test report')
        parser.add_argument('review_status', type=str, choices=['Pending', 'Approved', 'Rejected'], default=None, help='Review status of the report')
        parser.add_argument('review_comment', type=str, default=None, help='Review comment for the report')
        args = parser.parse_args(strict=True)
        try:
            report = update_report(
                report_id=report_id,
                content=args.get('content'),
                review_status=args.get('review_status'),  # Not updating review status here
                review_comment=args.get('review_comment')  # Not updating review comment here
            )

            return report.serialize, 200
        except ValueError as e:
            return {"message": str(e)}, 400
        except Exception as e:
            return {"message": "An error occurred: " + str(e)}, 500

    def delete(self, report_id):
        """Delete a test report by ID.

        ---
        tags:
            - TestReport
        parameters:
            - name: test_id
              in: path
              type: integer
              required: true
              description: The ID of the test report to delete.
        responses:
            204:
                description: No content.
            404:
                description: Test report not found.
                schema:
                    type: object
                    properties:
                        message:
                            type: string
                            example: "Test report not found"
        """
        try:
            delete_report(report_id)
        except ValueError as e:
            return {"message": str(e)}, 404
        except Exception as e:
            return {"message": "An error occurred: " + str(e)}, 500
        return '', 204

class TestReportResource(Resource):
    """TestReport resource for managing test reports."""

    def get(self, test_id):
        """Retrieve a list of test reports.

        ---
        tags:
            - TestReport
        parameters:
            - name: test_id
              in: path
              type: integer
              required: true
              description: The ID of the test to filter reports by.
        responses:
            200:
                description: A list of test reports.
                schema:
                    type: array
                    items:
                        $ref: '#/definitions/TestReportResponseSchema'
            404:
                description: No test reports found.
                schema:
                    type: object
                    properties:
                        message:
                            type: string
                            example: "No test reports found"
        """
        reports = get_reports_by_test_id(test_id)
        if not reports:
            return {"message": "No test reports found"}, 404
        return [r.serialize for r in reports], 200

    def post(self, test_id):
        """Create a new test report.

        ---
        tags:
            - TestReport
        definitions:
            CreateTestReportSchema:
                type: object
                properties:
                    user_id:
                        type: integer
                    content:
                        type: string
                    review_status:
                        type: string
                        enum: ['Pending', 'Approved', 'Rejected']
                        example: 'Pending'
                    review_comment:
                        type: string
                        example: 'Initial review comment'
        parameters:
            - name: body
              in: body
              required: true
              schema:
                $ref: '#/definitions/CreateTestReportSchema'
              description: The test report to create.
            - name: test_id
              in: path
              type: integer
              required: true
              description: The ID of the test to create a report for.
        responses:
            201:
                description: The created test report.
                schema:
                    $ref: '#/definitions/TestReportResponseSchema'
            400:
                description: Bad request.
                schema:
                    type: object
                    properties:
                        message:
                            type: string
                            example: "Invalid input"
            409:
                description: Test report already exists.
                schema:
                    type: object
                    properties:
                        message:
                            type: string
                            example: "Test report already exists"
        """
        parser = reqparse.RequestParser()
        parser.add_argument('user_id', type=int, required=True, help='ID of the user')
        parser.add_argument('content', type=str, required=True, help='Content of the test report')
        parser.add_argument('review_status', type=str, choices=['Pending', 'Approved', 'Rejected'], default='Pending', help='Review status of the report')
        parser.add_argument('review_comment', type=str, default=None, help='Review comment for the report')
        args = parser.parse_args(strict=True)
        try:
            report = create_report(
                user_id=args.get('user_id'),
                test_id=test_id,
                content=args.get('content'),
                review_status=args.get('review_status'),
                review_comment=args.get('review_comment', None)
            )
            if not report:
                return {"message": "Test report already exists"}, 409
            return report.serialize, 201
        except ReportExistsError as e:
            return {"message": str(e)}, 409
        except ValueError as e:
            from flask import current_app
            current_app.logger.error(f"Error creating report: {str(e)}")
            current_app.logger.error(traceback.format_exc())
            return {"message": str(e)}, 400
        except Exception as e:
            return {"message": "An error occurred: " + str(e)}, 500
