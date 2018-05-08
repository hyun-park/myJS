
## `async / await` 알아보기

`async` 함수란 함수 내의 비동기 함수(`Promise` 함수) 앞에 `await` 표현을 사용해 해당 비동기 함수의 실행이 끝날 때까지 다음 코드들의 실행을 기다리게할 수 있는 특수 함수다. `async / await` 함수를 사용하면 `.then` 등 을 사용할 필요 없이 완전히 동기적으로 코드를 작성할 수 있다.


### 사용 방법


- 비동기 `Promise` 함수를 만들어서 `async` 함수 내에서 `await`로 실행시킨다.

    비동기 작업을 해야하는 부분을 함수로 만들어서 Promise 객체 인스턴스의 argument로 넘겨준다.
    이때 해당 함수의 첫 번째 인자로 resolve 함수가 오는데, 이 함수를 실행시켜야 비동기 작업이 종료된다.

    ```js
    function getUsersNames () {
        return new Promise((resolve) => {

            // 비동기 작업
            setTimeout(function() {
                const data = ["정현", "지원", "로켓"];
                resolve(data);
            }, 2000);

        });
    }

    async function addData() {
        // getUsersNames Promise를 리턴하는 비동기 함수라고 가정하자.
        const data = await getUsersNames();

        // 동기적으로 코드가 작성되었지만 위에 코드에서 data를 받을때 까지 아래 코드들은 실행되지 않고 기다린다.
        const allUsersName = data.join(",");

        console.log(allUsersName); // "정현,지원,로켓"
    }

    addData();
    ```
