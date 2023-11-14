// mục đích chính là bọc 1 hàm xử lý ko đồng bộ async để tự động xử lý lỗi. Khi hàm fn(req,res,next) được gọi, nó sẽ kiểm soái bất kì lỗi nào xảy ra trg qtrinh thực thi hàm fn và chuyển nó đến midd next tiếp theo.
const asyncHandler = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};

module.exports = asyncHandler;
