"""
Database Migration Utilities for MEGA-CONSOLIDATION Phase 4
Advanced migration tools, schema validation, and database management
"""

import logging
from typing import Dict, List, Any, Optional
from sqlalchemy import create_engine, MetaData, Table, inspect
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import SQLAlchemyError
from alembic import command, script
from alembic.config import Config
from alembic.migration import MigrationContext
import json
from datetime import datetime

logger = logging.getLogger(__name__)

class DatabaseMigrationManager:
    """Advanced database migration management with validation and rollback capabilities"""
    
    def __init__(self, database_url: str, alembic_config_path: str = "alembic.ini"):
        self.database_url = database_url
        self.engine = create_engine(database_url)
        self.metadata = MetaData()
        self.Session = sessionmaker(bind=self.engine)
        self.alembic_config = Config(alembic_config_path)
        self.alembic_config.set_main_option("sqlalchemy.url", database_url)
    
    def get_current_revision(self) -> Optional[str]:
        """Get current database revision"""
        try:
            with self.engine.connect() as connection:
                context = MigrationContext.configure(connection)
                return context.get_current_revision()
        except Exception as e:
            logger.error(f"Error getting current revision: {e}")
            return None
    
    def get_pending_migrations(self) -> List[str]:
        """Get list of pending migrations"""
        try:
            script_dir = script.ScriptDirectory.from_config(self.alembic_config)
            current_rev = self.get_current_revision()
            
            if current_rev is None:
                return []
            
            head_rev = script_dir.get_current_head()
            revisions = list(script_dir.walk_revisions(head_rev, current_rev))
            return [rev.revision for rev in revisions if rev.revision != current_rev]
        except Exception as e:
            logger.error(f"Error getting pending migrations: {e}")
            return []
    
    def validate_schema_changes(self, target_revision: str) -> Dict[str, Any]:
        """Validate schema changes before applying migrations"""
        validation_result = {
            "is_valid": True,
            "warnings": [],
            "errors": [],
            "changes_summary": {}
        }
        
        try:
            # Get current schema state
            inspector = inspect(self.engine)
            current_tables = inspector.get_table_names()
            
            # Simulate migration to get schema changes
            # This is a simplified validation - in production, use more sophisticated tools
            validation_result["changes_summary"] = {
                "current_tables": len(current_tables),
                "target_revision": target_revision,
                "validation_timestamp": datetime.utcnow().isoformat()
            }
            
            # Add specific validations
            if len(current_tables) > 100:
                validation_result["warnings"].append("Large number of tables detected - migration may take longer")
            
        except Exception as e:
            validation_result["is_valid"] = False
            validation_result["errors"].append(f"Schema validation error: {e}")
            logger.error(f"Schema validation failed: {e}")
        
        return validation_result
    
    def backup_database_schema(self) -> Dict[str, Any]:
        """Create a backup of current database schema"""
        backup_info = {
            "timestamp": datetime.utcnow().isoformat(),
            "revision": self.get_current_revision(),
            "tables": {},
            "indexes": {}
        }
        
        try:
            inspector = inspect(self.engine)
            
            for table_name in inspector.get_table_names():
                backup_info["tables"][table_name] = {
                    "columns": [col for col in inspector.get_columns(table_name)],
                    "foreign_keys": inspector.get_foreign_keys(table_name),
                    "primary_key": inspector.get_pk_constraint(table_name),
                    "unique_constraints": inspector.get_unique_constraints(table_name)
                }
                
                backup_info["indexes"][table_name] = inspector.get_indexes(table_name)
            
            logger.info(f"Schema backup created for {len(backup_info['tables'])} tables")
            
        except Exception as e:
            logger.error(f"Schema backup failed: {e}")
            backup_info["error"] = str(e)
        
        return backup_info
    
    def apply_migrations(self, target_revision: str = "head", dry_run: bool = False) -> Dict[str, Any]:
        """Apply database migrations with validation and rollback capability"""
        migration_result = {
            "success": False,
            "applied_migrations": [],
            "errors": [],
            "backup_info": None,
            "validation_result": None
        }
        
        try:
            # Validate schema changes
            migration_result["validation_result"] = self.validate_schema_changes(target_revision)
            
            if not migration_result["validation_result"]["is_valid"]:
                return migration_result
            
            # Create schema backup
            if not dry_run:
                migration_result["backup_info"] = self.backup_database_schema()
            
            # Get pending migrations
            pending = self.get_pending_migrations()
            
            if dry_run:
                migration_result["applied_migrations"] = pending
                migration_result["success"] = True
                logger.info(f"Dry run: Would apply {len(pending)} migrations")
                return migration_result
            
            # Apply migrations
            command.upgrade(self.alembic_config, target_revision)
            migration_result["applied_migrations"] = pending
            migration_result["success"] = True
            
            logger.info(f"Successfully applied {len(pending)} migrations")
            
        except Exception as e:
            migration_result["errors"].append(str(e))
            logger.error(f"Migration failed: {e}")
        
        return migration_result
    
    def rollback_migration(self, target_revision: str) -> Dict[str, Any]:
        """Rollback to a specific migration revision"""
        rollback_result = {
            "success": False,
            "target_revision": target_revision,
            "errors": []
        }
        
        try:
            command.downgrade(self.alembic_config, target_revision)
            rollback_result["success"] = True
            logger.info(f"Successfully rolled back to revision: {target_revision}")
            
        except Exception as e:
            rollback_result["errors"].append(str(e))
            logger.error(f"Rollback failed: {e}")
        
        return rollback_result

class SchemaValidator:
    """Database schema validation and integrity checking"""
    
    def __init__(self, engine):
        self.engine = engine
        self.inspector = inspect(engine)
    
    def validate_foreign_keys(self) -> Dict[str, Any]:
        """Validate all foreign key constraints"""
        validation_result = {
            "valid": True,
            "issues": [],
            "foreign_keys_checked": 0
        }
        
        try:
            for table_name in self.inspector.get_table_names():
                foreign_keys = self.inspector.get_foreign_keys(table_name)
                
                for fk in foreign_keys:
                    validation_result["foreign_keys_checked"] += 1
                    
                    # Check if referenced table exists
                    if fk['referred_table'] not in self.inspector.get_table_names():
                        validation_result["valid"] = False
                        validation_result["issues"].append({
                            "table": table_name,
                            "issue": f"Foreign key references non-existent table: {fk['referred_table']}"
                        })
        
        except Exception as e:
            validation_result["valid"] = False
            validation_result["issues"].append({"error": str(e)})
        
        return validation_result
    
    def validate_indexes(self) -> Dict[str, Any]:
        """Validate database indexes for performance"""
        validation_result = {
            "indexes_analyzed": 0,
            "performance_recommendations": [],
            "duplicate_indexes": []
        }
        
        try:
            all_indexes = {}
            
            for table_name in self.inspector.get_table_names():
                indexes = self.inspector.get_indexes(table_name)
                all_indexes[table_name] = indexes
                validation_result["indexes_analyzed"] += len(indexes)
                
                # Check for potential performance improvements
                columns = self.inspector.get_columns(table_name)
                if len(columns) > 5 and len(indexes) < 2:
                    validation_result["performance_recommendations"].append({
                        "table": table_name,
                        "recommendation": "Consider adding indexes for frequently queried columns"
                    })
        
        except Exception as e:
            validation_result["error"] = str(e)
        
        return validation_result

class DatabaseHealthMonitor:
    """Monitor database health and performance metrics"""
    
    def __init__(self, engine):
        self.engine = engine
    
    def get_table_sizes(self) -> Dict[str, Dict[str, Any]]:
        """Get size information for all tables"""
        table_sizes = {}
        
        try:
            with self.engine.connect() as connection:
                # This query works for PostgreSQL
                query = """
                SELECT 
                    schemaname,
                    tablename,
                    attname,
                    n_distinct,
                    correlation
                FROM pg_stats 
                WHERE schemaname = 'public'
                ORDER BY tablename, attname;
                """
                
                result = connection.execute(query)
                
                for row in result:
                    table_name = row[1]
                    if table_name not in table_sizes:
                        table_sizes[table_name] = {
                            "columns": [],
                            "statistics": {}
                        }
                    
                    table_sizes[table_name]["columns"].append({
                        "name": row[2],
                        "n_distinct": row[3],
                        "correlation": row[4]
                    })
        
        except Exception as e:
            logger.error(f"Error getting table sizes: {e}")
            return {"error": str(e)}
        
        return table_sizes
    
    def analyze_query_performance(self) -> Dict[str, Any]:
        """Analyze query performance and suggest optimizations"""
        performance_analysis = {
            "slow_queries": [],
            "index_recommendations": [],
            "optimization_suggestions": []
        }
        
        try:
            # This would require actual query log analysis
            # For now, provide general recommendations
            performance_analysis["optimization_suggestions"] = [
                "Regular VACUUM and ANALYZE operations",
                "Monitor connection pool usage",
                "Consider partitioning for large tables",
                "Review and optimize frequently used queries"
            ]
        
        except Exception as e:
            performance_analysis["error"] = str(e)
        
        return performance_analysis
