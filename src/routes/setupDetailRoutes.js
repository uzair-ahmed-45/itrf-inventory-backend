import express from 'express';
import {
  getAllSetupDetails,
  getSetupDetailById,
  getSetupDetailsBySMSId,
  createSetupDetail,
  updateSetupDetail,
  deleteSetupDetail
} from '../controllers/setupDetailController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

router.route('/')
  .get(getAllSetupDetails)
  .post(createSetupDetail);

router.route('/sms/:smsId')
  .get(getSetupDetailsBySMSId);

router.route('/:id')
  .get(getSetupDetailById)
  .put(updateSetupDetail)
  .delete(deleteSetupDetail);

export default router;

