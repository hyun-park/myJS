
## `Promise` 알아보기

`Promise`란 자바스크립트의 비동기 프로그래밍을 마치 동기인 것처럼 코딩을 할 수 있게 도와주는 특수 객체이다.  
기존의 자바스크립트에서는 비동기 함수를 제대로 사용하기 위해선 비동기 함수에 성공/실패 함수를 콜백으로 넘겨주어야 했다.
하지만 이는 `콜백 지옥`이라는 코딩 스타일에 빠지게 된다.  

`Promise`는 콜백 함수를 비동기 함수에 넘길 필요없이, `Promise` 객체의 리턴 값 다음에 이어서 할 작업들(함수들)을 차례로 붙어주면 된다.
즉, 비동기 프로그래밍을 마치 동기인 것처럼 사용할 수 있게 해준다.

### 사용 방법


1. `Promise` 객체 인스턴스 만들기

    비동기 작업을 해야하는 부분을 함수로 만들어서 Promise 객체 인스턴스의 argument로 넘겨준다.
    이때 해당 함수의 첫 번째 인자로 resolve 함수가 오는데, 이 함수를 실행시켜야 비동기 작업이 종료된다.

    ```js
    new Promise(function(resolve) {

        // 시간이 걸리는 비동기 작업
        setTimeout(function(){
            console.log("비동기 작업 시작!");
            const data = ['사과', '복숭아'];

            // 비동기가 끝난 후 결과 데이터를 resolve 함수의 인자로 넘겨준다.
            resolve(data);
        }, 1500);
    });
    ```

2. 그리고 해당 `Promise`를 리턴하는 함수를 만든다.

    ```js
    function getData() {
        return new Promise(function(resolve){
            setTimeout(function(){
                console.log("비동기 작업 시작!");
                const data = ['사과', '복숭아'];
                resolve(data);
            }, 3000);
        });
    }
    ```

3. 마지막으로 비동기 작업이 끝난 후 해야할 일들을 작성한다.

    ```js
    getData()

        // 비동기 작업 끝, 인자로 처리한 데이터가 넘어온다.
        .then(function(data){
            console.log(data) // ['사과', '복숭아']
            return data[0];
        })
        .then(function(data){
            console.log(data) // '사과'
        })

        // 계속 Chaining 할 수 있다.
        ...

        // 에러를 잡고 싶다면
        // 얘를 사용하기 위해선 Promise 객체에 두 번째 인자로 reject 함수를 받아 써야 한다. 
        .catch(function() {

        });
    ```
