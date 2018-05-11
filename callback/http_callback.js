const http = require('http');

const req = http.get(

    'http://nodejs.org/dist/index.json',

    // 이 함수가 http.get 메서드의 인자로 넘기는 콜백이다.
    // http.get 작업이 끝난 후 실행할 작업을 작성해서 넘긴다.
    function(res) {

        var bodyChunks = [];
        res.on('data', function(chunk) {
            bodyChunks.push(chunk);

        }).on('end', function() {
            var body = Buffer.concat(bodyChunks);
            console.log('결과: ' + body); // 응답 받은 결과가 나온다.
        })
    }
);
