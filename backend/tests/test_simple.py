"""Simple test to verify basic functionality"""
import pytest
from datetime import datetime, UTC


def test_basic_math():
    """Test basic math operations"""
    assert 2 + 2 == 4
    assert 10 - 5 == 5
    assert 3 * 4 == 12
    assert 20 / 4 == 5


def test_string_operations():
    """Test string operations"""
    assert "hello" + " world" == "hello world"
    assert "test".upper() == "TEST"
    assert "TEST".lower() == "test"
    assert len("hello") == 5


def test_list_operations():
    """Test list operations"""
    my_list = [1, 2, 3, 4, 5]
    assert len(my_list) == 5
    assert my_list[0] == 1
    assert my_list[-1] == 5
    assert sum(my_list) == 15


def test_datetime():
    """Test datetime operations"""
    now = datetime.now(UTC)
    assert now.year >= 2024
    assert 1 <= now.month <= 12
    assert 1 <= now.day <= 31


@pytest.mark.asyncio
async def test_async_function():
    """Test async functionality"""
    async def async_add(a, b):
        return a + b

    result = await async_add(5, 3)
    assert result == 8



class TestClassExample:
    """Test class with multiple test methods"""

    def test_addition(self):
        """Test addition in a class"""
        assert 1 + 1 == 2

    def test_subtraction(self):
        """Test subtraction in a class"""
        assert 10 - 3 == 7

    def test_multiplication(self):
        """Test multiplication in a class"""
        assert 5 * 6 == 30


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
