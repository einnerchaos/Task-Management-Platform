from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_socketio import SocketIO, emit, join_room, leave_room
from datetime import datetime, timedelta
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-here'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///task_management.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(20), default='user')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    projects = db.relationship('Project', backref='owner', lazy=True)
    assigned_tasks = db.relationship('Task', foreign_keys='Task.assignee_id', backref='assignee', lazy=True)
    created_tasks = db.relationship('Task', foreign_keys='Task.created_by', backref='creator', lazy=True)

class Project(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    status = db.Column(db.String(20), default='active')
    owner_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    tasks = db.relationship('Task', backref='project', lazy=True)
    members = db.relationship('ProjectMember', backref='project', lazy=True)

class ProjectMember(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    role = db.Column(db.String(20), default='member')
    joined_at = db.Column(db.DateTime, default=datetime.utcnow)

class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    status = db.Column(db.String(20), default='todo')
    priority = db.Column(db.String(20), default='medium')
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    assignee_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    created_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    due_date = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    comments = db.relationship('TaskComment', backref='task', lazy=True)
    time_entries = db.relationship('TimeEntry', backref='task', lazy=True)

class TaskComment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    task_id = db.Column(db.Integer, db.ForeignKey('task.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    user = db.relationship('User', foreign_keys=[user_id], backref='comments')

class TimeEntry(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    task_id = db.Column(db.Integer, db.ForeignKey('task.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    description = db.Column(db.Text)
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime)
    duration = db.Column(db.Integer)  # in minutes
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    user = db.relationship('User', foreign_keys=[user_id], backref='time_entries')

# Dummy authentication endpoints
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    user = User.query.filter_by(email=data['email']).first()
    if not user:
        user = User(
            name=data['name'],
            email=data['email'],
            password=data['password'],
            role=data.get('role', 'user')
        )
        db.session.add(user)
        db.session.commit()
    return jsonify({
        'token': 'demo-token',
        'user': {
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'role': user.role
        }
    })

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data['email']).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify({
        'token': 'demo-token',
        'user': {
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'role': user.role
        }
    })

# Project routes
@app.route('/api/projects', methods=['GET'])
def get_projects():
    projects = Project.query.all()
    return jsonify([{
        'id': p.id,
        'name': p.name,
        'description': p.description,
        'status': p.status,
        'owner_id': p.owner_id,
        'created_at': p.created_at.isoformat(),
        'task_count': len(p.tasks),
        'completed_tasks': len([t for t in p.tasks if t.status == 'completed'])
    } for p in projects])

@app.route('/api/projects', methods=['POST'])
def create_project():
    data = request.get_json()
    
    project = Project(
        name=data['name'],
        description=data.get('description', ''),
        owner_id=1 # Dummy owner for now
    )
    
    db.session.add(project)
    db.session.commit()
    
    # Add owner as member
    member = ProjectMember(project_id=project.id, user_id=1, role='owner') # Dummy owner for now
    db.session.add(member)
    db.session.commit()
    
    socketio.emit('project_created', {
        'project': {
            'id': project.id,
            'name': project.name,
            'description': project.description,
            'status': project.status,
            'owner_id': project.owner_id,
            'created_at': project.created_at.isoformat()
        }
    })
    
    return jsonify({
        'id': project.id,
        'name': project.name,
        'description': project.description,
        'status': project.status,
        'owner_id': project.owner_id,
        'created_at': project.created_at.isoformat()
    })

@app.route('/api/projects/<int:project_id>', methods=['GET'])
def get_project(project_id):
    project = Project.query.get_or_404(project_id)
    
    return jsonify({
        'id': project.id,
        'name': project.name,
        'description': project.description,
        'status': project.status,
        'owner_id': project.owner_id,
        'created_at': project.created_at.isoformat(),
        'members': [{
            'id': m.user_id,
            'role': m.role,
            'joined_at': m.joined_at.isoformat()
        } for m in project.members],
        'tasks': [{
            'id': t.id,
            'title': t.title,
            'description': t.description,
            'status': t.status,
            'priority': t.priority,
            'assignee_id': t.assignee_id,
            'due_date': t.due_date.isoformat() if t.due_date else None,
            'created_at': t.created_at.isoformat()
        } for t in project.tasks]
    })

# Task routes
@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    project_id = request.args.get('project_id', type=int)
    status = request.args.get('status')
    
    query = Task.query
    
    if project_id:
        query = query.filter_by(project_id=project_id)
    
    if status:
        query = query.filter_by(status=status)
    
    tasks = query.all()
    
    return jsonify([{
        'id': t.id,
        'title': t.title,
        'description': t.description,
        'status': t.status,
        'priority': t.priority,
        'project_id': t.project_id,
        'assignee_id': t.assignee_id,
        'assignee_name': t.assignee.name if t.assignee else None,
        'due_date': t.due_date.isoformat() if t.due_date else None,
        'created_at': t.created_at.isoformat(),
        'comment_count': len(t.comments),
        'time_spent': sum(te.duration or 0 for te in t.time_entries)
    } for t in tasks])

@app.route('/api/tasks', methods=['POST'])
def create_task():
    data = request.get_json()
    
    task = Task(
        title=data['title'],
        description=data.get('description', ''),
        status=data.get('status', 'todo'),
        priority=data.get('priority', 'medium'),
        project_id=data['project_id'],
        assignee_id=data.get('assignee_id'),
        created_by=1, # Dummy creator for now
        due_date=datetime.fromisoformat(data['due_date']) if data.get('due_date') else None
    )
    
    db.session.add(task)
    db.session.commit()
    
    socketio.emit('task_created', {
        'task': {
            'id': task.id,
            'title': task.title,
            'status': task.status,
            'project_id': task.project_id
        }
    })
    
    return jsonify({
        'id': task.id,
        'title': task.title,
        'description': task.description,
        'status': task.status,
        'priority': task.priority,
        'project_id': task.project_id,
        'assignee_id': task.assignee_id,
        'due_date': task.due_date.isoformat() if task.due_date else None,
        'created_at': task.created_at.isoformat()
    })

@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    task = Task.query.get_or_404(task_id)
    data = request.get_json()
    
    if 'title' in data:
        task.title = data['title']
    if 'description' in data:
        task.description = data['description']
    if 'status' in data:
        task.status = data['status']
    if 'priority' in data:
        task.priority = data['priority']
    if 'assignee_id' in data:
        task.assignee_id = data['assignee_id']
    if 'due_date' in data:
        task.due_date = datetime.fromisoformat(data['due_date']) if data['due_date'] else None
    
    task.updated_at = datetime.utcnow()
    db.session.commit()
    
    socketio.emit('task_updated', {
        'task': {
            'id': task.id,
            'title': task.title,
            'status': task.status,
            'project_id': task.project_id
        }
    })
    
    return jsonify({
        'id': task.id,
        'title': task.title,
        'description': task.description,
        'status': task.status,
        'priority': task.priority,
        'project_id': task.project_id,
        'assignee_id': task.assignee_id,
        'due_date': task.due_date.isoformat() if task.due_date else None,
        'updated_at': task.updated_at.isoformat()
    })

# User routes
@app.route('/api/users', methods=['GET'])
def get_users():
    users = User.query.all()
    return jsonify([{
        'id': u.id,
        'name': u.name,
        'email': u.email,
        'role': u.role
    } for u in users])

# Dashboard statistics
@app.route('/api/dashboard/stats', methods=['GET'])
def get_dashboard_stats():
    user_id = 1 # Dummy user for now
    user = User.query.get(user_id)
    
    if user.role == 'admin':
        total_projects = Project.query.count()
        total_tasks = Task.query.count()
        completed_tasks = Task.query.filter_by(status='completed').count()
        pending_tasks = Task.query.filter_by(status='todo').count()
    else:
        # Get user's accessible projects
        member_projects = db.session.query(Project).join(ProjectMember).filter(ProjectMember.user_id == user_id).all()
        owned_projects = Project.query.filter_by(owner_id=user_id).all()
        project_ids = [p.id for p in member_projects + owned_projects]
        
        total_projects = len(project_ids)
        total_tasks = Task.query.filter(Task.project_id.in_(project_ids)).count()
        completed_tasks = Task.query.filter(Task.project_id.in_(project_ids), Task.status == 'completed').count()
        pending_tasks = Task.query.filter(Task.project_id.in_(project_ids), Task.status == 'todo').count()
    
    return jsonify({
        'total_projects': total_projects,
        'total_tasks': total_tasks,
        'completed_tasks': completed_tasks,
        'pending_tasks': pending_tasks,
        'completion_rate': (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
    })

@app.route('/api/seed', methods=['POST'])
def reseed_demo_data():
    user_id = 1 # Dummy user for now
    user = User.query.get(user_id)
    if not user or user.role != 'admin':
        return jsonify({'error': 'Admin only'}), 403
    # Drop all data
    meta = db.metadata
    for table in reversed(meta.sorted_tables):
        db.session.execute(table.delete())
    db.session.commit()
    # Reseed
    create_sample_data()
    return jsonify({'message': 'Demo data reseeded.'})

# Socket.IO events
@socketio.on('connect')
def handle_connect():
    print('Client connected')

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

@socketio.on('join_project')
def handle_join_project(data):
    room = f"project_{data['project_id']}"
    join_room(room)
    print(f'Client joined room: {room}')

@socketio.on('leave_project')
def handle_leave_project(data):
    room = f"project_{data['project_id']}"
    leave_room(room)
    print(f'Client left room: {room}')

def create_sample_data():
    # Create users
    users = [
        User(name='John Doe', email='john@example.com', password='password123', role='admin'),
        User(name='Jane Smith', email='jane@example.com', password='password123', role='user'),
        User(name='Mike Johnson', email='mike@example.com', password='password123', role='user'),
        User(name='Sarah Wilson', email='sarah@example.com', password='password123', role='user'),
        User(name='David Brown', email='david@example.com', password='password123', role='user')
    ]
    for user in users:
        db.session.add(user)
    db.session.commit()

    # Realistic project names, descriptions, and icons
    project_data = [
        {'name': 'Website Redesign', 'desc': 'Complete overhaul of the company website with a modern UI/UX.', 'icon': '🌐', 'status': 'active'},
        {'name': 'Mobile App Launch', 'desc': 'Develop and launch a new mobile app for iOS and Android.', 'icon': '📱', 'status': 'active'},
        {'name': 'CRM Migration', 'desc': 'Migrate all customer data to the new CRM platform.', 'icon': '🔄', 'status': 'planning'},
        {'name': 'Marketing Campaign Q4', 'desc': 'Plan and execute the Q4 marketing campaign.', 'icon': '📢', 'status': 'active'},
        {'name': 'Cloud Infrastructure', 'desc': 'Move core services to scalable cloud infrastructure.', 'icon': '☁️', 'status': 'active'},
        {'name': 'E-commerce Platform', 'desc': 'Build a new e-commerce platform for online sales.', 'icon': '🛒', 'status': 'planning'},
        {'name': 'HR Portal', 'desc': 'Develop an internal HR portal for employees.', 'icon': '👩‍💼', 'status': 'active'},
        {'name': 'Analytics Dashboard', 'desc': 'Create a dashboard for business analytics and KPIs.', 'icon': '📊', 'status': 'active'},
        {'name': 'Customer Support System', 'desc': 'Implement a new customer support ticketing system.', 'icon': '🎫', 'status': 'planning'},
        {'name': 'Security Audit', 'desc': 'Conduct a full security audit of all systems.', 'icon': '🔒', 'status': 'active'},
        {'name': 'Inventory Management', 'desc': 'Automate inventory tracking and reporting.', 'icon': '📦', 'status': 'active'},
        {'name': 'API Integration', 'desc': 'Integrate third-party APIs for payments and logistics.', 'icon': '🔗', 'status': 'active'},
        {'name': 'Employee Onboarding', 'desc': 'Streamline the onboarding process for new hires.', 'icon': '📝', 'status': 'planning'},
        {'name': 'DevOps Pipeline', 'desc': 'Set up CI/CD pipelines for all projects.', 'icon': '⚙️', 'status': 'active'},
        {'name': 'Data Warehouse', 'desc': 'Centralize data storage for analytics.', 'icon': '🏢', 'status': 'active'},
        {'name': 'Partner Portal', 'desc': 'Build a portal for business partners.', 'icon': '🤝', 'status': 'planning'},
        {'name': 'Social Media Automation', 'desc': 'Automate social media posting and analytics.', 'icon': '🤖', 'status': 'active'},
        {'name': 'Legal Compliance', 'desc': 'Ensure all systems comply with new regulations.', 'icon': '📜', 'status': 'active'},
        {'name': 'Product Launch', 'desc': 'Coordinate the launch of the new product line.', 'icon': '🚀', 'status': 'active'},
        {'name': 'User Feedback Program', 'desc': 'Collect and analyze user feedback for improvements.', 'icon': '💬', 'status': 'planning'}
    ]
    projects = []
    for i, pdata in enumerate(project_data, 1):
        p = Project(
            name=pdata['name'],
            description=pdata['desc'],
            status=pdata['status'],
            owner_id=((i-1) % 5) + 1
        )
        db.session.add(p)
        projects.append(p)
    db.session.commit()

    # Add project members
    for i, project in enumerate(projects, 1):
        for uid in range(1, 6):
            db.session.add(ProjectMember(project_id=project.id, user_id=uid, role='owner' if uid == project.owner_id else 'member'))
    db.session.commit()

    # Create realistic tasks for each project
    import random
    task_templates = [
        ('Design UI', 'Design the user interface for the project.'),
        ('Develop Backend', 'Implement backend logic and database.'),
        ('Testing', 'Perform QA and bug fixing.'),
        ('Deployment', 'Deploy the project to production.'),
        ('Documentation', 'Write user and technical documentation.'),
        ('Client Meeting', 'Meet with client to gather requirements.'),
        ('API Integration', 'Integrate with third-party APIs.'),
        ('Performance Optimization', 'Optimize for speed and scalability.'),
        ('Security Review', 'Review and improve security.'),
        ('User Training', 'Train users on the new system.')
    ]
    statuses = ['todo', 'in_progress', 'completed']
    priorities = ['low', 'medium', 'high', 'critical']
    for project in projects:
        for ttitle, tdesc in random.sample(task_templates, 5):
            db.session.add(Task(
                title=ttitle,
                description=tdesc,
                status=random.choice(statuses),
                priority=random.choice(priorities),
                project_id=project.id,
                assignee_id=random.randint(1, 5),
                created_by=project.owner_id,
                due_date=datetime.now() + timedelta(days=random.randint(-10, 30))
            ))
    db.session.commit()

# Global flag to track initialization
_initialized = False

def initialize_database():
    with app.app_context():
        db.create_all()
        # Always check and seed if empty
        if not User.query.first() or not Project.query.first():
            print('Seeding sample data...')
            create_sample_data()
        else:
            print('Sample data already present, skipping seeding.')

@app.before_request
def ensure_initialized():
    global _initialized
    if not _initialized:
        initialize_database()
        _initialized = True

if __name__ == '__main__':
    initialize_database()
    socketio.run(app, debug=True, host='0.0.0.0', port=5000, allow_unsafe_werkzeug=True) 