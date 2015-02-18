if (typeof bio !== 'undefined') {
  console.warn("bio namespace occupied");
}

bio = require("./export"); // create namespace bio

module.exports = bio;

