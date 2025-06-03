import click
from flask_sqlalchemy import SQLAlchemy

import enum
from flask import current_app, g
from sqlalchemy import Integer, String, DateTime, ForeignKey
from datetime import datetime, timedelta
from sqlalchemy.orm import Mapped, mapped_column, relationship
from werkzeug.security import generate_password_hash
from sqlalchemy import Text, Enum

db = SQLAlchemy()

DESCRIPTION_MAX_LENGTH = 256
NAME_MAX_LENGTH = 127
PASSWORD_HASH_LENGTH = 162

class Role(db.Model):
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(NAME_MAX_LENGTH), unique=True, nullable=False)
    description: Mapped[str] = mapped_column(String(DESCRIPTION_MAX_LENGTH), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=db.func.current_timestamp())
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())
    users: Mapped[list['User']] = relationship(back_populates='role')

    @property
    def serialize(self):
        """Return object data in easily serializeable format"""
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class User(db.Model):
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(NAME_MAX_LENGTH), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(String(PASSWORD_HASH_LENGTH), nullable=False)
    email: Mapped[str] = mapped_column(String(DESCRIPTION_MAX_LENGTH), unique=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=db.func.current_timestamp())
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())
    role_id: Mapped[int] = mapped_column(ForeignKey('role.id'), nullable=False)
    role: Mapped['Role'] = relationship(back_populates='users')
    assigned_tests: Mapped[list['AssignedTest']] = relationship(
        back_populates='user', cascade='all, delete-orphan')
    tests: Mapped[list['Test']] = relationship(
        secondary='assigned_test', back_populates='users', viewonly=True,
        primaryjoin='User.id == AssignedTest.user_id',
    )
    
    test_reports: Mapped[list['TestReport']] = relationship(
        back_populates='user', cascade='all, delete-orphan',
        foreign_keys='TestReport.user_id'
    )
    device_reservations: Mapped[list['DeviceReservation']] = relationship(back_populates='user', cascade='all, delete-orphan')
    
    user_skills: Mapped[list['UserSkill']] = relationship(
        back_populates='user', cascade='all, delete-orphan'
    )
    skills: Mapped[list['Skill']] = relationship(
        secondary='user_skill', back_populates='users', viewonly=True,
        primaryjoin='User.id == UserSkill.user_id'
    )
    
    groups: Mapped[list['BelongsToGroup']] = relationship(back_populates='user', cascade='all, delete-orphan')
    leader_groups: Mapped[list['Group']] = relationship(back_populates='leader', foreign_keys='Group.leader_id')

    reviewed_reports: Mapped[list['TestReport']] = relationship(
        back_populates='reviewer', foreign_keys='TestReport.reviewer_id',
        cascade='all, delete-orphan',
        passive_deletes=True
    )

    __table_args__ = (
        db.Index('ix_username', 'username'),
        db.Index('ix_email', 'email'),
    )
    
    @property
    def serialize(self):
        """Return object data in easily serializeable format"""
        # Note that for security reason, do note return password here.
        return {
            'id': self.id,
            'username': self.username,
            'role_id': self.role_id,
            'role': self.role.serialize,
            'email': self.email,
            'skills': [s.serialize for s in self.skills],
            'tests': [{
                'id': t.id,
                'name': t.name,
                'status': t.status,
                'display_id': t.display_id,
            } for t in self.tests],
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'groups': [{
                'id': g.id,
                'name': g.group.name,
            } for g in self.groups],
        }

class Group(db.Model):
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(NAME_MAX_LENGTH), unique=True, nullable=False)
    description: Mapped[str] = mapped_column(String(DESCRIPTION_MAX_LENGTH), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=db.func.current_timestamp())
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())
    tests: Mapped[list['Test']] = relationship(back_populates='group', cascade='all, delete-orphan')
    users: Mapped[list['BelongsToGroup']] = relationship(back_populates='group')
    leader_id: Mapped[int] = mapped_column(ForeignKey('user.id'), nullable=False)
    leader: Mapped['User'] = relationship(back_populates='leader_groups', foreign_keys=[leader_id])

    @property
    def serialize(self):
        """Return object data in easily serializeable format"""
        return {
            'id': self.id,
            'name': self.name,
            'leader_id': self.leader_id,
            'leader': {
                'id': self.leader.id,
                'username': self.leader.username,
                'email': self.leader.email,
            },
            'memberCount': self.memberCount,
            'activeTests': self.activeTests,
            'description': self.description,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    @property
    def memberCount(self):
        """Return the number of members in the group."""
        return len(self.users)
    
    @property
    def activeTests(self):
        """Return the number of active tests in the group."""
        return len([t for t in self.tests if t.status in [TestStatusEnum.Pending, TestStatusEnum.InProgress]])

class BelongsToGroup(db.Model):
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey('user.id'), nullable=False)
    user: Mapped['User'] = relationship(back_populates='groups')
    group_id: Mapped[int] = mapped_column(ForeignKey('group.id'), nullable=False)
    group: Mapped['Group'] = relationship(back_populates='users')
    created_at: Mapped[datetime] = mapped_column(DateTime, default=db.func.current_timestamp())
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())
    
    # add index to speed up query
    __table_args__ = (
        db.Index('ix_user_id_group_id', 'user_id', 'group_id'),
    )

    
    @property
    def serialize(self):
        """Return object data in easily serializeable format"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'group_id': self.group_id,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
    
class Method(db.Model):
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(NAME_MAX_LENGTH), unique=True, nullable=False)
    description: Mapped[str] = mapped_column(String(DESCRIPTION_MAX_LENGTH), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=db.func.current_timestamp())
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())
    tests: Mapped[list['Test']] = relationship(back_populates='method', cascade='all, delete-orphan')
    
    allowed_devices: Mapped[list['AllowedDevice']] = relationship(back_populates='method')
    devices: Mapped[list['Device']] = relationship(
        secondary='allowed_device', back_populates='methods', viewonly=True,
        primaryjoin='Method.id == AllowedDevice.method_id',
    )

    allowed_skills: Mapped[list['AllowedSkill']] = relationship(back_populates='method')
    skills: Mapped[list['Skill']] = relationship(
        secondary='allowed_skill', back_populates='methods', viewonly=True,
        primaryjoin='Method.id == AllowedSkill.method_id',
    )

    @property
    def serialize(self):
        """Return object data in easily serializeable format"""
        return {
            'id': self.id,
            'name': self.name,
            'devices': [d.serialize for d in self.devices],
            'skills': [{
                'id': s.id,
                'name': s.name,
                'description': s.description,
            } for s in self.skills],
            'description': self.description,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class TestStatusEnum(str, enum.Enum):
    Pending = 'Pending'
    InProgress = 'InProgress'
    Completed = 'Completed'
    Failed = 'Failed'
    Cancelled = 'Cancelled'

    def __str__(self):
        return self.value

class Test(db.Model):
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)  # Unique among all tests
    display_id: Mapped[str] = mapped_column(String(NAME_MAX_LENGTH), nullable=False)  # Unique among groups only
    group_id: Mapped[int] = mapped_column(ForeignKey('group.id'), nullable=False)
    group: Mapped['Group'] = relationship(back_populates='tests')
    method_id: Mapped[int] = mapped_column(ForeignKey('method.id'), nullable=False)
    method: Mapped['Method'] = relationship(back_populates='tests')
    
    assigned_tests: Mapped[list['AssignedTest']] = relationship(back_populates='test', cascade='all, delete-orphan')
    users: Mapped[list['User']] = relationship(
        secondary='assigned_test', back_populates='tests', viewonly=True,
        primaryjoin='Test.id == AssignedTest.test_id',
    )

    test_reports: Mapped[list['TestReport']] = relationship(back_populates='test', cascade='all, delete-orphan')

    device_reservations: Mapped[list['DeviceReservation']] = relationship(back_populates='test', cascade='all, delete-orphan')
    name: Mapped[str] = mapped_column(String(NAME_MAX_LENGTH), nullable=False)
    status: Mapped[str] = mapped_column(
        Enum(TestStatusEnum, name='test_status'),
        nullable=False,
        default='Pending'
    )
    description: Mapped[str] = mapped_column(String(DESCRIPTION_MAX_LENGTH), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=db.func.current_timestamp())
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())

    # contraint to ensure test_id is unique within the group
    __table_args__ = (
        db.UniqueConstraint('display_id', 'group_id', name='uq_display_id_group_id'),
    )

    @property
    def serialize(self):
        """Return object data in easily serializeable format"""
        return {
            'id': self.id,
            'display_id': self.display_id,
            'group_id': self.group_id,
            'method_id': self.method_id,
            'users': [{
                'id': u.id,
                'username': u.username,
            } for u in self.users],
            'method': self.method.serialize,
            'test_reports': [{
                'id': r.id,
            } for r in self.test_reports],
            'name': self.name,
            'status': self.status,
            'description': self.description,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class AssignedTest(db.Model):
    test_id: Mapped[int] = mapped_column(ForeignKey('test.id'), nullable=False, primary_key=True)
    test: Mapped['Test'] = relationship(back_populates='assigned_tests')
    user_id: Mapped[int] = mapped_column(ForeignKey('user.id'), nullable=False, primary_key=True)
    user: Mapped['User'] = relationship(back_populates='assigned_tests')

    created_at: Mapped[datetime] = mapped_column(DateTime, default=db.func.current_timestamp())
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())

    @property
    def serialize(self):
        """Return object data in easily serializeable format"""
        return {
            'test_id': self.test_id,
            'user_id': self.user_id,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
    
class ReviewStatusEnum(str, enum.Enum):
    Pending = 'Pending'
    Approved = 'Approved'
    Rejected = 'Rejected'

    
class TestReport(db.Model):
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    test_id: Mapped[int] = mapped_column(ForeignKey('test.id'), nullable=False)
    test: Mapped['Test'] = relationship(back_populates='test_reports')
    user_id: Mapped[int] = mapped_column(ForeignKey('user.id'), nullable=False)
    user: Mapped['User'] = relationship(back_populates='test_reports', foreign_keys=[user_id])
    created_at: Mapped[datetime] = mapped_column(DateTime, default=db.func.current_timestamp())
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())
    content: Mapped[str] = mapped_column(Text, nullable=False)

    review_status: Mapped[str] = mapped_column(
        Enum(ReviewStatusEnum, name='review_status', values_callable=lambda obj: [e.value for e in obj]),
        nullable=False,
        default='Pending'
    )

    review_comment: Mapped[str] = mapped_column(Text, nullable=True)
    reviewer_id: Mapped[int] = mapped_column(ForeignKey('user.id'), nullable=True)
    reviewer: Mapped['User'] = relationship(
        foreign_keys=[reviewer_id],
        back_populates='reviewed_reports',
    )

    # contraint to ensure that each test can only have one report per user
    __table_args__ = (
        db.UniqueConstraint('test_id', 'user_id', name='uq_test_id_user_id'),
    )

    @property
    def serialize(self):
        """Return object data in easily serializeable format"""
        return {
            'id': self.id,
            'test_id': self.test_id,
            'user_id': self.user_id,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'content': self.content,
            'review_status': self.review_status,
            'review_comment': self.review_comment,
            'reviewer': self.reviewer.serialize if self.reviewer else None,
        }

class Skill(db.Model):
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(NAME_MAX_LENGTH), unique=True, nullable=False)
    user_skills: Mapped[list['UserSkill']] = relationship(
        back_populates='skill'
    )
    users: Mapped[list['User']] = relationship(
        secondary='user_skill', back_populates='skills', viewonly=True,
        primaryjoin='Skill.id == UserSkill.skill_id',
    )

    allowed_skills: Mapped[list['AllowedSkill']] = relationship(
        back_populates='skill'
    )
    methods: Mapped[list['Method']] = relationship(
        secondary='allowed_skill', back_populates='skills', viewonly=True,
        primaryjoin='Skill.id == AllowedSkill.skill_id',
    )

    description: Mapped[str] = mapped_column(String(DESCRIPTION_MAX_LENGTH), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=db.func.current_timestamp())
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())

    @property
    def serialize(self):
        """Return object data in easily serializeable format"""
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'methods': [{
                'id': m.id,
                'name': m.name,
                'description': m.description,
            } for m in self.methods],
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class UserSkill(db.Model):

    __table_name__ = 'user_skill'

    user_id: Mapped[int] = mapped_column(ForeignKey('user.id'), nullable=False, primary_key=True)
    user: Mapped['User'] = relationship(back_populates='user_skills')
    skill_id: Mapped[int] = mapped_column(ForeignKey('skill.id'), nullable=False, primary_key=True)
    skill: Mapped['Skill'] = relationship(back_populates='user_skills')
    created_at: Mapped[datetime] = mapped_column(DateTime, default=db.func.current_timestamp())
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())

    @property
    def serialize(self):
        """Return object data in easily serializeable format"""
        return {
            'skill': self.skill.serialize,
            'user_id': self.user_id,
            'skill_id': self.skill_id,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
    
class AllowedSkill(db.Model):
    method_id: Mapped[int] = mapped_column(ForeignKey('method.id'), nullable=False, primary_key=True)
    method: Mapped['Method'] = relationship(back_populates='allowed_skills')
    skill_id: Mapped[int] = mapped_column(ForeignKey('skill.id'), nullable=False, primary_key=True)
    skill: Mapped['Skill'] = relationship(back_populates='allowed_skills')
    created_at: Mapped[datetime] = mapped_column(DateTime, default=db.func.current_timestamp())
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())
    @property
    def serialize(self):
        """Return object data in easily serializeable format"""
        return {
            'id': self.id,
            'method_id': self.method_id,
            'skill_id': self.skill_id,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class DeviceStatusEnum(str, enum.Enum):
    Available='Available'
    Reserved='Reserved'
    Occupied='Occupied'
    Error='Error'
    Maintaince='Maintaince' # TODO: corret the spelling to Maintenance

    def __str__(self):
        return self.value

class DeviceType(db.Model):
    """DeviceType model.
    
    Represents a type of device that can be reserved for testing.
    """
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(NAME_MAX_LENGTH), unique=True, nullable=False)
    devices: Mapped[list['Device']] = relationship(back_populates='device_type')
    description: Mapped[str] = mapped_column(String(DESCRIPTION_MAX_LENGTH), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=db.func.current_timestamp())
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())

    @property
    def serialize(self):
        """Return object data in easily serializeable format"""
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class Device(db.Model):
    """Device model.
    
    Represents a device that can be reserved for testing.
    """
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(NAME_MAX_LENGTH), unique=True, nullable=False)
    device_reservations: Mapped[list['DeviceReservation']] = relationship(back_populates='device')
    device_type_id: Mapped[int] = mapped_column(ForeignKey('device_type.id'), nullable=False)
    device_type: Mapped['DeviceType'] = relationship(back_populates='devices')

    allowed_devices: Mapped[list['AllowedDevice']] = relationship(back_populates='device')
    methods: Mapped[list['Method']] = relationship(
        secondary='allowed_device', back_populates='devices', viewonly=True,
        primaryjoin='Device.id == AllowedDevice.device_id',
    )

    status: Mapped[str] = mapped_column(
        Enum(DeviceStatusEnum, name='device_status'),
        nullable=False,
        default='Available'
    )

    position: Mapped[str] = mapped_column(String(NAME_MAX_LENGTH), nullable=True)
    previous_maintenance_date: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    next_maintenance_date: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    description: Mapped[str] = mapped_column(String(DESCRIPTION_MAX_LENGTH), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=db.func.current_timestamp())
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())

    @property
    def serialize(self):
        """Return object data in easily serializeable format"""
        return {
            'id': self.id,
            'name': self.name,
            'device_type': self.device_type.serialize,
            'status': self.status,
            'position': self.position,
            'previous_maintenance_date': self.previous_maintenance_date.isoformat() if self.previous_maintenance_date else None,
            'next_maintenance_date': self.next_maintenance_date.isoformat() if self.next_maintenance_date else None,
            'description': self.description,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class DeviceReservation(db.Model):
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    device_id: Mapped[int] = mapped_column(ForeignKey('device.id'), nullable=False)
    device: Mapped['Device'] = relationship(back_populates='device_reservations')
    user_id: Mapped[int] = mapped_column(ForeignKey('user.id'), nullable=False)
    user: Mapped['User'] = relationship(back_populates='device_reservations')
    test_id: Mapped[int] = mapped_column(ForeignKey('test.id'), nullable=False)
    test: Mapped['Test'] = relationship(back_populates='device_reservations')
    start_time: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    end_time: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=db.func.current_timestamp())
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())

    # end_time must be greater than start_time
    __table_args__ = (
        db.CheckConstraint('end_time > start_time', name='ck_end_time_greater_than_start_time'),
    )

    @property
    def serialize(self):
        """Return object data in easily serializeable format"""
        return {
            'id': self.id,
            'device_id': self.device_id,
            'device': self.device.serialize,
            'user_id': self.user_id,
            'user': {
                'id': self.user.id,
                'username': self.user.username,
            },
            'test_id': self.test_id,
            'test': {
                'id': self.test.id,
                'display_id': self.test.display_id,
                'name': self.test.name,
                'status': self.test.status,
            },
            'duration': (self.end_time - self.start_time).total_seconds() / 60,  # duration in minutes
            'start_time': self.start_time.isoformat(),
            'end_time': self.end_time.isoformat(),
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    @property
    def duration(self):
        """Return the duration of the reservation in minutes."""
        return (self.end_time - self.start_time).total_seconds() / 60

class AllowedDevice(db.Model):
    method_id: Mapped[int] = mapped_column(ForeignKey('method.id'), nullable=False, primary_key=True)
    method: Mapped['Method'] = relationship(back_populates='allowed_devices')
    device_id: Mapped[int] = mapped_column(ForeignKey('device.id'), nullable=False, primary_key=True)
    device: Mapped['Device'] = relationship(back_populates='allowed_devices')
    created_at: Mapped[datetime] = mapped_column(DateTime, default=db.func.current_timestamp())
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())
    @property
    def serialize(self):
        """Return object data in easily serializeable format"""
        return {
            'method_id': self.method_id,
            'device_id': self.device_id,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

def get_db():
    """Get a database connection."""
    if 'db' not in g:
        g.db = db
    return g.db

def close_db(e=None):
    """Close the database connection."""
    db = g.pop('db', None)

    if db is not None:
        db.session.remove()

def init_db():
    """Initialize the database."""
    with current_app.app_context():
        db.create_all()
        # Add any initial data or setup here if needed
        # For example, you can create a default user or other initial records
        # db.session.add(User(username='admin', password='admin'))
        # db.session.commit()

def gen_mock_data():
    """Generate mock data for testing."""
    # This function can be used to generate mock data for testing purposes
    # You can create instances of your models and add them to the session
    # For example:
    db = get_db()
    # Create mock roles
    role1 = Role(name='Admin', description='Administrator role')
    role2 = Role(name='Leader', description='Group leader role')
    role3 = Role(name='Tester', description='Tester role')
    db.session.add(role1)
    db.session.add(role2)
    db.session.add(role3)
    db.session.commit()

    # Create mock users
    admin = User(username='admin', password=generate_password_hash('admin'),
                 email='admin@test.com', role_id=role1.id)
    leader = User(username='leader', password=generate_password_hash('leader'),
                 email='leader@test.com', role_id=role2.id)
    leader2 = User(username='leader2', password=generate_password_hash('leader2'),
                 email='leader2@test.com', role_id=role2.id)
    tester = User(username='tester', password=generate_password_hash('tester'),
                 email='tester@test.com', role_id=role3.id)
    tester2 = User(username='tester2', password=generate_password_hash('tester2'),
                 email='tester2@test.com', role_id=role3.id)
    tester3 = User(username='tester3', password=generate_password_hash('tester3'),
                 email='tester3@test.com', role_id=role3.id)
    tester4 = User(username='tester4', password=generate_password_hash('tester4'),
                 email='tester4@test.com', role_id=role3.id)

    db.session.add(admin)
    db.session.add(leader)
    db.session.add(leader2)
    db.session.add(tester)
    db.session.add(tester2)
    db.session.add(tester3)
    db.session.add(tester4)
    db.session.commit()

    # Create mock groups
    group1 = Group(name='Group A', leader=leader, description='Description for Group A')
    group2 = Group(name='Group B', leader=leader2, description='Description for Group B')
    db.session.add(group1)
    db.session.add(group2)
    db.session.commit()

    # Create mock group memberships
    db.session.add(BelongsToGroup(user_id=leader.id, group_id=group1.id))
    db.session.add(BelongsToGroup(user_id=leader2.id, group_id=group2.id))
    db.session.add(BelongsToGroup(user_id=tester.id, group_id=group1.id))
    db.session.add(BelongsToGroup(user_id=tester2.id, group_id=group1.id))
    db.session.add(BelongsToGroup(user_id=tester3.id, group_id=group2.id))
    db.session.add(BelongsToGroup(user_id=tester4.id, group_id=group2.id))
    db.session.commit()


    # Create mock skills
    # 電性測試技能
    skill1 = Skill(name='Electrical Testing', description='Testing electrical systems')
    # 物性測試技能
    skill2 = Skill(name='Physical Testing', description='Testing physical properties')
    # 溫度測試技能
    skill3 = Skill(name='Temperature Testing', description='Testing temperature systems')

    db.session.add(skill1)
    db.session.add(skill2)
    db.session.add(skill3)
    db.session.commit()

    # Create mock user skills

    user_skill1 = UserSkill(user_id=tester.id, skill_id=skill1.id)
    user_skill2 = UserSkill(user_id=tester2.id, skill_id=skill2.id)
    user_skill3 = UserSkill(user_id=tester3.id, skill_id=skill3.id)
    user_skill4 = UserSkill(user_id=tester4.id, skill_id=skill1.id)
    user_skill5 = UserSkill(user_id=tester4.id, skill_id=skill2.id)

    db.session.add(user_skill1)
    db.session.add(user_skill2)
    db.session.add(user_skill3)
    db.session.add(user_skill4)
    db.session.add(user_skill5)
    db.session.commit()

    # Create mock device types
    device_type1 = DeviceType(name='Electrical Device', description='Device for electrical testing')
    device_type2 = DeviceType(name='Physical Device', description='Device for physical testing')
    device_type3 = DeviceType(name='Temperature Device', description='Device for temperature testing')
    db.session.add(device_type1)
    db.session.add(device_type2)
    db.session.add(device_type3)
    db.session.commit()

    # Create mock devices
    # Device for electrical testing
    device1 = Device(name='Device A', device_type_id=device_type1.id, status='Available',
                     description='Device for electrical testing')
    # Device for physical testing
    device2 = Device(name='Device B', device_type_id=device_type2.id, status='Available',
                     description='Device for physical testing')
    # Device for temperature testing
    device3 = Device(name='Device C', device_type_id=device_type3.id, status='Available',
                     description='Device for temperature testing')
    # Device in maintaince
    device4 = Device(name='Device D', device_type_id=device_type1.id, status='Maintaince',
                     description='Device for electrical testing, currently in maintenance')
    device5 = Device(name='Device E', device_type_id=device_type2.id, status='Maintaince',
                     description='Device for physical testing, currently in maintenance')
    # Device in error
    device6 = Device(name='Device F', device_type_id=device_type2.id, status='Error',
                     description='Device for physical testing, currently in error state')
    db.session.add(device1)
    db.session.add(device2)
    db.session.add(device3)
    db.session.add(device4)
    db.session.add(device5)
    db.session.add(device6)
    db.session.commit()
    
    # Create mock methods
    method1 = Method(name='Method A', description='Method for electrical testing')
    method2 = Method(name='Method B', description='Method for physical testing')
    method3 = Method(name='Method C', description='Method for temperature testing')
    method4 = Method(name='Method D', description='Advanced Method for electrical testing, also needs physical testing device and skill')

    db.session.add(method1)
    db.session.add(method2)
    db.session.add(method3)
    db.session.add(method4)
    db.session.commit()

    # Create mock allowed devices
    db.session.add(AllowedDevice(method_id=method1.id, device_id=device1.id))
    db.session.add(AllowedDevice(method_id=method2.id, device_id=device2.id))
    db.session.add(AllowedDevice(method_id=method3.id, device_id=device3.id))
    db.session.add(AllowedDevice(method_id=method4.id, device_id=device1.id))
    db.session.add(AllowedDevice(method_id=method4.id, device_id=device2.id))
    db.session.commit()

    # Create mock allowed skills
    db.session.add(AllowedSkill(method_id=method1.id, skill_id=skill1.id))
    db.session.add(AllowedSkill(method_id=method2.id, skill_id=skill2.id))
    db.session.add(AllowedSkill(method_id=method3.id, skill_id=skill3.id))
    db.session.add(AllowedSkill(method_id=method4.id, skill_id=skill1.id))
    db.session.add(AllowedSkill(method_id=method4.id, skill_id=skill2.id))
    db.session.commit()

    # Create mock tests
    # Group A tests
    test1 = Test(display_id='T-0001', group_id=group1.id, method_id=method1.id, name='Group A Electrical Test',
                 status='Completed', description='Test for electrical testing')
    test2 = Test(display_id='T-0002', group_id=group1.id, method_id=method2.id, name='Group A Physical Test',
                 status='Completed', description='Test for physical testing')
    test3 = Test(display_id='T-0003', group_id=group1.id, method_id=method3.id, name='Group A Temperature Test',
                 status='Pending', description='Test for temperature testing')
    
    # Group B tests
    test4 = Test(display_id='T-0001', group_id=group2.id, method_id=method1.id, name='Group B Electrical Test',
                 status='Failed', description='Test for temperature testing')
    test5 = Test(display_id='T-0002', group_id=group2.id, method_id=method2.id, name='Group B Physical Test',
                 status='Pending', description='Test for electrical testing')
    test6 = Test(display_id='T-0003', group_id=group2.id, method_id=method3.id, name='Group B Temperature Test',
                 status='Pending', description='Test for physical testing')
    test7 = Test(display_id='T-0004', group_id=group2.id, method_id=method4.id, name='Group A Advanced Electrical Test',
                 status='Pending', description='Test for advanced electrical testing')

    db.session.add(test1)
    db.session.add(test2)
    db.session.add(test3)
    db.session.add(test4)
    db.session.add(test5)
    db.session.add(test6)
    db.session.add(test7)
    db.session.commit()

    # Create mock assigned tests
    db.session.add(AssignedTest(test_id=test1.id, user_id=tester.id))
    db.session.add(AssignedTest(test_id=test2.id, user_id=tester2.id))
    db.session.add(AssignedTest(test_id=test4.id, user_id=tester3.id))
    db.session.add(AssignedTest(test_id=test7.id, user_id=tester4.id))
    db.session.commit()

    # Create mock test reports
    db.session.add(TestReport(test_id=test1.id, user_id=tester.id, content='Test report for Electrical Test'))
    db.session.add(TestReport(test_id=test2.id, user_id=tester2.id, content='Test report for Physical Test'))
    db.session.add(TestReport(test_id=test5.id, user_id=tester3.id, content='Test report for Electrical Test, Failed'))
    db.session.commit()

def gen_mock_data_for_dashboard(
        start_time: datetime=datetime.now() - timedelta(days=14), 
        end_time: datetime=datetime.now(), 
        num_user_per_group: int=10,
        num_groups: int=1,
        num_tests_per_group: int=200, # in average 100 tests per week
        num_devices: int=10,
        avg_test_duration: int=3,
        std_test_duration: int=2,
        random_seed: int=None
    ):
    """Generate mock data for dashboard testing."""
    # ======= Default Settings =======    
    db = get_db()

    admin_exists = lambda: db.session.query(Role).all().count() > 0
    if not admin_exists:
        role1 = Role(name='Admin', description='Administrator role', created_at=start_time, updated_at=start_time)
        role2 = Role(name='Leader', description='Group leader role', created_at=start_time, updated_at=start_time)
        role3 = Role(name='Tester', description='Tester role', created_at=start_time, updated_at=start_time)
        db.session.add(role1)
        db.session.add(role2)
        db.session.add(role3)
        db.session.commit()
        # Create mock users
        admin = User(username='admin', password=generate_password_hash('admin'),
                    email='admin@test.com', role_id=role1.id, created_at=start_time, updated_at=start_time)

        db.session.add(admin)


        # Create mock skills
        # 電性測試技能
        skill1 = Skill(name='Electrical Testing', description='Testing electrical systems')
        # 物性測試技能
        skill2 = Skill(name='Physical Testing', description='Testing physical properties')
        # 溫度測試技能
        skill3 = Skill(name='Temperature Testing', description='Testing temperature systems')

        db.session.add(skill1)
        db.session.add(skill2)
        db.session.add(skill3)

        device_type1 = DeviceType(name='Electrical Device', description='Device for electrical testing',
                                created_at=start_time, updated_at=start_time)
        device_type2 = DeviceType(name='Physical Device', description='Device for physical testing',
                                created_at=start_time, updated_at=start_time)
        device_type3 = DeviceType(name='Temperature Device', description='Device for temperature testing',
                                created_at=start_time, updated_at=start_time)
        db.session.add(device_type1)
        db.session.add(device_type2)
        db.session.add(device_type3)
        db.session.commit()
        
        method1 = Method(name='Method A', description='Method for electrical testing',
                        created_at=start_time, updated_at=start_time)
        method2 = Method(name='Method B', description='Method for physical testing',
                        created_at=start_time, updated_at=start_time)
        method3 = Method(name='Method C', description='Method for temperature testing',
                        created_at=start_time, updated_at=start_time)
        
        db.session.add(method1)
        db.session.add(method2)
        db.session.add(method3)
        db.session.commit()
    else:
        role1 = db.session.query(Role).filter_by(name='Admin').first()
        role2 = db.session.query(Role).filter_by(name='Leader').first()
        role3 = db.session.query(Role).filter_by(name='Tester').first()
        skill1 = db.session.query(Skill).filter_by(name='Electrical Testing').first()
        skill2 = db.session.query(Skill).filter_by(name='Physical Testing').first()
        skill3 = db.session.query(Skill).filter_by(name='Temperature Testing').first()
        device_type1 = db.session.query(DeviceType).filter_by(name='Electrical Device').first()
        device_type2 = db.session.query(DeviceType).filter_by(name='Physical Device').first()
        device_type3 = db.session.query(DeviceType).filter_by(name='Temperature Device').first()
        method1 = db.session.query(Method).filter_by(name='Method A').first()
        method2 = db.session.query(Method).filter_by(name='Method B').first()
        method3 = db.session.query(Method).filter_by(name='Method C').first()
    # Create mock devices
    import numpy as np
    import time
    # Ensure id is unique and alphanumeric
    np.random.seed(int(time.time())) 
    n_digits = 8
    d_id = np.random.randint(0, 36, (n_digits,))
    d_id = ''.join([str(i) if i < 10 else chr(i + 87) for i in d_id])  # convert to alphanumeric
    print(f'Generating mock data with random ID prefix: {d_id}')
    devices = []
    for d in range(num_devices):
        device = Device(name=f'Device {d_id} {d+1}', device_type_id=device_type1.id, status='Available',
                        position=f'Position {d_id} {d+1}', description=f'Device for testing {d_id} {d+1}',
                        created_at=start_time, updated_at=start_time)
        db.session.add(device)
        devices.append(device)

    db.session.commit()

    # ======= END Default Settings =======

    # ======= Generate Mock Data =======
    
    user_cnt = 1
    total_tests = 0
    total_test_hours = 0
    # Set random seed for reproducibility
    if random_seed is None:
        random_seed = int(time.time())
    np.random.seed(random_seed) 
    for i in range(num_groups):
        # Geberate Group
        leader = User(username=f'{d_id}_leader{i+1}', password=generate_password_hash('password'),
                      email=f'{d_id}_leader{i+1}@test.com', role_id=role2.id, created_at=start_time, updated_at=start_time)
        db.session.add(leader)
        db.session.commit()

        group1 = Group(name=f'Group {d_id} {i+1}', leader=leader, description=f'Description for Group {i+1}',
                       created_at=start_time, updated_at=start_time)
        db.session.add(group1)
        db.session.commit()
        db.session.add(BelongsToGroup(user_id=leader.id, group_id=group1.id))
        db.session.commit()

        times = np.random.uniform(
            0, ((end_time - start_time) - timedelta(hours=8)).total_seconds() / 3600, num_user_per_group
        )
        times = np.sort(times)
        times = [start_time + timedelta(hours=int(np.floor(t))) for t in times]
        user_work_times = [end_time - t for t in times]
        group_human_hours = np.sum([t.total_seconds() for t in user_work_times]) / 3600
        for idx, (t, st) in enumerate(zip(user_work_times, times)):

            # Generate users
            user = User(username=f'{d_id}_tester{user_cnt}', password=generate_password_hash('password'),
                        email=f'{d_id}_tester{user_cnt}@test.com', role_id=role3.id, 
                        created_at=st, updated_at=st)
            user_cnt += 1
            db.session.add(user)
            db.session.commit()
            db.session.add(BelongsToGroup(user_id=user.id, group_id=group1.id))
            db.session.commit()
            # Assign skills to users
            if user_cnt % 3 == 0:
                user_skill = UserSkill(user_id=user.id, skill_id=skill1.id)
            elif user_cnt % 3 == 1:
                user_skill = UserSkill(user_id=user.id, skill_id=skill2.id)
            else:
                user_skill = UserSkill(user_id=user.id, skill_id=skill3.id)
            db.session.add(user_skill)
            db.session.commit()

            hours = int(t.total_seconds() / 3600 * 0.33 * (5/7)) # 8 hours per day, 5 days a week
            # freq: average number of tests per user per hour
            # Assuming each user works 8 hours a day, 5 days a week
            # Simulate a Poisson distribution for the number of tests per user
            freq = group_human_hours / num_user_per_group / num_tests_per_group
            num_tests = np.random.poisson(
                freq * hours / avg_test_duration # divide by average test duration to get number of tests
            )
            num_tests = max(1, int(num_tests)) # ensure at least one test per user
            print(f'Group {i}, User {idx+1}, Hours: {hours}, Tests: {num_tests}, Freq: {freq}')
            total_tests = total_tests + num_tests
            for k in range(num_tests):
                test_start_time = st + timedelta(
                        hours=np.random.randint(0, hours)
                    )
                # duration unit: half and hour
                # 
                test_duration = np.round(np.random.normal(avg_test_duration*2, std_test_duration*2))/2
                test_duration = max(0.5, test_duration)  # ensure at least 0.5 hours
                total_test_hours += test_duration
                test_end_time = test_start_time + timedelta(hours=test_duration)
                current_app.logger.info(f'S: {test_start_time}, E: {test_end_time}, Duration: {test_duration} hours')
                status = 'Completed' if np.random.rand() > 0.05 else 'Failed'
                test = Test(
                    display_id=f'T-{idx+1:04d}-{k+1:04d}',
                    group_id=group1.id,
                    method_id=method1.id,  # Assuming all tests use Method A
                    name=f'Test {k+1} for Group {d_id} {i+1}',
                    assigned_tests=[AssignedTest(user_id=user.id)],
                    status=status,
                    description=f'Test {k+1} for Group {d_id} {i+1}',
                    created_at=test_start_time,
                    updated_at=test_start_time
                )
                db.session.add(test)
                db.session.commit()
                # Add device reservation
                device = np.random.choice(devices)
                device_reservation = DeviceReservation(
                    device_id=device.id,
                    user_id=user.id,
                    test_id=test.id,
                    start_time=test_start_time,
                    end_time=test_end_time,
                    created_at=test_start_time,
                    updated_at=test_start_time
                )
                db.session.add(device_reservation)
                # Add test report
                if status == 'Completed':
                    test_report = TestReport(
                        test_id=test.id,
                        user_id=user.id,
                        content=f'Test report for {test.name}',
                        created_at=test_start_time,
                        updated_at=test_start_time
                    )
                
                db.session.add(test_report)
                db.session.commit()
    
    print('======== Summary ========')
    print(f'Total of {num_groups} groups generated.')
    print(f'Total of {num_user_per_group * num_groups} users generated.')
    print(f'Total of {num_devices} devices generated.')
    print(f'Total of {total_tests} tests generated: ')
    print(f'Total test hours: {total_test_hours}')
    print(f'Generated group names: "Group {d_id} {{i}}", 1 <= i <= {num_groups}')
    print(f'Generated user names: "{d_id}_tester{{user_cnt}}", 1 <= user_cnt <= {num_user_per_group * num_groups}')
    print(f'Generated device names: "Device {d_id} {{d+1}}", 1 <= d <= {num_devices}')


def clear_db():
    """Clear the database."""
    with current_app.app_context():
        db.drop_all()
        db.create_all()
        # Optionally, you can call gen_mock_data() here to repopulate the database with mock data

@click.command('init-db')
def init_db_command():
    """Clear the existing data and create new tables."""
    init_db()
    click.echo('Initialized the database.')

@click.command('clear-db')
def clear_db_command():
    """Clear the existing data and create new tables."""
    clear_db()
    click.echo('Cleared the database.')
    # app.register_blueprint(api.bp)

@click.command('gen-mock-data')
def gen_mock_data_command():
    """Generate mock data for testing."""
    gen_mock_data()
    click.echo('Generated mock data.')

@click.command('gen-mock-data-dashboard')
@click.option('--start-time', default=(datetime.now() - timedelta(days=14)).isoformat(), help='Start time for mock data generation')
@click.option('--end-time', default=datetime.now().isoformat(), help='End time for mock data generation')
@click.option('--num-user-per-group', default=10, help='Number of users per group')
@click.option('--num-groups', default=1, help='Number of groups to generate')
@click.option('--num-tests-per-group', default=200, help='Average number of tests per group')
@click.option('--num-devices', default=10, help='Number of devices to generate')
@click.option('--avg-test-duration', default=3, help='Average test duration in hours')
@click.option('--std-test-duration', default=2, help='Standard deviation of test duration in hours')
def gen_mock_data_dashboard_command(start_time, end_time, num_user_per_group, num_groups, num_tests_per_group, num_devices, avg_test_duration, std_test_duration):
    """Generate mock data for dashboard testing."""
    start_time = datetime.fromisoformat(start_time)
    end_time = datetime.fromisoformat(end_time)
    gen_mock_data_for_dashboard(
        start_time=start_time,
        end_time=end_time,
        num_user_per_group=num_user_per_group,
        num_groups=num_groups,
        num_tests_per_group=num_tests_per_group,
        num_devices=num_devices,
        avg_test_duration=avg_test_duration,
        std_test_duration=std_test_duration
    )
    click.echo('Generated mock data for dashboard testing.')

@click.command('gen-token')
@click.option('--user-id', default=1, help='User ID to generate token for')
@click.option('--expires', default=3600, help='Token expiration time in seconds')
@click.option('--no-expiry', is_flag=True, default=False, help='Generate a token without expiration')
def gen_token_command(user_id, expires, no_expiry):
    """Generate a token for testing."""
    from flaskr.services.user import generate_jwt_token, get_user_by_id
    user = get_user_by_id(user_id)
    if user is None:
        click.echo(f'User with ID {user_id} not found.')
        return
    expires_delta = timedelta(seconds=3600)
    if expires:
        expires_delta = timedelta(seconds=int(expires))
    if no_expiry:
        if expires_delta:
            click.echo('Warning: --no-expiry flag overrides --expires option.')
        expires_delta = False
    
    token = generate_jwt_token(user, expires_delta=expires_delta)
    click.echo(f'Token for user {user.username} (ID: {user.id}) generated successfully.')
    click.echo(f'Generated token: {token}')

def init_app(app):
    """Initialize the app with the database."""
    app.teardown_appcontext(close_db)
    app.cli.add_command(init_db_command)
    app.cli.add_command(clear_db_command)
    app.cli.add_command(gen_mock_data_command)
    app.cli.add_command(gen_token_command)
    app.cli.add_command(gen_mock_data_dashboard_command)
    db.init_app(app)
    # Register any other commands or blueprints here
    # For example, you can register a blueprint for your API
    # from . import api