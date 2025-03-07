pipeline {
  agent {
    docker {
      image 'node:16-alpine' // Use Node.js image for the pipeline
      args '-u root' // Run as root to avoid permission issues
    }
  }

  environment {
    // Docker Hub Credentials (stored in Jenkins credentials)
    DOCKER_HUB_CREDENTIALS = credentials('docker-hub-credentials')
  }

  stages {
    stage('Checkout') {
      steps {
         git branch: 'main', url: 'https://github.com/Saisankar99-dev/nodepipeline2'
      }
    }

    stage('Load Environment Variables') {
      steps {
        script {
          // Load environment variables from .env file
          env.DOCKER_HUB_REPO = sh(script: 'cat .env | grep DOCKER_HUB_REPO | cut -d "=" -f2', returnStdout: true).trim()
          env.NGINX_HTML_DIR = sh(script: 'cat .env | grep NGINX_HTML_DIR | cut -d "=" -f2', returnStdout: true).trim()
          env.NGINX_CONF_DIR = sh(script: 'cat .env | grep NGINX_CONF_DIR | cut -d "=" -f2', returnStdout: true).trim()
        }
      }
    }

    stage('Build Backend') {
      steps {
        script {
          // Build the Docker image
          docker.build("${DOCKER_HUB_REPO}:latest", "./backend")
        }
      }
    }

    stage('Push Backend Image') {
      steps {
        script {
          // Push the Docker image to Docker Hub
          docker.withRegistry('https://registry.hub.docker.com', DOCKER_HUB_CREDENTIALS) {
            docker.image("${DOCKER_HUB_REPO}:latest").push()
          }
        }
      }
    }

    stage('Deploy Backend') {
      steps {
        script {
          // Stop and remove the old container (if it exists)
          sh 'docker stop backend-container || true'
          sh 'docker rm backend-container || true'

          // Start a new container with the PORT from .env
          sh "docker run -d --name backend-container -p ${PORT}:${PORT} ${DOCKER_HUB_REPO}:latest"
        }
      }
    }

    stage('Update Frontend') {
      steps {
        script {
          // Copy frontend files to Nginx HTML directory
          sh "cp -r frontend/public/* ${NGINX_HTML_DIR}/"

          // Copy Nginx configuration
          sh "cp nginx.conf ${NGINX_CONF_DIR}/nginx.conf"

          // Restart Nginx
          sh "nginx -s reload"
        }
      }
    }
  }

  post {
    always {
      // List all Docker containers (for debugging)
      sh 'docker ps -a'
    }
  }
}
