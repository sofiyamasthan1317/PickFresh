const express = require('express');
const path = require('path');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const cors = require('cors');
const products=require('./productData')
const app = express();

app.use(express.json());
app.use(cors());
const dbPath = path.join(__dirname, 'database.db');
let db = null;




const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    
    await db.run(`
    CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    quantity TEXT NOT NULL,
    price TEXT NOT NULL,
    image TEXT,
    categoryId TEXT NOT NULL
  );
` );


    await db.run(`DELETE FROM products`);

    products.forEach(product => {
    db.run(`
    INSERT INTO products (id, name, quantity, price, image, categoryId)
    VALUES (?, ?, ?, ?, ?, ?);
  `, [product.id, product.name, product.quantity, product.price, product.image, product.categoryId]);
});

    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/');
    });

  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();


app.get('/products/:category/', async (request, response) => {
  const { category } = request.params;
  const getProductQuery = `
    SELECT * FROM products WHERE categoryId = ?;
  `;
  const dbResponse = await db.all(getProductQuery, [category]);
  response.send(dbResponse);
});

module.exports=app