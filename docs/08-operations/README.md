# Operations Guide

This guide covers system operations, maintenance, troubleshooting, and monitoring for the MCP Project Manager.

## 🔧 System Maintenance

### Regular Maintenance Tasks

#### Daily Tasks
- Monitor system health endpoints
- Check error logs for anomalies
- Verify backup completion
- Monitor disk space usage

#### Weekly Tasks
- Review performance metrics
- Update dependencies (security patches)
- Clean up old log files
- Verify database integrity

#### Monthly Tasks
- Full system backup verification
- Security audit review
- Performance optimization review
- Documentation updates

### Database Maintenance

#### Backup Procedures
```bash
# SQLite backup
cp sql_app.db sql_app_backup_$(date +%Y%m%d).db

# PostgreSQL backup
pg_dump -h localhost -U username dbname > backup_$(date +%Y%m%d).sql
```

#### Migration Management
```bash
# Check current migration status
cd backend
python -m alembic current

# Apply pending migrations
python -m alembic upgrade head

# Create new migration
alembic revision --autogenerate -m "description"
```

## 🔍 Monitoring and Logging

### Health Check Endpoints

#### System Health
```bash
# Check overall system health
curl http://localhost:8000/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00Z",
  "version": "1.0.0",
  "database": "connected"
}
```

### Log Management

#### Log Locations
```
backend/logs/
├── app.log          # Application logs
├── error.log        # Error logs
├── access.log       # API access logs
└── audit.log        # Audit trail logs
```

## 🚨 Troubleshooting

### Common Issues and Solutions

#### Backend Issues

**Issue: Backend won't start**
```bash
# Check Python virtual environment
cd backend
source .venv/bin/activate  # Linux/macOS
# or
.venv\Scripts\activate     # Windows

# Verify dependencies
pip install -r requirements.txt

# Check port availability
netstat -ano | findstr :8000  # Windows
lsof -i :8000                 # Linux/macOS
```

**Issue: Database connection errors**
```bash
# Check database file permissions (SQLite)
ls -la sql_app.db

# Verify database URL in .env
cat backend/.env | grep DATABASE_URL
```

#### Frontend Issues

**Issue: Frontend build failures**
```bash
# Clear node modules and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install

# Check Node.js version
node --version  # Should be 18+

# Run type checking
npm run type-check
```

**Issue: API connection errors**
```bash
# Check frontend environment configuration
cat frontend/.env.local

# Verify backend is running
curl http://localhost:8000/health
```

### Error Code Reference

| Error Code | Description | Solution |
|------------|-------------|----------|
| `AUTH_001` | Invalid credentials | Check username/password |
| `AUTH_002` | Token expired | Refresh authentication token |
| `AUTH_003` | Insufficient permissions | Check user role and permissions |
| `VAL_001` | Validation error | Check request data format |
| `DB_001` | Database connection error | Check database configuration |
| `API_001` | Rate limit exceeded | Reduce request frequency |

### Emergency Procedures

#### System Recovery
```bash
# Emergency system restart
sudo systemctl restart mcp-project-manager

# Restore from backup
cp sql_app_backup_YYYYMMDD.db sql_app.db
sudo systemctl restart mcp-project-manager
```

## 🔐 Security Operations

### Security Monitoring

#### Log Analysis
```bash
# Monitor failed login attempts
grep "AUTH_001" backend/logs/app.log | tail -20

# Check for suspicious API activity
grep "429\|403\|401" backend/logs/access.log | tail -50
```

#### Security Hardening
```bash
# Update dependencies
cd backend && pip install --upgrade -r requirements.txt
cd frontend && npm audit fix

# Check for security vulnerabilities
npm audit
```

### Backup and Recovery

#### Automated Backup Script
```bash
#!/bin/bash
# backup.sh - Automated backup script

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/mcp-project-manager"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Backup database
cp sql_app.db "$BACKUP_DIR/sql_app_$DATE.db"

# Backup configuration files
tar -czf "$BACKUP_DIR/config_$DATE.tar.gz" \
    backend/.env \
    frontend/.env.local

echo "Backup completed: $DATE"
```

## 📊 Performance Optimization

### Database Optimization

#### Index Management
```sql
-- Add indexes for frequently queried columns
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
```

### Application Optimization

#### Caching Strategy
```python
# Redis caching for frequently accessed data
import redis
from functools import wraps

redis_client = redis.Redis(host='localhost', port=6379, db=0)

def cache_result(expiration=300):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            cache_key = f"{func.__name__}:{hash(str(args) + str(kwargs))}"
            
            # Try to get from cache
            cached_result = redis_client.get(cache_key)
            if cached_result:
                return json.loads(cached_result)
            
            # Execute function and cache result
            result = await func(*args, **kwargs)
            redis_client.setex(cache_key, expiration, json.dumps(result, default=str))
            
            return result
        return wrapper
    return decorator
```

## 🎯 Operational Best Practices

### Deployment Checklist
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificates installed
- [ ] Monitoring configured
- [ ] Backup procedures tested
- [ ] Security hardening applied
- [ ] Performance testing completed
- [ ] Documentation updated

### Maintenance Schedule
- **Daily**: Health checks, log review
- **Weekly**: Security updates, performance review
- **Monthly**: Full backup verification, security audit
- **Quarterly**: Disaster recovery testing, capacity planning

### Incident Response
1. **Detection**: Monitor alerts and health checks
2. **Assessment**: Determine severity and impact
3. **Response**: Implement immediate fixes
4. **Communication**: Notify stakeholders
5. **Resolution**: Apply permanent fixes
6. **Post-mortem**: Document lessons learned

## 📞 Support and Escalation

### Escalation Matrix
- **Level 1**: Application errors, minor performance issues
- **Level 2**: Service outages, security incidents
- **Level 3**: Data loss, major security breaches
- **Level 4**: Complete system failure, critical security incidents
