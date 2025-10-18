import pkg from 'pg';
const { Client } = pkg;

const client = new Client({
  user: 'postgres',       
  host: 'localhost',
  database: 'teamtaskdb',  
  password: 'ahmad', 
  port: 5432,
});

client.connect()
  .then(() => console.log('Database connected successfully'))
  .catch(err => console.error('Database connection error:', err))
  .finally(() => client.end());
