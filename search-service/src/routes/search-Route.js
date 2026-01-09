import express from 'express'
import {authvalidate} from '../middleware/authentication.js';
import { searchPost } from '../controllers/search-controller.js';

const router=express.Router();

router.use(authvalidate);

router.get('/post',searchPost);

export default router;