// function isEven(n) {
//     return (n & 1) === 0;
// }

// const number = 7;
// const result = isEven(number);
// console.log(`${number} có phải là số chẵn không? ${result}`);

// function isPositive(n) {
//     return (n & (1 << 31)) === 0;
// }

// console.log((1 << 31).toString(16));
// //0101 => 1010

// const num = -10;
// const result = isPositive(num);
// console.log(`${num} có phải là số dương không? ${result}`);

// 7 / 2 = 3 / 2 = 1 / 2 = 0
// 0 1 1 1
// 5 / 2 = 2 / 2 = 1 / 2 = 0
// 0 1 0 1
// 0 1 0 1

// function swapValues(a, b) {
//     a = a ^ b;
//     console.log("1", a);
//     b = a ^ b;
//     console.log("2", b);
//     a = a ^ b;
//     console.log("3", a);

//     return [a, b];
// }

// let x = 5;
// let y = 10;
// [x, y] = swapValues(x, y);
// console.log(`Sau khi hoán đổi giá trị: x = ${x}, y = ${y}`);

function maxSubarray(arr) {
    let maxSum = arr[0];
    let currentSum = arr[0];
    let index = [];

    for (let i = 1; i < arr.length; i++) {
        // nếu giá trị thứ arr[i] mà lớn hơn giá trị của giá trị đầu tiên trong mảng(arr[0]) + giá trị thứ i(arr[1])
        currentSum = Math.max(arr[i], currentSum + arr[i]);
        if (currentSum + arr[i] > arr[i]) {
            index.push(arr[i]);
        } else {
        }
        maxSum = Math.max(maxSum, currentSum);
        console.log();
    }
    return maxSum;
}

/*
    -> tc khi for đặt cờ hiệu
    maxSum = -2 arr[0]
    currentSum = -2 arr[0]
    ->sau khi for
    currentSum = Math.max(currentSum, currentSum + arr[1] => -2 + 1 = -1) 
    maxSum = Math.max(maxSum, currentSum) => maxSum = -1 dãy số liên nhau là 2
    vòng for i  = 2
    currentSum = -3, -1 + -3 = -4 => currentSum = arr[2] = -3
    maxSum (-1 , -3) => maxSum = -1
    vòng for i = 3 
    currentSum = 4, 4 + (-3) = 1 => currentSum = arr[3](4)
    maxSum(-1 , 4) => maxSum = 4
    vòng for i = 4
    currentSum = -1, 4 + (-1) = 3 -> currentSum = 3
    maxSum(4, 3) => 4
    (2, 2 + 3 = 5) => currentSum = 5
    maxSum(4, 5) => maxSum = 5
    (1, 5 + 1 = 6) => currentSum = 6
    maxSum(5, 6) => maxSum = 6
*/

let arr = [-2, 1, -3, 4, -1, 2, 1, -5, 4];
let result = maxSubarray(arr);
console.log("Tổng lớn nhất của dãy con là:", result);
