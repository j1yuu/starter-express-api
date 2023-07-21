import PostModel from "../models/Post.js"
import UserModel from "../models/User.js"

export const getLastTags = async (req, res) => {
    try {
        const posts = await PostModel.find().limit(5).exec();
        const tags = posts.map(obj => obj.tags).flat().reverse().slice(0, 5);
        res.json(tags);
    } catch (err) {
        console.log(err);

        res.status(500).json({
            message: 'Не удалось получить тэги'
        });
    };
};

export const getLastComm = async (req, res) => {
    try {
        const posts = await PostModel.find().limit(5).exec();
        const comments = posts.map(obj => obj.comments).flat().reverse().slice(0, 3);
        res.json(comments);
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось получить комментарии'
        });
    };
};

export const create = async (req, res) => {
    try {
        const doc = new PostModel({
            title: req.body.title,
            text: req.body.text,
            imageURL: req.body.imageURL,
            tags: req.body.tags,
            user: req.userId,
        });

        const post = await doc.save()

        res.json(post)
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось создать статью'
        })
    }
}

export const getAll = async (req, res) => {
    try {
        const posts = await PostModel.find().sort([['createdAt', -1]]).populate('user').exec()

        res.json(posts)
    } catch (err) {
        console.log(err)

        res.status(500).json({
            message: 'Не удалось получить статьи'
        })
    }
}

export const getPopularPosts = async (req, res) => {
    try {
        const posts = await PostModel.find().sort([['viewsCount', -1]]).populate('user').exec()

        res.json(posts)
    } catch (err) {
        console.log(err)

        res.status(500).json({
            message: 'Не удалось получить статьи'
        })
    }
}

export const getTagSortedPost = async (req, res) => {
    try {
        const posts = await PostModel.find({ tags: req.params.name }).populate('user').exec()

        res.json(posts)
    } catch (err) {
        console.log(err)

        res.status(500).json({
            message: 'Не удалось получить статьи'
        })
    }
}

export const getOne = async (req, res) => {
    try {
        const postId = req.params.id;
        PostModel.updateOne(
            {
                _id: postId,
            },
            {
                $inc: { viewsCount: 1 },
            },
            {
                returnDocument: 'after',
            },
        ).then(async (doc) => {
            if (!doc) {
                return res.status(404).json({
                    message: 'Статья не найдена',
                });
            }

            const post = await PostModel.findById(postId).populate('user');
            const { ...postData } = post._doc;
            res.json({ postData });
        }).catch(err => {
            console.log(err);
            return res.status(500).json({
                message: 'Не удалось вернуть статью',
            });
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось получить статью',
        });
    }
};

export const update = async (req, res) => {
    try {
        const postId = req.params.id;

        await PostModel.updateOne(
            { _id: postId },
            {
                title: req.body.title,
                text: req.body.text,
                imageURL: req.body.imageURL,
                user: req.body.userId,
                tags: req.body.tags,
            }
        )

        res.json({
            success: true
        })
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось обновить статью',
        });
    }
}

export const remove = async (req, res) => {
    try {
        const postId = req.params.id;

        PostModel.deleteOne({ _id: postId }).then((doc) => {
            if (!doc) {
                return res.status(404).json({
                    message: 'Статья не найдена',
                });
            }
            res.json({ success: true });
        });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({
            message: 'Не удалось удалить статью',
        });
    }
}

export const comment = async (req, res) => {
    try {
        const postId = req.params.id;
        const user = await UserModel.findById(req.body.userId)
        PostModel.updateOne(
            {
                _id: postId,
            },
            {
                $push: {
                    comments: {
                        userId: user._id,
                        fullName: user.fullName,
                        text: req.body.comment,
                    }
                }
            },
            {
                returnDocument: 'after',
            },
        ).then(async (doc) => {
            if (!doc) {
                return res.status(404).json({
                    message: 'Статья не найдена',
                });
            }

            const post = await PostModel.findById(postId).populate('user');
            const { ...postData } = post._doc;
            res.json({ postData });
        }).catch(err => {
            console.log(err);
            return res.status(500).json({
                message: 'Не удалось вернуть статью',
            });
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось получить статью',
        });
    }
}