const { pool, init } = require('./src/db');

async function testConnection() {
  try {
    console.log('Testing database connection...');
    await init();
    console.log('Database connection successful!');
    
    // 测试简单查询
    const [rows] = await pool.query('SELECT 1 as test');
    console.log('Test query result:', rows);
    
  } catch (error) {
    console.error('Database connection failed:', error.message);
    console.error('Full error:', error);
  } finally {
    process.exit(0);
  }
}

testConnection();