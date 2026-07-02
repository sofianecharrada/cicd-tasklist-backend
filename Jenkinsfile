pipeline {
    agent any

    environment {
        // Variables d'identification Docker Hub
        DOCKER_HUB_USER = 'sofianecharrada'
        IMAGE_NAME      = 'tasklist-backend'
        IMAGE_TAG       = "latest"
        
        // Identifiants Jenkins Credentials ID
        DOCKER_CREDS_ID = 'c71ca4ae-d32c-4e85-8e57-fecbdcbc8644'
        SONAR_CREDS_ID  = 'sam-sonar-token'
    }

    stages {
        stage('1. Installation & Initialisation') {
            steps {
                echo 'Installation des dépendances npm...'
                bat 'npm install'
                
                echo 'Génération des types client Prisma...'
                bat 'npm run prisma:generate'
            }
        }

        stage('2. Exécution des Tests Unitaires') {
            steps {
                echo 'Exécution des tests avec Vitest et génération des rapports...'
                bat 'npm run test:coverage'
            }
            post {
                always {
                    junit allowEmptyResults: true, testResults: 'reports/junit.xml'
                }
            }
        }

        stage('3. Analyse Qualité Code (SonarQube)') {
            steps {
                withSonarQubeEnv('Sonarqube') {
                    withCredentials([string(credentialsId: env.SONAR_CREDS_ID, variable: 'SONAR_TOKEN')]) {
                        echo 'Lancement de l\'analyse via le conteneur officiel Sonar-Scanner...'
                        bat """
                        docker run --rm ^
                          -v "%WORKSPACE%:/usr/src" ^
                          sonarsource/sonar-scanner-cli ^
                          -Dsonar.token=%SONAR_TOKEN% ^
                          -Dsonar.host.url=%SONAR_HOST_URL%
                        """
                    }
                }
            }
        }

        stage('4. Génération du SBOM (Sécurité)') {
            steps {
                echo 'Génération du Software Bill of Materials (SBOM) au format SPDX via Docker...'
                // On utilise le conteneur officiel Syft pour analyser le dossier sans dépendre de Windows
                bat """
                docker run --rm ^
                  -v "%WORKSPACE%:/project" ^
                  anchore/syft:latest dir:/project -o spdx-json=/project/sbom-spdx.json
                """
            }
        }

        stage('5. Construction de l\'image Docker') {
            steps {
                echo 'Construction de l\'image Docker Backend...'
                bat "docker build -t ${env.DOCKER_HUB_USER}/${env.IMAGE_NAME}:${env.IMAGE_TAG} ."
            }
        }

        stage('6. Scan de Vulnérabilités (Trivy)') {
            steps {
                echo 'Analyse de l\'image Docker finale avec un conteneur Trivy...'
                bat """
                docker run --rm ^
                  -v //./pipe/docker_engine://./pipe/docker_engine ^
                  aquasec/trivy:latest image --severity HIGH,CRITICAL ${env.DOCKER_HUB_USER}/${env.IMAGE_NAME}:${env.IMAGE_TAG}
                """
            }
        }

        stage('7. Publication sur Docker Hub') {
            steps {
                echo 'Connexion sécurisée et Push de l\'image sur Docker Hub...'
                withCredentials([usernamePassword(credentialsId: env.DOCKER_CREDS_ID, passwordVariable: 'DOCKER_PASSWORD', usernameVariable: 'DOCKER_USERNAME')]) {
                    // Le (echo %DOCKER_PASSWORD%) sans espace bloque les caractères spéciaux et les espaces parasites sous Windows
                    bat "(echo %DOCKER_PASSWORD%) | docker login -u %DOCKER_USERNAME% --password-stdin"
                    bat "docker push ${env.DOCKER_HUB_USER}/${env.IMAGE_NAME}:${env.IMAGE_TAG}"
                }
            }
        }
    }

    post {
        success {
            echo 'Pipeline Backend exécuté avec succès !'
        }
        failure {
            echo 'Le pipeline a échoué.'
        }
    }
}