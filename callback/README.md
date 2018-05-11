
## `callback` (콜백) 알아보기

자바스크립트에서는 함수도 객체이기 때문에 값이 될 수 있다. 즉, 함수의 인자로도 함수를 전달할 수 있다는 뜻이다. 이때 원래의 함수에서 인수로 넘긴 함수를 사용하는 것을 `callback`이라고 한다. 주로 비동기 작업을 수행할 때 이 기능을 활용해 비동기 작업이 끝난 후의 일들을 처리한다.

### 비동기 환경에서의 `callback` 이용

자바스크립트에서 `전역 변수`는 어플리케이션 어디서나 접근할 수 있는 변수를 의미한다.

```js
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
```

***주의***  

비동기 작업을 여러개 수행해야할 경우 콜백 지옥에 빠질 수 있다.

```js
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
```

> 이와 같은 코드는 작동은 하더라도 가독성이 매우 떨어지기 때문에 좋지 않다.
이를 방지하기 위해서 `ES2015`(`ES6`)에서는 `Promise`, `ES2016`(`ES7`)에서는 `async / await`를 추가했다.


----------------

***참조***  

[값으로서의 함수와 콜백 - 생활코딩](https://opentutorials.org/course/743/6508)
