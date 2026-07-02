pipeline {
    agent any

    stages {
        stage('Diagnostic 1 : Qui est Jenkins ?') {
            steps {
                echo '=== Vérification de l\'utilisateur exécutant Jenkins ==='
                bat 'whoami'
            }
        }
        stage('Diagnostic 2 : Où regarde Jenkins ?') {
            steps {
                echo '=== Vérification des chemins système (PATH) ==='
                bat 'echo %PATH%'
            }
        }
        stage('Diagnostic 3 : Disponibilité des outils') {
            steps {
                echo '=== Test de la présence des binaires ==='
                // Ces commandes vont soit afficher la version, soit une erreur explicite dans les logs !
                bat 'node -v || echo Node.js est INTROUVABLE'
                bat 'npm -v || echo NPM est INTROUVABLE'
                bat 'docker -v || echo Docker est INTROUVABLE'
            }
        }
    }
}