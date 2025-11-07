import express from 'express';
import {
  getAllSetups,
  getSetupById,
  createSetup,
  updateSetup,
  deleteSetup
} from '../controllers/setupController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

router.route('/')
  .get(getAllSetups)
  .post(createSetup);

router.route('/:id')
  .get(getSetupById)
  .put(updateSetup)
  .delete(deleteSetup);

export default router;

