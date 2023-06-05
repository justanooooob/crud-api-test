const express = require("express");
const app = express();
const conn = require("./config/db");

app.use(express.json())

/*app.get('/get-animals', function (req, res) {
    const queryStr = 'SELECT id, name, description FROM animals WHERE deleted_at IS NULL';
    conn.query(queryStr, (err, results) => {
      if (err) {
        res.error(err.sqlMessage, res);
      } else {
        res.status(200).json({
          "success" : true,
          "message" : "Sukses menampilkan data",
          "data" : results
        });
      }
    })
  })*/
  
const resultsPerPage = 6;

app.get('/get-animals', (req, res) => {
    let totalPages = 0;

    const queryPages = `SELECT COUNT(id) AS total FROM animals WHERE deleted_at IS NULL`;
    conn.query(queryPages, (err, results) => {
      if(err){
        return res.status(500).json({
          message: "Internal server error"
        })
      }

      totalPages = Math.ceil(results[0].total / resultsPerPage)
      
      // mengambil page dari parameter URL
      // jika tidak ada defaultnya 1
      const page = req.query.page ? Number(req.query.page) : 1;
      // const name = req.query.name ? req.query.name : '';
      // offset buat titik awal query ke db
      const offset = (page - 1) * resultsPerPage;
  
      // jika page lebih besar dari total page
      if(page > totalPages){
        return res.status(404).json({
          message: "Page not found"
        })
      }
  
      const query = `SELECT id, name, description, price 
        FROM animals
        WHERE deleted_at IS NULL
        LIMIT ${resultsPerPage}
        OFFSET ${offset}`;
  
      conn.query(query, (err, results) => {
        if(err) {
          return res.status(500).json({
            message: "Internal server error"
          })
        }
  
        return res.status(200).json({
            message: "Success",
            data: results,
            page,
            totalPages
        })
      })
    })
});

app.get('/get-animal', function (req, res) {
const param = req.query;
const id = param.id;
const queryStr = 'SELECT id, name, description, price FROM animals WHERE id = ? AND deleted_at IS NULL';
const values = [id];
conn.query(queryStr, values, (err, results) => {
  if (err) {
  console.log(err);
  } else {
    res.status(200).json({
      "success" : true,
      "message" : "Sukses menampilkan data",
      "data" : results
    });
  }
  })
})

  app.get('/get-animal-by-name', function (req, res) {
    const param = req.query;
    const name = param.name;
    const queryStr = 'SELECT id, name, description, price FROM animals WHERE name LIKE ? AND deleted_at IS NULL';
    const values = ['%' + name + '%'];
    conn.query(queryStr, values, (err, results) => {
      if (err) {
        console.log(err);
      } else {
        res.status(200).json({
          "success" : true,
          "message" : "Sukses menampilkan data",
          "data" : results
        });
      }
    })
  })

  app.post('/store-animal', function (req, res) {
    console.log(req.body);
    const param = req.body;
    const name = param.name;
    const description = param.description;
    const price = param.price;
    const queryStr = 'INSERT INTO animals (name, description, price) VALUES (?, ?, ?)';
    const values = [name, description, price];
  
    conn.query(queryStr, values, (err, results) => {
      if (err) {
        console.log(err);
        res.error(err.sqlMessage, res);
        res.status(500).json({
            "success": false,
            "message": err.sqlMessage,
            "data": null
        })
      } else {
        res.status(200).json({
          "success" : true,
          "message" : "Sukses menyimpan data",
          "data" : results
        });
      }
    })
  })

  app.post('/update-animal', function (req, res) {
    const param = req.body;
    const id = param.id;
    const name = param.name;
    const description = param.description;
    const price = param.price;
    const now = new Date();

    const queryStr = 'UPDATE animals SET name = ?, description = ?, price = ?, updated_at = ? WHERE id = ? AND deleted_at IS NULL';
    const values = [name, description, price, now, id];

    conn.query(queryStr, values, (err, results) => {
      if (err) {
        console.log(err);
        res.status(500).json({
            "success" : false,
            "message" : err.sqlMessage,
            "data" : null
          });
      } else {
        res.status(200).json({
          "success" : true,
          "message" : "Sukses mengubah data",
          "data" : results
        });
      }
    })
  })

  app.post('/delete-animal', function (req, res) {
    const param = req.body;
    const id = param.id;
    const queryStr = 'UPDATE animals SET deleted_at = ? WHERE id = ?';
    const now = new Date();
    const values = [now, id];
    conn.query(queryStr, values, (err, results) => {
      if (err) {
        console.log(err);
        res.status(500).json({
            "success" : false,
            "message" : err.sqlMessage,
            "data" : null
          });
      } else {
        res.status(200).json({
          "success" : true,
          "message" : "Sukses menghapus data",
          "data" : results
        });
      }
    })
  })

app.listen(3000);
