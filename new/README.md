
## `new` 알아보기

함수를 실행할 때 앞에 `new` 키워드를 붙여서 실행하면 해당 함수는 생성자 함수가 된다. 따라서 새로운 객체가 생성되어 결과 값으로 리턴된다. 즉, 일반적인 객체지향언어에서 클래스를 통해 객체를 생성하는 것과 다르게 자바스크립트에서는 함수를 통해 자유롭게 객체를 생성할 수 있다. (일반적으로 자바스크립트는 클래스가 없다. 하지만 ***ES6에서는 클래스가 생겼다.***)

### 사용 방법

- 함수 앞에 `new` 키워드를 붙인 후 실행 시킨다.

    > 일반적으로 생성자 함수는 대문자로 시작한다.

    ```js
    // 생성자 함수
    // 사실 이 함수 정의만으로는 아무 역할도 하지 않는다.
    // 실행할 때 함수 이름 앞에 new 키워드가
    // 이 함수를 생성자 함수로 만드는 것이다.
    function Car () {};

    // 일반적인 함수 실행
    var notCar = Car(); // notCar 에는 undefined가 들어간다.

    var car = new Car(); // car은 Car Object를 가리킨다.

    // 생성자 함수에 아무 것도 없었다면
    // 다음과 동일한 의미이다.
    var car = {} // car은 Object객체를 가리킨다.
    ```

    > 하지만 `{}`만을 사용해 객체를 생성한다면 중복을 제거할 수 없어 객체 지향 프로그래밍을 하기 어렵다.

    ```js
    var car1 = {
        name: `Tesla`,
        maximumSpeed: 350,
        getSpeed: function() {
            return Math.floor(Math.random() * (this.maximumSpeed+1));
        },
    };

    // 새로운 객체를 만들때 마다 같은 코드를 작성해야 한다.
    var car2 = {
        name: `Bentley`,
        maximumSpeed: 300,
        // getSpeed 메서드의 코드가 계속 중복 된다.
        getSpeed: function() {
            return Math.floor(Math.random() * (this.maximumSpeed+1));
        },
    };

    console.log(`${car1.name}'s speed: ${car1.getSpeed()}`);
    console.log(`${car2.name}'s speed: ${car2.getSpeed()}`);

    // Tesla's speed: 88
    // Bentley's speed: 129
    ```

    > ***생성자 함수를 이용하면 여러 활용이 가능해 객체 지향 프로그래밍을 할 수 있다.***

    ```js
    function Car(name, maximumSpeed) {
        this.name = name;
        this.maximumSpeed = maximumSpeed;

        this.getSpeed = function() {
            return Math.floor(Math.random() * (this.maximumSpeed+1));
        };
    };

    var car1 = new Car('Tesla', 350);
    var car2 = new Car('Bentley', 300);

    console.log(`${car1.name}'s speed: ${car1.getSpeed()}`);
    console.log(`${car2.name}'s speed: ${car2.getSpeed()}`);

    // Tesla's speed: 88
    // Bentley's speed: 129
    ```

-----------
### 참고
[생활코딩 생성자와 new](https://opentutorials.org/course/743/6570)
