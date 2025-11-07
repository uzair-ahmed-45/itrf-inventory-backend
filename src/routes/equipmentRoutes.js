import express from 'express';
import {
  getAllEquipments,
  getEquipmentById,
  getEquipmentsByType,
  getEquipmentBySerialNo,
  searchEquipments,
  createEquipment,
  updateEquipment,
  deleteEquipment
} from '../controllers/equipmentController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

router.route('/search').get(searchEquipments);

router.route('/type/:equipmentTypeSetupDetailId').get(getEquipmentsByType);

router.route('/serial/:serialNo').get(getEquipmentBySerialNo);

router.route('/')
  .get(getAllEquipments)
  .post(createEquipment);

router.route('/:id')
  .get(getEquipmentById)
  .put(updateEquipment)
  .delete(deleteEquipment);

export default router;

