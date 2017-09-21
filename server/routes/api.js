var express = require('express');
var player = require('../controller/players');
var user = require('../controller/users');
var bodyParser = require('body-parser');
var parse = bodyParser.urlencoded({ extended: true });
var router = express.Router();
var app= express();
var validator= require('express-validator');
var session = require('express-session');

module.exports=function (){

  router.get('/',function(req,res){
    app.use(express.static(path.join(__dirname, '/index.html')));
    res.json({ message: 'welcome to Swiss Tournament' });
  })

  /*---------------------Register Tournaments------------------------------------------*/

  router.post('/registerTour',parse, function (req, res)
  {
    var t_name = req.body.name;
    var u_id= req.session.passport.user;

    console.log("req.body.u_id...",req.session.passport.user);
    console.log("creating tournament...",req.body.name);
    user.registerTour(t_name,req.session.passport.user,function(err,result)
    {
      console.log("registering tournament...");
      if (err)
      {
        console.log("Tournament creation error");
          //res.json(err);
          // res.send({
          //   "invalid":"Tournament name already exists",
          //   "code":400,
          //   "failed":"error ocurred"
          // });
        }
        else
        {
          console.log("Tournament created ",result);
          res.json(result);

        }
      });
  });

  /*--------------------Created Tournaments Display------------------------------------------*/

  router.post('/displayTours',function(req,res){
    player.displayTours(function(error,results){
      if (error) {
        console.log("error ocurred",error);
        res.send({
          "code":400,
          "failed":"error ocurred"
        })
      }else{
        console.log('Tournament t_name ', results.t_name);
        console.log('Tournament t_id ', results.t_id);
        res.render('createTour',{
          t_name: t_name,
          t_id: t_id,
          status: status,
          winner: winner
        });

      }
    });
  });


  /*--------------------Register Players for matches------------------------------------*/
  router.post('/addPlayer', parse ,function(req,res){
    var p_name = req.body.name;
    var t_id= req.body.t_id;
    var wins=0;
    var loses=0;
    console.log("p_name: "+p_name);
    console.log("t_id: "+t_id);
    console.log("u_id: "+req.session.passport.user);
    player.registerPlayers(p_name,t_id,req.session.passport.user,function(err,result){
      if (err) {
        console.log("error ocurred",err);
      // res.send({
      //   "invalid":"Entered player name already exists in current tournament",
      //   "code":400,
      //   "failed":"error ocurred"
      // })
    }else{
      console.log('Player details: ', result);
      res.json(result);
    }
  })
  })

  /*--------------------New Players Display------------------------------------------*/
  router.post('/displayPlayers',parse,function(req,res){
    var t_id= req.body.t_id;
    var wins=0;
    var loses=0;
    player.displayPlayers(t_id,function(error,results){
      if (error) {
        console.log("error ocurred",error);
        res.send({
          "code":400,
          "failed":"error ocurred"
        })
      }else{
        console.log('Player details: ', results);
        res.render('createTour',{
          p_name: p_name,
          p_id: p_id,
          wins: wins,
          loses: loses
        });

      }
    });
  });

  /*----------------Get matches played----------------------------------------------*/


  router.post('/getMatchesCount',parse,function(req,res){
    var t_id= req.body.t_id;
    player.getMatchesCount(t_id,function(error,results){
      if (error) {
        console.log("error ocurred",error);

      }else{
        console.log('Match count: ', results);
        res.json({
          "matchCount": results
        })

      }
    });
  });




  /*-----(Count Players, Round Status and Current Round) after on click Start Tour button-------*/
  router.post('/countPlayers',parse,function(req,res)
  {
    var t_id= req.body.t_id;
    var u_id= req.session.passport.user;
    console.log("t_id: "+t_id);
    console.log("u_id: "+req.session.passport.user);
    player.countPlayers(u_id,t_id,function(error,results)
    {
      if (error)
      {
        console.log("Please enter 2^n players",error);
        res.json({"ms":"Please enter 2^n players"});
      }else
      {

        console.log('Total players: ', results[0].total_players);
        var count=results[0].total_players;
        console.log('count: ', results[0].total_players);
        player.getRoundStatus(t_id,count,function(error,status)
        {
          if(error)
          {
            console.log("getRoundStatus error");
          }else
          {
            console.log('status: ', status);
            player.getCurRound(t_id,function(error,cur_round)
            {
              if(error)
              {
                console.log("getCurRound error");
              }else
              {
                console.log('cur_round: ', cur_round);
                res.json({  "count":count,
                  "t_id": t_id,
                  "status":status,
                  "cur_round":cur_round,
                  "players": results[0].total_players
                })
              }
            })
          }
        })
      };
    });
  });



  /*---------------------Return Router-------------------------------------------------*/
  return router;
}
