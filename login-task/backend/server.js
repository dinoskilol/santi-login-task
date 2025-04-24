const http = require('http');
const { Client } = require('pg');
const bcrypt = require('bcryptjs');

// POSTGRESQL CONNECTION
const db = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'login_db',
  password: '1q2w3e4r',
  port: 5432
});
db.connect();

const server = http.createServer((req, res) => {
  // ALWAYS ALLOW REQUESTS FROM FRONTEND
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  // REGISTER THE ENDPOINT
  if (req.url === '/register' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', async () => {
      const { email, password } = JSON.parse(body);

      if (!email || !password) {
        res.writeHead(400);
        return res.end(JSON.stringify({ error: 'Email and password required' }));
      }

      try {
        // CHECK IF USER EXIST ALREADY
        const check = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (check.rows.length > 0) {
          res.writeHead(409);
          return res.end(JSON.stringify({ error: 'Email already in use' }));
        }

        // HASH USER PASS
        const hashedPassword = await bcrypt.hash(password, 10);

        // INSERT USER IN USERS TABLE
        await db.query('INSERT INTO users (email, password) VALUES ($1, $2)', [email, hashedPassword]);

        res.writeHead(201);
        res.end(JSON.stringify({ message: 'User registered!' }));
      } catch (err) {
        console.error(err);
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Something went wrong' }));
      }
    });
  }

  else if (req.url === '/login' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
  
    req.on('end', async () => {
      const { email, password } = JSON.parse(body);
  
      if (!email || !password) {
        res.writeHead(400);
        return res.end(JSON.stringify({ error: 'Email and password required' }));
      }
  
      try {
        // STEP 1: LOOK FOR USER IN DB
        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];
  
        if (!user) {
          res.writeHead(401);
          return res.end(JSON.stringify({ error: 'User not found' }));
        }
  
        // STEP 2: COMPARE PASSWORD
        const isMatch = await bcrypt.compare(password, user.password);
  
        if (!isMatch) {
          res.writeHead(401);
          return res.end(JSON.stringify({ error: 'Incorrect password' }));
        }
  
        // STEP 3: CREATE JWT TOKEN
        const jwt = require('jsonwebtoken');
        const token = jwt.sign({ id: user.id, email: user.email }, 'secret123', { expiresIn: '1m' });
  
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Login successful', token }));
      } catch (err) {
        console.error(err);
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Something went wrong during login' }));
      }
    });
  }
  
  else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});