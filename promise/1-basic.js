function doSomething() {
  return new Promise((resolve, reject) => {
    console.log("Now Starting Promise!");
    // Succeed half of the time.
    if (Math.random() > .5) {
      resolve("SUCCESS1");
    } else {
      reject("FAILURE1");
    }
  })
}

const promise = doSomething();
promise
    .then(function(data){
        console.log(data);
        console.log("This is next one!");
        return "SUCCESS2";
    })
    .then(function(data){
        console.log(data);
        console.log("This is next two!");
        console.log("SUCCESS3");
    })
    .catch(function(err){
        console.log(err);
    });
