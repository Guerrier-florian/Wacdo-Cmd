import express from 'express';
import cors from 'cors';
import pkg from 'pg';
const { Pool } = pkg;

const app = express();
const PORT = 3001;

// Configuration de la connexion PostgreSQL Neon
const dbConfig = {
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DATABASE,
  ssl: {
    rejectUnauthorized: false
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000
};

// Middleware
app.use(cors());
app.use(express.json());

// Test de connexion au démarrage
const pool = new Pool(dbConfig);
console.log('✅ Pool de connexions PostgreSQL créé');

// Test immédiat de la connexion
pool.connect()
  .then(client => {
    console.log('✅ Test de connexion PostgreSQL réussi');
    client.release();
  })
  .catch(err => {
    console.error('❌ Erreur connexion PostgreSQL:', err.message);
  });

// Endpoint pour enregistrer une commande
app.post('/api/commandes', async (req, res) => {
  let client;
  try {
    const { Cnumber, total, articles, place, table } = req.body;

    console.log('📝 Tentative d\'enregistrement:', { Cnumber, total, articles, place, table });

    // Validation des données
    if (!Cnumber || total === undefined || !articles || !place) {
      return res.status(400).json({ 
        error: 'Données manquantes',
        details: 'Cnumber, total, articles et place sont requis' 
      });
    }

    // Créer une connexion à la base de données
    console.log('🔌 Connexion à PostgreSQL...');
    client = await pool.connect();
    console.log('✅ Connecté à PostgreSQL');

    // Insérer la commande dans la table
    const query = `
      INSERT INTO orders (cnumber, total, articles, place, "table", traite)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const values = [
      parseInt(Cnumber),
      total.toString(),
      articles,
      place,
      table ? parseInt(table) : null,
      false
    ];

    const result = await client.query(query, values);

    console.log('✅ Commande enregistrée, ID:', result.rows[0].id);

    res.status(201).json({
      success: true,
      message: 'Commande enregistrée avec succès',
      order: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Erreur lors de l\'enregistrement:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({
      error: 'Erreur serveur',
      details: error.message
    });
  } finally {
    if (client) client.release();
  }
});

// Route de test
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Serveur API opérationnel' });
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur API démarré sur http://localhost:${PORT}`);
});
