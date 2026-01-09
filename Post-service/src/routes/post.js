import express from 'express';
import {authvalidate} from '../middleware/authentication.js'
import {createPost,getAllPost,getPost,deletePost} from '../controllers/post-controller.js'
const router=express.Router();

router.use(authvalidate); // every route will pass through this auth verification

router.post('/createPost',createPost);
router.get('/get-Allpost',getAllPost);
router.get('/getpost/:id',getPost);
router.delete('/deletePost/:id',deletePost);


export default router;
