const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const Campground = require('./models/Campground');
const ejsMate = require('ejs-mate');
const catchAsync = require('./utils/catchAsync')
const ExpressError = require('./utils/ExpressError')
const Joi = require('joi')
const { campgroundSchema, reviewSchema } = require('./schemas.js');
const methodOverride = require('method-override')
const Review = require('./models/review');

const campgrounds = require('./routes/campground');

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

app.engine('ejs', ejsMate)
app.use(express.urlencoded({ extended: true}))
app.use(methodOverride('_method'))

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {next()}
}

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use('/campgrounds', campgrounds)

app.get('/', (req, res) => {
    res.render("home")
})



app.post('/campgrounds/:id/reviews', validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save()
    await campground.save()
    res.redirect(`/campgrounds/${campground._id}`);
}))

app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync(async (req,res) => {
    const {id, reviewId} = req.params;
    await Campground.findByIdAndUpdate(id, {$pull: {reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId)
    res.redirect(`/campgrounds/${id}`)
}))

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const {statusCode = 500 } = err;
    if(!err.message) err.message = 'Something Went Wrong :(';
    res.status(statusCode).render('error', {err});
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
});