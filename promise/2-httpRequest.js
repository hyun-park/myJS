const https = require('https');

function makeRequest (method, url) {
  return new Promise(function (resolve, reject) {
      console.log("request start!");
      https.get(url, (resp) => {
        let data = '';

        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
          data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
            resolve(data);
        });

      }).on("error", (err) => {
        reject(err);
      });
  });
}

makeRequest('GET', 'https://naver.com')
.then(function (data) {
        console.log(data);
        console.log("data is received!");
})
.catch(function (err) {
  console.error('Augh, there was an error!', err.statusText);
});
