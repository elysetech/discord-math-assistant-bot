// Charger les variables d'environnement depuis le fichier .env
require('dotenv').config();

const { Client, GatewayIntentBits, Events, EmbedBuilder } = require('discord.js');
const axios = require('axios');

// Configuration des API LLM
const OPENAI_API_KEY = process.env.OPENAI_API_KEY; // À configurer dans le fichier MCP settings
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY; // À configurer dans le fichier MCP settings
const USE_CLAUDE = process.env.USE_CLAUDE === 'true'; // Choisir entre Claude et OpenAI

// Créer une instance client avec les intents nécessaires
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent // Requis pour lire le contenu des messages
  ]
});

// Préfixe pour les commandes
const prefix = '!';

// Contexte pour le LLM (instructions spécifiques pour les mathématiques)
const mathContext = `
Tu es un assistant pédagogique spécialisé en mathématiques pour des élèves de collège et lycée.
Ton objectif est d'aider les élèves à comprendre les concepts mathématiques et à résoudre des problèmes.
Adapte tes explications au niveau scolaire (collège ou lycée).
Explique les concepts étape par étape de manière claire et pédagogique.
Utilise des exemples concrets pour illustrer les concepts.
Encourage la réflexion plutôt que de donner directement les réponses.
Pour les problèmes, guide l'élève vers la solution en posant des questions et en donnant des indices.
`;

// Fonction pour appeler l'API OpenAI
async function callOpenAI(prompt) {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [
          { role: 'system', content: mathContext },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1000,
        temperature: 0.7
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        }
      }
    );
    
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Erreur OpenAI:', error.response?.data || error.message);
    return "Désolé, je n'ai pas pu traiter ta demande. Essaie à nouveau plus tard.";
  }
}

// Fonction pour appeler l'API Claude
async function callClaude(prompt) {
  try {
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-3-opus-20240229',
        max_tokens: 1000,
        messages: [
          { role: 'user', content: prompt }
        ],
        system: mathContext,
        temperature: 0.7
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01'
        }
      }
    );
    
    return response.data.content[0].text;
  } catch (error) {
    console.error('Erreur Claude:', error.response?.data || error.message);
    return "Désolé, je n'ai pas pu traiter ta demande. Essaie à nouveau plus tard.";
  }
}

// Fonction pour appeler le LLM (Claude ou OpenAI)
async function callLLM(prompt) {
  if (USE_CLAUDE) {
    return callClaude(prompt);
  } else {
    return callOpenAI(prompt);
  }
}

// Quand le client est prêt, exécuter ce code (une seule fois)
client.once(Events.ClientReady, () => {
  console.log(`Connecté en tant que ${client.user.tag}!`);
  console.log(`Le bot est présent dans ${client.guilds.cache.size} serveurs`);
  console.log('Le bot est maintenant à l\'écoute des commandes. Essayez de taper !aide dans votre canal Discord.');
  console.log('Appuyez sur Ctrl+C pour arrêter le bot.');
});

// Écouter les messages
client.on(Events.MessageCreate, async message => {
  // Ignorer les messages des bots
  if (message.author.bot) return;

  // Traiter les commandes avec préfixe
  if (message.content.startsWith(prefix)) {
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    console.log(`Commande reçue: ${command} avec arguments: [${args.join(', ')}]`);

    // Gestionnaire de commandes
    switch (command) {
      case 'aide':
      case 'help':
        await message.reply(
          'Commandes disponibles:\n' +
          '`!aide` ou `!help` - Afficher ce message d\'aide\n' +
          '`!ping` - Vérifier si le bot est réactif\n' +
          '`!math [question]` - Poser une question de mathématiques\n' +
          '`!exercice [niveau] [sujet]` - Générer un exercice de mathématiques\n' +
          '`!concept [concept]` - Expliquer un concept mathématique\n' +
          '`!formule [formule]` - Expliquer une formule mathématique\n\n' +
          'Tu peux aussi simplement me mentionner (@Math Assistant) suivi de ta question!'
        );
        break;
        
      case 'ping':
        const sent = await message.reply('Ping en cours...');
        const pingTime = sent.createdTimestamp - message.createdTimestamp;
        await sent.edit(`Pong! Latence: ${pingTime}ms. Latence API: ${Math.round(client.ws.ping)}ms`);
        break;
        
      case 'math':
        const question = args.join(' ');
        if (!question) {
          await message.reply('Merci de poser une question de mathématiques!');
        } else {
          await message.reply("Je réfléchis à ta question...");
          const prompt = `Question de mathématiques: ${question}\n\nRéponds de manière pédagogique et adaptée à un élève.`;
          const response = await callLLM(prompt);
          await message.reply(response);
        }
        break;
        
      case 'exercice':
        const niveau = args[0]?.toLowerCase() || '';
        const sujet = args.slice(1).join(' ') || '';
        
        let niveauScolaire = "collège ou lycée";
        if (niveau.includes('college') || niveau.includes('collège') || niveau.includes('6') || 
            niveau.includes('5') || niveau.includes('4') || niveau.includes('3')) {
          niveauScolaire = "collège";
        } else if (niveau.includes('lycee') || niveau.includes('lycée') || niveau.includes('2') || 
                  niveau.includes('1') || niveau.includes('terminale')) {
          niveauScolaire = "lycée";
        }
        
        await message.reply("Je génère un exercice pour toi...");
        const exercicePrompt = `Génère un exercice de mathématiques de niveau ${niveauScolaire}${sujet ? ' sur le sujet: ' + sujet : ''}. 
        L'exercice doit être clair, adapté au niveau, et inclure la solution détaillée étape par étape.`;
        
        const exercice = await callLLM(exercicePrompt);
        
        // Créer un embed pour l'exercice
        const exerciceEmbed = new EmbedBuilder()
          .setColor(0x0099FF)
          .setTitle(`Exercice de Mathématiques - ${niveauScolaire.charAt(0).toUpperCase() + niveauScolaire.slice(1)}`)
          .setDescription(exercice)
          .setTimestamp()
          .setFooter({ text: 'Math Assistant Bot' });
        
        await message.reply({ embeds: [exerciceEmbed] });
        break;
        
      case 'concept':
        const concept = args.join(' ');
        if (!concept) {
          await message.reply('Merci de préciser le concept mathématique que tu souhaites comprendre!');
        } else {
          await message.reply("Je prépare une explication...");
          const conceptPrompt = `Explique le concept mathématique "${concept}" de manière claire et pédagogique, 
          avec des exemples concrets et des applications pratiques. Adapte l'explication pour un élève de collège ou lycée.`;
          
          const explication = await callLLM(conceptPrompt);
          
          // Créer un embed pour l'explication
          const conceptEmbed = new EmbedBuilder()
            .setColor(0x00FF99)
            .setTitle(`Concept: ${concept}`)
            .setDescription(explication)
            .setTimestamp()
            .setFooter({ text: 'Math Assistant Bot' });
          
          await message.reply({ embeds: [conceptEmbed] });
        }
        break;
        
      case 'formule':
        const formule = args.join(' ');
        if (!formule) {
          await message.reply('Merci de préciser la formule mathématique que tu souhaites comprendre!');
        } else {
          await message.reply("J'analyse cette formule...");
          const formulePrompt = `Explique la formule mathématique "${formule}". 
          Détaille chaque composant de la formule, son origine, comment l'utiliser correctement, 
          et donne des exemples d'application. Adapte l'explication pour un élève de collège ou lycée.`;
          
          const explication = await callLLM(formulePrompt);
          
          // Créer un embed pour l'explication
          const formuleEmbed = new EmbedBuilder()
            .setColor(0xFF9900)
            .setTitle(`Formule: ${formule}`)
            .setDescription(explication)
            .setTimestamp()
            .setFooter({ text: 'Math Assistant Bot' });
          
          await message.reply({ embeds: [formuleEmbed] });
        }
        break;
        
      default:
        // Ne rien faire pour les commandes inconnues
        break;
    }
  } 
  // Répondre aux mentions du bot
  else if (message.mentions.has(client.user)) {
    const question = message.content.replace(/<@!?(\d+)>/g, '').trim();
    if (question) {
      await message.reply("Je réfléchis à ta question...");
      const prompt = `Question: ${question}\n\nRéponds de manière pédagogique et adaptée à un élève de mathématiques.`;
      const response = await callLLM(prompt);
      await message.reply(response);
    } else {
      await message.reply("Bonjour! Je suis ton assistant de mathématiques. Comment puis-je t'aider aujourd'hui? Pose-moi une question ou utilise la commande `!aide` pour voir ce que je peux faire.");
    }
  }
});

// Se connecter à Discord avec le token
const token = process.env.DISCORD_TOKEN;
if (!token) {
  console.error('Le token Discord est requis. Définissez la variable d\'environnement DISCORD_TOKEN.');
  process.exit(1);
}

client.login(token)
  .then(() => console.log('Connexion réussie'))
  .catch(error => {
    console.error(`Échec de la connexion: ${error}`);
    process.exit(1);
  });

// Gérer l'arrêt du processus
process.on('SIGINT', () => {
  console.log('Le bot s\'arrête...');
  client.destroy();
  process.exit(0);
});