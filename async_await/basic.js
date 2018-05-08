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
