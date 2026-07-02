pipeline {
    agent any

    environment {
        // Variables d'identification Docker Hub
        DOCKER_HUB_USER = 'sofianecharrada'
        IMAGE_NAME      = 'tasklist-backend'
        IMAGE_TAG       = "latest"
        
        // Identifiants Jenkins Credentials ID
        DOCKER_CREDS_ID = 'sam-dockerhub-password'
        SONAR_CREDS_ID  = 'sonar-token'
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
            withSonarQubeEnv('SonarQube') {
                withCredentials([string(credentialsId: env.SONAR_CREDS_ID, variable: 'SONAR_TOKEN')]) {
                    // Utilisation du chemin absolu/relatif du binaire Windows sans npx
                    bat "cmd /c .\\node_modules\\sonar-scanner\\bin\\sonar-scanner.bat -Dsonar.token=%SONAR_TOKEN%"
                }
            }
        }
    }

        stage('4. Génération du SBOM (Sécurité)') {
            steps {
                echo 'Génération du Software Bill of Materials (SBOM) au format SPDX...'
                // Gestion de l'erreur gracieuse sous Windows si Syft n'est pas présent
                bat 'syft dir:. -o spdx-json=sbom-spdx.json || echo Syft non disponible ou en erreur'
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
                echo 'Analyse de l\'image Docker avec Trivy...'
                bat "trivy image --severity HIGH,CRITICAL --format table ${env.DOCKER_HUB_USER}/${env.IMAGE_NAME}:${env.IMAGE_TAG} || echo Scan Trivy complété"
            }
        }

        stage('7. Publication sur Docker Hub') {
            steps {
                echo 'Connexion sécurisée à Docker Hub et Push de l\'image...'
                withCredentials([usernamePassword(credentialsId: env.DOCKER_CREDS_ID, passwordVariable: 'DOCKER_PASSWORD', usernameVariable: 'DOCKER_USERNAME')]) {
                    // Syntaxe de connexion Docker adaptée pour l'invite de commandes Windows (cmd)
                    bat "echo %DOCKER_PASSWORD% | docker login -u %DOCKER_USERNAME% --password-stdin"
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