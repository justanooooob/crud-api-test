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
  
const resultsPerPage = 5;

app.get('/get-animals', (req, res) => {
    let sql = 'SELECT id, name, description FROM animals WHERE deleted_at IS NULL';
    conn.query(sql, (err, result) => {
        if(err) throw err;
        const numOfResults = result.length;
        const numberOfPages = Math.ceil(numOfResults / resultsPerPage);
        let page = req.query.page ? Number(req.query.page) : 1;
        if(page > numberOfPages){
            res.redirect('/get-animals?page='+encodeURIComponent(numberOfPages));
        }else if(page < 1){
            res.redirect('/get-animals?page='+encodeURIComponent('1'));
        }
        //Determine the SQL LIMIT starting number
        const startingLimit = (page - 1) * resultsPerPage;
        //Get the relevant number of POSTS for this starting page
        sql = `SELECT id, name, description FROM animals  WHERE deleted_at IS NULL LIMIT ${startingLimit},${resultsPerPage}`;
        conn.query(sql, (err, result)=>{
            if(err) throw err;
            let iterator = (page - 5) < 1 ? 1 : page - 5;
            let endingLink = (iterator + 9) <= numberOfPages ? (iterator + 9) : page + (numberOfPages - page);
            if(endingLink < (page + 4)){
                iterator -= (page + 4) - numberOfPages;
            } 
            res.status(200).json({data: result, page, iterator, endingLink, numberOfPages});
        });
    });
});

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

  app.get('/get-animal-by-name', function (req, res) {
    const param = req.query;
    const name = param.name;
    const queryStr = 'SELECT id, name, description FROM animals WHERE name LIKE ? AND deleted_at IS NULL';
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
