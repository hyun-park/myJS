
## `Global Object (전역객체)` 알아보기

자바스크립트에서의 모든 객체는 `Global Object (전역객체)`의 Property 이다. `Global Object`는 호스트 환경에 따라 달라진다. (웹브라우저에서는 `window`, NodeJS에서는 `global`이 전역객체이다.)

### 사용 방법

- 전역 변수로 선언한 함수 및 변수는 모두 `Global Object`의 Property로도 접근이 가능하다.

    ```js
    function func(){
        console.log('Hello?');    
    }

    func(); // => Hello?
    window.func(); // 브라우저에서 => Hello?
    global.func(); // NodeJS에서 => Hello?
    ```
