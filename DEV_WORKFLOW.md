# Development Workflow Guide

## Quick Reference

### First Time Setup
```bash
./setup-local.sh
```
- Builds Docker images (takes 2-5 minutes)
- Sets up all services and seeds data
- Only needed once or when Dockerfiles change

### Daily Development (Fast Start)
```bash
./quick-start.sh
```
- Starts services in seconds (no rebuild)
- Hot reload enabled for both frontend and backend
- Use this for regular development

### Force Rebuild
```bash
./setup-local.sh --build
```
- Rebuilds all Docker images
- Use when Dockerfiles or dependencies change

## Hot Reload

### How It Works

**Backend (FastAPI):**
- Changes in `./backend/app/` automatically reload
- Uses `uvicorn --reload` flag
- No container restart needed

**Frontend (Next.js):**
- Changes in `./frontend/` automatically reload
- Uses Next.js dev mode (`npm run dev`)
- Browser auto-refreshes on file changes

### What Gets Hot Reloaded

✅ **Hot Reload Works For:**
- Python code changes (`./backend/app/`)
- React components (`./frontend/app/`, `./frontend/src/`)
- TypeScript/JavaScript files
- CSS/styling changes
- Configuration files (if not cached)

❌ **Requires Rebuild:**
- Changes to `Dockerfile.*` files
- Changes to `package.json` or `pyproject.toml` (dependencies)
- System-level dependencies
- Changes to `docker-compose.local.yml` structure

## Development Tips

### 1. Fast Iteration
- Use `./quick-start.sh` for daily development
- Make code changes → see results instantly
- No need to stop/start containers

### 2. Viewing Logs
```bash
# All services
docker compose -f docker-compose.local.yml logs -f

# Specific service
docker compose -f docker-compose.local.yml logs -f api
docker compose -f docker-compose.local.yml logs -f frontend
```

### 3. Stopping Services
```bash
docker compose -f docker-compose.local.yml down
```

### 4. Restarting a Single Service
```bash
docker compose -f docker-compose.local.yml restart api
docker compose -f docker-compose.local.yml restart frontend
```

### 5. Rebuilding a Single Service
```bash
docker compose -f docker-compose.local.yml build api
docker compose -f docker-compose.local.yml up -d api
```

## File Structure for Hot Reload

```
smart-home/
├── backend/
│   ├── app/              ← Changes here auto-reload
│   ├── scripts/          ← Changes here auto-reload
│   └── Dockerfile.api     ← Changes require rebuild
├── frontend/
│   ├── app/              ← Changes here auto-reload
│   ├── src/              ← Changes here auto-reload
│   └── Dockerfile.dev    ← Changes require rebuild
└── docker-compose.local.yml
```

## Troubleshooting

### Hot Reload Not Working?

1. **Check volumes are mounted:**
   ```bash
   docker compose -f docker-compose.local.yml ps
   ```

2. **Restart the service:**
   ```bash
   docker compose -f docker-compose.local.yml restart api
   docker compose -f docker-compose.local.yml restart frontend
   ```

3. **Check logs for errors:**
   ```bash
   docker compose -f docker-compose.local.yml logs api
   docker compose -f docker-compose.local.yml logs frontend
   ```

### Changes Not Reflecting?

- **Backend:** Wait 1-2 seconds for uvicorn to detect changes
- **Frontend:** Check browser console for errors
- **Both:** Try hard refresh (Cmd+Shift+R / Ctrl+Shift+R)

### Need to Reinstall Dependencies?

```bash
# Backend
docker compose -f docker-compose.local.yml exec api uv sync

# Frontend
docker compose -f docker-compose.local.yml exec frontend npm install
```

## Performance Comparison

| Method | Startup Time | Hot Reload | Use Case |
|--------|-------------|------------|----------|
| `./quick-start.sh` | ~5 seconds | ✅ Yes | Daily development |
| `./setup-local.sh` | ~30 seconds | ✅ Yes | First time or after Dockerfile changes |
| `./setup-local.sh --build` | ~2-5 minutes | ✅ Yes | Rebuild images |

## Best Practices

1. **Start your day:** `./quick-start.sh`
2. **Make changes:** Edit code in your IDE
3. **See results:** Browser/API auto-updates
4. **End your day:** `docker compose -f docker-compose.local.yml down`

No need to rebuild unless Dockerfiles change! 🚀

