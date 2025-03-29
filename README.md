# Bot Assistant Mathématique Discord

Guide complet pour déployer et utiliser un bot Discord alimenté par un LLM (Claude ou OpenAI) pour aider vos élèves de collège et lycée en mathématiques.

## Table des matières
1. [Prérequis](#prérequis)
2. [Configuration initiale](#configuration-initiale)
3. [Déploiement permanent](#déploiement-permanent)
4. [Guide d'utilisation pour les élèves](#guide-dutilisation-pour-les-élèves)
5. [Administration et maintenance](#administration-et-maintenance)
6. [Dépannage](#dépannage)

## Prérequis

- Un serveur Discord déjà créé où vous êtes administrateur
- Une clé API pour Claude (Anthropic) ou OpenAI
- Un ordinateur ou serveur qui peut fonctionner en continu pour héberger le bot

## Configuration initiale

### Étape 1: Créer une application Discord et un bot

1. Rendez-vous sur le [Portail des développeurs Discord](https://discord.com/developers/applications)
2. Cliquez sur "New Application" et donnez un nom à votre application (ex: "Assistant Mathématiques")
3. Allez dans la section "Bot" et cliquez sur "Add Bot"
4. Sous "Token", cliquez sur "Reset Token" puis "Copy" pour copier le token du bot
5. Dans la section "Privileged Gateway Intents", activez :
   - SERVER MEMBERS INTENT
   - MESSAGE CONTENT INTENT
   - PRESENCE INTENT
6. Sauvegardez les changements

### Étape 2: Inviter le bot sur votre/vos serveur(s)

1. Dans la section "OAuth2" > "URL Generator" :
   - Sélectionnez les scopes : "bot" et "applications.commands"
   - Sélectionnez les permissions : "Read Messages/View Channels", "Send Messages", "Read Message History", "Use Slash Commands", "Embed Links"
2. Copiez l'URL générée et ouvrez-la dans votre navigateur
3. Sélectionnez le(s) serveur(s) où vous voulez ajouter le bot et confirmez

### Étape 3: Obtenir une clé API pour le LLM

#### Option A: Clé API OpenAI
1. Rendez-vous sur [OpenAI API](https://platform.openai.com/signup)
2. Créez un compte ou connectez-vous
3. Allez dans la section "API Keys"
4. Cliquez sur "Create new secret key"
5. Copiez la clé générée (elle ne sera affichée qu'une seule fois)

#### Option B: Clé API Claude (Anthropic)
1. Rendez-vous sur [Anthropic Console](https://console.anthropic.com/)
2. Créez un compte ou connectez-vous
3. Allez dans la section "API Keys"
4. Cliquez sur "Create Key"
5. Copiez la clé générée

### Étape 4: Configurer le fichier d'environnement

1. Clonez ce dépôt:
   ```bash
   git clone https://github.com/elysetech/discord-math-assistant-bot.git
   cd discord-math-assistant-bot
   npm install
   ```

2. Copiez le fichier `.env.example` vers `.env`:
   ```bash
   cp .env.example .env
   ```

3. Modifiez le fichier `.env` et ajoutez vos informations:
   ```
   DISCORD_TOKEN=votre-token-discord
   OPENAI_API_KEY=votre-clé-openai
   CLAUDE_API_KEY=votre-clé-claude
   USE_CLAUDE=false
   ```
   (Remplacez `false` par `true` si vous préférez utiliser Claude)

## Déploiement permanent

Pour que votre bot soit disponible en permanence, vous avez plusieurs options:

### Option 1: Utiliser PM2 (recommandé pour un serveur Linux/macOS)

1. Rendez le script de configuration exécutable:
   ```bash
   chmod +x setup-service.sh
   ```

2. Exécutez le script de configuration:
   ```bash
   ./setup-service.sh
   ```

3. Suivez les instructions à l'écran pour terminer la configuration.

### Option 2: Utiliser un service d'hébergement

Vous pouvez héberger votre bot sur des services comme:
- [Heroku](https://www.heroku.com/)
- [Railway](https://railway.app/)
- [Replit](https://replit.com/)

Pour ces services, vous devrez:
1. Créer un compte
2. Créer un nouveau projet
3. Importer votre code (GitHub ou upload direct)
4. Configurer les variables d'environnement (DISCORD_TOKEN, OPENAI_API_KEY ou CLAUDE_API_KEY, USE_CLAUDE)
5. Déployer l'application

### Option 3: Utiliser un script de démarrage avec crontab (Linux/macOS)

1. Rendez le script de démarrage exécutable:
   ```bash
   chmod +x start-bot.sh
   ```

2. Configurez crontab pour redémarrer le bot au redémarrage:
   ```bash
   crontab -e
   ```
   Ajoutez la ligne:
   ```
   @reboot cd /chemin/vers/discord-math-assistant-bot && ./start-bot.sh > /chemin/vers/discord-math-assistant-bot/bot.log 2>&1
   ```

### Option 4: Utiliser un service Windows

Si vous utilisez Windows:
1. Installez [NSSM (Non-Sucking Service Manager)](https://nssm.cc/)
2. Créez un service Windows pour votre bot:
   ```
   nssm install MathAssistantBot "node" "C:\chemin\vers\math-assistant-bot.js"
   nssm set MathAssistantBot AppDirectory "C:\chemin\vers\discord-math-assistant-bot"
   ```

## Guide d'utilisation pour les élèves

### Commandes disponibles

| Commande | Description | Exemple |
|----------|-------------|----------|
| `!aide` ou `!help` | Affiche la liste des commandes disponibles | `!aide` |
| `!ping` | Vérifie si le bot est réactif | `!ping` |
| `!math [question]` | Pose une question de mathématiques | `!math Comment résoudre x² + 5x + 6 = 0?` |
| `!exercice [niveau] [sujet]` | Génère un exercice de mathématiques | `!exercice lycée équations différentielles` |
| `!concept [concept]` | Explique un concept mathématique | `!concept dérivation` |
| `!formule [formule]` | Explique une formule mathématique | `!formule E=mc²` |

### Mention directe

Les élèves peuvent également mentionner directement le bot suivi de leur question:
```
@Math Assistant Comment calculer l'intégrale de sin(x)?
```

### Conseils pour les élèves

1. **Soyez précis dans vos questions**: Plus votre question est claire, meilleure sera la réponse.
2. **Spécifiez votre niveau**: Mentionnez si vous êtes au collège ou au lycée pour obtenir des explications adaptées.
3. **Utilisez la commande appropriée**: Utilisez `!math` pour des problèmes, `!concept` pour des explications théoriques, etc.
4. **Posez des questions de suivi**: Si une explication n'est pas claire, n'hésitez pas à demander plus de détails.

## Administration et maintenance

### Configuration pour plusieurs serveurs

Le bot peut fonctionner sur plusieurs serveurs Discord simultanément. Pour cela:

1. Invitez le bot sur chaque serveur en utilisant le lien d'invitation généré à l'étape 2 de la configuration initiale.
2. Le bot répondra automatiquement aux commandes sur tous les serveurs où il est présent.

### Surveillance et maintenance

1. **Vérifier les logs**: Consultez régulièrement les logs pour détecter d'éventuels problèmes:
   ```bash
   # Si vous utilisez PM2
   pm2 logs math-assistant
   
   # Sinon, vérifiez le fichier de log
   cat bot.log
   ```

2. **Mettre à jour les dépendances**:
   ```bash
   npm update
   ```

3. **Redémarrer le bot après les mises à jour**:
   ```bash
   # Avec PM2
   pm2 restart math-assistant
   
   # Sans PM2
   # Arrêtez d'abord le processus en cours, puis redémarrez-le
   ```

### Personnalisation avancée

1. **Modifier le contexte mathématique**: Ouvrez `math-assistant-bot.js` et modifiez la variable `mathContext` pour ajuster les instructions données au LLM.

2. **Ajouter de nouvelles commandes**: Modifiez la section du gestionnaire de commandes dans `math-assistant-bot.js`.

3. **Personnaliser l'apparence**: Modifiez les couleurs et le style des embeds dans les fonctions qui créent des messages riches.

## Dépannage

### Le bot ne répond pas

1. **Vérifiez que le bot est en ligne**: Dans Discord, le bot devrait apparaître comme "En ligne" dans la liste des membres.

2. **Vérifiez les logs**: Consultez les logs pour identifier d'éventuelles erreurs.

3. **Vérifiez les permissions**: Assurez-vous que le bot a les permissions nécessaires dans le canal où vous essayez de l'utiliser.

4. **Redémarrez le bot**: Parfois, un simple redémarrage peut résoudre les problèmes.

### Problèmes d'API

1. **Vérifiez votre clé API**: Assurez-vous que votre clé API (OpenAI ou Claude) est valide et correctement configurée.

2. **Vérifiez votre quota**: Les API ont des limites d'utilisation. Vérifiez que vous n'avez pas dépassé votre quota.

3. **Vérifiez le statut du service**: Consultez les pages de statut d'[OpenAI](https://status.openai.com/) ou d'[Anthropic](https://status.anthropic.com/) pour voir s'il y a des problèmes connus.

### Autres problèmes

Pour tout autre problème, vérifiez:
1. La connexion Internet du serveur hébergeant le bot
2. Les mises à jour de Discord.js qui pourraient nécessiter des modifications du code
3. Les changements dans les API d'OpenAI ou Claude qui pourraient affecter le fonctionnement du bot

---

Ce bot est conçu pour être un outil pédagogique puissant qui aide vos élèves à comprendre les mathématiques de manière interactive et engageante. N'hésitez pas à l'adapter à vos besoins spécifiques!