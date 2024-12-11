const Campground = require('../models/campground');
const { cloudinary } = require('../cloudinary')
const maptilerClient = require("@maptiler/client");
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});                
    res.render('campgrounds/index', {campgrounds});                           
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');                            //opens new campground creating page
}

module.exports.createCampground = async (req, res, next) => {
    //if(!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    const campground = new Campground(req.body.campground);
    const {features} = await maptilerClient.geocoding.forward(req.body.campground.location, {limit: 1});
    campground.geometry = features[0].geometry;
    campground.images = req.files.map(f => ({url: f.path, filename: f.filename})); // from multer storage
    console.log(req.files);
    campground.author = req.user._id;                                           //new campground making
    await campground.save();
    req.flash('success', 'Successfully made a new campground');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.showCampground = async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate({path:'reviews', populate:{path:'author'}}).populate('author');       // to display reviews related to that campground by particular auhtor and also display author of that campground
    console.log(campground);
    if(!campground){                                                  // shows the particlar campground
        req.flash('error', 'Cannot find that campgorund');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', {campground});
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if(!campground){
        req.flash('error', 'Cannot find that campgorund');                  // shows the particlar campground edit page
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', {campground});
}

module.exports.updateCampground = async (req, res)=>{
    const {id} = req.params;                                                              // editing/updating the campground.
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    const {features} = await maptilerClient.geocoding.forward(req.body.campground.location, {limit: 1});
    campground.geometry = features[0].geometry;
    const imgs = req.files.map(f => ({url: f.path, filename: f.filename})); // since images are an array
    campground.images.push(...imgs); // ... is spread operator used to involve all images
    await campground.save();
    if(req.body.deleteImage){
        for(let filename of req.body.deleteImage){
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: {images: {filename: {$in: req.body.deleteImage}}}});
        console.log(campground);
    }
    req.flash('success', 'Successfully updated campground');
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteCampground = async(req, res)=>{
    const {id} = req.params;
    const campground = await Campground.findById(id);
    await Campground.findByIdAndDelete(id);                               // deleting a campground
    req.flash('success', 'Successfully deleted campground');
    res.redirect('/campgrounds');
}
