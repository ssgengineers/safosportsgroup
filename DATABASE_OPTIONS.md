# Database Options Explained

## The Three Options

### Option 1: Docker PostgreSQL (✅ RECOMMENDED for Development)
**What it is**: A real PostgreSQL database running in a Docker container

**How it works**:
- Docker Compose runs PostgreSQL in a container
- Spring Boot (your Java app) connects to it
- **They are separate** - Docker = database, Spring Boot = application

**Setup**:
```bash
# Terminal 1: Start the database
cd backend
docker-compose up -d postgres

# Terminal 2: Start Spring Boot (connects to Docker PostgreSQL)
cd backend/nil-api
./mvnw spring-boot:run
```

**Pros**:
- ✅ Real PostgreSQL (same as production)
- ✅ Data persists between restarts
- ✅ Can use pgAdmin to view data
- ✅ Best for testing real database features

**Cons**:
- Requires Docker installed

---

### Option 2: H2 In-Memory Database (Already in your config)
**What it is**: A lightweight Java database that runs in memory

**How it works**:
- Built into Spring Boot
- No Docker needed
- Data is lost when app stops

**Setup**:
```bash
# Just run Spring Boot with "local" profile
cd backend/nil-api
./mvnw spring-boot:run -Dspring.profiles.active=local
```

**Pros**:
- ✅ No Docker needed
- ✅ Super fast startup
- ✅ Good for quick testing

**Cons**:
- ❌ Data disappears when app stops
- ❌ Not real PostgreSQL (different SQL syntax)
- ❌ Can't easily view data

---

### Option 3: AWS RDS PostgreSQL (Production)
**What it is**: Your production database in AWS

**Setup**:
```bash
# Set environment variables
export DB_HOST=your-rds-endpoint.rds.amazonaws.com
export DB_USERNAME=your_rds_user
export DB_PASSWORD=your_rds_password

# Run Spring Boot
./mvnw spring-boot:run
```

**Pros**:
- ✅ Production database
- ✅ Shared across team
- ✅ Persistent and backed up

**Cons**:
- ❌ Currently in private subnet (can't connect from local)
- ❌ Slower (network latency)
- ❌ Costs money

---

## My Recommendation

**For Development**: Use **Docker PostgreSQL** (Option 1)

**Why?**
1. It's a real PostgreSQL database (like production)
2. Data persists (unlike H2)
3. You can view/edit data with pgAdmin
4. No AWS connectivity issues
5. Your config already defaults to `localhost` (which Docker PostgreSQL uses)

**Visual Diagram**:
```
┌─────────────────┐         ┌──────────────────┐
│   Docker        │         │   Spring Boot    │
│   PostgreSQL    │◄────────┤   (Java App)     │
│   (Database)    │         │                  │
│   Port: 5432    │         │   Port: 8080     │
└─────────────────┘         └──────────────────┘
      ↑                              ↑
   Separate                    Separate
   Container                    Process
```

They are **two separate things** that talk to each other!

---

## Quick Start with Docker PostgreSQL

```bash
# 1. Start database container
cd backend
docker-compose up -d postgres

# 2. Verify it's running
docker ps  # Should see nil-postgres

# 3. Start Spring Boot (it connects to Docker PostgreSQL automatically)
cd nil-api
./mvnw spring-boot:run
```

That's it! Spring Boot will automatically connect to the Docker PostgreSQL because:
- Default `DB_HOST=localhost` ✅
- Docker PostgreSQL is on `localhost:5432` ✅
- Credentials match (`nil_user`/`nil_password`) ✅

---

## If You Want to Use H2 Instead

```bash
# Run with "local" profile (uses H2 in-memory)
cd backend/nil-api
./mvnw spring-boot:run -Dspring.profiles.active=local
```

But I don't recommend this because:
- Data disappears when you stop the app
- Not real PostgreSQL
- Can't easily inspect data

---

## Summary

**Use Docker PostgreSQL** - it's the best option for development because:
- ✅ Real database (like production)
- ✅ Data persists
- ✅ Easy to inspect with pgAdmin
- ✅ No AWS connectivity issues
- ✅ Already configured in your project

**Docker = Database Container**  
**Spring Boot = Your Application**  
**They connect to each other!**

