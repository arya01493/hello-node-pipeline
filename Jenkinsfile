// pipeline {
//     agent any

//     environment {
//         REGISTRY = 'docker.io'
//         DOCKERHUB_USER = 'narasimha96'
//         IMAGE = "${env.DOCKERHUB_USER}/hello-node"
//         TAG = "latest"
//         IMAGE_TAG = "${IMAGE}:${TAG}"
//     }

//     stages {
//         stage('Checkout') {
//             steps { 
//                 checkout scm 
//             }
//         }

//         stage('Build Docker Image') {
//             steps {
//                 sh 'docker build -t $IMAGE_TAG .'
//             }
//         }

//         stage('Trivy Scan (image)') {
//             steps {
//                 sh 'docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy image --severity HIGH,CRITICAL $IMAGE_TAG || true'
//             }
//         }

//         stage('Push to DockerHub') {
//             steps {
//                 withCredentials([usernamePassword(credentialsId: 'dockerhub-cred', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
//                     sh '''
//                         echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
//                         docker push $IMAGE_TAG
//                         docker logout
//                     '''
//                 }
//             }
//         }
//     }

//     post {
//         always {
//             sh 'docker logout || true'
//         }
//     }
// }



pipeline {
    agent any

    environment {
        REGISTRY = 'docker.io'
        DOCKERHUB_USER = 'narasimha96'
        IMAGE = "${env.DOCKERHUB_USER}/hello-node"
        TAG = "latest"
        IMAGE_TAG = "${IMAGE}:${TAG}"
        REPORT_DIR = "trivy-reports"
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
                sh """
                mkdir -p $REPORT_DIR
                docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \\
                    -v \$(pwd)/$REPORT_DIR:/reports \\
                    aquasec/trivy image --format json --output /reports/$IMAGE_TAG.json --severity HIGH,CRITICAL $IMAGE_TAG
                """
            }
        }

        stage('Send Report to DefectDojo') {
            steps {
                withCredentials([string(credentialsId: '60bab8b852d0c69f002151ca5ab08d88083d51b3', variable: 'DD_API_KEY')]) {
                    script {
                        def status = sh(script: """
                        curl -s -o /dev/null -w "%{http_code}" -k -X POST "http://localhost:8000/api/v2/import-scan/" \\
                          -H "Authorization: Token $DD_API_KEY" \\
                          -F "engagement=2" \\
                          -F "scan_type=Trivy Scan" \\
                          -F "file=@$REPORT_DIR/$IMAGE_TAG.json" \\
                          -F "lead=2" \\
                          -F "active=true" \\
                          -F "verified=true"
                        """, returnStdout: true).trim()

                        if (status != "201") {
                            error "DefectDojo scan import failed with status: ${status}"
                        } else {
                            echo "Report successfully uploaded to DefectDojo"
                        }
                    }
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

