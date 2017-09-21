var LocalStrategy   = require('passport-local').Strategy;
var bcrypt = require('bcrypt');
const saltRounds = 10;
var mysql = require('mysql');
var dbconfig = require('./database');
var connection = mysql.createConnection(dbconfig.connection);
connection.query('USE ' + dbconfig.database);
module.exports = function(passport) {

    passport.serializeUser(function(user, done) {
        console.log("user.id: ----------- "+user.id)
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        console.log("inside passport.deserializeUser");
        connection.query("SELECT * FROM users WHERE id = ? ",[id], function(err, rows){
            done(err, rows[0]);
        });
    });



    passport.use(
        'local-signup',
        new LocalStrategy({
            //u_nameField: 'u_name',
            usernameField : 'email',
            passwordField : 'password',
            passReqToCallback : true
        },
        function(req, email, password, done) {
            console.log("email: "+email);
            console.log("password: "+password);
            if(email==undefined||password==undefined){
                return done(null, false, req.flash('signupMessage', 'Email ID or password cannot be empty!'));
            }else{
            connection.query("SELECT * FROM users WHERE email = ?",[email], function(err, rows) {
                if (err)
                    return done(err);
                if (rows.length) {
                    return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
                } else {
                    var newUserMysql = {
                       // u_name: req.body.u_name,
                       email: email,
                       password: bcrypt.hashSync(password,8)
                   };
                   //console.log("regPass: "+password);
                    //console.log("bcryptPass: "+bcrypt.hashSync(password, 8));

                    var insertQuery = "INSERT INTO users ( email, password ) values (?,?)";

                    connection.query(insertQuery,[newUserMysql.email, newUserMysql.password],function(err, rows) {
                        newUserMysql.id = rows.insertId;

                        return done(null, newUserMysql);
                    });
                }
            });
        }
    })
);



    passport.use(
        'local-login',
        new LocalStrategy({
            usernameField : 'email',
            passwordField : 'password',
            passReqToCallback : true
        },
        function(req, email, password, done) {
            connection.query("SELECT * FROM users WHERE email = ?",[email], function(err, rows){
                //console.log("logPass: "+rows[0].password);
                //console.log("entPass: "+password);
                //console.log("hashPass: "+bcrypt.compareSync(password, rows[0].password));
                //var dbPassword = rows[0].password;

                if (err){
                    console.log("1st err");
                    return done(err);
                }
                if (!rows.length) {
                    console.log("2nd err");
                    return done(null, false,req.flash("loginMessage","Please check your username!"));
                }
                if (!bcrypt.compareSync(password,rows[0].password)){
                    console.log("errrrrrrrr");
                    return done(null, false,req.flash("loginMessage","Please check your password!"));
                }
                //console.log("success");
                //console.log("final user_id: "+rows[0].id);
                return done(null, rows[0],req.flash("loginMessage",""));
            });
        })
    );
};
