const router = require('express').Router()
const { Comment, User, Post } = require('../../models')
const withAuth = require('../../utils/auth')

router.post("/", async (req,res) => {
    try {
        const comment = await Comment.create({
            comment_body: req.body.comment_body,
            post_id: req.body.post_id,
            user_id: req.session.user_id || req.body.user_id
        })
        res.status(200).json(comment)
    } catch (err) {
        res.status(400).json(err)
    }
})

router.get("/", async (req, res) =>{
    try {
        const commentData = await Comment.findAll({
            include: [
                {
                    model: User,
                    attributes: ['username']
                },
                {
                    model: Post,
                    attributes: ['id']
                }
            ]
        })
        res.status(200).json(commentData)
    } catch (err) {
        res.status(400).json(err)
    }
})

router.put("/:id", async (req, res) => {
    try {
        const updatedComment = await Comment.update(req.body, {
            where: {
                id: req.params.id
            }
        })
        if (!updatedComment[0]) {
            res.status(400).json({ message: "No comment with that id exists." })
            return
        }
        res.status(200).json(updatedComment)
    } catch (err) {
        res.status(400).json(err)
    }
})

router.delete("/:id", async (req, res) => {
    try {
        const comment = await Comment.destroy({
            where: {
                id: req.params.id
            }
        })
        if (!comment) {
            res.status(404).json({ message: "Comment does not exist." })
        }
        res.status(200).json({ message: "Comment deleted." })
    } catch (err) {
        res.status(400).json(err)
    }
})

module.exports = router