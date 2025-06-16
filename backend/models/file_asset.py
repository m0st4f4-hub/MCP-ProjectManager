"""
File Asset Management Models for MCP-based project manager.
Handles physical file storage, metadata, and version tracking.
"""

from sqlalchemy import Column, String, Integer, DateTime, Boolean, Text, Index
from sqlalchemy.orm import relationship
from datetime import datetime

from .base import Base, BaseModel, JSONText


class FileAsset(Base, BaseModel):
    """
    Physical file asset with SHA-256 content verification.
    Separate from MemoryEntity to handle actual file storage.
    """
    __tablename__ = "file_assets"
    __table_args__ = (
        Index('idx_file_assets_sha256', 'sha256_hash'),
        Index('idx_file_assets_filename', 'filename'),
        Index('idx_file_assets_mime_type', 'mime_type'),
        Index('idx_file_assets_storage_path', 'storage_path'),
    )

    # File identification
    filename = Column(String(500), nullable=False)
    original_filename = Column(String(500), nullable=True)
    file_extension = Column(String(50), nullable=True, index=True)
    
    # Content verification
    sha256_hash = Column(String(64), nullable=False, unique=True, index=True)
    file_size_bytes = Column(Integer, nullable=False)
    
    # MIME type and metadata
    mime_type = Column(String(200), nullable=False, index=True)
    encoding = Column(String(50), nullable=True)
    
    # Storage information
    storage_path = Column(String(1000), nullable=False)
    storage_bucket = Column(String(255), nullable=True)  # For future cloud storage
    is_public = Column(Boolean, default=False, nullable=False)
    
    # File status
    is_available = Column(Boolean, default=True, nullable=False)
    is_temp = Column(Boolean, default=False, nullable=False)
    expires_at = Column(DateTime, nullable=True)
    
    # Content analysis
    content_preview = Column(Text, nullable=True)  # First 1000 chars for text files
    file_metadata = Column(JSONText, nullable=True)  # File-specific metadata
    extraction_metadata = Column(JSONText, nullable=True)  # OCR, image analysis, etc.
    
    # Versioning
    version = Column(Integer, default=1, nullable=False)
    parent_file_id = Column(String(32), nullable=True)  # For file versions
    
    # Access tracking
    access_count = Column(Integer, default=0, nullable=False)
    last_accessed_at = Column(DateTime, nullable=True)
    
    # Relationships
    memory_entities = relationship(
        "MemoryEntity", 
        primaryjoin="FileAsset.id == foreign(MemoryEntity.source)",
        uselist=True,
        viewonly=True
    )
    
    def __repr__(self):
        return f"<FileAsset(id={self.id}, filename='{self.filename}', size={self.file_size_bytes})>"


class FileAssetTag(Base, BaseModel):
    """Tags for categorizing and organizing file assets."""
    __tablename__ = "file_asset_tags"
    __table_args__ = (
        Index('idx_file_asset_tags_name', 'tag_name'),
        Index('idx_file_asset_tags_category', 'tag_category'),
    )
    
    tag_name = Column(String(100), nullable=False, index=True)
    tag_category = Column(String(50), nullable=True)  # e.g., 'document_type', 'project_phase'
    description = Column(Text, nullable=True)
    color = Column(String(7), nullable=True)  # Hex color for UI
    
    def __repr__(self):
        return f"<FileAssetTag(id={self.id}, name='{self.tag_name}')>"


class FileAssetTagAssociation(Base):
    """Many-to-many association between file assets and tags."""
    __tablename__ = "file_asset_tag_associations"
    __table_args__ = (
        Index('idx_file_tag_associations_file', 'file_asset_id'),
        Index('idx_file_tag_associations_tag', 'tag_id'),
    )
    
    file_asset_id = Column(String(32), nullable=False, primary_key=True)
    tag_id = Column(String(32), nullable=False, primary_key=True)
    
    # Additional association metadata
    confidence_score = Column(Integer, default=100, nullable=False)  # 0-100
    auto_tagged = Column(Boolean, default=False, nullable=False)
    tagged_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class FileProcessingJob(Base, BaseModel):
    """Background jobs for file processing (OCR, analysis, etc.)."""
    __tablename__ = "file_processing_jobs"
    __table_args__ = (
        Index('idx_file_processing_status', 'status'),
        Index('idx_file_processing_file', 'file_asset_id'),
        Index('idx_file_processing_type', 'job_type'),
    )
    
    file_asset_id = Column(String(32), nullable=False, index=True)
    job_type = Column(String(50), nullable=False)  # 'ocr', 'thumbnail', 'metadata_extract'
    status = Column(String(20), default='pending', nullable=False)  # pending, running, completed, failed
    
    # Job parameters and results
    job_parameters = Column(JSONText, nullable=True)
    job_result = Column(JSONText, nullable=True)
    error_message = Column(Text, nullable=True)
    
    # Timing
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    processing_time_ms = Column(Integer, nullable=True)
    
    # Priority and retry
    priority = Column(Integer, default=5, nullable=False)  # 1-10, higher is more urgent
    retry_count = Column(Integer, default=0, nullable=False)
    max_retries = Column(Integer, default=3, nullable=False)
    
    def __repr__(self):
        return f"<FileProcessingJob(id={self.id}, type='{self.job_type}', status='{self.status}')>"