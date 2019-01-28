const express = require('express');
const app = express();
const port = 8080;

let visitors = {};

app.get('/', (request, response) => {

  // update visitors if visitor param is available
  let visitor = request.query.visitor;
  if (visitor) {

    if (visitors[visitor]) {
      visitors[visitor]++;
    } else {
      visitors[visitor] = 1;
    }

  }

  let entries = Object.entries(visitors);

  // do not do this in the wild
  response.send(`
    <html>
      <body>
        <div id="visitors_log">
          <ul>
            ${
              entries.map((entry) => `<li>${entry[0]}: ${entry[1]}</li>`)
                     .reduce((a,b) => a + b, '')
            }
          </ul>
        </div>
        <form id="sign_in" action="/" method="GET">
          <h3>Please feel free to sign in</h3>
          <input name="visitor" type="text" value="Anonymous"/>
          <input type="submit" value="Sign in"/>
        </form> 
      </body>
    </html>
  `);

});


app.listen(port, () => {console.log('running guestbook...')});
