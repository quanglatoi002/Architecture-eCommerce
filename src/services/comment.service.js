"use strict";

const Comment = require("../models/comment.model");
const { product } = require("../models/product.model");
const { findProduct } = require("../models/repositories/product.repo");
const { convertToObjectMongodb } = require("../utils");

/*
    key features: Comment service
    + addComment [User | Shop]
    + get a list of comments [User | Shop]
    + delete a comment [User | Shop | admin]
*/

class CommentService {
    static async createComment({
        productId,
        userId,
        content,
        parentCommentId,
    }) {
        console.log(content);
        const comment = new Comment({
            comment_productId: productId,
            comment_userId: userId,
            comment_content: content,
            comment_parentId: parentCommentId,
        });
        console.log("parentComment", parentCommentId);

        let rightValue;
        if (parentCommentId) {
            const parentComment = await Comment.findById(parentCommentId);
            if (!parentComment)
                throw new Error(`parent comment not found ${parentComment}`);
            rightValue = parentComment.comment_right;

            await Comment.updateMany(
                {
                    comment_productId: productId,
                    comment_right: { $gte: rightValue },
                },
                {
                    $inc: { comment_right: 2 },
                }
            );

            await Comment.updateMany(
                {
                    comment_productId: productId,
                    comment_left: { $gt: rightValue },
                },
                {
                    $inc: { comment_left: 2 },
                }
            );
        } else {
            const maxRightValue = await Comment.findOne(
                {
                    comment_productId: productId,
                },
                "comment_right",
                { sort: { comment_right: -1 } }
            );
            console.log("maxRight", maxRightValue);
            if (maxRightValue) {
                rightValue = maxRightValue.comment_right + 1;
            } else {
                rightValue = 1;
            }
        }

        // insert to comment
        comment.comment_left = rightValue;
        comment.comment_right = rightValue + 1;
        console.log("comment_left", comment.comment_left);

        await comment.save();
        return comment;
    }

    // <> với {productId,parentCommentId,limit, offset} = req.query
    static async getCommentsByParentId({
        productId,
        parentCommentId = null,
        limit = 2,
        offset = 0,
    }) {
        console.log(productId);
        if (parentCommentId) {
            const parent = await Comment.findById(parentCommentId);
            if (!parent) throw new Error("Not found comment for product");

            const comments = await Comment.find({
                comment_productId: productId,
                comment_left: { $gt: parent.comment_left },
                comment_right: { $lte: parent.comment_right },
            })
                .select(
                    "comment_left comment_right comment_content comment_parentId"
                )
                .sort({
                    comment_left: 1,
                })
                .skip(Math.max(offset * limit, 0))
                .limit(limit);
            return comments;
        }
        const comments = await Comment.find({
            comment_productId: productId,
            comment_parentId: parentCommentId,
        })
            .select(
                "comment_left comment_right comment_content comment_parentId"
            )
            .sort({
                comment_left: 1,
            })
            .skip(Math.max(offset * limit, 0))
            .limit(limit);
        return comments;
    }

    //delete comments
    static async deleteComments({ commentId, productId }) {
        //check the product exists in the database
        const foundProduct = await findProduct({ product_id: productId });

        if (!foundProduct) throw new Error("Product not found");

        //1. Xác định giá trị left và right if commentId
        const comment = await Comment.findById(commentId);
        if (!comment) throw new Error("Comment not found");
        // root (1, 22)
        // vd trừ từ 3 - 8 (8 - 3 + 1 = 6) nếu mà xóa đi thì có phải sẽ xóa những tk có left <= 3 >= right
        // update giá trị của những tk có right và left > tk muốn xóa ở đây là 8. sơ đồ lại (1, 16), con là (2, 3) và (4, 15)
        const leftValue = comment.comment_left;
        const rightValue = comment.comment_right;
        // 2. width
        const width = rightValue - leftValue + 1;
        // delete những tk có left <= leftValue >= rightValue
        await Comment.deleteMany({
            comment_productId: productId,
            comment_left: { $gte: leftValue, $lte: rightValue },
        });
        //4 cập nhật giá trị left và right còn lại
        await Comment.updateMany(
            {
                comment_productId: productId,
                comment_right: { $gt: rightValue },
            },
            {
                $inc: { comment_right: -width },
            }
        );

        await Comment.updateMany(
            {
                comment_productId: productId,
                comment_right: { $gt: rightValue },
            },
            {
                $inc: { comment_right: -width },
            }
        );
    }
}

module.exports = CommentService;
