const express = require('express');
const router = express.Router({mergeParams: true});
const {validateReview, isLoggedIn, isReviewAuthor} = require('../middleware')

const Campground = require('../models/Campground');
const Review = require('../models/review');


const ExpressError = require('../utils/ExpressError')
const catchAsync = require('../utils/catchAsync')



router.post('/', isLoggedIn, validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save()
    await campground.save()
    req.flash('success', 'successfully made a new review!')
    res.redirect(`/campgrounds/${campground._id}`);
}))

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(async (req,res) => {
    const {id, reviewId} = req.params;
    await Campground.findByIdAndUpdate(id, {$pull: {reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId)
    req.flash('success', 'successfully deleted a review!')
    res.redirect(`/campgrounds/${id}`)
}))

module.exports = router;