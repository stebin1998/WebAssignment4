const fs = require("fs");

let posts = [];
let categories = [];


//Part 3
function getPostsByCategory(category) {
    return new Promise((resolve, reject) => {
      const allposts = posts.filter(post => post.category === category);
      if (allposts.length > 0) {
        resolve(allposts);
      } else {
        reject("No results returned");
      }
    });
  };

//   /posts?minDate=value
// return a JSON string consisting of all posts whose postDate property is equal or greater than value - where value is a date string in the format YYYY-MM-DD (ie: 2020-12-01 would only show posts 8 and 9) . This can be accomplished by calling the getPostsByMinDate(minDateStr) function of your blog-service (defined below)  Sample: https://web322-a3-sample.herokuapp.com/posts?minDate=2020-12-01 
function getPostsByMinDate(minDateStr) {
    return new Promise((resolve, reject) => {
         const minDate = new Date(minDateStr);
        const allposts = posts.filter(post => new Date(post.postDate) >= minDate);
        if (allposts.length > 0) {
          resolve(allposts);
        } else {
          reject("No results returned");
        }
      });
};
function getPostById(id) {
    return new Promise((resolve, reject) => {
        const allpost = posts.find(post => post.id === id);
        if (allpost) {
          resolve(allpost);
        } else {
          reject("No results returned");
        }
      });
};
function getPublishedPostsByCategory(category) {
  return new Promise((resolve, reject) => {
    if (posts.length === 0) {
      reject("No posts found");
    } else {
      let filteredPosts = posts.filter(post => post.published && post.category === category);
      resolve(filteredPosts);
    }
  });
};
function getPublishedPostById(id) {
  return new Promise((resolve, reject) => {
      // Replace this with actual logic to retrieve a post by ID from your data store
      //const post = this.posts.find(post => post.id === id && post.published);
      const post = posts.find(post => post.id === id && post.published); 
      if (post) {
          resolve(post);
      } else {
          reject('Post not found');
      }
  });
}
addPost = function(postdata) {
    return new Promise((resolve, reject) =>{
         // If postData.published is undefined, set it to false; otherwise, set it to true
        //postdata.published = postdata.published = undefined ? false : true;
        postdata.published = postdata.published === undefined ? false : true;
         // Set the id property of postData to the length of the "posts" array plus one
        postdata.id = posts.length + 1;

        // Set the postDate to the current date in YYYY-MM-DD format
        postData.postDate = new Date().toISOString().split('T')[0];
        // Push the updated postData object onto the "posts" array
        posts.push(postdata);

        // Resolve the promise with the updated postData
        resolve(postdata);
    });
}


initialize = function () {
    return new Promise((resolve, reject) => {
        fs.readFile('./data/posts.json', 'utf8', (err, data) => {
            if (err) {
                reject("unable to read file");
            } else {
                posts = JSON.parse(data);

                fs.readFile('./data/categories.json', 'utf8', (err, data) => {
                    if (err) {
                        reject("unable to read file");
                    } else {
                        categories = JSON.parse(data);
                        resolve();
                    }
                });
            }
        });
    });
};

getAllPosts = function () {
  return new Promise((resolve, reject) => {
      (posts.length > 0) ? resolve(posts) : reject("no results returned");
  });
};


getPublishedPosts = function(){
    return new Promise((resolve,reject)=>{
        (posts.length > 0) ? resolve(posts.filter(post => post.published)) : reject("no results returned");
    });
};

getCategories = function(){
    return new Promise((resolve,reject)=>{
        (categories.length > 0 ) ? resolve(categories) : reject("no results returned"); 
    });
}

module.exports = {
  initialize,
  getAllPosts,
  getPublishedPosts,
  getCategories,
  addPost,
  getPostsByCategory,
  getPostsByMinDate,
  getPostById,
  getPublishedPostsByCategory,
  getPublishedPostById
};