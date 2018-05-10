
## `Scope` (유효범위) 알아보기

`Scope`란 자바스크립트에서 변수의 수명을 의미한다.

### 1. `전역 변수`와 `지역 변수`  

자바스크립트에서 `전역 변수`는 어플리케이션 어디서나 접근할 수 있는 변수를 의미한다.

```js
var vscope = 'global';
function fscope(){
    alert(vscope);
}
fscope(); // 'global'
```

반면에 `지역 변수`는 특정한 유효범위 안에서만 접근할 수 있는 변수를 의미한다. 일반적으로 함수 내부에서 선언한 변수는 전역 변수와 이름이 같더라도
함수 내부에서는 지역 변수로 취급된다.

```js
var vscope = 'global';
function fscope(){
    var vscope = 'local';
    alert('함수안 '+vscope);
}
fscope(); // '함수안 local'
alert('함수밖 '+vscope); // '함수밖 global'
```

***주의***  

함수 내부에서 변수를 선언했다고 하더라도 변수 앞에 `var`, `let`, `const` 등의 선언(`statement`)이 없다면 전역변수로 간주된다.

```js
var vscope = 'global';
function fscope(){
    // vscope 앞에 선언이 없기 때문에 전역변수로 간주되어
    // global로 할당 되었던 변수 값이 local로 바뀌었다.
    vscope = 'local';
    alert('함수안'+vscope); // 함수안 local
}
fscope();
alert('함수밖'+vscope); // 함수밖 local
```

> 일반적으로 전역변수는 서로 다른 로직에서 같은 이름으로 사용되면
의도치 않은 문제점을 발생시킬 수 있으므로 사용을 최대한 지양하는 것이 좋다.

### 2. 그래도 불가피하게 `전역 변수`를 사용해야 한다면...

하나의 객체를 전역 변수로 만들고 해당 객체의 속성으로 변수를 관리하는 방법을 사용한다.

```js
MYAPP = {}
MYAPP.calculator = {
    'left' : null,
    'right' : null
}
MYAPP.coordinate = {
    // 위에 MYAPP.calculator의 left, right 속성과
    // 이름이 같지만 다른 속성 안에서 정의되었기 때문에
    // 서로 영향을 끼치지 않는다.
    'left' : null,
    'right' : null
}

MYAPP.calculator.left = 10;
MYAPP.calculator.right = 20;
function sum(){
    return MYAPP.calculator.left + MYAPP.calculator.right;
}
console.log(sum()); // 30
```

전역 변수를 아예 사용하고 싶지 않다면 위에 코드를 익명 함수로 감싸서 바로 실행시킨다. 이를 `IIFE`(Immediately Invoked Function Expression)라고도 한다.

```js
// 코드 전체를 함수로 감싼 후 해당 함수를 즉시 실행 시킨다.
(function () {
    MYAPP = {}
    MYAPP.calculator = {
        'left' : null,
        'right' : null
    }
    MYAPP.coordinate = {
        'left' : null,
        'right' : null
    }

    MYAPP.calculator.left = 10;
    MYAPP.calculator.right = 20;
    function sum(){
        return MYAPP.calculator.left + MYAPP.calculator.right;
    }
    console.log(sum());

   // 맨 마지막에 () 부분이 함수를 실행시킨다.
})();
```

### 3. 자바스크립트에서 `var`선언 변수의 유효범위의 대상은 `함수`이다.  

자바스크립트에서 `지역 변수`의 유효 범위는 `블록` (`{}`와 같은 범위)이 아닌 `함수`이다. 함수가 아니라면 `{}` 안에 선언된 변수라도 해당 지역 변수가 되지 못한다.

```js
for(var i = 0; i < 1; i++){
    var name = 'coding everybody';
}
// for문 블록 안에 있는 name을 가리키고 있지만
// 문제 없지 작동한다.
console.log(name); // coding everybody
```

***하지만 ES2015(ES6)의 `let`, `const` 선언은 `block-scoped`(블록 유효범위)이다.***  

```js
for(var i = 0; i < 1; i++){
    let name = 'coding everybody';
    const user = 'coding is fun';
}
console.log(name); // ReferenceError: name is not defined
console.log(user); //ReferenceError: user is not defined
```

### 4. 자바스크립트는 `정적 유효 범위`를 갖는다.

자바스크립트는 함수가 선언된 시점에서의 유효범위를 갖는다.  
사용될 때 (X) / ***선언될 때 (O)***

그래서 함수를 어디에서 사용해도 같은 결과를 기대할 수 있다.

```js
var i = 5;

function a(){
    var i = 10;
    b();
}

function b(){
    console.log(i);
}

// b 함수는 a 함수의 블록 안에서 실행됐지만
// 변수 i는 전역 변수를 가리킨다.
a(); // 5
```

----------------

***참조***  

[유효범위 - 생활코딩](https://opentutorials.org/course/743/6495)
