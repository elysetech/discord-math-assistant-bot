#!/bin/bash

# Script de démarrage pour le bot d'assistant mathématique Discord

# Couleurs pour les messages
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Bot d'Assistant Mathématique Discord ===${NC}"
echo -e "${BLUE}================================================${NC}"

# Vérifier si le fichier .env existe
ENV_FILE="$(dirname "$0")/.env"
if [ ! -f "$ENV_FILE" ]; then
  echo -e "${RED}Erreur: Fichier .env non trouvé.${NC}"
  echo -e "${YELLOW}Veuillez créer un fichier .env avec les variables nécessaires:${NC}"
  echo -e "${YELLOW}DISCORD_TOKEN, OPENAI_API_KEY ou CLAUDE_API_KEY, USE_CLAUDE${NC}"
  exit 1
fi

# Vérifier si les variables nécessaires sont configurées
source "$ENV_FILE"

if [ -z "$DISCORD_TOKEN" ]; then
  echo -e "${RED}Erreur: DISCORD_TOKEN non configuré dans le fichier .env${NC}"
  exit 1
fi

# Vérifier si au moins une clé API est configurée
if [ "$USE_CLAUDE" = "true" ] && [ -z "$CLAUDE_API_KEY" ]; then
  echo -e "${RED}Erreur: USE_CLAUDE est défini sur 'true' mais CLAUDE_API_KEY n'est pas configuré dans le fichier .env${NC}"
  exit 1
elif [ "$USE_CLAUDE" != "true" ] && [ -z "$OPENAI_API_KEY" ]; then
  echo -e "${RED}Erreur: USE_CLAUDE est défini sur 'false' mais OPENAI_API_KEY n'est pas configuré dans le fichier .env${NC}"
  exit 1
fi

# Afficher les informations de configuration
if [ "$USE_CLAUDE" = "true" ]; then
  echo -e "${GREEN}Utilisation de Claude (Claude 3 Opus)${NC}"
else
  echo -e "${GREEN}Utilisation d'OpenAI (GPT-4)${NC}"
fi

echo -e "${BLUE}Démarrage du bot...${NC}"
echo -e "${YELLOW}Appuyez sur Ctrl+C pour arrêter le bot.${NC}"

# Démarrer le bot
node "$(dirname "$0")/math-assistant-bot.js"