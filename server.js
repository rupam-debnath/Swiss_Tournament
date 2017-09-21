var express = require('express');
var morgan = require('morgan');
var player = require('./server/controller/players');
var user = require('./server/controller/users');
var path = require('path');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
const api = require('./server/routes/api')();
var app = express();
var session = require('express-session');
var validator = require('express-validator');
var FileStore = require('session-file-store')(session);
var parse = bodyParser.urlencoded({ extended: true });
var cookieParser = require('cookie-parser');
var exphbs  = require('express-handlebars');
var passport = require('passport');
require('./config/passport')(passport);
var flash= require('connect-flash');
app.use(function (req, res, next) {
 res.locals.messages = require('express-messages')(req, res);
 next();
});
var router = express.Router();
var file = {
    path: "./tmp/session",
    useAsync: true,
    reapInterval: 5000,
    maxAge: 100000
}
var host = 'localhost';
var port= 5000;

/*--------------------------------------------------------------------------------------------*/

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
    store: new FileStore(file),
    secret: 'abbcccddddcccbba',
    resave:'false',
    saveUninitialized :'false'

}));


/*-------------------------------Set View Engine------------------------------------------------*/

app.engine('.hbs', exphbs({extname: '.hbs'}));
app.engine('.hbs', exphbs({defaultLayout: 'index.hbs'}));
app.set('view engine', 'hbs'); // set up hbs for templating


/*-----------------------------------------------------------------------------------------------*/
app.set('views',path.join(__dirname,'./views'));

app.use(express.static(__dirname+'/public'));
/*-----------------------------------------------------------------------------------------------*/
app.use(cookieParser('12345-54321-67890-09876'));//secret key
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

/*---------------------------------------------------------------------------------------------*/

require('./app/route.js')(app,passport);
app.use('/api',api);
app.listen(port);
