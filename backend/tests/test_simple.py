"""Simple test suite verifying basic functionality."""

import pytest
from datetime import datetime, UTC


def test_addition():
    """Verify basic addition."""
    assert 2 + 2 == 4


def test_subtraction():
    """Verify basic subtraction."""
    assert 10 - 5 == 5


def test_multiplication():
    """Verify basic multiplication."""
    assert 3 * 4 == 12


def test_division():
    """Verify basic division."""
    assert 20 / 4 == 5


def test_string_concatenation():
    """Verify string concatenation."""
    assert "hello" + " world" == "hello world"


def test_string_case_conversion():
    """Verify string case conversions."""
    assert "test".upper() == "TEST"
    assert "TEST".lower() == "test"


def test_string_length():
    """Verify string length calculation."""
    assert len("hello") == 5


def test_list_length_and_sum():
    """Verify list length and sum."""
    my_list = [1, 2, 3, 4, 5]
    assert len(my_list) == 5
    assert sum(my_list) == 15


def test_list_first_and_last():
    """Verify first and last list elements."""
    my_list = [1, 2, 3, 4, 5]
    assert my_list[0] == 1
    assert my_list[-1] == 5


def test_datetime_values():
    """Verify datetime attributes and timezone."""
    now = datetime.now(UTC)
    assert now.year >= 2024
    assert 1 <= now.month <= 12
    assert 1 <= now.day <= 31
    assert now.tzinfo is UTC


@pytest.mark.asyncio
async def test_async_function():
    """Verify async functionality."""
    async def async_add(a, b):
        return a + b

    result = await async_add(5, 3)
    assert result == 8


class TestClassExample:
    """Test class with multiple test methods."""

    def test_addition(self):
        """Test addition in a class."""
        assert 1 + 1 == 2

    def test_subtraction(self):
        """Test subtraction in a class."""
        assert 10 - 3 == 7

    def test_multiplication(self):
        """Test multiplication in a class."""
        assert 5 * 6 == 30
