pipeline {
    agent any

    environment {
        DOCKER_HUB_USER = 'sofianecharrada'
        IMAGE_NAME      = 'tasklist-backend'
        IMAGE_TAG       = "latest"
        
        DOCKER_CREDS_ID = 'sam-dockerhub-password'
        SONAR_CREDS_ID  = 'sonar-token'
    }

    stages {
        stage('1 & 2. Installation, Prisma & Tests') {
            steps {
                echo 'Exécution de l\'installation, génération Prisma et tests dans un conteneur Node (Root)...'
                bat """
                docker run --rm ^
                  --user root ^
                  -v "%WORKSPACE%:/app" ^
                  -w /app ^
                  node:22-slim ^
                  sh -c "npm install && npm run prisma:generate && npm run test:coverage"
                """
            }
            post {
                always {
                    junit allowEmptyResults: true, testResults: 'reports/junit.xml'
                }
            }
        }

        stage('3. Analyse Qualité Code (SonarQube)') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    withCredentials([string(credentialsId: env.SONAR_CREDS_ID, variable: 'SONAR_TOKEN')]) {
                        echo 'Lancement de l\'analyse via le conteneur officiel Sonar-Scanner...'
                        bat """
                        docker run --rm ^
                          -v "%WORKSPACE%:/usr/src" ^
                          sonarsource/sonar-scanner-cli ^
                          -Dsonar.token=%SONAR_TOKEN%
                        """
                    }
                }
            }
        }

        stage('4. Génération du SBOM') {
            steps {
                echo 'Génération du SBOM via un conteneur Syft...'
                bat """
                docker run --rm ^
                  -v "%WORKSPACE%:/project" ^
                  anchore/syft:latest dir:/project -o spdx-json=/project/sbom-spdx.json
                """
            }
        }

        stage('5. Construction de l\'image Docker') {
            steps {
                echo 'Construction de l\'image Docker finale...'
                bat "docker build -t ${env.DOCKER_HUB_USER}/${env.IMAGE_NAME}:${env.IMAGE_TAG} ."
            }
        }

        stage('6. Scan de Vulnérabilités (Trivy)') {
            steps {
                echo 'Analyse de l\'image avec un conteneur Trivy...'
                bat """
                docker run --rm ^
                  -v /var/run/docker.sock:/var/run/docker.sock ^
                  aquasec/trivy:latest image --severity HIGH,CRITICAL ${env.DOCKER_HUB_USER}/${env.IMAGE_NAME}:${env.IMAGE_TAG} ^
                  || echo "Scan Trivy complété"
                """
            }
        }

        stage('7. Publication sur Docker Hub') {
            steps {
                echo 'Push de l\'image sur Docker Hub...'
                withCredentials([usernamePassword(credentialsId: env.DOCKER_CREDS_ID, passwordVariable: 'DOCKER_PASSWORD', usernameVariable: 'DOCKER_USERNAME')]) {
                    bat "echo %DOCKER_PASSWORD% | docker login -u %DOCKER_USERNAME% --password-stdin"
                    bat "docker push ${env.DOCKER_HUB_USER}/${env.IMAGE_NAME}:${env.IMAGE_TAG}"
                }
            }
        }
    }
}