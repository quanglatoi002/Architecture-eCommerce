const { isArray } = require("lodash");

function dpMaximumSubarray(inputArray) {
    if (isArray(inputArray) && inputArray.length === 0)
        throw new Error("Input array must be empty array or array of length 0");
    // thiết lập giá trị nhỏ nhất cho maxSum
    let maxSum = -Infinity;
    let currentSum = 0;
    let maxStartIndex = 0;
    let maxEndIndex = inputArray.length - 1;
    let currentStartIndex = 0;

    inputArray.forEach((currentNumber, currentIndex) => {
        // cộng từng giá trị của currentNumber with currentSum
        currentSum += currentNumber;

        //update maxSuM
        if (maxSum < currentSum) {
            maxSum = currentSum;
            maxStartIndex = currentStartIndex;
            maxEndIndex = currentIndex; // cập nhật index cuối cùng khi kết thúc foreach
        }

        //reset currentSum và currentStartIndex if currentSum drops below 0
        if (currentSum < 0) {
            currentSum = 0;
            currentStartIndex = currentIndex + 1;
        }
    });
    // return inputArray.slice(maxStartIndex, maxEndIndex + 1);
    return maxSum;
}

let arr = [-2, 1, -3, 4, -1, 2, 1, -5, 4];
let result = dpMaximumSubarray(arr);
console.log(result);
