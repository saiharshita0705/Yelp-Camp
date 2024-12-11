if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}




const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const Campground = require('./models/campground');
const methodOverride = require('method-override');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');


const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');

const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');

const dbURL = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';

//mongoose.connect('mongodb://localhost:27017/yelp-camp');  // local host
mongoose.connect(dbURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });


const ejsMate = require('ejs-mate');
// const {campgroundSchema, reviewSchema} = require('./schemas')
// const Review = require('./models/review')

// const campgrounds = require('./routes/campgrounds')       // before

// const reviews = require('./routes/reviews');

const campgroundRoutes = require('./routes/campgrounds')    
const reviewRoutes = require('./routes/reviews');
const MongoStore = require('connect-mongo')
const userRoutes = require('./routes/users');


const session = require('express-session');

const flash = require('connect-flash')



const db = mongoose.connection;
db.on("error", console.error.bind(console, 'Connection Error'));
db.once("open", () => {
    console.log("Database Connected");
});

const secret = process.env.SECRET || 'thisshouldbeasecret!';
const store = MongoStore.create({
    mongoUrl: dbURL,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: secret,
    }
});

store.on("error", function (e) {
  console.log("SESSION STORE ERROR", e);
})

const sessionConfig = {
    store: store,
    name: 'session',
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
    }
}

const app = express();
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public'))) //static assets

app.use(session(sessionConfig))
app.engine('ejs', ejsMate)

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(flash());

app.use(mongoSanitize({
    replaceWith: '_'
}));

app.use(helmet());
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    // "https://api.tiles.mapbox.com/",
    // "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/", // add this
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    // "https://api.mapbox.com/",
    // "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/", // add this
];
const connectSrcUrls = [
    // "https://api.mapbox.com/",
    // "https://a.tiles.mapbox.com/",
    // "https://b.tiles.mapbox.com/",
    // "https://events.mapbox.com/",
    "https://api.maptiler.com/", // add this
];


const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc:[
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dndtptavq/",
                "https://images.unsplash.com/",
                "https://api/maptiler.com/"
            ],
            fontSrc: ["'self'", ...fontSrcUrls]
        },
    })
)

app.use(passport.initialize());                   ///////////// PASSPORT ///////////////
app.use(passport.session()); 


passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next) => {
    console.log(req.query);
    res.locals.currentUser = req.user;          // user who is logged in currently. details are from passport
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.get('/fakeUser', async(req, res) => {
    const user = new User({ email: 'harshu@gmail.com', username: 'harshu'});
    const newUser = await User.register(user, 'chicken');
    res.send(newUser);

})


app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);      // from router

app.use('/campgrounds/:id/reviews', reviewRoutes);  // from router



// app.get('/makeCampground', async (req, res) => {
//     const camp = new Campground({title: 'My Backyard', description: 'Cheap Camping!'})
//     await camp.save()
//     res.send(camp);
// })


app.get('/', (req, res) => {
    res.render('home');
})

app.all('*', (req, res, next) =>{
    next(new ExpressError('Page Not Found', 404));
})

app.use((err, req, res, next) => {
    const {message = 'Something Went Wrong', status = 500} = err;
    if(!err.message) err.message = 'Something Went Wrong'
    res.status(status).render('error', { err }); 
})

app.listen(3000, ()=>{
    console.log("we are in port 3000");
})