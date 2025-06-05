import shutil
from start_system import SystemIntegrator


def test_setup_frontend_missing_npm(monkeypatch, capsys):
    monkeypatch.setattr(shutil, 'which', lambda cmd: None)
    integrator = SystemIntegrator()
    result = integrator.setup_frontend()
    captured = capsys.readouterr()
    assert not result
    assert "npm is not installed" in captured.out
