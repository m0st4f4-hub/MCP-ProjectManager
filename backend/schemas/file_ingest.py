from pydantic import BaseModel, Field


class FileIngestInput(BaseModel):
    """Input schema for file ingestion."""
    file_path: str = Field(..., description="Absolute path to the file to ingest.")

