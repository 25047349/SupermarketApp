const express = require('express');
const mysql = require('mysql2');
const multer = require('multer');
const app = express();

const connection = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: 'J7@Tatsumaki',
  database: 'c237_supermarketapp'
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images'); // Directory to save uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage: storage });

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  connection.query('SELECT * FROM products', (error, results) => {
    if (error) throw error;
    res.render('index', { products: results });
  });
});

app.get('/product/:id', (req, res) => {
  const productId = req.params.id;
  const sql = 'SELECT * FROM products WHERE productId = ?';
  connection.query(sql, [productId], (error, results) => {
    if (error) {
      console.error('Database query error:', error.message);
      return res.send('Error Retrieving product by ID');
    }
    if (results.length > 0) {
      res.render('product', { product: results[0] });
    } else {
      res.send('Product not found');
    }
  });
});

app.get('/addProduct', (req, res) => {
  res.render('addProduct');
});

app.post('/addProduct', upload.single('image'), (req, res) => {
  const { name, quantity, price } = req.body;
  let image;
  if (req.file) {
    image = req.file.filename; // Save only the filename
  } else {
    image = null;
  }
  const sql = 'INSERT INTO products (productName, quantity, price, image) VALUES (?, ?, ?, ?)';
  connection.query(sql, [name, quantity, price, image], (error, results) => {
    if (error) {
      console.error("Error adding product:", error);
      res.send('Error adding product');
    } else {
      res.redirect('/');
    }
  });
});

// Show edit form with current product data
app.get('/editProduct/:id', (req, res) => {
  const productId = req.params.id;
  const sql = 'SELECT * FROM products WHERE productId = ?';
  connection.query(sql, [productId], (error, results) => {
    if (error) {
      console.error('Database query error:', error.message);
      return res.send('Error retrieving product by ID');
    }
    if (results.length > 0) {
      res.render('editProduct', { product: results[0] });
    } else {
      res.send('Product not found');
    }
  });
});

// Handle edit form submission
app.post('/editProduct/:id', upload.single('image'), (req, res) => {
  const productId = req.params.id;
  const { name, quantity, price } = req.body;
  let image = req.body.currentImage; // retrieve current image filename
  if (req.file) { // if new image is uploaded
    image = req.file.filename; // set image to be new image filename
  }
  const sql = 'UPDATE products SET productName = ?, quantity = ?, price = ?, image = ? WHERE productId = ?';
  connection.query(sql, [name, quantity, price, image, productId], (error, results) => {
    if (error) {
      console.error("Error updating product:", error);
      res.send('Error updating product');
    } else {
      res.redirect('/');
    }
  });
});

// Delete a product
app.get('/deleteProduct/:id', (req, res) => {
  const productId = req.params.id;
  const sql = 'DELETE FROM products WHERE productId = ?';
  connection.query(sql, [productId], (error, results) => {
    if (error) {
      console.error("Error deleting product:", error);
      res.send('Error deleting product');
    } else {
      res.redirect('/');
    }
  });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));