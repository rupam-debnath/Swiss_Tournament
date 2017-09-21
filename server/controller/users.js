var mysql      = require('mysql');
var session = require('express-session');
var connection = mysql.createConnection ({
  host     : 'localhost',
  user     : 'root',
  password : 'mountblue',
  database : 'swiss_tournament'
});

connection.connect(function(err){
  if(!err) {
    console.log("Database is connected ... nn");
  } else {
    console.log("Error connecting database ... nn");
  }
});


function registerTour(t_name,u_id,cb)
{//check if tournament already exists
  var sql1= `select t_name from tournaments where u_id='${u_id}' and t_name='${t_name}';`
  connection.query(sql1,function(err,result)
  {
    console.log(result);
    console.log(result.length);
    if(result.length==0)
    {
      var status = "Yet to start";
      var winner = "Yet to be declared";
      //create new tournament
      connection.query('INSERT INTO tournaments(t_name,u_id,status,winner) values ("'+t_name+'","'+u_id+'","'+status+'","'+winner+'")', function (error, results) {

        if (error)
        {
          cb(error,0);
        }
        else
        {
          connection.query('select * from tournaments where u_id=?',[u_id],function(err,result1){
            if(err)
            {
              cb(err,0);
            }
            else
            {
              console.log("result1: "+result1);
              cb(null,result1);
            }
          });
          //cb(null, results);
        }
      });
    }
    else
    {
     cb(err,0)
   }
 })
}

module.exports={
  registerTour: registerTour
}
