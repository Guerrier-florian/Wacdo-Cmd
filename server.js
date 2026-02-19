/**
 * server.js — Serveur API Express (back-end)
 *
 * Ce serveur Node.js/Express expose une API REST pour enregistrer
 * les commandes dans la base de données PostgreSQL hébergée sur Neon.
 *
 * Routes :
 *  POST /api/commandes  → Insertion d'une nouvelle commande
 *  GET  /api/health     → Vérification de l'état du serveur
 *
 * Sécurité :
 *  - CORS restreint aux origines autorisées (voir ALLOWED_ORIGINS)
 *  - Validation des champs obligatoires avant toute requête SQL
 *  - Requêtes paramétrées ($1, $2...) pour prévenir les injections SQL
 *  - Taille maximale du body JSON limitée à 10kb
 *  - Connexions PostgreSQL via pool avec timeout pour éviter les fuites
 */
import express from 'express'
import cors from 'cors'
import pkg from 'pg'
const { Pool } = pkg

const app = express()
const PORT = process.env.PORT || 3001

/* ══════════════════════════════════════════════════════════════
   Configuration CORS (Cross-Origin Resource Sharing)
   Sécurité : restreindre les origines autorisées à effectuer
   des requêtes vers cette API.
   ══════════════════════════════════════════════════════════════ */
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : [
      'http://localhost:5173',            // Développement local Vite
      'http://localhost:4173',            // Prévisualisation build Vite
      'https://wacdo-cmd.vercel.app',     // Production Vercel
    ]

app.use(cors({
  origin: (origin, callback) => {
    // Autoriser les requêtes sans origine (Postman, outils CLI, etc.)
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error(`Origine non autorisée par CORS : ${origin}`))
    }
  },
  methods: ['GET', 'POST'],           // Seules ces méthodes sont acceptées
  allowedHeaders: ['Content-Type'],   // Seul ce header est accepté
}))

/* ── Parsing JSON limité à 10kb pour éviter les attaques par payload trop grand ── */
app.use(express.json({ limit: '10kb' }))

/* ══════════════════════════════════════════════════════════════
   Configuration de la connexion PostgreSQL (Neon)
   Les identifiants sont lus depuis les variables d'environnement
   (fichier .env non versionné pour la sécurité).
   ══════════════════════════════════════════════════════════════ */
const dbConfig = {
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DATABASE,
  ssl: {
    rejectUnauthorized: false, // Requis pour Neon (certificat auto-signé)
  },
  max: 10,                      // Nombre maximum de connexions simultanées dans le pool
  idleTimeoutMillis: 30000,     // Fermer les connexions inactives après 30s
  connectionTimeoutMillis: 10000, // Échouer après 10s si connexion impossible
}

/* ── Création du pool de connexions (réutilisation pour les performances) ── */
const pool = new Pool(dbConfig)
console.log('Pool de connexions PostgreSQL créé')

/* ── Test de connexion au démarrage du serveur ── */
pool.connect()
  .then(client => {
    console.log('Connexion PostgreSQL réussie')
    client.release()
  })
  .catch(err => {
    console.error('Erreur de connexion PostgreSQL:', err.message)
  })

/* ══════════════════════════════════════════════════════════════
   POST /api/commandes — Enregistrement d'une commande
   ══════════════════════════════════════════════════════════════ */
app.post('/api/commandes', async (req, res) => {
  let client

  try {
    const { Cnumber, total, articles, place, table } = req.body

    /* ── Validation des données requises ── */
    if (!Cnumber || total === undefined || !articles || !place) {
      return res.status(400).json({
        error: 'Données manquantes',
        details: 'Les champs Cnumber, total, articles et place sont obligatoires',
      })
    }

    /* ── Validation supplémentaire des types ── */
    if (typeof total !== 'number' || total < 0) {
      return res.status(400).json({
        error: 'Données invalides',
        details: 'Le champ total doit être un nombre positif',
      })
    }

    if (!['sur place', 'à emporter'].includes(place)) {
      return res.status(400).json({
        error: 'Données invalides',
        details: 'Le champ place doit être "sur place" ou "à emporter"',
      })
    }

    /* ── Connexion depuis le pool ── */
    client = await pool.connect()

    /* ── Requête paramétrée (prévient les injections SQL) ──
       Les valeurs ($1, $2...) sont transmises séparément et jamais
       interpolées directement dans la chaîne SQL. */
    const query = `
      INSERT INTO orders (cnumber, total, articles, place, "table", traite)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `

    const values = [
      parseInt(Cnumber),               // Identifiant unique (timestamp en ms)
      total.toString(),                // Montant total en euros
      articles,                        // Liste des articles formatée
      place,                           // Mode de consommation
      table ? parseInt(table) : null,  // Numéro de chevalet (null si à emporter)
      false,                           // traite = false (commande non traitée par le personnel)
    ]

    const result = await client.query(query, values)

    /* ── Réponse de succès avec la commande créée ── */
    res.status(201).json({
      success: true,
      message: 'Commande enregistrée avec succès',
      order: result.rows[0],
    })

  } catch (error) {
    console.error('Erreur lors de l\'enregistrement de la commande:', error.message)
    res.status(500).json({
      error: 'Erreur serveur',
      details: error.message,
    })
  } finally {
    /* ── Libération de la connexion vers le pool (évite les fuites) ── */
    if (client) client.release()
  }
})

/* ══════════════════════════════════════════════════════════════
   GET /api/health — Vérification de l'état du serveur
   Utilisé pour monitorer que l'API est opérationnelle.
   ══════════════════════════════════════════════════════════════ */
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Serveur API opérationnel' })
})

/* ── Démarrage du serveur ── */
app.listen(PORT, () => {
  console.log(`Serveur API démarré sur http://localhost:${PORT}`)
})
