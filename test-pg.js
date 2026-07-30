const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres:vijaycollection555%40@db.onwoigymsalnfnmbfgvm.supabase.co:5432/postgres'
});
client.connect()
  .then(() => client.query('SELECT email FROM "User"'))
  .then(res => { console.log(res.rows); client.end(); })
  .catch(console.error);
