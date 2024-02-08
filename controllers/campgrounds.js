const Campground = require('../models/Campground');

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
}

module.exports.createCampground = async(req, res, next)=>{
    const campground = new Campground(req.body.campground);
    campground.auther = req.user._id;
    await campground.save();
    req.flash('success', 'successfully made a new campground!')
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.showCampground = async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
        }).populate('author');
    if(!campground){
        req.flash('error', 'Campground cannot be found')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', { campground })
}

module.exports.renderEditForm = async(req,res) => {
    const campground = await Campground.findById(req.params.id)
    req.flash('success', 'successfully edited a campground!')
    res.render('campgrounds/edit', {campground})
}

module.exports.updateCampground = async (req, res) => {
    const {id} = req.params;
    const camp = await Campground.findByIdAndUpdate(id, {...req.body.campground})
    req.flash('success', 'successfully updated a campground!')
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.destroyCampground = async (req,res)=>{
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'successfully deleted a campground!')
    res.redirect('/campgrounds')
}