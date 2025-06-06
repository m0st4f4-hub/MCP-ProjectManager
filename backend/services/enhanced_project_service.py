from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from datetime import datetime, timedelta
import logging

from models.project import Project
from models.task import Task
from schemas.project import ProjectCreate, ProjectUpdate
from core.exceptions import ProjectNotFoundError, ProjectAccessDeniedError
from core.cache import cache_manager
from core.audit import audit_logger

logger = logging.getLogger(__name__)

class EnhancedProjectService:
    """Enhanced project service with caching, auditing, and advanced features."""
    
    def __init__(self, db: Session, user_id: Optional[str] = None):
        self.db = db
        self.user_id = user_id
        self.cache_ttl = 300  # 5 minutes
    
    async def get_project_with_cache(self, project_id: str) -> Optional[Project]:
        """Get project with caching support."""
        cache_key = f"project:{project_id}"
        
        # Try cache first
        cached_project = await cache_manager.get(cache_key)
        if cached_project:
            logger.debug(f"Cache hit for project {project_id}")
            return cached_project
        
        # Fetch from database
        project = self.db.query(Project).filter(
            Project.id == project_id,
            Project.is_deleted == False
        ).first()
        
        if project:
            # Cache the result
            await cache_manager.set(cache_key, project, ttl=self.cache_ttl)
            logger.debug(f"Cached project {project_id}")
        
        return project
    
    async def create_project_enhanced(
        self, 
        project_data: ProjectCreate,
        auto_setup: bool = True
    ) -> Project:
        """Create project with enhanced features and auto-setup."""
        try:
            # Create the project
            project = Project(
                name=project_data.name,
                description=project_data.description,
                owner_id=self.user_id,
                settings=project_data.settings or {},
                created_at=datetime.utcnow()
            )
            
            self.db.add(project)
            self.db.flush()  # Get the ID without committing
            
            if auto_setup:
                await self._setup_default_project_structure(project)
            
            self.db.commit()
            self.db.refresh(project)
            
            # Clear related caches
            await self._invalidate_project_caches(project.id)
            
            # Audit log
            await audit_logger.log_project_created(
                project_id=project.id,
                user_id=self.user_id,
                project_data=project_data.dict()
            )
            
            logger.info(f"Created project {project.id} with auto-setup={auto_setup}")
            return project
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"Failed to create project: {str(e)}")
            raise
    
    async def update_project_enhanced(
        self, 
        project_id: str, 
        updates: ProjectUpdate
    ) -> Project:
        """Update project with validation and caching."""
        project = await self.get_project_with_cache(project_id)
        if not project:
            raise ProjectNotFoundError(f"Project {project_id} not found")
        
        # Check permissions
        if not await self._check_project_access(project, 'write'):
            raise ProjectAccessDeniedError("Insufficient permissions")
        
        try:
            # Apply updates
            update_data = updates.dict(exclude_unset=True)
            for field, value in update_data.items():
                if hasattr(project, field):
                    setattr(project, field, value)
            
            project.updated_at = datetime.utcnow()
            
            self.db.commit()
            self.db.refresh(project)
            
            # Clear caches
            await self._invalidate_project_caches(project_id)
            
            # Audit log
            await audit_logger.log_project_updated(
                project_id=project_id,
                user_id=self.user_id,
                changes=update_data
            )
            
            logger.info(f"Updated project {project_id}")
            return project
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"Failed to update project {project_id}: {str(e)}")
            raise
    
    async def get_project_analytics(self, project_id: str) -> Dict[str, Any]:
        """Get comprehensive project analytics."""
        cache_key = f"project_analytics:{project_id}"
        
        # Check cache first
        cached_analytics = await cache_manager.get(cache_key)
        if cached_analytics:
            return cached_analytics
        
        # Calculate analytics
        project = await self.get_project_with_cache(project_id)
        if not project:
            raise ProjectNotFoundError(f"Project {project_id} not found")
        
        # Task statistics
        task_stats = self.db.query(
            func.count(Task.id).label('total_tasks'),
            func.count(Task.id).filter(Task.status == 'completed').label('completed_tasks'),
            func.count(Task.id).filter(Task.status == 'in_progress').label('active_tasks'),
            func.count(Task.id).filter(Task.status == 'pending').label('pending_tasks'),
            func.avg(Task.estimated_hours).label('avg_estimated_hours'),
            func.sum(Task.actual_hours).label('total_actual_hours')
        ).filter(Task.project_id == project_id).first()
        
        # Recent activity
        recent_tasks = self.db.query(Task).filter(
            Task.project_id == project_id,
            Task.updated_at >= datetime.utcnow() - timedelta(days=7)
        ).order_by(Task.updated_at.desc()).limit(10).all()
        
        # Performance metrics
        completion_rate = 0
        if task_stats.total_tasks > 0:
            completion_rate = (task_stats.completed_tasks / task_stats.total_tasks) * 100
        
        analytics = {
            'project_id': project_id,
            'task_statistics': {
                'total': task_stats.total_tasks or 0,
                'completed': task_stats.completed_tasks or 0,
                'active': task_stats.active_tasks or 0,
                'pending': task_stats.pending_tasks or 0,
                'completion_rate': round(completion_rate, 2)
            },
            'time_tracking': {
                'average_estimated_hours': float(task_stats.avg_estimated_hours or 0),
                'total_actual_hours': float(task_stats.total_actual_hours or 0)
            },
            'recent_activity': [
                {
                    'task_id': task.id,
                    'title': task.title,
                    'status': task.status,
                    'updated_at': task.updated_at.isoformat()
                } for task in recent_tasks
            ],
            'generated_at': datetime.utcnow().isoformat()
        }
        
        # Cache for 10 minutes
        await cache_manager.set(cache_key, analytics, ttl=600)
        
        return analytics
    
    async def search_projects(
        self,
        query: str,
        filters: Dict[str, Any] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[Project]:
        """Advanced project search with filters."""
        base_query = self.db.query(Project).filter(Project.is_deleted == False)
        
        # Text search
        if query:
            search_filter = or_(
                Project.name.ilike(f"%{query}%"),
                Project.description.ilike(f"%{query}%")
            )
            base_query = base_query.filter(search_filter)
        
        # Apply filters
        if filters:
            if 'is_archived' in filters:
                base_query = base_query.filter(Project.is_archived == filters['is_archived'])
            
            if 'owner_id' in filters:
                base_query = base_query.filter(Project.owner_id == filters['owner_id'])
            
            if 'created_after' in filters:
                base_query = base_query.filter(Project.created_at >= filters['created_after'])
            
            if 'created_before' in filters:
                base_query = base_query.filter(Project.created_at <= filters['created_before'])
        
        # Apply user access restrictions
        if self.user_id:
            # Add logic for user access based on permissions
            pass
        
        projects = base_query.offset(offset).limit(limit).all()
        
        logger.info(f"Search returned {len(projects)} projects for query: {query}")
        return projects
    
    async def _setup_default_project_structure(self, project: Project):
        """Set up default project structure (tasks, milestones, etc.)."""
        default_tasks = [
            {
                'title': 'Project Setup',
                'description': 'Initial project setup and configuration',
                'status': 'pending',
                'priority': 'high'
            },
            {
                'title': 'Requirements Analysis',
                'description': 'Analyze and document project requirements',
                'status': 'pending',
                'priority': 'medium'
            }
        ]
        
        for task_data in default_tasks:
            task = Task(
                project_id=project.id,
                **task_data,
                created_at=datetime.utcnow()
            )
            self.db.add(task)
        
        logger.info(f"Set up default structure for project {project.id}")
    
    async def _check_project_access(self, project: Project, permission: str) -> bool:
        """Check if user has permission to access project."""
        if not self.user_id:
            return False
        
        # Owner has full access
        if project.owner_id == self.user_id:
            return True
        
        # Add more sophisticated permission checking here
        # This could include team memberships, role-based access, etc.
        
        return False
    
    async def _invalidate_project_caches(self, project_id: str):
        """Invalidate all caches related to a project."""
        cache_keys = [
            f"project:{project_id}",
            f"project_analytics:{project_id}",
            f"project_tasks:{project_id}"
        ]
        
        for key in cache_keys:
            await cache_manager.delete(key)
        
        logger.debug(f"Invalidated caches for project {project_id}")
