pipeline {
    agent any
 
    environment {
        REGISTRY = 'docker.io'
        DOCKERHUB_USER = 'narasimha96'
        IMAGE = "${env.DOCKERHUB_USER}/hello-node"
        TAG = "latest"
        IMAGE_TAG = "${IMAGE}:${TAG}"
    }
 
    stages {
        stage('Checkout') {
            steps { 
                checkout scm 
            }
        }
 
        stage('Build Docker Image') {
            steps {
                sh 'docker build -t $IMAGE_TAG .'
            }
        }
 
        stage('Trivy Scan (image)') {
            steps {
                sh 'docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy image --severity HIGH,CRITICAL $IMAGE_TAG || true'
            }
        }
 
        stage('Push to DockerHub') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-cred', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh '''
                        echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                        docker push $IMAGE_TAG
                        docker logout
                    '''
                }
            }
        }
    }
 
    post {
        always {
            sh 'docker logout || true'
        }
    }
}
