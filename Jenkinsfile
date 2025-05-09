pipeline {
    agent any
    
    environment {
        NODE_VERSION = '18.x'
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
                        bat 'npm install'
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
                        bat 'npm run build'
                    } catch (Exception e) {
                        echo "Error building application: ${e.message}"
                        error "Build failed"
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