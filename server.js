/********************************************************************************** 
 * WEB322 – Assignment 04* I declare that this assignment is my own work in accordance with Seneca Academic Policy. 
 * No part* of this assignment has been copied manually or electronically from any other source* 
 * (including 3rd party web sites) or distributed to other students.** Name: Stebin George
 * Student ID: 120277223 Date: Nov 15, 2023 ** Online (Cyclic) Link: https://graceful-dog-trunks.cyclic.app/blog
 * *********************************************************************************/

const multer = require("multer");
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')
const express = require('express');
const exphbs = require('express-handlebars'); // Move this line up
const app = express();
const blogData = require("./blog-service");
const path = require("path");
const blogService = require("./blog-service.js");
const stripJs = require('strip-js');
const Handlebars = require('handlebars');




cloudinary.config({
    cloud_name: 'derlwpyf6',
    api_key: '691953784436571',
    api_secret: 'Tz1OauNIs8TUsSHfybLsCr9G21c',
    secure: true
});

const upload = multer(); 
// Define your custom helpers in an object
const hbsHelpers = {
    navLink: function(url, options) {
        return '<li' +
            (url == app.locals.activeRoute ? ' class="active"' : '') +
            '><a href="' + url + '">' + options.fn(this) + '</a></li>';
    },
    equal: function(lvalue, rvalue, options) {
        if (arguments.length < 3)
            throw new Error("Handlebars Helper 'equal' needs 2 parameters");
        return lvalue == rvalue ? options.fn(this) : options.inverse(this);
    },
    safeHTML: function(context) {
        return new Handlebars.SafeString(stripJs(context));
    }
    // Add more custom helpers if needed
};

// Create an instance of express-handlebars with the custom helpers
const hbs = exphbs.create({
    extname: '.hbs',
    helpers: hbsHelpers,
    safeHTML: function(context){return stripJs(context);}
});

// Configure the view engine using the instance of express-handlebars with helpers
app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');

const HTTP_PORT = process.env.PORT || 8080;
app.use(express.static('public'));

Handlebars.registerHelper('safeHTML', function(options) {
    return new Handlebars.SafeString(options.fn(this));
});

// Middleware to set the current path for active CSS class in the navbar
app.use(function(req, res, next){
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    app.locals.viewingCategory = req.query.category;
    next();
});

app.get('/', (req, res) => {
    res.redirect('/blog');
});
// Route for "about" page
app.get("/about", (req, res) => {
    res.render('about');
});

// Route for "add post" page
app.get("/posts/add", upload.single("featureImage"), (req, res) => {
    res.render("addPost");
});

// Routes for "posts" page with optional query parameters
app.get("/posts", (req, res) => {
    const { category, minDate } = req.query;

    if (category) {
        blogData.getPostsByCategory(category)
            .then((data) => res.render("posts", { posts: data }))
            .catch((error) => res.render("posts", { message: "no results" }));
    } else if (minDate) {
        blogData.getPostsByMinDate(minDate)
            .then((data) => res.render("posts", { posts: data }))
            .catch((error) => res.render("posts", { message: "no results" }));
    } else {
        blogData.getAllPosts()
            .then((data) => res.render("posts", { posts: data }))
            .catch((error) => res.render("posts", { message: "no results" }));
    }
});
//Part 3 - step 1
app.get("/categories", (req, res) =>{
    blogService.getCategories()
    .then((data) => res.render("categories", { categories: data }))
    .catch((error) => res.render("categories", { message: "no results" })); 
})
app.get('/blog', async (req, res) => {

    // Declare an object to store properties for the view
    let viewData = {};

    try{

        // declare empty array to hold "post" objects
        let posts = [];

        // if there's a "category" query, filter the returned posts by category
        if(req.query.category){
            // Obtain the published "posts" by category
            posts = await blogData.getPublishedPostsByCategory(req.query.category);
        }else{
            // Obtain the published "posts"
            posts = await blogData.getPublishedPosts();
        }

        // sort the published posts by postDate
        posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

        // get the latest post from the front of the list (element 0)
        let post = posts[0]; 

        // store the "posts" and "post" data in the viewData object (to be passed to the view)
        viewData.posts = posts;
        viewData.post = post;

    }catch(err){
        viewData.message = "no results";
    }

    try{
        // Obtain the full list of "categories"
        let categories = await blogData.getCategories();

        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }

    // render the "blog" view with all of the data (viewData)
    res.render("blog", {data: viewData})

});
app.get('/blog/:id', async (req, res) => {

    // Declare an object to store properties for the view
    let viewData = {};

    try{

        // declare empty array to hold "post" objects
        let posts = [];

        // if there's a "category" query, filter the returned posts by category
        if(req.query.category){
            // Obtain the published "posts" by category
            posts = await blogData.getPublishedPostsByCategory(req.query.category);
        }else{
            // Obtain the published "posts"
            posts = await blogData.getPublishedPosts();
        }

        // sort the published posts by postDate
        posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

        // store the "posts" and "post" data in the viewData object (to be passed to the view)
        viewData.posts = posts;

    }catch(err){
        viewData.message = "no results";
    }

    try{
        // Obtain the post by "id"
        viewData.post = await blogData.getPostById(req.params.id);
    }catch(err){
        viewData.message = "no results"; 
    }

    try{
        // Obtain the full list of "categories"
        let categories = await blogData.getCategories();

        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }

    // render the "blog" view with all of the data (viewData)
    res.render("blog", {data: viewData})
});

// 404 error handler
app.use((req, res) => {
    res.status(404).render('404');
});

// Initialize the blog service and start the server
blogData.initialize().then(() => {
    app.listen(HTTP_PORT, () => {
        console.log('Server listening on: ' + HTTP_PORT);
    });
}).catch((err) => {
    console.log(err);
});
