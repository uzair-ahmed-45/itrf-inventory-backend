import { SetupDetail } from '../models/SetupDetail.js';

export const getAllSetupDetails = async (req, res) => {
  try {
    const setupDetails = await SetupDetail.getAll();
    res.json({
      success: true,
      count: setupDetails.length,
      data: setupDetails
    });
  } catch (error) {
    console.error('Error getting setup details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching setup details',
      error: error.message
    });
  }
};

export const getSetupDetailById = async (req, res) => {
  try {
    const setupDetail = await SetupDetail.getById(req.params.id);
    
    if (!setupDetail) {
      return res.status(404).json({
        success: false,
        message: 'Setup detail not found'
      });
    }
    
    res.json({
      success: true,
      data: setupDetail
    });
  } catch (error) {
    console.error('Error getting setup detail:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching setup detail',
      error: error.message
    });
  }
};

export const getSetupDetailsBySMSId = async (req, res) => {
  try {
    const setupDetails = await SetupDetail.getBySMSId(req.params.smsId);
    res.json({
      success: true,
      count: setupDetails.length,
      data: setupDetails
    });
  } catch (error) {
    console.error('Error getting setup details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching setup details',
      error: error.message
    });
  }
};

export const createSetupDetail = async (req, res) => {
  try {
    const { smsID, setupDetailName } = req.body;
    
    if (!smsID || !setupDetailName) {
      return res.status(400).json({
        success: false,
        message: 'SMS ID and Setup detail name are required'
      });
    }
    
    const setupDetail = await SetupDetail.create({ smsID, setupDetailName });
    
    res.status(201).json({
      success: true,
      message: 'Setup detail created successfully',
      data: setupDetail
    });
  } catch (error) {
    console.error('Error creating setup detail:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating setup detail',
      error: error.message
    });
  }
};

export const updateSetupDetail = async (req, res) => {
  try {
    const { smsID, setupDetailName } = req.body;
    
    if (!smsID || !setupDetailName) {
      return res.status(400).json({
        success: false,
        message: 'SMS ID and Setup detail name are required'
      });
    }
    
    const setupDetail = await SetupDetail.update(req.params.id, { smsID, setupDetailName });
    
    if (!setupDetail) {
      return res.status(404).json({
        success: false,
        message: 'Setup detail not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Setup detail updated successfully',
      data: setupDetail
    });
  } catch (error) {
    console.error('Error updating setup detail:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating setup detail',
      error: error.message
    });
  }
};

export const deleteSetupDetail = async (req, res) => {
  try {
    const deleted = await SetupDetail.delete(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Setup detail not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Setup detail deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting setup detail:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting setup detail',
      error: error.message
    });
  }
};

