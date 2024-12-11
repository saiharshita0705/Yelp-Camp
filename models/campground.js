const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review')
const User = require('./user');

const imageSchema =  new Schema({
    url: String,                // from cloudinary
    filename: String,
})

imageSchema.virtual('thumbnail').get(function(){
    return this.url.replace('/upload', '/upload/w_300');
})

const opts = {toJSON: {virtuals: true}};  // includes virtuals to the schema

const campGroundSchema = new Schema({
    title: String,
    images: [imageSchema],
    geometry:{
        type:{
            type: String,
            enum: ['Point'],
            required: true,
        },                                   // structure in mongodb documentation 
        coordinates: {
            type: [Number],
            required: true,
        }
    },
    price: Number,
    description: String,
    location: String,
    author:{
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review',
        }
    ],
}, opts);

campGroundSchema.virtual('properties.popUpMarkup').get(function(){
    return `<strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
    <p>${this.description.substring(0, 20)}...</p>`;
})

campGroundSchema.post('findOneAndDelete', async function (campground) {
  if(campground){
    await Review.deleteMany({                    // mongoose middleware used to delete associated reviews with campground
        _id: {
            $in: campground.reviews
        }
    })
  }  
})

module.exports = mongoose.model('Campground', campGroundSchema);

