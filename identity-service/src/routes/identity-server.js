import express from 'express'
import {Registration,Login} from '../controllers/identity-controller.js'
const router=express.Router();

router.post('/register',Registration);

router.post('/login',Login);

export default router;

