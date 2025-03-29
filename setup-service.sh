#!/bin/bash

# Script pour configurer le bot comme un service avec PM2

# Couleurs pour les messages
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Configuration du Bot Assistant Mathématique comme service ===${NC}"
echo -e "${BLUE}=============================================================${NC}"

# Vérifier si le fichier .env existe
ENV_FILE="$(dirname "$0")/.env"
if [ ! -f "$ENV_FILE" ]; then
  echo -e "${RED}Erreur: Fichier .env non trouvé.${NC}"
  echo -e "${YELLOW}Veuillez d'abord créer un fichier .env avec les variables nécessaires.${NC}"
  exit 1
fi

# Vérifier si PM2 est installé
if ! command -v pm2 &> /dev/null; then
  echo -e "${YELLOW}PM2 n'est pas installé. Installation en cours...${NC}"
  npm install -g pm2
  
  if [ $? -ne 0 ]; then
    echo -e "${RED}Erreur lors de l'installation de PM2. Veuillez l'installer manuellement:${NC}"
    echo -e "${YELLOW}npm install -g pm2${NC}"
    exit 1
  fi
  
  echo -e "${GREEN}PM2 installé avec succès.${NC}"
else
  echo -e "${GREEN}PM2 est déjà installé.${NC}"
fi

# Chemin absolu vers le dossier du bot
BOT_DIR="$(cd "$(dirname "$0")" && pwd)"
BOT_FILE="$BOT_DIR/math-assistant-bot.js"

echo -e "${BLUE}Configuration du bot comme service PM2...${NC}"

# Arrêter le service s'il existe déjà
pm2 stop math-assistant 2>/dev/null
pm2 delete math-assistant 2>/dev/null

# Démarrer le bot avec PM2
pm2 start "$BOT_FILE" --name "math-assistant" --time

if [ $? -ne 0 ]; then
  echo -e "${RED}Erreur lors du démarrage du bot avec PM2.${NC}"
  exit 1
fi

echo -e "${GREEN}Bot démarré avec succès via PM2.${NC}"

# Configurer PM2 pour démarrer au démarrage du système
echo -e "${BLUE}Configuration du démarrage automatique...${NC}"
pm2 save

# Générer la commande de démarrage automatique
STARTUP_CMD=$(pm2 startup | grep -v "sudo" | grep -v "[PM2] Init System found:" | grep -v "You have to run this command as root" | tail -n 1)

echo -e "${YELLOW}Pour configurer le démarrage automatique, exécutez la commande suivante:${NC}"
echo -e "${GREEN}$STARTUP_CMD${NC}"

echo -e "${BLUE}Commandes utiles:${NC}"
echo -e "${YELLOW}pm2 status${NC} - Afficher le statut du bot"
echo -e "${YELLOW}pm2 logs math-assistant${NC} - Afficher les logs du bot"
echo -e "${YELLOW}pm2 restart math-assistant${NC} - Redémarrer le bot"
echo -e "${YELLOW}pm2 stop math-assistant${NC} - Arrêter le bot"
echo -e "${YELLOW}pm2 start math-assistant${NC} - Démarrer le bot"

echo -e "${GREEN}Configuration terminée!${NC}"
echo -e "${GREEN}Le bot est maintenant configuré comme un service et démarrera automatiquement au démarrage du système.${NC}"