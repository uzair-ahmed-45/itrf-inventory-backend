import express from 'express';
import {
  getAllUnits,
  getUnitById,
  getUnitsByParentUnit,
  getUnitsByCompanyId,
  createUnit,
  updateUnit,
  deleteUnit,
  getCommands,
  getUnitsByCommand
} from '../controllers/unitController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

router.route('/commands').get(getCommands);

router.route('/command/:commandId').get(getUnitsByCommand);

router.route('/parent/:parentUnitId').get(getUnitsByParentUnit);

router.route('/company/:companyId').get(getUnitsByCompanyId);

router.route('/')
  .get(getAllUnits)
  .post(createUnit);

router.route('/:id')
  .get(getUnitById)
  .put(updateUnit)
  .delete(deleteUnit);

export default router;

