import { User } from '../models/User.js';

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.getAll();
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.getById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
};

export const getUsersByCommandSetupDetailId = async (req, res) => {
  try {
    const users = await User.getByCommandSetupDetailId(req.params.commandSetupDetailId);
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

export const createUser = async (req, res) => {
  try {
    const { username, password, fullName, role, commandSetupDetailID } = req.body;
    
    if (!username || !password || !fullName) {
      return res.status(400).json({
        success: false,
        message: 'Username, password, and full name are required'
      });
    }
    
    const user = await User.create({ 
      username, 
      password, 
      fullName, 
      role, 
      commandSetupDetailID 
    });
    
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: error.message
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { username, password, fullName, role, commandSetupDetailID } = req.body;
    
    if (!username || !password || !fullName) {
      return res.status(400).json({
        success: false,
        message: 'Username, password, and full name are required'
      });
    }
    
    const user = await User.update(req.params.id, { 
      username, 
      password, 
      fullName, 
      role, 
      commandSetupDetailID 
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const deleted = await User.delete(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
};

