const mongoose = require('mongoose');
const cities = require('./cities');
const {places, descriptors} = require('./seedHelpers');
const Campground = require('../models/campground');
mongoose.connect('mongodb://localhost:27017/yelp-camp');

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
            author: '674d03855ff740ea13a45bda',  // Personal author ID
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            // image: `http://picsum.photos/400?random=${Math.random()}`,
            description: 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Incidunt similique delectus ratione, ducimus id soluta at ea corporis dolor quae commodi itaque cupiditate temporibus sapiente, iste, quidem debitis? Accusantium, quae?',
            price: price,
            geometry: {

                type: "Point",
                coordinates: [cities[random1000].longitude, cities[random1000].latitude]

            },
            images: [
                {
                  url: 'https://res.cloudinary.com/dndtptavq/image/upload/v1733603339/YelpCamp/rqsu3xylepvcwnsyguiw.jpg',
                  filename: 'YelpCamp/rqsu3xylepvcwnsyguiw',
                },
                {
                  url: 'https://res.cloudinary.com/dndtptavq/image/upload/v1733603339/YelpCamp/nco0uatdhhfvasu3x3ac.jpg',
                  filename: 'YelpCamp/nco0uatdhhfvasu3x3ac',
                },
                {
                  url: 'https://res.cloudinary.com/dndtptavq/image/upload/v1733603339/YelpCamp/ym22fzrc7wyz5wkl1f4w.jpg',
                  filename: 'YelpCamp/ym22fzrc7wyz5wkl1f4w',
                }
              ],
            
        })
        await camp.save();
    }
}

seedDB().then(()=>{
    mongoose.connection.close();
});