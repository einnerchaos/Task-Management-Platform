from app import db, User, Project, ProjectMember, Task, TaskComment, TimeEntry
from datetime import datetime, timedelta
import random

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
    
    # Create projects
    projects = [
        Project(
            name='Website Redesign',
            description='Complete redesign of company website with modern UI/UX',
            owner_id=1,
            status='active'
        ),
        Project(
            name='Mobile App Development',
            description='Develop a new mobile application for iOS and Android',
            owner_id=2,
            status='active'
        ),
        Project(
            name='Database Migration',
            description='Migrate legacy database to new cloud infrastructure',
            owner_id=1,
            status='active'
        ),
        Project(
            name='Marketing Campaign',
            description='Launch new marketing campaign for Q4',
            owner_id=3,
            status='planning'
        )
    ]
    
    for project in projects:
        db.session.add(project)
    db.session.commit()
    
    # Add project members
    project_members = [
        # Website Redesign team
        ProjectMember(project_id=1, user_id=1, role='owner'),
        ProjectMember(project_id=1, user_id=2, role='member'),
        ProjectMember(project_id=1, user_id=3, role='member'),
        
        # Mobile App team
        ProjectMember(project_id=2, user_id=2, role='owner'),
        ProjectMember(project_id=2, user_id=1, role='member'),
        ProjectMember(project_id=2, user_id=4, role='member'),
        
        # Database Migration team
        ProjectMember(project_id=3, user_id=1, role='owner'),
        ProjectMember(project_id=3, user_id=5, role='member'),
        
        # Marketing Campaign team
        ProjectMember(project_id=4, user_id=3, role='owner'),
        ProjectMember(project_id=4, user_id=2, role='member'),
        ProjectMember(project_id=4, user_id=4, role='member')
    ]
    
    for member in project_members:
        db.session.add(member)
    db.session.commit()
    
    # Create tasks
    tasks = [
        # Website Redesign tasks
        Task(
            title='Design Homepage Layout',
            description='Create wireframes and mockups for the new homepage design',
            status='completed',
            priority='high',
            project_id=1,
            assignee_id=2,
            created_by=1,
            due_date=datetime.now() - timedelta(days=5)
        ),
        Task(
            title='Implement Responsive Design',
            description='Ensure website works properly on all device sizes',
            status='in_progress',
            priority='high',
            project_id=1,
            assignee_id=3,
            created_by=1,
            due_date=datetime.now() + timedelta(days=7)
        ),
        Task(
            title='Content Management System',
            description='Build CMS for easy content updates',
            status='todo',
            priority='medium',
            project_id=1,
            assignee_id=2,
            created_by=1,
            due_date=datetime.now() + timedelta(days=14)
        ),
        Task(
            title='SEO Optimization',
            description='Optimize website for search engines',
            status='todo',
            priority='low',
            project_id=1,
            assignee_id=3,
            created_by=1,
            due_date=datetime.now() + timedelta(days=21)
        ),
        
        # Mobile App tasks
        Task(
            title='UI/UX Design',
            description='Design user interface and user experience for mobile app',
            status='completed',
            priority='high',
            project_id=2,
            assignee_id=4,
            created_by=2,
            due_date=datetime.now() - timedelta(days=10)
        ),
        Task(
            title='Frontend Development',
            description='Develop React Native frontend components',
            status='in_progress',
            priority='high',
            project_id=2,
            assignee_id=1,
            created_by=2,
            due_date=datetime.now() + timedelta(days=5)
        ),
        Task(
            title='Backend API Integration',
            description='Integrate mobile app with backend APIs',
            status='todo',
            priority='high',
            project_id=2,
            assignee_id=1,
            created_by=2,
            due_date=datetime.now() + timedelta(days=12)
        ),
        Task(
            title='Testing and QA',
            description='Perform comprehensive testing on all devices',
            status='todo',
            priority='medium',
            project_id=2,
            assignee_id=4,
            created_by=2,
            due_date=datetime.now() + timedelta(days=20)
        ),
        
        # Database Migration tasks
        Task(
            title='Backup Current Database',
            description='Create full backup of existing database',
            status='completed',
            priority='critical',
            project_id=3,
            assignee_id=5,
            created_by=1,
            due_date=datetime.now() - timedelta(days=3)
        ),
        Task(
            title='Set Up Cloud Infrastructure',
            description='Configure new cloud database environment',
            status='in_progress',
            priority='high',
            project_id=3,
            assignee_id=1,
            created_by=1,
            due_date=datetime.now() + timedelta(days=2)
        ),
        Task(
            title='Data Migration Scripts',
            description='Write scripts to migrate data to new structure',
            status='todo',
            priority='high',
            project_id=3,
            assignee_id=5,
            created_by=1,
            due_date=datetime.now() + timedelta(days=5)
        ),
        
        # Marketing Campaign tasks
        Task(
            title='Campaign Strategy',
            description='Develop comprehensive marketing strategy',
            status='completed',
            priority='high',
            project_id=4,
            assignee_id=3,
            created_by=3,
            due_date=datetime.now() - timedelta(days=7)
        ),
        Task(
            title='Content Creation',
            description='Create marketing materials and content',
            status='in_progress',
            priority='medium',
            project_id=4,
            assignee_id=2,
            created_by=3,
            due_date=datetime.now() + timedelta(days=3)
        ),
        Task(
            title='Social Media Planning',
            description='Plan social media campaign schedule',
            status='todo',
            priority='medium',
            project_id=4,
            assignee_id=4,
            created_by=3,
            due_date=datetime.now() + timedelta(days=5)
        )
    ]
    
    for task in tasks:
        db.session.add(task)
    db.session.commit()
    
    # Create task comments
    comments = [
        TaskComment(
            task_id=1,
            user_id=2,
            content='Initial wireframes completed. Ready for review.'
        ),
        TaskComment(
            task_id=1,
            user_id=1,
            content='Great work! The design looks modern and clean.'
        ),
        TaskComment(
            task_id=2,
            user_id=3,
            content='Mobile responsiveness implemented. Testing on various devices.'
        ),
        TaskComment(
            task_id=5,
            user_id=4,
            content='UI design approved by stakeholders. Moving to development phase.'
        ),
        TaskComment(
            task_id=6,
            user_id=1,
            content='Core components built. Need to integrate with state management.'
        ),
        TaskComment(
            task_id=9,
            user_id=5,
            content='Backup completed successfully. All data verified.'
        ),
        TaskComment(
            task_id=10,
            user_id=1,
            content='Cloud environment configured. Ready for migration.'
        ),
        TaskComment(
            task_id=12,
            user_id=3,
            content='Strategy document finalized. Approved by management.'
        )
    ]
    
    for comment in comments:
        db.session.add(comment)
    db.session.commit()
    
    # Create time entries
    time_entries = [
        TimeEntry(
            task_id=1,
            user_id=2,
            description='Design work',
            start_time=datetime.now() - timedelta(days=7, hours=2),
            end_time=datetime.now() - timedelta(days=7),
            duration=120
        ),
        TimeEntry(
            task_id=1,
            user_id=2,
            description='Revision work',
            start_time=datetime.now() - timedelta(days=6, hours=3),
            end_time=datetime.now() - timedelta(days=6),
            duration=180
        ),
        TimeEntry(
            task_id=2,
            user_id=3,
            description='Responsive design implementation',
            start_time=datetime.now() - timedelta(days=2, hours=4),
            end_time=datetime.now() - timedelta(days=2),
            duration=240
        ),
        TimeEntry(
            task_id=5,
            user_id=4,
            description='UI/UX design work',
            start_time=datetime.now() - timedelta(days=12, hours=6),
            end_time=datetime.now() - timedelta(days=12),
            duration=360
        ),
        TimeEntry(
            task_id=6,
            user_id=1,
            description='React Native development',
            start_time=datetime.now() - timedelta(days=1, hours=5),
            end_time=datetime.now() - timedelta(days=1),
            duration=300
        ),
        TimeEntry(
            task_id=9,
            user_id=5,
            description='Database backup process',
            start_time=datetime.now() - timedelta(days=3, hours=1),
            end_time=datetime.now() - timedelta(days=3),
            duration=60
        ),
        TimeEntry(
            task_id=10,
            user_id=1,
            description='Cloud infrastructure setup',
            start_time=datetime.now() - timedelta(hours=3),
            end_time=datetime.now() - timedelta(hours=1),
            duration=120
        ),
        TimeEntry(
            task_id=12,
            user_id=3,
            description='Strategy development',
            start_time=datetime.now() - timedelta(days=8, hours=4),
            end_time=datetime.now() - timedelta(days=8),
            duration=240
        )
    ]
    
    for entry in time_entries:
        db.session.add(entry)
    db.session.commit()
    
    print("Sample data created successfully!") 