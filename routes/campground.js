const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync')
const { campgroundSchema} = require('../schemas.js');
const {isLoggedIn} = require('../middleware')

const ExpressError = require('../utils/ExpressError')
const Campground = require('../models/Campground');

const validateCampground = (req, res, next) => {
    const {error} = campgroundSchema.validate(req.body)
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {next()}
}

router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', { campgrounds })
}))

router.get('/new', isLoggedIn, (req, res) => {
    res.render('campgrounds/new');
})

router.post('/', isLoggedIn, validateCampground, catchAsync(async(req, res, next)=>{
    const campground = new Campground(req.body.campground);
    await campground.save();
    req.flash('success', 'successfully made a new campground!')
    res.redirect(`/campgrounds/${campground._id}`)
}))

router.get('/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews');
    if(!campground){
        req.flash('error', 'Campground cannot be found')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', { campground })
}))

router.get('/:id/edit', catchAsync(async(req,res) => {
    const campground = await Campground.findById(req.params.id)
    req.flash('success', 'successfully edited a campground!')
    res.render('campgrounds/edit', {campground})
}))

router.put('/:id', validateCampground, catchAsync(async (req, res) => {
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground})
    req.flash('success', 'successfully updated a campground!')
    res.redirect(`/campgrounds/${campground._id}`)
}))

router.delete('/:id', catchAsync(async (req,res)=>{
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'successfully deleted a campground!')
    res.redirect('/campgrounds')
}))

module.exports = router