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
                        bat """
                            echo Checking Docker service status...
                            sc query com.docker.service
                            
                            echo Starting Docker Desktop...
                            start "" "C:\\Program Files\\Docker\\Docker\\Docker Desktop.exe"
                            
                            echo Waiting for Docker to start...
                            timeout /t 30 /nobreak
                            
                            echo Testing Docker command...
                            "%DOCKER_PATH%\\docker.exe" info
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
                        bat """
                            echo Building Docker image...
                            "%DOCKER_PATH%\\docker.exe" build -t %DOCKER_IMAGE%:%DOCKER_TAG% .
                            echo Tagging Docker image...
                            "%DOCKER_PATH%\\docker.exe" tag %DOCKER_IMAGE%:%DOCKER_TAG% %DOCKER_IMAGE%:latest
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
                            bat """
                                echo Logging in to Docker Hub...
                                "%DOCKER_PATH%\\docker.exe" login -u %DOCKER_USERNAME% -p %DOCKER_PASSWORD%
                                echo Pushing Docker image...
                                "%DOCKER_PATH%\\docker.exe" push %DOCKER_IMAGE%:%DOCKER_TAG%
                                "%DOCKER_PATH%\\docker.exe" push %DOCKER_IMAGE%:latest
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
