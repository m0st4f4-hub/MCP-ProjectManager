import pytest_asyncio
from fastapi import Depends
from backend.auth import get_current_active_user
from backend.models.user import User

@pytest_asyncio.fixture(scope="function")


async def test_client_with_db(test_db):
    """Create an asynchronous test client with a test database for integration tests."""  # Create a mock active admin user for testing protected endpoints
    mock_admin_user_id = str(uuid.uuid4())
    mock_admin_user = User(
    id=mock_admin_user_id,  # Ensure unique ID
    username="testadmin",
    hashed_password="mockhashedpassword",
    email="testadmin@example.com",
    full_name="Test Admin",
    disabled=False,  # Use SQLAlchemy model for UserRole, not Pydantic schema
    user_roles=[UserRoleModel(role_name=UserRoleEnum.ADMIN, user_id=mock_admin_user_id)]  # Assign ADMIN role and user_id - Corrected
    )  # Override get_current_active_user dependency to return the mock admin user
async def override_get_current_active_user():
    yield mock_admin_user  # Use yield instead of return for async generator
class MockRoleChecker:
    def __init__(self, allowed_roles):  # Keep the constructor signature  # The __init__ method still receives the arguments passed in Depends(RoleChecker(...))
        self.allowed_roles = allowed_roles

    async def __call__(self, current_user: User = Depends(get_current_active_user)):
        # This method is called when the dependency is resolved during a request.
        # Since get_current_active_user is already overridden to return the mock admin,
        # we can simply yield the user, effectively passing the role check.
        print(f"[AUTH DEBUG] MockRoleChecker __call__ for user: {current_user.username}. Allowing access.")
        yield current_user  # Yield the user to satisfy the dependency

        app.dependency_overrides[get_current_active_user] = override_get_current_active_user  # Override the RoleChecker class itself, not an instance
        app.dependency_overrides[RoleChecker] = MockRoleChecker  # Include routers before creating the AsyncClient
        from backend.main import include_app_routers
        include_app_routers(app)

        async with AsyncClient(app=app, base_url="http://testserver") as client:
            yield client  # Clean up dependency overrides after the test
            app.dependency_overrides.pop(get_current_active_user, None)
            app.dependency_overrides.pop(RoleChecker, None)
