import mysql from 'mysql2/promise';

// Configuration de la connexion MySQL
const dbConfig = {
  host: process.env.MYSQL_HOST || 'srv1270.hstgr.io',
  port: parseInt(process.env.MYSQL_PORT || '3306'),
  user: process.env.MYSQL_USER || 'u716694317_wacdo',
  password: process.env.MYSQL_PASSWORD || 'WacdoApp1#',
  database: process.env.MYSQL_DATABASE || 'u716694317_wacdoapp',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000
};

// Pool de connexions
let pool;

function getPool() {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
  }
  return pool;
}

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
    let connection;
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
      console.log('🔌 Connexion à MySQL...');
      const currentPool = getPool();
      connection = await currentPool.getConnection();
      console.log('✅ Connecté à MySQL');

      // Insérer la commande dans la table
      const [result] = await connection.execute(
        'INSERT INTO orders (Cnumber, total, articles, place, `table`) VALUES (?, ?, ?, ?, ?)',
        [Cnumber, total, articles, place, table || null]
      );

      console.log('✅ Commande enregistrée, ID:', result.insertId);

      res.status(201).json({
        success: true,
        message: 'Commande enregistrée avec succès',
        orderId: result.insertId
      });

    } catch (error) {
      console.error('❌ Erreur lors de l\'enregistrement:', error.message);
      console.error('Code erreur:', error.code);
      console.error('Stack:', error.stack);
      res.status(500).json({
        error: 'Erreur serveur',
        details: error.message,
        code: error.code
      });
    } finally {
      if (connection) connection.release();
    }
    return;
  }

  // Méthode non autorisée
  console.log('❌ Méthode non autorisée:', req.method);
  res.status(405).json({ error: 'Méthode non autorisée' });
}
