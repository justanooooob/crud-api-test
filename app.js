const express = require("express");
const app = express();
const conn = require("./config/db");

app.use(express.json())

app.get('/get-animals', function (req, res) {
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
  })

  app.get('/get-animal-by-id', function (req, res) {
    const param = req.query;
    const id = param.id;
    const queryStr = 'SELECT id, name, description FROM animals WHERE id = ? AND deleted_at IS NULL';
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

  app.post('/store-animal', function (req, res) {
    console.log(req.body);
    const param = req.body;
    const name = param.name;
    const description = param.description;
    const queryStr = 'INSERT INTO animals (name, description) VALUES (?, ?)';
    const values = [name, description];
  
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
    const now = new Date();

    const queryStr = 'UPDATE animals SET name = ?, description = ?, updated_at = ? WHERE id = ? AND deleted_at IS NULL';
    const values = [name, description, now, id];

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
