// importing the required modules
var getMyIP = require('get-my-ip')

var express = require('express');
var multer = require('multer');
var mongoose = require('mongoose');
const port=process.env.PORT || 1000;

// connecting to a mongodb database at  port 27017 (Pepperfry) 
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Pepperfry', { useNewUrlParser: true });
// mongoose.connect('mongodb://localhost:27017/test', {useNewUrlParser: true});
var app = express();
var mkdirp = require('mkdirp');

// mongodb schema variable 
var armodels = new mongoose.Schema({
  days:{
    type:Number
  },
  modelname:String,
  price:Number,
  isarenabled:Boolean,
  maxscale:Number,
  sfa:String,
  sfb:String,
  png:String


}, { strict: false });

//instantiating the schema 
var Model = mongoose.model('Model', armodels);

//  used to store files within a specified dir in the server 
var storage = multer.diskStorage({
  destination: function (req, file, cb) {

    mkdirp('./uploads/' + req.params.id, function (err) {

      if (err)
        console.log(err);
      else
        cb(null, './uploads/' + req.params.id);

    })

  },
  filename: function (req, file, cb) {
    console.log(file);
    cb(null, file.originalname) //Appending .jpg
  }
})




app.get('/all', (req, res) => {
  Model.find().then((doc) => {
    res.status(200).send(doc);
  }).catch((err)=>{
    res.status(500).send(err);
    })
})
app.get('/getmodel/:id', (req, res) => {
  console.log(req.params.id.toString());
  
  Model.findById(req.params.id.toString()).then((doc) => {
    
//     var obj=doc[0];
//     var dynamicip="http://"+getMyIP()+":1000";
//  obj.sfa=dynamicip+obj.sfa;
//  obj.sfb=dynamicip+obj.sfb;
//  obj.png=dynamicip+obj.png;
 


 res.status(200).send(doc);
  }).catch((err)=>{res.status(500).send(err)})
})
var upload = multer({ storage: storage });
app.post('/fileupload/:id', upload.array('avatar', 3), function (req, res, next) {

  if (!req.files) {
    console.log("No file received");
    return res.status(500).send({
      success: false
    });

  } else {

    var obj = {}
    var modeldetails = req.files;
    modeldetails.forEach((element) => {
      //  console.log(element.filename);
      var t = element.originalname.split('.');
      var x = t[t.length - 1].toLowerCase();

      obj[`${x}`] = "/uploads/" + req.params.id + '/' + element.originalname;

    })
    obj["modelname"] = req.params.id;
    obj["price"] = req.body.price;
    obj["isarenabled"] = req.body.isarenabled;
    obj["days"] = req.body.days;
    obj["maxscale"] = req.body.maxscale;
    const au = new Model(obj);
    au.save().then((doc) => {
      res.status(200).send(doc);
    })


  }
})
var path = require('path');

app.get('/uploads/:id/:i', (req, res) => {
  console.log(req.params.id, req.params.i);
  var path = require('path');
  var fs = require('fs');
  var file = path.join(__dirname, './uploads/' + req.params.id + '/' + req.params.i);
  var data = fs.readFileSync(file);
  res.send(data);

})
app.get('/test',(req,res)=>{
res.send("hello world");
})
app.listen(port, (req, res) => {
  console.log("Server is running")
})