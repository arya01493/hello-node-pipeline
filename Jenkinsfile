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
                withCredentials([string(credentialsId: 'defectdojo-api', variable: 'DD_API')]) {
                    sh '''
                    curl -k -X POST "http://<defectdojo-host>:8000/api/v2/import-scan/" \
                    -H "Authorization: Token $DD_API" \
                    -F "file=@trivy-report.json" \
                    -F "engagement=2" \
                    -F "scan_type=Trivy Scan" \
                    -F "active=true" \
                    -F "verified=true" \
                    -F "minimum_severity=High" \
                    -F "close_old_findings=false"
                    '''
                }
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
