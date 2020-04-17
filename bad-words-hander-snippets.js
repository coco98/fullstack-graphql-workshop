// Requires
var Filter = require('bad-words');    
const filter = new Filter();


// Clean up code
const sanitized = filter.clean(title);
