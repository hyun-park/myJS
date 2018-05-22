
var car1 = {
    name: `Tesla`,
    maximumSpeed: 350,
    getSpeed: function() {
        return Math.floor(Math.random() * (this.maximumSpeed+1));
    },
};

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
