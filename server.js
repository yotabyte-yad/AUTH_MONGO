var express = require('express');
var app = express();

app.use(express.static(__dirname + '/public'));

var bodyParser = require('body-parser');
var multer = require('multer'); 
var upload = multer();

//Accessing database
var mongoose = require('mongoose');
var db = mongoose.connect('mongodb://localhost/test');


var passport = require('Passport');
var LocalStrategy = require('passport-local').Strategy;
var cookieParser = require('cookie-parser');
var session = require('express-session');


var UserSchema = new mongoose.Schema({
	username:  String,
	password:  String,
	email:     String,
	firstName: String,
	lastName:  String,
	roles:     [String]
});

var UserModel = mongoose.model("UserModel", UserSchema);

// var admin = new UserModel({username: 'alice', password: "alice", firstName: "Alice", lastName: "Wonderland", roles:["admin"]});
// var student = new UserModel({username: 'bob', password: "bob", firstName: "Bob", lastName: "Marley", roles:["student"]});
// admin.save();
// student.save();

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
//app.use(multer()); //parsing multipart/form data
app.use(session({secret: 'this is the secret'}));
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(
	function (username, password, done) {
		
		UserModel.findOne({username: username, password: password}, function (err, user){
			if(user){
				return done(null, user);
			}
			return done(null, false, {message:'Unable to login'});		
		});			
}));

passport.serializeUser(function(user, done){
	done(null, user);
});


passport.deserializeUser(function(user, done){
	done(null, user);
});

//upload.array(),
app.post("/login", upload.array(), passport.authenticate('local'), function (req, res){
	console.log("/login");
	console.log(req.user);
	res.json(req.user);
});

// app.get("/loggedin", upload.array(), passport.authenticate('local'), function (req, res){
// 	console.log('Till here 71');
// 	res.send(req.isAuthenticated() ? req.user : '0');
// });
//app.get("/loggedin", upload.array(), passport.authenticate('local'), function (req, res){
app.get("/loggedin", function (req, res){	
	res.send(req.isAuthenticated() ? req.user : '0');
});

app.post("/logout", function (req, res){
	req.logOut();
	res.send(200);
	
});

app.post("/register", function (req, res){
	UserModel.findOne({username: req.body.username}, function (err, user){
		if(user){
			res.json(null);
			return;			
		}
		else {
			var newUser = new UserModel(req.body);
			newUser.roles = ['student'];
			newUser.save(function (err, user){
					req.login(user, function(err){
						if(err){
							return next(err);
						}
						res.json(user);	
					});
			});
		}
	});
	var newUser = req.body;
	console.log(newUser);
});

var auth = function (req, res, next){
	if(!req.isAuthenticated())
		res.send(401);
	else
	    next();	
};


app.get("/rest/user", auth, function(req, res){
	UserModel.find(function (err, users){
		res.json(users);
	});
});

app.listen(3000);
console.log("Sever listening on port 3000");

