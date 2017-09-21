var mysql = require('mysql');
var path = require('path');
var dbconfig = require('../config/database');
var connection = mysql.createConnection(dbconfig.connection);
connection.query('USE ' + dbconfig.database);
var player = require('../server/controller/players');
var user = require('../server/controller/users');
var passport = require('passport');
var express = require('express');
var router = express.Router();
var bcrypt= require('bcrypt');
const saltRounds = 8;

module.exports = function(app,passport){

    app.get('/', function(req, res) {

        res.render('index');
    });


    app.route('/register')

    .get(function(req, res) {

        res.render('register');
    })

    app.post('/register', function(req, res, next) {
        passport.authenticate('local-signup', { failureFlash : true }, function(err, user, info) {
            if (err) {
                 res.status(500).send(JSON.stringify({
                    'msg': "Internal Server Error"
                }));
            }
            if (!user) {
               return res.render('register', { message: req.flash('signupMessage') });
            }
            req.login(user, function(err) {
                if (err) return next(err);
                req.session.save(function(err) {
                    if (!err) {
                        return res.render('login', { msg: req.flash('signupMessage') });
                    }
                    else {
                        console.log('error occured during session save');
                    }
                });
            });
        })(req, res, next);
    });



    app.route('/login')

    .get(function(req, res) {
        res.render('login');
    })

    app.post('/login', function(req, res, next) {
        passport.authenticate('local-login', { failureFlash : true }, function(err, user, info) {
            if (err) {
               res.status(500).send(JSON.stringify({
                'msg': "Internal Server Error"
                }));
            }
           if (!user) {
            return res.render('login',{ message: req.flash('loginMessage') });
        }
        req.login(user, function(err) {
            if (err) return next(err);
            req.session.save(function(err) {
                if (!err) {
                    return res.redirect('/createTour');
                }
                else {
                    console.log('error occured during session save');
                }
            });
        });
    })(req, res, next);
});


    app.get('/logout', function(req, res) {

      req.session.destroy(function (err) {
        console.log("COOKIE DELETED");
        res.render('login');
    });
  });
    /*------------------Routes for create Tournament page-----------------------------*/
    app.route('/createTour')

    .get(function(req, res)
    {

        console.log("req.session: "+req.session.passport);
        player.displayTours(req.session.passport.user,function(err,result)
        {
            if(err)
                cb(err,0);
            else{
                console.log("start rendering......");
                res.render('createTour.hbs',{result: result,
                    userId: req.session.passport.user
                });
            }

        })
    })


    /*-----------------Routes for final Tournament page-----------------------------*/

    app.get('/tournament/:id/:name',isLoggedIn,function(req, res) {
        var tour_id = req.params.id;
        var u_id = req.session.passport.user;
        player.displayPlayers(tour_id, function(err,result)
        {
            if(err)
                cb(err,0);
            else{
                player.currentStandings(u_id,tour_id, function(err,cur_result)
                {
                    if(err)
                        cb(err,0);
                    else{
                        player.getStatus(tour_id, function(err,t_status)
                        {
                            if(err)
                                cb(err,0);
                            else{
                                console.log("t_status: ",t_status);
                                res.render('tournament',{title: 'Tournament ',
                                    t_id : tour_id,
                                    t_name : req.params.name,
                                    t_status: t_status[0].status,
                                    result: result,
                                    cur_result: cur_result
                                });
                            }
                        })
                    }
                })
            }
        });
    });

//-------------------- Get swiss pair for round execution -------------------------//

app.get('/getFixture/:round/:t_id',isLoggedIn,function(req,res,next){
    var t_id = req.params.t_id;
    var u_id = req.session.passport.user;
    var round = req.params.round;
    console.log("getFixture t_id: "+t_id);
    console.log("getFixture round : "+round);
    player.getFixture(t_id,round,function(error,data){
        if(error)
            res.end('Error');
        else{
            res.json({"pairs":data,"round":round});
        }

    })
});

//----------- Report Match(Update matches table & change round status) -------------------------//
app.post('/reportMatch',isLoggedIn,function(req,res,result){
    var t_id = req.body.t_id;
    var u_id = req.session.passport.user;
    var roundInfo = req.body.roundDetails;
    console.log("/reportMatch t_id: "+t_id);
    console.log("/reportMatch roundInfo: "+roundInfo);
    roundInfo.forEach(function(match){
        player.reportMatch(t_id,match.round,match.winner,match.loser,function(error,res){
            if(error){
                // res.json({"msg":"error"})
            }
            else {
                console.log("Updated matches table");
            }
        })
    })
    player.countPlayers(u_id,t_id,function(err,count){
        if(err){

        }
        else {
            player.setStatus(t_id,count[0].total_players,roundInfo[0].round,function(error,status){
                if(error){

                }
                else{
                    res.json({
                        "count":count[0].total_players,
                        "round":roundInfo[0].round,
                        "status":status,
                        "t_id":t_id
                    })
                }
            })
        }
    })

})
//-------------------- Show Current Standings(Table 2) -------------------------//
app.post('/showStanding',isLoggedIn,function(req,res,next){
    var t_id = req.body.t_id;
    var u_id = req.session.passport.user;
    console.log("/showStanding t_id:---------- "+t_id);
    player.currentStandings(u_id,t_id,function(error,data){
        if(error)
            res.end('Error');
        else{
            res.json(data);
        }

    })
});

//-------------------- Enable/Disable buttons -------------------------//

app.post('/buttonDisable',isLoggedIn,function(req,res,next){
    var t_id = req.body.t_id;
    var u_id = req.session.passport.user;
    console.log("/buttonDisable t_id: "+t_id);
    console.log("/buttonDisable u_id: "+u_id);
    player.countPlayers(u_id,t_id,function(error,x){
        if(error)
            res.end('Error occured');
        else{
            player.getCurRound(t_id,function(error,cur_round){
                if(error){

                }
                else{
                    console.log(x,cur_round)
                    res.json({
                        "count":x,
                        "cur_round":cur_round
                    })
                }
            })
        }
    })

})
//-------------------- Show Standings for individual round(Table 3) -------------------------//

app.get('/getStandings/:round/:t_id',isLoggedIn,function(req,res,next){
    var round = req.params.round;
    var t_id = req.params.t_id;
    player.getStandings(t_id,round,function(err,result){
        if(err){

        }
        else{
            res.json({"data":result})
        }
    })
})
//-------------------- Declare winner -------------------------//

app.get('/winner/:t_id',isLoggedIn,function(req,res,next){
    var t_id = req.params.t_id;
    console.log("/winner t_id:------------- "+t_id);
    player.getWinner(t_id,function(error,data){
        if(error)
            res.end('Error');
        else{
            var status="Completed";
            player.updateWinner(t_id,data.p_name,status,function(error,result){
                if(error)
                    res.end('Error');
                else{
                    console.log("winner updated");
                    console.log("winner is: "+data);
                    res.json({"winner":data})
                }

            })
        }
    })
});

//------------------------checkSignIn--------------------------//

function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
      return next();
  }
  else {
      res.redirect('/');
  }
}
//------------------------xxxxxxxxxx-------------------------//

}
