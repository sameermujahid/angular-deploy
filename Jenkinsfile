pipeline {
    agent any
    
    environment {
        NODE_VERSION = '18.x'
        NODE_HOME = tool 'NodeJS 18.x'
        PATH = "${env.NODE_HOME};${env.PATH}"
        DOCKER_IMAGE = 'sameermujahid/angular-deploy'
        DOCKER_TAG = "${env.BUILD_NUMBER}"
        DOCKER_PATH = 'C:\\Program Files\\Docker\\Docker\\resources\\bin'
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
                    try {
                        nodejs(nodeJSInstallationName: 'NodeJS 18.x') {
                            bat 'node --version'
                            bat 'npm --version'
                        }
                    } catch (Exception e) {
                        echo "Error setting up Node.js: ${e.message}"
                        error "Node.js setup failed"
                    }
                }
            }
        }
        
        stage('Install Dependencies') {
            steps {
                script {
                    try {
                        bat """
                            echo "Current PATH: %PATH%"
                            echo "NODE_HOME: %NODE_HOME%"
                            "%NODE_HOME%\\npm.cmd" install
                        """
                    } catch (Exception e) {
                        echo "Error installing dependencies: ${e.message}"
                        error "Dependencies installation failed"
                    }
                }
            }
        }
        
        stage('Build') {
            steps {
                script {
                    try {
                        bat """
                            "%NODE_HOME%\\npm.cmd" run build
                        """
                    } catch (Exception e) {
                        echo "Error building application: ${e.message}"
                        error "Build failed"
                    }
                }
            }
        }
        
        stage('Check Docker Service') {
            steps {
                script {
                    try {
                        powershell """
                            Write-Host 'Checking Docker service status...'
                            \$service = Get-Service -Name 'com.docker.service' -ErrorAction SilentlyContinue
                            if (\$service -and \$service.Status -ne 'Running') {
                                Write-Host 'Docker service is not running. Attempting to start...'
                                Start-Process 'C:\\Program Files\\Docker\\Docker\\Docker Desktop.exe' -Verb RunAs
                                Start-Sleep -Seconds 30
                            }
                            
                            Write-Host 'Checking Docker Desktop process...'
                            \$dockerProcess = Get-Process -Name 'Docker Desktop' -ErrorAction SilentlyContinue
                            if (-not \$dockerProcess) {
                                Write-Host 'Docker Desktop is not running. Starting it...'
                                Start-Process 'C:\\Program Files\\Docker\\Docker\\Docker Desktop.exe' -Verb RunAs
                                Start-Sleep -Seconds 30
                            }
                            
                            Write-Host 'Testing Docker command...'
                            \$maxAttempts = 3
                            \$attempt = 0
                            \$success = \$false
                            
                            while (-not \$success -and \$attempt -lt \$maxAttempts) {
                                \$attempt++
                                try {
                                    \$result = & '${DOCKER_PATH}\\docker.exe' info 2>&1
                                    if (\$LASTEXITCODE -eq 0) {
                                        \$success = \$true
                                        Write-Host "Docker is ready after \$attempt attempts"
                                    } else {
                                        Write-Host "Attempt \$attempt failed, waiting before retry..."
                                        Start-Sleep -Seconds 10
                                    }
                                } catch {
                                    Write-Host "Attempt \$attempt failed with error: \$_\"
                                    Start-Sleep -Seconds 10
                                }
                            }
                            
                            if (-not \$success) {
                                throw "Failed to verify Docker after \$maxAttempts attempts"
                            }
                        """
                    } catch (Exception e) {
                        echo "Docker service check failed: ${e.message}"
                        error "Docker service is not running properly"
                    }
                }
            }
        }
        
        stage('Build Docker Image') {
            steps {
                script {
                    try {
                        powershell """
                            Write-Host 'Building Docker image...'
                            & '${DOCKER_PATH}\\docker.exe' build -t ${DOCKER_IMAGE}:${DOCKER_TAG} .
                            Write-Host 'Tagging Docker image...'
                            & '${DOCKER_PATH}\\docker.exe' tag ${DOCKER_IMAGE}:${DOCKER_TAG} ${DOCKER_IMAGE}:latest
                        """
                    } catch (Exception e) {
                        echo "Error building Docker image: ${e.message}"
                        error "Docker build failed"
                    }
                }
            }
        }
        
        stage('Push to Docker Hub') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: 'docker-hub-credentials', passwordVariable: 'DOCKER_PASSWORD', usernameVariable: 'DOCKER_USERNAME')]) {
                        try {
                            powershell """
                                Write-Host 'Logging in to Docker Hub...'
                                & '${DOCKER_PATH}\\docker.exe' login -u ${DOCKER_USERNAME} -p ${DOCKER_PASSWORD}
                                Write-Host 'Pushing Docker image...'
                                & '${DOCKER_PATH}\\docker.exe' push ${DOCKER_IMAGE}:${DOCKER_TAG}
                                & '${DOCKER_PATH}\\docker.exe' push ${DOCKER_IMAGE}:latest
                            """
                        } catch (Exception e) {
                            echo "Error pushing to Docker Hub: ${e.message}"
                            error "Docker push failed"
                        }
                    }
                }
            }
        }
        
        stage('Archive') {
            steps {
                script {
                    try {
                        archiveArtifacts artifacts: 'dist/**/*', fingerprint: true
                    } catch (Exception e) {
                        echo "Error archiving artifacts: ${e.message}"
                        error "Archiving failed"
                    }
                }
            }
        }
    }
    
    post {
        always {
            cleanWs()
        }
        failure {
            echo 'Pipeline failed!'
        }
        success {
            echo 'Pipeline succeeded!'
        }
    }
} 