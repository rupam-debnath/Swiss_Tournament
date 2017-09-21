var mysql = require('mysql');
var session = require('express-session');
function get_connection() {
    var con = mysql.createConnection({
      host     : 'localhost',
      user     : 'root',
      password : 'mountblue',
      database : 'swiss_tournament'
  });
    con.connect(function(err) {
      if (err) throw err;
      console.log("Connected!");
  });
    return con;
}

function dropPlayers_t(cb){
    var con =get_connection();
    var sql="truncate players";
    con.query(sql,function(err,result){
        con.end();
        if(err){
            cb(err,0);
        }
        cb(null, result.affectedRows);
    })
}

function dropMatches_t(cb){
    var con=get_connection();
    var sql="truncate matches";
    con.query(sql,function(err,result){
        con.end();
        if(err){
            cb(err,0);
        }
        cb(null, result.affectedRows);
    })
}

function registerPlayers(p_name,t_id,u_id,cb)
{
    //check if player already exists in current tournament
    var connection=get_connection();
    var sql1= `select * from players where u_id='${u_id}' and p_name='${p_name}' and t_id='${t_id}';`
    connection.query(sql1,function(err,result)
    {
        console.log(result);
        console.log(result.length);
        if(result.length==0)
        {
            //register new player
            var sql='INSERT INTO players(p_name,t_id,u_id) values ("'+p_name+'","'+t_id+'","'+u_id+'")';
            connection.query(sql,function(err,result)
            {
                if(err)
                {
                    cb(err,0)
                }else
                {
                  connection.query('select p_name from players where u_id=? and t_id=?',[u_id,t_id],function(err,result1){
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
                 //cb(null, result.affectedRows);
             }
         });
        }
        else
        {
           cb(err,0)
       }
   })
}

function displayTours(u_id,cb){
    var con= get_connection();
    var sql="select * from tournaments where tournaments.u_id=?;"
    con.query(sql,u_id,function(err,result){
        //con.end();
        if(err||result==undefined) {
            cb(err,0);
        }
        //console.log("dispTour: "+result[0].t_name);
        cb(null, result);
    })
}

function displayPlayers(t_id,cb){
    var con= get_connection();
    var sql="select * from players,users where players.u_id=users.id and t_id=?;"
    con.query(sql,t_id,function(err,result){
        //con.end();
        if(err) {
            cb(err,0);
        }
        cb(null, result);
    })
}

function countPlayers(u_id,t_id,cb){
    //console.log('u_id: '+req.session.passport.user);
    console.log('t_id----------: '+t_id);
    var con= get_connection();
    var sql="select count(p_name) as total_players from players where u_id = (?) and t_id = (?);"
    con.query(sql,[u_id,t_id],function(err,rows,fields){
        if(err) {
            cb(err,0);
        }
        else{
            console.log('total players in lib: ',rows);
            cb(null, rows);
        }
    })
}

function getCurRound(t_id,cb){
    var connection = get_connection();
    var query = "select max(round) as cur_round from matches where t_id=?";
    connection.query(query,t_id,function(error, results){
        if(error)
            cb(error,null);
        else{
            console.log(results[0]);
            cb(null,results[0]);
        }
    })
}

function getRoundStatus(t_id,count,cb) {
    var connection = get_connection();
    var query = 'select max(round) cur_round from matches where t_id=?';
    connection.query(query, [t_id], function (error, results, fields) {
        //connection.end();
        if (error) {
            cb(error, 0);
        }
        else{
            var arr=[]
            for(var i=0;i<Math.log2(count);i++){
                arr.push('Not Started');
            }

            if(results[0].cur_round==null){
                cb(null, arr);
            }
            else{
                for(var i=0;i<results[0].cur_round;i++){
                    arr[i]='Completed';
                }
                console.log(arr);
                cb(null,arr);
            }

        }
    });
}

function setStatus(t_id,count,round,cb){
    var connection = get_connection();
    var query = `update tournaments set status='In progress' where t_id=?`
    if(round<Math.log2(count)){
        var status = 'In Progress'
        var query = `update tournaments set status='In progress' where t_id=?`
        connection.query(query,t_id,function(err,res){
            //connection.end();
            if(res){
                cb(null,status)
            }
        })
    }
    else {
        var status = 'Completed'
        var query = `update tournaments set status='Completed' where t_id=?`
        connection.query(query,t_id,function(err,reslt){
            //connection.end();
            if(reslt){
                cb(null,status);
            }
        })
    }
}

function getStatus(t_id,cb){
    var connection = get_connection();
    var query = `select status from tournaments where t_id=?`
    connection.query(query,t_id,function(err,res){
           // connection.end();
           if(res){
            cb(null,res)
        }
    })
}

function getFixture(t_id,round,cb)
{
    var pairing=[];
    var con=get_connection();
    if(round==1)
    {
        //session.round=1;
        var sql='select p_name from players where t_id=?;'
        console.log("for round 1");
        con.query(sql,t_id,function(err,result)
        {
            if(err) throw err;
            else
            {
                for(var i=0;i<result.length-1;i+=2)
                {
                    var first_player=result[i].p_name;
                    var second_player=result[i+1].p_name;
                    pairing.push(first_player,second_player);
                }
            }
            console.log(pairing);
            cb(0,pairing);
        })
    }
    else
    {
        //session.round++;
        console.log("current round: "+round);
        // if(session.round<=3)
        // {
            var sql="SELECT players.p_name FROM players LEFT JOIN matches ON matches.winner = players.p_name where players.t_id=? GROUP BY players.p_name ORDER BY COUNT(matches.winner) DESC;"
            console.log("for other rounds");
            con.query(sql,t_id,function(err,result)
            {
                if(err) throw err;
                var sql1="select winner, loser from matches;"
                con.query(sql1,function(err,results)
                {
                    if(err) throw err;
                    var matches=results;
                    while(result.length>0)
                    {
                        var first=result.splice(0,1);
                        var first_player=first[0].p_name;
                        for(var i=0;i<result.length;i++)
                        {
                            var second_player=result[i].p_name;
                            if(!((matches.winner==first_player&&matches.loser==second_player)||(matches.winner==second_player&&matches.loser==first_player)))
                            {
                                pairing.push(first_player,second_player);
                                result.splice(i,1);
                                break;
                            }
                        }
                    }
                    console.log(pairing);
                    cb(0,pairing);
                })
            })
        }
    }


    function reportMatch(t_id,round, winner, loser, cb)
    {
        var con =get_connection();
        var query = "insert into matches(player_1,player_2,winner,loser,round,t_id) values(?,?,?,?,?,?)";
        con.query(query, [winner, loser, winner, loser, round, t_id],
            function (error, results, fields) {
                if (error) {
                    cb(error, 0);
                }
                cb(null, results.affectedRows);
            });
    }

    function getMatchesCount(t_id,cb)
    {
        var con =get_connection();
        var query = "select count(m_id) as matchCount from matches where t_id=?";
        con.query(query, [t_id],
            function (error, results) {
                if (error) {
                    cb(error, 0);
                }
                cb(null, results[0].matchCount);
            });
    }

    function getStandings(t_id,round,cb)
    {
        var con=get_connection();
        console.log("getStandings t_id: "+t_id);
        console.log("getStandings round: "+round);
        var sql1= "SELECT player_1, player_2, winner FROM matches where t_id = ? and round= ? ;"
        con.query(sql1,[t_id,round],function(err,results)
        {
            if(err)
            {
                cb(err,0);
            }
            console.log(results);
            cb(0,results);
        })
    }

    function currentStandings(u_id,t_id,cb)
    {
        var con=get_connection();
        console.log("currentStandings t_id: "+t_id);
        //console.log("currentStandings u_id: "+req.session.passport.user);
        var sql = `select p.p_name as Name,
        ifnull(ws.wins, 0) as wins,ifnull(ls.loses,0) as loses

        from
        (select * from players where players.t_id = ?) as p
        left outer join
        ((select winner, count(*) as wins from matches
        where t_id = ?
        group by winner) as ws)
        on (p.p_name = ws.winner)
        left outer join
        ((select loser, count(*) as loses from matches
        where t_id = ?
        group by loser) as ls)
        on (p.p_name = ls.loser)
        where p.t_id = ? and p.u_id=?
        order by
        wins desc`
        con.query(sql,[t_id,t_id,t_id,t_id,u_id],function(err,results)
        {
            if(err)
            {
                cb(err,0);
            }
            console.log(results);
            cb(0,results);
        })
    }


    function getWinner(t_id,cb)
    {
        console.log("getWinner t_id: "+t_id);
        var con=get_connection();
        var sql1= "SELECT players.p_name FROM players LEFT JOIN matches ON matches.winner = players.p_name where players.t_id=? and matches.t_id=? GROUP BY players.p_name ORDER BY COUNT(matches.winner) DESC;"
        con.query(sql1,[t_id,t_id],function(err,results)
        {
            if(err)
            {
                cb(err,0);
            }
            console.log("players.p_name: ",results[0]);
            cb(0,results[0]);
        })
    }

    function updateWinner(t_id,winner,status,cb)
    {
        var con=get_connection();
        var sql1= `update tournaments set winner=? where t_id=?`
        con.query(sql1,[winner,t_id],function(err,results)
        {
            if(err)
            {
                cb(err,0);
            }
            else{
                var sql1= `update tournaments set status=? where t_id=?`
                con.query(sql1,[status,t_id],function(err,results)
                {
                    if(err)
                    {
                        cb(err,0);
                    }
                    console.log("winner updated into tour table");
                    cb(0,results);
                })
            }
        })
    }



    module.exports= {
        registerPlayers : registerPlayers,
        dropMatches_t : dropMatches_t,
        countPlayers : countPlayers,
        dropPlayers_t : dropPlayers_t,
        displayTours : displayTours,
        displayPlayers : displayPlayers,
        getStandings : getStandings,
        getFixture : getFixture,
        currentStandings: currentStandings,
        getRoundStatus: getRoundStatus,
        getCurRound: getCurRound,
        reportMatch: reportMatch,
        setStatus: setStatus,
        getWinner: getWinner,
        getStatus: getStatus,
        getMatchesCount: getMatchesCount,
        updateWinner: updateWinner

    }

