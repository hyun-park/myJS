
## `pass by value / call by reference` 알아보기

`pass by -` 란 `JavaScript`에서 함수의 `argument`를 넘길 때, 그 `argument`가 함수 안에서 어떤 식으로 작동하는지에 대한 결정 방식이다.
***일반적으로 자바스크립트는 무조건 `pass by value`를 한다.***

### `pass by value`


- 함수의 `argument`로 값을 넘길 때, 원래 값이 아닌 ***복사된 값*** 이 넘어오는 방식이다. 따라서 해당 값을 수정해도 원래 값엔 영향을 끼치지 않는다.

    ```js
    const a = 1;
    const func = function(b) {
      b = b + 1;
    }

    // a 를 argument로 넘기지만
    // a의 복사된 값을 넘긴다.
    func(a);
    console.log(a); // 1
    ```

### `pass by reference`

- 함수의 `argument`로 값을 넘길 때, 해당 변수의 참조 값을 넘겨서 함수에서도 ***원래 참조 값*** 에 접근할 수 있는 방식이다. 하지만 자바스크립트는 ***무조건 `pass by value`를 한다.***  

    > 헷갈릴 수 있는 예시

    ```js
    var a = {}; // (1)
    var func = function(b) { // (2)
      b.a = 1;
    }

    // a의 복사된 값을 argument로 넘겼지만,
    // func 함수에서 a 객체의 복사본에 property를 지정하자
    // 원래의 a 객체에 property도 변경됐다.
    func(a);
    console.log(a.a); // 1
    ```

    이 예시를 보면 자바스크립트가 `pass by reference`로 작동하는 것처럼 보인다.
    하지만 자바스크립트는 여기서도 `pass by value`를 하고 있다.  

    (1)에서 a 변수에 객체를 담으면, 변수 a에 담기는 것은 객체 `{}`의 메모리 주소 값이다. (기본 자료형은 변수에 원시 값이 담긴다.) 그리고 `argument`에서 이 변수 a를 넘기면 a의 참조 값을 복사한 값이 넘어간다. 즉, 복사한 값도 참조하고 있는 주소는 같다는 것이다.

    그렇기 때문에 `pass by value`로 `argument`를 넘겼어도, 함수 내에서 그 변수를 수정하면 원래 객체에 영향이 가는 것이다.

    > `pass by value`라는 증거

    ```js
    var a = {};
    var func = function(b) {
      b = 1;
    }

    // 분명 함수에서 해당 변수를 변경했지만,
    // a의 원래 참조 값은 변하지 않았다.
    func(a);
    console.log(a); // {} (1이 아니다.)
    ```

-----------
### 참고
[(자알쓰) call by value vs call by reference](https://blog.perfectacle.com/2017/10/30/js-014-call-by-value-vs-call-by-reference/)
