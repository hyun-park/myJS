const http = require('http');

http.get(
    'http://nodejs.org/dist/index.json',

    // 첫 번째 콜백
    function(res) {
        res.on('data', function() {})
            .on('end', function() {
            console.log("첫 번째 작업 끝!");

            // 첫 번째 콜백이 끝난 후 실행할 작업
            http.get(
                'http://nodejs.org/dist/index.json',

                // 두 번째 콜백
                function(res) {
                    res.on('data', function() {})
                        .on('end', function() {
                        console.log("두 번째 작업 끝!");

                        // 두 번째 콜백이 끝난 후 실행할 작업
                        http.get (
                            'http://nodejs.org/dist/index.json',

                            // 세 번째 콜백
                            function(res) {
                                res.on('data', function() {})
                                    .on('end', function() {
                                    console.log("모든 작업 끝!");
                                });
                            }

                        )
                    });
                }
            );

        });
    }
);
