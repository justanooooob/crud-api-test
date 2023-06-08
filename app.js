const express = require("express");
const app = express();
const Multer = require('multer');
const util = require('util');
const bodyParser = require("body-parser");
const sharp = require('sharp');
const axios = require('axios');
const ndarray = require('ndarray');
const { Image } = require('image-js');
const { getPixels } = require('ndarray-pixels');

const conn = require("./config/db");
const { upload } = require('./config/bucket');
const { animals } = require('./models');



app.use(express.json());
  




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
  
      const query = `SELECT id, name, description, price,image 
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
  if(err){
    return res.status(500).json({
      message: "Internal server error"
    })
  } else if(id == undefined){
    return res.status(404).json({
      message: "Animal not found"
    })
  } 
  else {
    return res.status(200).json({
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
        return res.status(500).json({
          message: "Internal server error"
        })
      } else if(name == undefined){
        return res.status(404).json({
          message: "Animal not found"
        })
      } else {
        return res.status(200).json({
          "success" : true,
          "message" : "Sukses menampilkan data",
          "data" : results
        });
      }
    })
  })

  app.post('/store-animal', async function (req, res) {
    let processFile = Multer({
      storage: Multer.memoryStorage(),
    }).single("image");
   
   
    let parseFile = util.promisify(processFile);
    await parseFile(req, res)
   
    // upload to GCS
    const url = await upload(req.file);
    //
    /*const photo = animals.build({image: url})
    
    photo
    .save()
    .then((_) => {
      res.status(200).send({
        message: 'photo successfully uploaded'
      });
    })
    .catch((err) => {
      res.status(500).send({
        message: err
      });
    });*/
   
    console.log(req.body);
    const param = req.body;
    const name = param.name;
    const description = param.description;
    const price = param.price;
    const image = url;
    const queryStr = 'INSERT INTO animals (name, description, price, image) VALUES (?, ?, ?, ?)';
    const values = [name, description, price, image];
  
    conn.query(queryStr, values, (err, results) => {
      if (err) {
        return res.status(500).json({
            "success": false,
            "message": err.sqlMessage,
            "data": null
        })
      } else {
        return res.status(200).json({
          "success" : true,
          "message" : "Sukses menyimpan data",
          "data" : results
        });
      }
    })
  })

  app.post('/update-animal', async function (req, res) {
    let processFile = Multer({
      storage: Multer.memoryStorage(),
    }).single("image");
   
   
    let parseFile = util.promisify(processFile);
    await parseFile(req, res)
   
    // upload to GCS
    const url = await upload(req.file);
    const param = req.body;
    const id = param.id;
    const name = param.name;
    const description = param.description;
    const price = param.price;
    const image = url;
    const now = new Date();

    const queryStr = 'UPDATE animals SET name = ?, description = ?, price = ?, image = ?, updatedAt = ? WHERE id = ? AND deleted_at IS NULL';
    const values = [name, description, price, image, now, id];

    conn.query(queryStr, values, (err, results) => {
      if (err) {
        console.log(err);
        return res.status(500).json({
            "success" : false,
            "message" : err.sqlMessage,
            "data" : null
          });
      } else {
        return res.status(200).json({
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
        return res.status(500).json({
            "success" : false,
            "message" : err.sqlMessage,
            "data" : null
          });
      } else {
        return res.status(200).json({
          "success" : true,
          "message" : "Sukses menghapus data",
          "data" : results
        });
      }
    })
  })

  app.get('/get-seller', function (req, res) {
    const param = req.query;
    const id = param.id;
    const queryStr = 'SELECT id, name, email, phone FROM seller WHERE id = ?';
    const values = [id];
    conn.query(queryStr, values, (err, results) => {
      if (err) {
        return res.status(500).json({
          message: "Internal server error"
        })
      } else {
        return res.status(200).json({
          "success" : true,
          "message" : "Sukses menampilkan data",
          "data" : results
        });
      }
      })
    })

  app.post('/store-seller', function (req, res) {
    console.log(req.body);
    const param = req.body;
    const name = param.name;
    const email = param.email;
    const phone = param.phone;
    const queryStr = 'INSERT INTO seller (name, email, phone) VALUES (?, ?, ?)';
    const values = [name, email, phone];
  
    conn.query(queryStr, values, (err, results) => {
      if (err) {
        return res.status(500).json({
            "success": false,
            "message": err.sqlMessage,
            "data": null
        })
      } else {
        return res.status(200).json({
          "success" : true,
          "message" : "Sukses menyimpan data",
          "data" : results
        });
      }
    })
  })  





  // Experimental Zone KEEP OUT kekw

const fs = require('fs');
const { exec } = require('child_process');

const storage = Multer.diskStorage({
    destination: './uploads/',
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const resize = Multer({ storage: storage });


app.post('/pred', async (req, res) => {
  try {
    let processFile = Multer({
    storage: Multer.memoryStorage(),
  }).single("image");
   
   
  let parseFile = util.promisify(processFile);
  await parseFile(req, res)
   
  // upload to GCS
  const url = await upload(req.file);
  console.log(url)
  const file = req.file;
    if (!file) {
      res.status(400).json({ error: 'No file uploaded.' });
      return;
    }

    // Check the file type
    const allowedFileTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedFileTypes.includes(file.mimetype)) {
      res.status(400).json({ error: 'Invalid file type. Only JPG are allowed.' });
      return;
    }
  // Get the path of the uploaded file
  // const imagePath = req.file.path;

  // Download the image from the remote URL
  // const imageUrl = imagePath;
  const resize_response = await axios.get(url, { responseType: 'arraybuffer' });
  const imageData = resize_response.data;
  const imageName = url.substring(url.lastIndexOf('/') + 1);
  const filePath = '/var/www/Heiwan/downloads/';
  const downloadedFilePath = filePath + imageName;
  console.log(imageName);
  console.log(filePath);
  console.log(downloadedFilePath);

  // Save the downloaded image locally
  // const downloadedImagePath = '/var/www/Heiwan/downloads/downloaded.jpg';
  fs.writeFileSync(downloadedFilePath, Buffer.from(imageData, 'binary'));

  // python goes here
  const pythonScriptPath = '/var/www/Heiwan/pred3.py';
  const command = `python3 ${pythonScriptPath} "${downloadedFilePath}"`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error('Python script execution error:', error);
      res.status(500).json({ error: 'Python script execution failed.' });
    } else {
      try {
        const outputJson = JSON.parse(stdout);
        res.status(500).json({
          "success" : true,
          "message" : "Prediksi Sukses",
          "data" : outputJson
        });

        fs.unlink(downloadedFilePath, (err) => {
          if (err) {
            console.error('Error deleting file:', err);
            // Handle the error accordingly
          } else {
            console.log('File deleted successfully');
            // File deletion successful, proceed with other tasks or send a success response
          }
        });
      } catch (parseError) {
        console.error('Error parsing Python script output:', parseError);
        console.log(stdout)
        res.status(500).json({ error: 'Error parsing script output.' });
      }
    }
  });
  
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});


const port = 3000
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
