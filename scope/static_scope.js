
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
