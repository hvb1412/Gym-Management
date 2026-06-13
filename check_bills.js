import db from './server/src/configs/database.js';
db.query('SELECT * FROM "Bills" LIMIT 5').then(res => {
  console.log(res[0]);
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
