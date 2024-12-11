const mongoose = require('mongoose');
const cities = require('./cities');
const {places, descriptors} = require('./seedHelpers');
const Campground = require('../models/campground');

require("dotenv").config();
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';

mongoose.connect(dbUrl);
  
const db = mongoose.connection;
db.on("error", console.error.bind(console, 'Connection Error'));
db.once("open", () => {
    console.log("Database Connected");
});

const sample = (array) =>{
    return array[Math.floor(Math.random()*array.length)]
}

const seedDB = async() => {
    await Campground.deleteMany({});
    for(let i=0; i < 400; i++){
        const random1000 = Math.floor(Math.random()*1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: '6758e41fcb7e88520a93d1d3',  // Personal author ID
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            // image: `http://picsum.photos/400?random=${Math.random()}`,
            description: 'Check out the campground for exciting experience. This campground rejunuvates the energy that you lost from your work stress. Enjoy the holiday exploring amazing places around, trying few fun activites. Feel youeself again!!!',
            price: price,
            geometry: {

                type: "Point",
                coordinates: [cities[random1000].longitude, cities[random1000].latitude]

            },
            images: [
                {
                  url: 'https://res.cloudinary.com/dndtptavq/image/upload/v1733935754/YelpCamp/zymz8v1cpvvjggevyma8.jpg',
                  filename: 'YelpCamp/zymz8v1cpvvjggevyma8',
                },
                {
                  url: 'https://res.cloudinary.com/dndtptavq/image/upload/v1733603339/YelpCamp/nco0uatdhhfvasu3x3ac.jpg',
                  filename: 'YelpCamp/c8vfrlso5lxozvstqgsf',
                },
                {
                  url: 'https://res.cloudinary.com/dndtptavq/image/upload/v1733603339/YelpCamp/ym22fzrc7wyz5wkl1f4w.jpg',
                  filename: 'YelpCamp/fcceoquyeka9rb080znt',
                },
                {
                  url: 'https://res.cloudinary.com/dndtptavq/image/upload/v1733603339/YelpCamp/ym22fzrc7wyz5wkl1f4w.jpg',
                  filename: 'YelpCamp/mxe9zsm9upgi5yjwfb6q',
                },
                {
                  url: 'https://res.cloudinary.com/dndtptavq/image/upload/v1733603339/YelpCamp/ym22fzrc7wyz5wkl1f4w.jpg',
                  filename: 'YelpCamp/y2ds3buzsjibijayue9o',
                }
              ],
            
        })
        await camp.save();
    }
}

seedDB().then(()=>{
    mongoose.connection.close();
});