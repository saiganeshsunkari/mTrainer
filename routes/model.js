var router = require('express').Router();

router.get('/',function(req,res,next){
   console.log("from happy and routes/model.js");
   res.send("from happy and routes/model.js");
});


module.exports = router;