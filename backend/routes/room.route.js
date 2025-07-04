import express from 'express';

import { getRoom, createRoom, updateRoom, deleteRoom } from '../controllers/room.controller.js';

const router = express.Router();

router.get('/', getRoom);
router.post('/', createRoom);
router.put('/:id', updateRoom);
router.delete('/:id', deleteRoom);

export default router;