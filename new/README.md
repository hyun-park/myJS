
## `apply` 알아보기

`apply`는 자바스크립트의 함수를 실행하는 특수한 방법 중 하나이다. 자바스크립트에서 함수를 정의하면 해당 함수의 메서드로 `apply`가 자동으로 생성되는데, 이 메서드의 인자를 이용하면 함수의 `this`를 임의로 지정할 수 있다.

### 사용 방법

- 함수를 정의한 후 해당 함수를 `apply` 메서드로 실행 시킨다.

    > `apply` 메서드의 첫 번째 인자는 함수의 this가 될 대상이다.

    ```js
    o1 = {val1:1, val2:2, val3:3};

    function sum(){
        var _sum = 0;

        // this는 함수가 실행될 때 정해진다.
        for(name in this){
            _sum += this[name];
        }
        return _sum;
    }

    // 함수를 실행하는 일반적인 방법
    sum();

    // apply 메서드로 함수를 실행하는 방법
    sum.apply(o1) // o1 Object를 함수의 this로 지정한다.
    // => 6
    ```

    > `apply` 메서드의 두 번째 인자는 함수의 매개 변수(파라미터)가 된다.  
    > 이때 두 번째 인자는 배열로 넘겨야 한다.

    ```js
    o1 = {val1:1, val2:2, val3:3};

    function sum(num1, num2){
        var _sum = 0;

        // this는 함수가 실행될 때 정해진다.
        for(name in this){
            _sum += this[name];
        }
        return _sum + num1 + num2;
    }

    sum.apply(o1, [5, 3]);
    // => 6 + 5 + 3 = 14
    ```
