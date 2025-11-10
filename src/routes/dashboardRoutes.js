import express from 'express';
import {
  getDashboardStats,
  getEquipmentByType,
  getEquipmentByStatus,
  getEquipmentByCommand,
  getEquipmentByUnitsInCommand
} from '../controllers/dashboardController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

router.route('/stats').get(getDashboardStats);
router.route('/equipment-by-type').get(getEquipmentByType);
router.route('/equipment-by-status').get(getEquipmentByStatus);
router.route('/equipment-by-command').get(getEquipmentByCommand);
router.route('/equipment-by-command/:commandId/units').get(getEquipmentByUnitsInCommand);

export default router;

