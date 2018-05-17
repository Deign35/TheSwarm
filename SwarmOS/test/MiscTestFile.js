/*Besides generator objects, yield* can also yield other kinds of iterables, e.g. arrays, strings or arguments objects.

function* g3() {
    yield* [1, 2];
    yield '34';
    yield* Array.from(arguments);
}

var iterator = g3(5, 6);

console.log(iterator.next()); // {value: 1, done: false}
console.log(iterator.next()); // {value: 2, done: false}
console.log(iterator.next()); // {value: "3", done: false}
console.log(iterator.next()); // {value: "4", done: false}
console.log(iterator.next()); // {value: 5, done: false}
console.log(iterator.next()); // {value: 6, done: false}
console.log(iterator.next()); // {value: undefined, done: true}

//yield* is an expression, not a statement, so it evaluates to a value.
/*

function* g4() {
    yield* [1, 2, 3];
    return 'foo';
}

var result;

function* g5() {
    result = yield* g4();
}

var iterator = g5();

console.log(iterator.next()); // {value: 1, done: false}
console.log(iterator.next()); // {value: 2, done: false}
console.log(iterator.next()); // {value: 3, done: false}
console.log(iterator.next()); // {value: undefined, done: true}, 
// g4() returned {value: 'foo', done: true} at this point

console.log(result); // "foo"*/
let runTest = true;

function* test1() {
    let num = 0;
    while (runTest) {
        console.log('ping ping[' + (num) + ']');
        yield num++;
    }
    console.log('ping2');
}

function* test2() {
    let iterator = test1()
    for (let i = 0; i < 10; i++) {
        yield iterator.next();
    }

    return false;
}

let numYields = 0;
var iterator = test2();
while (iterator.next().value) {
    numYields++;
    if (numYields > 7) {
        runTest = false;
    }
}