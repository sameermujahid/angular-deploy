# Angular Application Deployment with Jenkins and Docker

This project demonstrates the complete CI/CD pipeline for an Angular application using Jenkins and Docker.

## Prerequisites

1. Node.js (v18.x or later)
2. Angular CLI
3. Docker Desktop
4. Jenkins
5. GitHub Account
6. Docker Hub Account

## Project Setup

### 1. Create Angular Project
```bash
ng new angular-jenkins-demo
cd angular-jenkins-demo
```

### 2. Initialize Git Repository
```bash
git init
git add .
git commit -m "Initial commit"
```

### 3. Create GitHub Repository
1. Go to GitHub.com
2. Create a new repository named "angular-deploy"
3. Push your code:
```bash
git remote add origin https://github.com/YOUR_USERNAME/angular-deploy.git
git push -u origin main
```

## Docker Configuration

### 1. Create Dockerfile
Create a file named `Dockerfile` in your project root:
```dockerfile
# Stage 1: Build the Angular application
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build -- --configuration production

# Stage 2: Serve the application using Nginx
FROM nginx:alpine
# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*
# Copy static assets from builder stage
COPY --from=build /app/dist/angular-jenkins-demo/browser /usr/share/nginx/html
# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 2. Create Nginx Configuration
Create a file named `nginx.conf`:
```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Enable gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Handle Angular routing
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache";
    }

    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
        expires 1y;
        add_header Cache-Control "public, no-transform";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-XSS-Protection "1; mode=block";
    add_header X-Content-Type-Options "nosniff";
}
```

## Jenkins Configuration

### 1. Install Required Jenkins Plugins
1. Go to Jenkins Dashboard
2. Navigate to Manage Jenkins > Manage Plugins
3. Install the following plugins:
   - Git
   - Docker Pipeline
   - NodeJS Plugin

### 2. Configure Jenkins Tools
1. Go to Manage Jenkins > Global Tool Configuration
2. Configure NodeJS:
   - Name: NodeJS_18.x
   - Version: 18.x
3. Configure Git:
   - Name: Default
   - Path to Git executable: git

### 3. Create Jenkins Pipeline
Create a file named `Jenkinsfile` in your project root:
```groovy
pipeline {
    agent any
    
    environment {
        DOCKER_IMAGE = 'sameermujahid/angular-deploy'
        DOCKER_TAG = "${BUILD_NUMBER}"
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Setup Node.js') {
            steps {
                script {
                    nodejs('NodeJS_18.x') {
                        sh 'node --version'
                        sh 'npm --version'
                    }
                }
            }
        }
        
        stage('Install Dependencies') {
            steps {
                script {
                    nodejs('NodeJS_18.x') {
                        sh 'npm install'
                    }
                }
            }
        }
        
        stage('Build') {
            steps {
                script {
                    nodejs('NodeJS_18.x') {
                        sh 'npm run build'
                    }
                }
            }
        }
        
        stage('Check Docker Service') {
            steps {
                script {
                    sh 'echo Checking Docker service...'
                    sh 'docker info'
                    sh 'echo Starting Docker Desktop...'
                    sh 'start "" "C:\\Program Files\\Docker\\Docker\\Docker Desktop.exe"'
                    sh 'echo Waiting for Docker to start...'
                    sh 'ping 127.0.0.1 -n 31 >nul'
                    sh 'echo Testing Docker command...'
                    sh 'docker info'
                }
            }
        }
        
        stage('Build Docker Image') {
            steps {
                script {
                    sh 'echo Building Docker image...'
                    sh 'docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} .'
                    sh 'echo Tagging Docker image...'
                    sh 'docker tag ${DOCKER_IMAGE}:${DOCKER_TAG} ${DOCKER_IMAGE}:latest'
                }
            }
        }
        
        stage('Push to Docker Hub') {
            steps {
                withCredentials([string(credentialsId: 'docker-password', variable: 'DOCKER_PASSWORD')]) {
                    sh 'echo Logging in to Docker Hub...'
                    sh 'docker login -u sameermujahid -p ${DOCKER_PASSWORD}'
                    sh 'echo Pushing Docker image...'
                    sh 'docker push ${DOCKER_IMAGE}:${DOCKER_TAG}'
                    sh 'docker push ${DOCKER_IMAGE}:latest'
                }
            }
        }
        
        stage('Archive') {
            steps {
                archiveArtifacts artifacts: 'dist/**/*'
            }
        }
    }
    
    post {
        always {
            cleanWs()
            echo 'Pipeline succeeded!'
        }
    }
}
```

### 4. Create Jenkins Pipeline Job
1. Go to Jenkins Dashboard
2. Click "New Item"
3. Enter name: "angular-deploy"
4. Select "Pipeline"
5. Configure the pipeline:
   - Definition: Pipeline script from SCM
   - SCM: Git
   - Repository URL: https://github.com/YOUR_USERNAME/angular-deploy.git
   - Credentials: Add your GitHub credentials
   - Branch Specifier: */main
   - Script Path: Jenkinsfile

### 5. Configure Docker Hub Credentials
1. Go to Jenkins Dashboard
2. Navigate to Manage Jenkins > Credentials > System > Global credentials
3. Add new credentials:
   - Kind: Secret text
   - Secret: Your Docker Hub password
   - ID: docker-password

## Running the Application

### Local Development
```bash
ng serve
```

### Build and Run with Docker
```bash
# Build the image
docker build -t sameermujahid/angular-deploy .

# Run the container
docker run -d -p 80:80 sameermujahid/angular-deploy
```

### Access the Application
- Local development: http://localhost:4200
- Docker container: http://localhost:80

## Troubleshooting

### Common Issues

1. **Nginx Default Page Instead of Angular App**
   - Check if the build output is correctly copied in Dockerfile
   - Verify nginx.conf configuration
   - Ensure the correct path is used in the COPY command

2. **Docker Build Failures**
   - Check Docker Desktop is running
   - Verify Docker daemon is accessible
   - Check for sufficient disk space

3. **Jenkins Pipeline Failures**
   - Check Jenkins logs for specific error messages
   - Verify all required plugins are installed
   - Ensure credentials are properly configured

## Maintenance

### Updating Dependencies
```bash
npm update
git add package*.json
git commit -m "Update dependencies"
git push
```

### Rebuilding Docker Image
```bash
docker build -t sameermujahid/angular-deploy:latest .
docker push sameermujahid/angular-deploy:latest
```

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License
This project is licensed under the MIT License.
