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
                sh '''
                docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
                -v $WORKSPACE:/workspace \
                aquasec/trivy image --format json --output /workspace/trivy-report.json \
                --severity HIGH,CRITICAL $IMAGE_TAG || true
                '''
            }
        }

        stage('Send Trivy Report to DefectDojo') {
            steps {
                withCredentials([string(credentialsId: 'defectdojo-api', variable: 'DD_API_KEY')]) {
                    defectDojoPublisher(
                        defectDojoUrl: 'http://localhost:8000',   // update to your DefectDojo URL
                        defectDojoCredentialsId: 'defectdojo-api', // Jenkins credentials ID for API key
                        productName: 'Hello Node',                 // existing or auto-created product
                        engagementName: 'Trivy Engagement',        // existing or auto-created engagement
                        scanType: 'Trivy Scan',                    // must match DefectDojo parser name
                        artifact: 'trivy-report.json',
                        sourceCodeUrl: "${GIT_URL}",
                        branchTag: "${GIT_BRANCH}"
                    )
                }
            }
        }

        stage('Push to DockerHub') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-cred',
                                                 usernameVariable: 'DOCKER_USER',
                                                 passwordVariable: 'DOCKER_PASS')]) {
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
