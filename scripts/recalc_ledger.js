const { pool } = require('../backend/src/db');
const calc = require('../backend/src/calculator');

(async ()=>{
  const conn = await pool.getConnection();
  try{
    const [rows] = await conn.query('SELECT id, meta, type, amount, kgco2e FROM ledger');
    let updated = 0;
    for(const r of rows){
      let meta = {};
      if (typeof r.meta === 'string') {
        try{ meta = JSON.parse(r.meta || '{}'); }catch(e){ meta = {}; }
      } else if (typeof r.meta === 'object' && r.meta != null) {
        meta = r.meta;
      }
      const activity = { type: r.type, amount: r.amount, meta };
      const kg = calc.calculateActivity(activity);
      console.log('Row', r.id, 'type', r.type, 'amount', r.amount, 'meta_type', typeof r.meta, 'meta_raw', r.meta, 'meta_parsed', meta, 'calcKg', kg, 'storedKg', r.kgco2e);
      if (kg !== r.kgco2e){
        await conn.query('UPDATE ledger SET kgco2e = ? WHERE id = ?', [kg, r.id]);
        updated++;
        console.log('Updated', r.id, '->', kg);
      }
    }
    console.log('Done. Updated rows:', updated);
  }catch(err){
    console.error(err);
  }finally{
    conn.release();
    process.exit(0);
  }
})();
