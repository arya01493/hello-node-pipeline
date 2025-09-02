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
      steps { checkout scm }
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
        withCredentials([usernamePassword(credentialsId: 'dockerhub', usernameVariable: 'USR', passwordVariable: 'PWD')]) {
          sh '''
            echo "$PWD" | docker login -u "$USR" --password-stdin
            docker push $IMAGE_TAG
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
