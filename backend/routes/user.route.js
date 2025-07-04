import express from 'express';

import { getUser, createUser, updateUser, deleteUser, loginUser, showUser, updateUserPassword } from '../controllers/user.controller.js';

const router = express.Router();

router.get('/', getUser);
router.post('/', createUser);
router.get('/:id', showUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
router.put('/:id/password', updateUserPassword);
router.post('/login', loginUser);


export default router;