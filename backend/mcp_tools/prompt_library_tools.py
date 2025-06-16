"""
Prompt Library MCP Tool for managing reusable prompts with context awareness.
"""

import re
import json
from typing import Dict, Any, List, Optional
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func
import logging

from .contracts.base_contract import BaseMCPTool
from ..models.memory import MemoryEntity, MemoryObservation
from ..services.memory_service import MemoryService
from ..services.exceptions import EntityNotFoundError, ValidationError, DuplicateEntityError

logger = logging.getLogger(__name__)


class PromptLibraryTool(BaseMCPTool):
    """MCP tool for managing a library of reusable prompts with template variables."""
    
    def __init__(self, db: AsyncSession):
        super().__init__()
        self.db = db
        self.memory_service = MemoryService(db)
    
    async def execute(self, parameters: Dict[str, Any], context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Execute prompt library operations."""
        try:
            # Validate parameters
            validated_params = self.validate_parameters(parameters)
            action = validated_params['action']
            
            # Route to appropriate action
            if action == 'create':
                return await self._create_prompt(validated_params)
            elif action == 'get':
                return await self._get_prompt(validated_params)
            elif action == 'list':
                return await self._list_prompts(validated_params)
            elif action == 'update':
                return await self._update_prompt(validated_params)
            elif action == 'delete':
                return await self._delete_prompt(validated_params)
            elif action == 'search':
                return await self._search_prompts(validated_params)
            else:
                raise ValidationError(f"Unknown action: {action}")
                
        except Exception as e:
            logger.error(f"Error in PromptLibraryTool: {e}")
            return {
                "success": False,
                "action": parameters.get('action', 'unknown'),
                "error": str(e),
                "message": f"Prompt library operation failed: {str(e)}"
            }
    
    async def _create_prompt(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new prompt in the library."""
        name = params['name']
        content = params['content']
        category = params.get('category', 'task_planning')
        tags = params.get('tags', [])
        context_requirements = params.get('context_requirements', {})
        agent_roles = params.get('agent_roles', [])
        
        # Generate prompt ID
        prompt_id = self._generate_prompt_id(name)
        
        # Check for duplicates
        existing = await self._find_prompt_by_name(name)
        if existing:
            raise DuplicateEntityError(f"Prompt with name '{name}' already exists")
        
        # Validate template syntax
        self._validate_template(content, context_requirements)
        
        # Create memory entity for the prompt
        entity_data = {
            "entity_type": "prompt_template",
            "name": prompt_id,
            "content": content,
            "entity_metadata": {
                "name": name,
                "prompt_id": prompt_id,
                "category": category,
                "tags": tags,
                "context_requirements": context_requirements,
                "agent_roles": agent_roles,
                "created_at": datetime.utcnow().isoformat(),
                "usage_count": 0,
                "last_used": None
            },
            "source": "prompt_library_tool"
        }
        
        prompt_entity = await self.memory_service.create_memory_entity(entity_data)
        
        # Add categorization observation
        await self.memory_service.add_observation_to_entity(
            prompt_entity.id,
            f"Prompt created in category '{category}' with tags: {', '.join(tags)}",
            source="prompt_library_tool"
        )
        
        return {
            "success": True,
            "action": "create",
            "data": {
                "prompt_id": prompt_id,
                "name": name,
                "category": category,
                "created_at": entity_data["entity_metadata"]["created_at"]
            },
            "message": "Prompt created successfully"
        }
    
    async def _get_prompt(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Get a prompt and optionally render it with variables."""
        prompt_id = params['prompt_id']
        variables = params.get('variables', {})
        include_examples = params.get('include_examples', False)
        
        # Find the prompt
        prompt_entity = await self._find_prompt_by_id(prompt_id)
        if not prompt_entity:
            raise EntityNotFoundError(f"Prompt '{prompt_id}' not found")
        
        metadata = prompt_entity.entity_metadata
        content = prompt_entity.content
        
        # Check agent role access if context provided
        if params.get('_agent_role') and metadata.get('agent_roles'):
            if params['_agent_role'] not in metadata['agent_roles']:
                return {
                    "success": False,
                    "action": "get",
                    "error": "ACCESS_DENIED",
                    "message": "Agent role not authorized to access this prompt"
                }
        
        # Render template if variables provided
        rendered_content = content
        if variables:
            try:
                rendered_content = self._render_template(content, variables)
                
                # Update usage tracking
                await self._update_usage_stats(prompt_entity)
                
            except Exception as e:
                return {
                    "success": False,
                    "action": "get",
                    "error": "MISSING_VARIABLES",
                    "message": f"Template rendering failed: {str(e)}"
                }
        
        response_data = {
            "prompt_id": prompt_id,
            "name": metadata['name'],
            "content": content,
            "metadata": {
                "category": metadata.get('category'),
                "tags": metadata.get('tags', []),
                "context_requirements": metadata.get('context_requirements', {}),
                "usage_count": metadata.get('usage_count', 0),
                "last_used": metadata.get('last_used')
            }
        }
        
        # Add rendered content if variables were provided
        if variables:
            response_data["rendered_content"] = rendered_content
            response_data["variables_used"] = variables
        
        # Add examples if requested
        if include_examples:
            response_data["examples"] = await self._get_prompt_examples(prompt_entity)
        
        return {
            "success": True,
            "action": "get",
            "data": response_data,
            "message": "Prompt retrieved successfully"
        }
    
    async def _list_prompts(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """List all prompts with optional filtering."""
        category = params.get('category')
        tags = params.get('tags', [])
        agent_role = params.get('_agent_role')
        
        # Build query for prompt entities
        query = select(MemoryEntity).where(MemoryEntity.entity_type == "prompt_template")
        
        # Apply filters
        filters = []
        if category:
            filters.append(func.json_extract(MemoryEntity.entity_metadata, '$.category') == category)
        
        if filters:
            query = query.where(and_(*filters))
        
        result = await self.db.execute(query)
        prompt_entities = result.scalars().all()
        
        # Filter by tags and agent role in Python (more complex JSON filtering)
        filtered_prompts = []
        for entity in prompt_entities:
            metadata = entity.entity_metadata
            
            # Tag filtering
            if tags:
                entity_tags = metadata.get('tags', [])
                if not any(tag in entity_tags for tag in tags):
                    continue
            
            # Agent role filtering
            if agent_role and metadata.get('agent_roles'):
                if agent_role not in metadata['agent_roles']:
                    continue
            
            filtered_prompts.append({
                "prompt_id": metadata['prompt_id'],
                "name": metadata['name'],
                "category": metadata.get('category'),
                "tags": metadata.get('tags', []),
                "usage_count": metadata.get('usage_count', 0),
                "last_used": metadata.get('last_used'),
                "created_at": metadata.get('created_at')
            })
        
        # Sort by usage count (most used first)
        filtered_prompts.sort(key=lambda x: x['usage_count'], reverse=True)
        
        return {
            "success": True,
            "action": "list",
            "data": {
                "prompts": filtered_prompts,
                "total_count": len(filtered_prompts),
                "filters_applied": {
                    "category": category,
                    "tags": tags,
                    "agent_role": agent_role
                }
            },
            "message": f"Found {len(filtered_prompts)} prompts"
        }
    
    async def _search_prompts(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Search prompts by content, name, or tags."""
        search_query = params['search_query'].lower()
        include_examples = params.get('include_examples', False)
        
        # Get all prompt entities
        query = select(MemoryEntity).where(MemoryEntity.entity_type == "prompt_template")
        result = await self.db.execute(query)
        prompt_entities = result.scalars().all()
        
        # Score and filter prompts based on relevance
        scored_prompts = []
        for entity in prompt_entities:
            metadata = entity.entity_metadata
            score = self._calculate_relevance_score(
                search_query, 
                entity.content, 
                metadata['name'], 
                metadata.get('tags', [])
            )
            
            if score > 0:
                prompt_data = {
                    "prompt_id": metadata['prompt_id'],
                    "name": metadata['name'],
                    "category": metadata.get('category'),
                    "tags": metadata.get('tags', []),
                    "relevance_score": score,
                    "snippet": self._create_snippet(entity.content, search_query)
                }
                
                if include_examples:
                    prompt_data["examples"] = await self._get_prompt_examples(entity)
                
                scored_prompts.append(prompt_data)
        
        # Sort by relevance score
        scored_prompts.sort(key=lambda x: x['relevance_score'], reverse=True)
        
        return {
            "success": True,
            "action": "search",
            "data": {
                "prompts": scored_prompts[:20],  # Limit to top 20 results
                "search_query": search_query,
                "total_matches": len(scored_prompts)
            },
            "message": f"Found {len(scored_prompts)} matching prompts"
        }
    
    async def _update_prompt(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Update an existing prompt."""
        prompt_id = params['prompt_id']
        
        # Find the prompt
        prompt_entity = await self._find_prompt_by_id(prompt_id)
        if not prompt_entity:
            raise EntityNotFoundError(f"Prompt '{prompt_id}' not found")
        
        # Prepare update data
        update_data = {}
        metadata_updates = {}
        
        if 'name' in params:
            metadata_updates['name'] = params['name']
        if 'content' in params:
            update_data['content'] = params['content']
            # Validate new template
            context_req = prompt_entity.entity_metadata.get('context_requirements', {})
            self._validate_template(params['content'], context_req)
        if 'category' in params:
            metadata_updates['category'] = params['category']
        if 'tags' in params:
            metadata_updates['tags'] = params['tags']
        if 'agent_roles' in params:
            metadata_updates['agent_roles'] = params['agent_roles']
        
        # Update metadata
        if metadata_updates:
            new_metadata = prompt_entity.entity_metadata.copy()
            new_metadata.update(metadata_updates)
            new_metadata['updated_at'] = datetime.utcnow().isoformat()
            update_data['entity_metadata'] = new_metadata
        
        # Perform update
        updated_entity = await self.memory_service.update_memory_entity(prompt_entity.id, update_data)
        
        return {
            "success": True,
            "action": "update",
            "data": {
                "prompt_id": prompt_id,
                "updated_fields": list(metadata_updates.keys()) + (['content'] if 'content' in params else []),
                "updated_at": update_data.get('entity_metadata', {}).get('updated_at')
            },
            "message": "Prompt updated successfully"
        }
    
    async def _delete_prompt(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Delete a prompt from the library."""
        prompt_id = params['prompt_id']
        
        # Find the prompt
        prompt_entity = await self._find_prompt_by_id(prompt_id)
        if not prompt_entity:
            raise EntityNotFoundError(f"Prompt '{prompt_id}' not found")
        
        # Delete the entity
        await self.memory_service.delete_memory_entity(prompt_entity.id)
        
        return {
            "success": True,
            "action": "delete",
            "data": {
                "prompt_id": prompt_id,
                "deleted_at": datetime.utcnow().isoformat()
            },
            "message": "Prompt deleted successfully"
        }
    
    # Helper methods
    
    def _generate_prompt_id(self, name: str) -> str:
        """Generate a unique prompt ID from name."""
        # Convert to snake_case and add timestamp
        import time
        base = re.sub(r'[^a-zA-Z0-9\s]', '', name.lower())
        base = re.sub(r'\s+', '_', base.strip())[:30]
        timestamp = str(int(time.time()))[-6:]  # Last 6 digits
        return f"{base}_{timestamp}"
    
    def _validate_template(self, content: str, context_requirements: Dict[str, str]):
        """Validate template syntax and required variables."""
        # Find all template variables
        variables = re.findall(r'\{([^}]+)\}', content)
        
        # Check if all required variables are defined
        for var in variables:
            if var not in context_requirements:
                logger.warning(f"Template variable '{var}' not defined in context requirements")
        
        # Basic syntax validation
        try:
            # Test template rendering with dummy data
            dummy_vars = {var: f"dummy_{var}" for var in variables}
            content.format(**dummy_vars)
        except Exception as e:
            raise ValidationError(f"Invalid template syntax: {str(e)}")
    
    def _render_template(self, content: str, variables: Dict[str, Any]) -> str:
        """Render template with provided variables."""
        try:
            return content.format(**variables)
        except KeyError as e:
            raise ValidationError(f"Missing required variable: {str(e)}")
        except Exception as e:
            raise ValidationError(f"Template rendering error: {str(e)}")
    
    async def _find_prompt_by_id(self, prompt_id: str) -> Optional[MemoryEntity]:
        """Find prompt entity by ID."""
        query = select(MemoryEntity).where(
            and_(
                MemoryEntity.entity_type == "prompt_template",
                MemoryEntity.name == prompt_id
            )
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()
    
    async def _find_prompt_by_name(self, name: str) -> Optional[MemoryEntity]:
        """Find prompt entity by name."""
        query = select(MemoryEntity).where(
            and_(
                MemoryEntity.entity_type == "prompt_template",
                func.json_extract(MemoryEntity.entity_metadata, '$.name') == name
            )
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()
    
    async def _update_usage_stats(self, prompt_entity: MemoryEntity):
        """Update usage statistics for a prompt."""
        metadata = prompt_entity.entity_metadata.copy()
        metadata['usage_count'] = metadata.get('usage_count', 0) + 1
        metadata['last_used'] = datetime.utcnow().isoformat()
        
        await self.memory_service.update_memory_entity(
            prompt_entity.id, 
            {"entity_metadata": metadata}
        )
    
    def _calculate_relevance_score(self, query: str, content: str, name: str, tags: List[str]) -> float:
        """Calculate relevance score for search results."""
        score = 0.0
        query_words = query.lower().split()
        
        # Name matching (highest weight)
        name_lower = name.lower()
        for word in query_words:
            if word in name_lower:
                score += 1.0
        
        # Content matching (medium weight)
        content_lower = content.lower()
        for word in query_words:
            if word in content_lower:
                score += 0.5
        
        # Tag matching (medium weight)
        for tag in tags:
            tag_lower = tag.lower()
            for word in query_words:
                if word in tag_lower:
                    score += 0.7
        
        return round(score, 2)
    
    def _create_snippet(self, content: str, query: str, max_length: int = 150) -> str:
        """Create a snippet showing query context."""
        query_lower = query.lower()
        content_lower = content.lower()
        
        # Find the first occurrence of any query word
        best_pos = -1
        for word in query_lower.split():
            pos = content_lower.find(word)
            if pos >= 0 and (best_pos == -1 or pos < best_pos):
                best_pos = pos
        
        if best_pos >= 0:
            # Extract snippet around the match
            start = max(0, best_pos - 50)
            end = min(len(content), start + max_length)
            snippet = content[start:end]
            
            # Add ellipsis if truncated
            if start > 0:
                snippet = "..." + snippet
            if end < len(content):
                snippet = snippet + "..."
                
            return snippet
        else:
            # Return beginning of content if no match found
            return content[:max_length] + ("..." if len(content) > max_length else "")
    
    async def _get_prompt_examples(self, prompt_entity: MemoryEntity) -> List[Dict[str, Any]]:
        """Get usage examples for a prompt."""
        # This could be enhanced to track actual usage examples
        # For now, return basic template variable examples
        metadata = prompt_entity.entity_metadata
        context_req = metadata.get('context_requirements', {})
        
        if context_req:
            return [{
                "description": f"Example usage of {metadata['name']}",
                "variables": {var: f"example_{var}" for var in context_req.keys()},
                "note": "Replace example values with actual data"
            }]
        else:
            return []