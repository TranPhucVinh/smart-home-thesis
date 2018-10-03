const { Pool } = require('pg');

const pool = new Pool({
  user: 'mjndtsnejegotq',
  host: 'ec2-54-235-90-0.compute-1.amazonaws.com',
  database: 'd2iot7rs8nsvar',
  password: '00356745038b61f39cd555a35fb982a0ae2939ddc4fc7c9fc717136f187adb5e', //password for user postgres
  port: 5432,
});

module.exports = pool;
