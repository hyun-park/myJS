
## `closure` (클로져) 알아보기

다른 프로그래밍 언어와는 다르게 자바스크립트에서는 함수가 선언되면 그 함수의 `Lexical Scoping (어휘적 유효 범위)`가 생긴다. 따라서 해당 함수가 선언된 `scope`에 있던 지역 변수들은, (부모 함수 실행이 종료된다던지 등의 이유로) `scope`가 끝나도 여전히 접근할 수 있다.  

이러한 것을 `closure`라고 하며, 이를 객체 지향 프로그래밍, 비동기 프로그래밍 등에 활용할 수 있다.

### `closure` 예시


```js
function makeFunc() {
  var name = "Mozilla";
  function displayName() {
    // 1) name 은 부모 함수 makeFunc의 scope에서만 접근이 가능한 지역 변수이다.
    alert(name);
  }
  return displayName;
}

var myFunc = makeFunc();

// 2) 하지만 makeFunc 함수의 scope가 끝난 후에도 여전히 displayName 함수의 참조를 통해 name 지역 변수에 접근할 수 있다.
myFunc(); // Mozilla
```

----------------

***참조***  

[클로저 - MDN](https://developer.mozilla.org/ko/docs/Web/JavaScript/Guide/Closures)
