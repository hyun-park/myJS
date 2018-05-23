
## `this` 알아보기

`this`는 함수 내에서 호출 맥락(context) 객체를 의미한다. 함수를 어떻게 실행시키냐에 따라서 `this`가 가리키는 값이 달라진다. 이를 이용하면 생성자 함수 내에서 실제로 객체가 생성되기 전에 객체에 대한 작업을 수행할 수 있다.  

결론적으로 말하자면 ***`this`는 해당 메서드가 속해있는 객체를 의미한다.***

> 모든 함수는 객체이고 모든 객체는 결국엔 전역 객체에 속해있기 때문에 ***모든 함수는 메서드이다.***

### 사용 방법

1. 일반적인 함수 호출시의 `this`

    > 일반적인 함수 호출에서의 `this`는 `global object` (전역 객체)를 가리킨다.

    일반적인 함수인 `func`는 `window`(또는 `global`)의 메소드이기 때문에 `func` 내부에서의 `this`는 해당 메서드가 속해있는 `global object`를 의미한다.  
    (`func()`가 `window.func()`와 동일한걸 생각해보자.)

    ```js
    function func(){
        if(window === this){
            console.log("window === this");
        }
    }
    func();  // => window === this
    ```

2. 메소드 호출시의 `this`

    > 메소드 호출에서의 `this`는 메소드가 소속된 객체를 가리킨다.

    ```js
    var o = {
        func : function(){
            if(o === this){
                console.log("o === this");
            }
        }
    }
    o.func(); // => o === this
    ```

3. 생성자 함수 호출시의 `this`

    > 생성자 함수 내에서의 `this`는 만들어진 객체를 가리킨다. ***이를 이용하면 생성자가 실행되기 전에도 미리 객체에 대한 작업을 할 수 있다.***

    ```js
    var funcThis = null;

    function Func(){
        // 생성자 함수로 Func를 실행하면
        // this는 생성된 객체를 가리킨다.
        funcThis = this;
        // !!주의!!
        // 일반 함수 호출로 Func 실행하면
        // this는 전역 객체를 가리킨다.
    }

    var o1 = new Func();
    if(funcThis === o1){
        console.log('funcThis is o1'); // => funcThis is o1
    }
    ```

4. 함수의 `apply` 메서드를 이용하면 `this`의 값을 임의로 지정할 수 있다.

    [`apply` 링크 바로 가기](https://github.com/hyun-park/myJS/tree/master/apply)



----------------

***참조***  

[this - 생활코딩](https://opentutorials.org/course/743/6571)
