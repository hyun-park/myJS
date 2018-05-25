function Person() {
}
Person.prototype.introduce = function() {
    console.log(this);
    console.log(`Hello ${this.name}!`);
}

function Programmer() {
}
Programmer.prototype = new Person();
Programmer.prototype.code = function() {
    console.log(this);
    console.log(`Let's iterate ${this.name}!`);
}

function FrontEndDeveloper(name) {
    this.name = name;

}
FrontEndDeveloper.prototype = new Programmer();

var p1 = new FrontEndDeveloper('Junghyun');
console.log(p1);
p1.code();
