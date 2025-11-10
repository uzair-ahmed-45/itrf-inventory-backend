import { Equipment } from '../models/Equipment.js';

export const getAllEquipments = async (req, res) => {
  try {
    const equipments = await Equipment.getAll();
    res.json({
      success: true,
      count: equipments.length,
      data: equipments
    });
  } catch (error) {
    console.error('Error getting equipments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching equipments',
      error: error.message
    });
  }
};

export const getEquipmentById = async (req, res) => {
  try {
    const equipment = await Equipment.getById(req.params.id);
    
    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }
    
    res.json({
      success: true,
      data: equipment
    });
  } catch (error) {
    console.error('Error getting equipment:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching equipment',
      error: error.message
    });
  }
};

export const getEquipmentsByType = async (req, res) => {
  try {
    const equipments = await Equipment.getByEquipmentTypeSetupDetailId(req.params.equipmentTypeSetupDetailId);
    res.json({
      success: true,
      count: equipments.length,
      data: equipments
    });
  } catch (error) {
    console.error('Error getting equipments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching equipments',
      error: error.message
    });
  }
};

export const getEquipmentBySerialNo = async (req, res) => {
  try {
    const equipment = await Equipment.getBySerialNo(req.params.serialNo);
    
    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }
    
    res.json({
      success: true,
      data: equipment
    });
  } catch (error) {
    console.error('Error getting equipment:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching equipment',
      error: error.message
    });
  }
};

export const searchEquipments = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }
    
    const equipments = await Equipment.search(q);
    res.json({
      success: true,
      count: equipments.length,
      data: equipments
    });
  } catch (error) {
    console.error('Error searching equipments:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching equipments',
      error: error.message
    });
  }
};

export const createEquipment = async (req, res) => {
  try {
    // Check if SerialNo is provided and if it already exists
    if (req.body.serialNo) {
      const existingEquipment = await Equipment.getBySerialNo(req.body.serialNo);
      if (existingEquipment) {
        return res.status(400).json({
          success: false,
          message: `Serial Number '${req.body.serialNo}' already exists. Please use a unique serial number.`
        });
      }
    }

    const equipment = await Equipment.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Equipment created successfully',
      data: equipment
    });
  } catch (error) {
    console.error('Error creating equipment:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating equipment',
      error: error.message
    });
  }
};

export const updateEquipment = async (req, res) => {
  try {
    // Check if SerialNo is provided and if it already exists for a different equipment
    if (req.body.serialNo) {
      const existingEquipment = await Equipment.getBySerialNo(req.body.serialNo);
      if (existingEquipment && existingEquipment.EquipmentID !== parseInt(req.params.id)) {
        return res.status(400).json({
          success: false,
          message: `Serial Number '${req.body.serialNo}' already exists. Please use a unique serial number.`
        });
      }
    }

    const equipment = await Equipment.update(req.params.id, req.body);
    
    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Equipment updated successfully',
      data: equipment
    });
  } catch (error) {
    console.error('Error updating equipment:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating equipment',
      error: error.message
    });
  }
};

export const deleteEquipment = async (req, res) => {
  try {
    const deleted = await Equipment.delete(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Equipment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting equipment:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting equipment',
      error: error.message
    });
  }
};

