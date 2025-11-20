import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';

const app = express();

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

// Middleware
app.use(cors());
app.use(express.json());

// Test de connexion au démarrage
let pool;
try {
  pool = mysql.createPool(dbConfig);
  console.log('✅ Pool de connexions MySQL créé');
  
  // Test immédiat de la connexion
  pool.getConnection()
    .then(connection => {
      console.log('✅ Test de connexion MySQL réussi');
      connection.release();
    })
    .catch(err => {
      console.error('❌ Erreur test connexion MySQL:', err.message);
    });
} catch (error) {
  console.error('❌ Erreur création pool MySQL:', error.message);
}

// Endpoint pour enregistrer une commande
app.post('/api/commandes', async (req, res) => {
  let connection;
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
    console.log('🔌 Connexion à MySQL...');
    connection = await pool.getConnection();
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
    res.status(500).json({
      error: 'Erreur serveur',
      details: error.message,
      code: error.code
    });
  } finally {
    if (connection) connection.release();
  }
});

// Route de test
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Serveur API opérationnel' });
});

// Export pour Vercel
export default app;
