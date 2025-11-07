import { Setup } from '../models/Setup.js';

export const getAllSetups = async (req, res) => {
  try {
    const setups = await Setup.getAll();
    res.json({
      success: true,
      count: setups.length,
      data: setups
    });
  } catch (error) {
    console.error('Error getting setups:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching setups',
      error: error.message
    });
  }
};

export const getSetupById = async (req, res) => {
  try {
    const setup = await Setup.getById(req.params.id);
    
    if (!setup) {
      return res.status(404).json({
        success: false,
        message: 'Setup not found'
      });
    }
    
    res.json({
      success: true,
      data: setup
    });
  } catch (error) {
    console.error('Error getting setup:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching setup',
      error: error.message
    });
  }
};

export const createSetup = async (req, res) => {
  try {
    const { setupName } = req.body;
    
    if (!setupName) {
      return res.status(400).json({
        success: false,
        message: 'Setup name is required'
      });
    }
    
    const setup = await Setup.create({ setupName });
    
    res.status(201).json({
      success: true,
      message: 'Setup created successfully',
      data: setup
    });
  } catch (error) {
    console.error('Error creating setup:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating setup',
      error: error.message
    });
  }
};

export const updateSetup = async (req, res) => {
  try {
    const { setupName } = req.body;
    
    if (!setupName) {
      return res.status(400).json({
        success: false,
        message: 'Setup name is required'
      });
    }
    
    const setup = await Setup.update(req.params.id, { setupName });
    
    if (!setup) {
      return res.status(404).json({
        success: false,
        message: 'Setup not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Setup updated successfully',
      data: setup
    });
  } catch (error) {
    console.error('Error updating setup:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating setup',
      error: error.message
    });
  }
};

export const deleteSetup = async (req, res) => {
  try {
    const deleted = await Setup.delete(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Setup not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Setup deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting setup:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting setup',
      error: error.message
    });
  }
};

