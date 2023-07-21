import express from "express"
import multer from "multer"
import mongoose from "mongoose"
import cors from 'cors'
import { registerValidation, loginValidation, postCreateValidation } from "./validations.js"
import { checkAuth, handleValidationErrors } from './utils/index.js'
import { UserController, PostController } from "./controllers/index.js"

mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => { console.log("db ok") })
    .catch((err) => { console.log("DB error", err) })

const app = express()

const storage = multer.diskStorage({
    destination: (_, __, cb) => {
        cb(null, 'uploads')
    },
    filename: (_, file, cb) => {
        cb(null, file.originalname)
    }
})

const upload = multer({ storage })

app.use(express.json())
app.use('/uploads', express.static('uploads'))
app.use(cors())
app.get('/', (req, res) => {
    res.send('Hello, world!')
})

app.post('/auth/login', loginValidation, handleValidationErrors, UserController.login);
app.post('/auth/register', registerValidation, handleValidationErrors, UserController.register);
app.get('/auth/me', checkAuth, UserController.getMe);

app.post('/upload', checkAuth, upload.single('image'), (req, res) => {
    res.json({
        url: `/uploads/${req.file.originalname}`
    })
})

app.get('/tags', PostController.getLastTags);
app.get('/tags/:name', PostController.getTagSortedPost);
app.post('/posts', checkAuth, postCreateValidation, handleValidationErrors, PostController.create);
app.get('/comments', PostController.getLastComm);
app.patch('/posts/:id/comment', checkAuth, postCreateValidation, handleValidationErrors, PostController.comment);
app.get('/posts', PostController.getAll);
app.get('/posts/popular', PostController.getPopularPosts);
app.get('/posts/:id', PostController.getOne);
app.patch('/posts/:id', checkAuth, postCreateValidation, handleValidationErrors, PostController.update);
app.delete('/posts/:id', checkAuth, PostController.remove);

const port = process.env.PORT || 4444
app.listen(port, (err) => {
    if (err) {
        console.log(err);
    }
    console.log('server ok')
}) 