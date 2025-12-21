import pkg from 'pg';
const { Pool } = pkg;

// Configuration de la connexion PostgreSQL Neon
const pool = new Pool({
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
});

// Handler pour Vercel serverless
export default async function handler(req, res) {
  console.log('🚀 API commandes appelée - Méthode:', req.method);
  console.log('🚀 Body:', req.body);
  
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Gérer preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Route POST uniquement
  if (req.method === 'POST') {
    let client;
    try {
      const { Cnumber, total, articles, place, table } = req.body;

      console.log('📝 Tentative d\'enregistrement:', { Cnumber, total, articles, place, table });

      // Validation des données
      if (!Cnumber || total === undefined || !articles || !place) {
        console.log('❌ Validation échouée - données manquantes');
        res.status(400).json({ 
          error: 'Données manquantes',
          details: 'Cnumber, total, articles et place sont requis',
          received: { Cnumber, total, articles, place, table }
        });
        return;
      }

      // Créer une connexion à la base de données
      console.log('🔌 Connexion à PostgreSQL...');
      client = await pool.connect();
      console.log('✅ Connecté à PostgreSQL Neon');

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
    return;
  }

  // Méthode non autorisée
  console.log('❌ Méthode non autorisée:', req.method);
  res.status(405).json({ error: 'Méthode non autorisée' });
}
