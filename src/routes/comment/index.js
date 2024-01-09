"use strict";

const express = require("express");
const asyncHandler = require("../../helpers/asyncHandler");
const { authentication } = require("../../auth/authUtils");
const CommentController = require("../../controllers/comment.controller");

const router = express.Router();

router.use(authentication);
router.post("/", asyncHandler(CommentController.createComment));
router.get("/", asyncHandler(CommentController.getCommentsByParentId));

module.exports = router;
