import { Unit } from '../models/Unit.js';

// Get all units
export const getAllUnits = async (req, res) => {
  try {
    const units = await Unit.getAll();
    res.status(200).json({
      success: true,
      data: units,
      message: 'Units retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting all units:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving units',
      error: error.message
    });
  }
};

// Get unit by ID
export const getUnitById = async (req, res) => {
  try {
    const { id } = req.params;
    const unit = await Unit.getById(parseInt(id));
    
    if (!unit) {
      return res.status(404).json({
        success: false,
        message: 'Unit not found'
      });
    }

    res.status(200).json({
      success: true,
      data: unit,
      message: 'Unit retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting unit by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving unit',
      error: error.message
    });
  }
};

// Get units by parent unit
export const getUnitsByParentUnit = async (req, res) => {
  try {
    const { parentUnitId } = req.params;
    const units = await Unit.getByParentUnit(parseInt(parentUnitId));
    
    res.status(200).json({
      success: true,
      data: units,
      message: 'Units retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting units by parent unit:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving units',
      error: error.message
    });
  }
};

// Get units by company ID
export const getUnitsByCompanyId = async (req, res) => {
  try {
    const { companyId } = req.params;
    const units = await Unit.getByCompanyId(parseInt(companyId));
    
    res.status(200).json({
      success: true,
      data: units,
      message: 'Units retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting units by company ID:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving units',
      error: error.message
    });
  }
};

// Create new unit
export const createUnit = async (req, res) => {
  try {
    const unitData = req.body;
    
    // Check if UnitCode already exists
    if (unitData.unitCode) {
      const existingUnit = await Unit.getByUnitCode(unitData.unitCode);
      if (existingUnit) {
        return res.status(400).json({
          success: false,
          message: `Unit Code '${unitData.unitCode}' already exists. Please use a unique unit code.`
        });
      }
    }
    
    const newUnit = await Unit.create(unitData);
    
    res.status(201).json({
      success: true,
      data: newUnit,
      message: 'Unit created successfully'
    });
  } catch (error) {
    console.error('Error creating unit:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating unit',
      error: error.message
    });
  }
};

// Update unit
export const updateUnit = async (req, res) => {
  try {
    const { id } = req.params;
    const unitData = req.body;
    
    // Check if UnitCode already exists for a different unit
    if (unitData.unitCode) {
      const existingUnit = await Unit.getByUnitCode(unitData.unitCode);
      if (existingUnit && existingUnit.UnitID !== parseInt(id)) {
        return res.status(400).json({
          success: false,
          message: `Unit Code '${unitData.unitCode}' already exists. Please use a unique unit code.`
        });
      }
    }
    
    const updatedUnit = await Unit.update(parseInt(id), unitData);
    
    if (!updatedUnit) {
      return res.status(404).json({
        success: false,
        message: 'Unit not found'
      });
    }

    res.status(200).json({
      success: true,
      data: updatedUnit,
      message: 'Unit updated successfully'
    });
  } catch (error) {
    console.error('Error updating unit:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating unit',
      error: error.message
    });
  }
};

// Delete unit
export const deleteUnit = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Unit.delete(parseInt(id));
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Unit not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Unit deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting unit:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting unit',
      error: error.message
    });
  }
};

// Get all commands (units with CompanyID = 1)
export const getCommands = async (req, res) => {
  try {
    const commands = await Unit.getCommands();
    res.status(200).json({
      success: true,
      data: commands,
      message: 'Commands retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting commands:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving commands',
      error: error.message
    });
  }
};

// Get units by command
export const getUnitsByCommand = async (req, res) => {
  try {
    const { commandId } = req.params;
    const units = await Unit.getUnitsByCommand(parseInt(commandId));
    res.status(200).json({
      success: true,
      data: units,
      message: 'Units retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting units by command:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving units',
      error: error.message
    });
  }
};

