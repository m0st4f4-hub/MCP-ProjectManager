"""
MCP Tool Contract System for Auto-Registration and Validation.
Provides YAML-based contracts for all MCP tools.
"""

import yaml
import json
from typing import Dict, Any, List, Optional, Type
from pathlib import Path
from pydantic import BaseModel, validator
from abc import ABC, abstractmethod
import logging

logger = logging.getLogger(__name__)


class ToolParameter(BaseModel):
    """Definition of a tool parameter."""
    name: str
    type: str  # 'string', 'integer', 'boolean', 'object', 'array'
    description: str
    required: bool = True
    default: Optional[Any] = None
    enum: Optional[List[Any]] = None
    min_length: Optional[int] = None
    max_length: Optional[int] = None
    min_value: Optional[float] = None
    max_value: Optional[float] = None
    pattern: Optional[str] = None
    examples: Optional[List[Any]] = None


class ToolResponse(BaseModel):
    """Definition of a tool response."""
    type: str
    description: str
    schema: Optional[Dict[str, Any]] = None
    examples: Optional[List[Any]] = None


class ToolError(BaseModel):
    """Definition of a tool error."""
    code: str
    message: str
    description: Optional[str] = None
    recoverable: bool = False


class ToolContract(BaseModel):
    """Complete contract for an MCP tool."""
    
    # Basic information
    name: str
    display_name: str
    description: str
    version: str = "1.0.0"
    category: str
    tags: List[str] = []
    
    # Execution configuration
    timeout_seconds: int = 30
    max_retries: int = 3
    rate_limit_per_minute: int = 60
    
    # Access control
    requires_agent_role: Optional[str] = None
    allowed_agent_ids: Optional[List[str]] = None
    
    # Tool specification
    parameters: List[ToolParameter] = []
    response: ToolResponse
    errors: List[ToolError] = []
    
    # Documentation
    usage_examples: List[Dict[str, Any]] = []
    notes: Optional[str] = None
    
    # Implementation details
    implementation_class: Optional[str] = None
    dependencies: List[str] = []
    
    @validator('name')
    def name_must_be_valid(cls, v):
        if not v.replace('_', '').replace('-', '').isalnum():
            raise ValueError('Tool name must be alphanumeric with underscores or hyphens')
        return v
    
    @validator('category')
    def category_must_be_valid(cls, v):
        valid_categories = ['project', 'task', 'memory', 'file', 'agent', 'workflow', 'analysis']
        if v not in valid_categories:
            raise ValueError(f'Category must be one of: {valid_categories}')
        return v


class BaseMCPTool(ABC):
    """Base class for all MCP tools with contract enforcement."""
    
    def __init__(self, contract_path: Optional[str] = None):
        self.contract = self._load_contract(contract_path)
        self._validate_implementation()
    
    def _load_contract(self, contract_path: Optional[str] = None) -> ToolContract:
        """Load tool contract from YAML file."""
        if contract_path is None:
            # Auto-discover contract file based on class name
            class_name = self.__class__.__name__
            contract_filename = f"{class_name.lower().replace('tool', '')}.yaml"
            contract_path = Path(__file__).parent / contract_filename
        
        try:
            with open(contract_path, 'r') as f:
                contract_data = yaml.safe_load(f)
            return ToolContract(**contract_data)
        except FileNotFoundError:
            logger.warning(f"Contract file not found: {contract_path}")
            return self._create_default_contract()
        except Exception as e:
            logger.error(f"Error loading contract from {contract_path}: {e}")
            return self._create_default_contract()
    
    def _create_default_contract(self) -> ToolContract:
        """Create a default contract for tools without YAML files."""
        return ToolContract(
            name=self.__class__.__name__.lower().replace('tool', ''),
            display_name=self.__class__.__name__,
            description="Auto-generated contract",
            category="agent",
            response=ToolResponse(type="object", description="Tool response")
        )
    
    def _validate_implementation(self):
        """Validate that the implementation matches the contract."""
        # Check that required methods exist
        if not hasattr(self, 'execute'):
            raise ValueError(f"Tool {self.contract.name} must implement execute() method")
    
    def validate_parameters(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Validate input parameters against contract."""
        validated = {}
        
        # Check required parameters
        for param in self.contract.parameters:
            if param.required and param.name not in parameters:
                raise ValueError(f"Missing required parameter: {param.name}")
            
            if param.name in parameters:
                value = parameters[param.name]
                validated[param.name] = self._validate_parameter_value(param, value)
            elif param.default is not None:
                validated[param.name] = param.default
        
        # Check for unexpected parameters
        contract_param_names = {p.name for p in self.contract.parameters}
        for param_name in parameters:
            if param_name not in contract_param_names:
                logger.warning(f"Unexpected parameter {param_name} for tool {self.contract.name}")
        
        return validated
    
    def _validate_parameter_value(self, param: ToolParameter, value: Any) -> Any:
        """Validate a single parameter value."""
        # Type validation
        if param.type == 'string' and not isinstance(value, str):
            raise ValueError(f"Parameter {param.name} must be a string")
        elif param.type == 'integer' and not isinstance(value, int):
            raise ValueError(f"Parameter {param.name} must be an integer")
        elif param.type == 'boolean' and not isinstance(value, bool):
            raise ValueError(f"Parameter {param.name} must be a boolean")
        
        # String validations
        if param.type == 'string' and isinstance(value, str):
            if param.min_length and len(value) < param.min_length:
                raise ValueError(f"Parameter {param.name} must be at least {param.min_length} characters")
            if param.max_length and len(value) > param.max_length:
                raise ValueError(f"Parameter {param.name} must be at most {param.max_length} characters")
            if param.pattern:
                import re
                if not re.match(param.pattern, value):
                    raise ValueError(f"Parameter {param.name} does not match required pattern")
        
        # Numeric validations
        if param.type in ['integer', 'number'] and isinstance(value, (int, float)):
            if param.min_value and value < param.min_value:
                raise ValueError(f"Parameter {param.name} must be at least {param.min_value}")
            if param.max_value and value > param.max_value:
                raise ValueError(f"Parameter {param.name} must be at most {param.max_value}")
        
        # Enum validation
        if param.enum and value not in param.enum:
            raise ValueError(f"Parameter {param.name} must be one of: {param.enum}")
        
        return value
    
    @abstractmethod
    async def execute(self, parameters: Dict[str, Any], context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Execute the tool with validated parameters."""
        pass
    
    def get_contract_dict(self) -> Dict[str, Any]:
        """Get contract as dictionary for API exposure."""
        return self.contract.dict()
    
    def get_openapi_spec(self) -> Dict[str, Any]:
        """Generate OpenAPI specification for this tool."""
        spec = {
            "summary": self.contract.display_name,
            "description": self.contract.description,
            "parameters": [],
            "responses": {
                "200": {
                    "description": self.contract.response.description,
                    "content": {
                        "application/json": {
                            "schema": self.contract.response.schema or {"type": "object"}
                        }
                    }
                }
            }
        }
        
        # Add parameters
        for param in self.contract.parameters:
            param_spec = {
                "name": param.name,
                "description": param.description,
                "required": param.required,
                "schema": {"type": param.type}
            }
            
            if param.enum:
                param_spec["schema"]["enum"] = param.enum
            if param.default is not None:
                param_spec["schema"]["default"] = param.default
                
            spec["parameters"].append(param_spec)
        
        return spec


class ToolRegistry:
    """Registry for all MCP tools with auto-discovery."""
    
    def __init__(self):
        self.tools: Dict[str, BaseMCPTool] = {}
        self.contracts: Dict[str, ToolContract] = {}
    
    def register_tool(self, tool: BaseMCPTool):
        """Register a tool instance."""
        self.tools[tool.contract.name] = tool
        self.contracts[tool.contract.name] = tool.contract
        logger.info(f"Registered MCP tool: {tool.contract.name}")
    
    def get_tool(self, tool_name: str) -> Optional[BaseMCPTool]:
        """Get a tool by name."""
        return self.tools.get(tool_name)
    
    def get_contract(self, tool_name: str) -> Optional[ToolContract]:
        """Get a tool contract by name."""
        return self.contracts.get(tool_name)
    
    def list_tools(self) -> List[str]:
        """List all registered tool names."""
        return list(self.tools.keys())
    
    def list_tools_by_category(self, category: str) -> List[str]:
        """List tools by category."""
        return [name for name, contract in self.contracts.items() if contract.category == category]
    
    def get_all_contracts(self) -> Dict[str, Dict[str, Any]]:
        """Get all contracts as dictionaries."""
        return {name: contract.dict() for name, contract in self.contracts.items()}
    
    def auto_discover_tools(self, tools_package: str = "backend.mcp_tools"):
        """Auto-discover and register tools from a package."""
        import importlib
        import pkgutil
        
        try:
            package = importlib.import_module(tools_package)
            for _, module_name, _ in pkgutil.iter_modules(package.__path__):
                if module_name.endswith('_tools'):
                    module = importlib.import_module(f"{tools_package}.{module_name}")
                    
                    # Look for classes that inherit from BaseMCPTool
                    for attr_name in dir(module):
                        attr = getattr(module, attr_name)
                        if (isinstance(attr, type) and 
                            issubclass(attr, BaseMCPTool) and 
                            attr != BaseMCPTool):
                            try:
                                tool_instance = attr()
                                self.register_tool(tool_instance)
                            except Exception as e:
                                logger.error(f"Failed to register tool {attr_name}: {e}")
        except Exception as e:
            logger.error(f"Failed to auto-discover tools: {e}")


# Global tool registry
tool_registry = ToolRegistry()