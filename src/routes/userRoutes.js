import express from 'express';
import {
  getAllUsers,
  getUserById,
  getUsersByCommandSetupDetailId,
  createUser,
  updateUser,
  deleteUser
} from '../controllers/userController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

router.route('/')
  .get(getAllUsers)
  .post(createUser);

router.route('/command/:commandSetupDetailId')
  .get(getUsersByCommandSetupDetailId);

router.route('/:id')
  .get(getUserById)
  .put(updateUser)
  .delete(deleteUser);

export default router;

