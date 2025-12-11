# CI/CD Pipeline Documentation

## Overview
This project includes comprehensive CI/CD pipelines using GitHub Actions for automated testing, security scanning, and deployment.

## Pipelines

### 1. Main CI/CD Pipeline (`ci-cd.yml`)
Runs on push to `main` and `develop` branches, and on pull requests.

**Jobs:**
- **test**: Tests the application across multiple Node.js versions (16.x, 18.x, 20.x)
  - Installs dependencies
  - Runs linter
  - Builds the project
  - Runs tests

- **security**: Performs security audits
  - Runs `npm audit` to check for vulnerabilities
  - Requires: test job to pass

- **code-quality**: Checks code quality
  - Runs Prettier for code formatting
  - Validates TypeScript types
  - Requires: test job to pass

- **deploy-staging**: Deploys to staging on develop branch
  - Requires: test, security, and code-quality jobs to pass
  - Only runs on `develop` branch with push events

- **deploy-production**: Deploys to production on main branch
  - Creates GitHub releases
  - Requires: test, security, and code-quality jobs to pass
  - Only runs on `main` branch with push events

### 2. Docker CI/CD Pipeline (`docker-ci-cd.yml`)
Builds and pushes Docker images to Docker Hub.

**Jobs:**
- **build**: Builds and pushes Docker images
  - Tags images with `develop` or `latest` based on branch
  - Uses Docker layer caching for faster builds

- **security-scan**: Scans Docker images and filesystem
  - Uses Trivy vulnerability scanner
  - Uploads results to GitHub Security tab

## Setup Instructions

### Prerequisites
1. GitHub repository
2. Docker Hub account (for Docker pipeline)
3. Staging and production deployment environments

### GitHub Actions Secrets
Add the following secrets to your GitHub repository (Settings > Secrets and Variables > Actions):

```
DOCKER_USERNAME     # Your Docker Hub username
DOCKER_PASSWORD     # Your Docker Hub personal access token
```

### Environment Variables
Create a `.env` file based on `.env.example`:

```bash
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=typescriptnode
DB_USER=postgres
DB_PASSWORD=your_password
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5000
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
```

## Docker Setup

### Build Docker Image
```bash
docker build -t typescriptnode:latest .
```

### Run with Docker Compose
```bash
docker-compose up -d
```

This will start:
- Node.js application on port 5000
- PostgreSQL database
- Both services are connected via network

### Stop Services
```bash
docker-compose down
```

### View Logs
```bash
docker-compose logs -f app
docker-compose logs -f postgres
```

## Deployment Workflows

### Development Flow (develop branch)
1. Push code to `develop` branch
2. GitHub Actions runs tests and security checks
3. On success, automatically deploys to staging
4. Builds and pushes Docker image tagged as `develop`

### Production Flow (main branch)
1. Create pull request to `main` branch
2. GitHub Actions runs all checks
3. After merge to `main`, automatic deployment to production
4. Creates GitHub release
5. Builds and pushes Docker image tagged as `latest` and with version number

## Local Testing

### Run Tests
```bash
npm test
```

### Run Linter
```bash
npm run lint
```

### Build Project
```bash
npm run build
```

### Start Application
```bash
npm start
```

## Monitoring and Health Checks

The Docker container includes health checks that verify the application is running:

```yaml
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3
```

View health status:
```bash
docker ps  # Check STATUS column
docker inspect <container_id>  # Detailed health info
```

## Troubleshooting

### Pipeline Failures
1. Check GitHub Actions logs: Go to Actions tab in your repository
2. Review error messages for specific job failures
3. Common issues:
   - Missing environment variables
   - Dependency installation failures
   - TypeScript compilation errors

### Docker Issues
1. Clear cache: `docker system prune -a`
2. Rebuild image: `docker build --no-cache -t typescriptnode:latest .`
3. Check logs: `docker logs <container_id>`

### Database Connection Issues
- Ensure PostgreSQL container is running: `docker-compose ps`
- Check database credentials in `.env` file
- Verify network connectivity: `docker network ls`

## Best Practices

1. **Branching Strategy**
   - Use `develop` for development
   - Use `main` for production releases
   - Use feature branches for new features

2. **Commit Messages**
   - Use conventional commits format
   - Example: `feat: add user authentication`

3. **Security**
   - Never commit `.env` files
   - Always use environment variables for secrets
   - Review GitHub Security alerts regularly

4. **Testing**
   - Write tests for new features
   - Maintain test coverage above 80%
   - Run tests locally before pushing

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Documentation](https://docs.docker.com/)
- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
