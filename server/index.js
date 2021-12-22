// package imports
const express = require('express');

// Express setup
const app = express();
const port = 5000;
app.use(express.static('../client/public/'));

// app.get('/', (req, res) => {
//   res.send('Hello World!')
// })


// Start Express server
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
