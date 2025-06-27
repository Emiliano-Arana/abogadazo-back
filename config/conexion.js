const { Pool } = require('pg');
require('dotenv').config(); // Para usar variables de entorno

const pool = new Pool({
  connectionString: "postgresql://neondb_owner:npg_h8McrZw6PHoY@ep-fancy-term-a8kbdvwm-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require", // Usa el connection string completo
  ssl: {
    rejectUnauthorized: false // Neon requiere esta configuración SSL
  }
});

// Verificación de conexión (opcional pero recomendado)
pool.query('SELECT NOW()', (err) => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err);
  } else {
    console.log('Conexión a Neon PostgreSQL establecida correctamente');
  }
});

module.exports = pool;