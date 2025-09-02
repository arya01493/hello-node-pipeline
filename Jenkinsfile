pipeline {
    agent any

    environment {
        REGISTRY = 'docker.io'
        DOCKERHUB_USER = 'narasimha96'
        IMAGE = "${env.DOCKERHUB_USER}/hello-node"
        TAG = "latest"
        IMAGE_TAG = "${IMAGE}:${TAG}"
        DEFECTDOJO_URL = "http://localhost:8000"   // Change if running remotely
        DEFECTDOJO_API_KEY = credentials('defectdojo-api-key')  // Jenkins secret text
        DEFECTDOJO_ENGAGEMENT_ID = "2"   // Replace with real engagement ID
        DEFECTDOJO_USER_ID = "2"         // Replace with real user ID
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
                    docker run --rm \
                        -v /var/run/docker.sock:/var/run/docker.sock \
                        -v $PWD:/root/.cache/ \
                        aquasec/trivy image \
                        --format json \
                        --output trivy-report.json \
                        --severity HIGH,CRITICAL \
                        $IMAGE_TAG || true
                '''
                sh 'ls -lh trivy-report.json'

            }
        }

        stage('Upload to DefectDojo') {
            steps {
                sh '''
                    curl -k -X POST "$DEFECTDOJO_URL/api/v2/import-scan/" \
                        -H "Authorization: Token $DEFECTDOJO_API_KEY" \
                        -F "file=@trivy-report.json" \
                        -F "engagement=$DEFECTDOJO_ENGAGEMENT_ID" \
                        -F "scan_type=Trivy Scan" \
                        -F "auto_create_context=true" \
                        -F "active=true" \
                        -F "verified=true" \
                        -F "minimum_severity=High" \
                        -F "close_old_findings=false" \
                        -F "push_to_jira=false"
                '''
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


