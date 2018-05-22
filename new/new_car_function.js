
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
