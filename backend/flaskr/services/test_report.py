from sqlalchemy.exc import IntegrityError, SQLAlchemyError

class ReportExistsError(Exception):
    """Custom exception for when a test report already exists."""
    def __init__(self, message="Test report already exists"):
        self.message = message
        super().__init__(self.message)

def create_report(
    test_id: int, 
    user_id: int, 
    content: str,
    review_status: str = 'Pending',
    review_comment: str = None
):
    """Create a new test report."""
    from flaskr.db import get_db, TestReport, ReviewStatusEnum, Test, User
    try:
        db = get_db()

        # Validate input parameters
        test = db.session.query(Test).filter_by(id=test_id).first()
        if test is None:
            raise ValueError("Test not found")
        user = db.session.query(User).filter_by(id=user_id).first()
        if user is None:
            raise ValueError("User not found")
        
        if test.users and user not in test.users:
            raise ValueError("User is not assigned to this test")

        # Check if the report already exists
        existing_report = db.session.query(TestReport).filter_by(test_id=test_id, user_id=user_id).first()
        if existing_report:
            raise ReportExistsError("Test report already exists for this test and user")
        

        report = TestReport(
            test_id=test_id, 
            user_id=user_id, 
            content=content,
            review_status=ReviewStatusEnum(review_status),
        )
        if review_comment:
            report.review_comment = review_comment

        db.session.add(report)
        db.session.commit()
        return report
    except IntegrityError as e:
        raise ValueError(f"Test report already exists {str(e)}")
    except SQLAlchemyError as e:
        db.session.rollback()
        raise ValueError(f"Database error: {str(e)}")
    except Exception as e:
        db.session.rollback()
        raise ValueError(f"An error occurred: {str(e)}")

def get_report_by_id(report_id: int):
    """Get a test report by ID."""
    from flaskr.db import get_db, TestReport
    db = get_db()
    report = db.session.query(TestReport).filter_by(id=report_id).first()
    if report is None:
        raise ValueError("Test report not found")
    return report

def get_reports_by_test_id(test_id: int):
    """Get all test reports for a specific test."""
    from flaskr.db import get_db, TestReport
    db = get_db()
    return db.session.query(TestReport).filter_by(test_id=test_id).all()

def update_report(report_id: int, content: str, review_status: str = None, review_comment: str = None):
    """Update a test report."""
    from flaskr.db import get_db, TestReport, ReviewStatusEnum

    db = get_db()
    report = db.session.query(TestReport).filter_by(id=report_id).first()
    if report is None:
        raise ValueError("Test report not found")
    
    if content is not None:
        report.content = content
    if review_status:
        report.review_status = ReviewStatusEnum(review_status)
    if review_comment is not None:
        report.review_comment = review_comment
    db.session.commit()
    return report

def delete_report(report_id: int):
    """Delete a test report."""
    from flaskr.db import get_db, TestReport
    db = get_db()
    report = db.session.query(TestReport).filter_by(id=report_id).first()
    if report is None:
        raise ValueError("Test report not found")
    
    db.session.delete(report)
    db.session.commit()
    return report
