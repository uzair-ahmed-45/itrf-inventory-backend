import { Equipment } from '../models/Equipment.js';
import { Unit } from '../models/Unit.js';
import sql from 'mssql';
import { getConnection } from '../config/database.js';

// Get dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    const pool = await getConnection();
    
    // Get equipment counts by status
    const statsResult = await pool.request().query(`
      SELECT 
        COUNT(*) as TotalEquipments,
        SUM(CASE WHEN Status = 'OPS' THEN 1 ELSE 0 END) as OPS,
        SUM(CASE WHEN Status = 'NON-OPS' THEN 1 ELSE 0 END) as NonOPS,
        SUM(CASE WHEN Status = 'UNDER-REPAIR' THEN 1 ELSE 0 END) as UnderRepair,
        SUM(CASE WHEN Status = 'BER' THEN 1 ELSE 0 END) as BER
      FROM Equipments
      WHERE isActive = 1
    `);

    const stats = statsResult.recordset[0];

    res.json({
      success: true,
      data: {
        totalEquipments: stats.TotalEquipments || 0,
        ops: stats.OPS || 0,
        nonOps: stats.NonOPS || 0,
        underRepair: stats.UnderRepair || 0,
        ber: stats.BER || 0
      }
    });
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics',
      error: error.message
    });
  }
};

// Get equipment by type
export const getEquipmentByType = async (req, res) => {
  try {
    const pool = await getConnection();
    
    const result = await pool.request().query(`
      SELECT 
        sd.SetupDetailName as Type,
        COUNT(*) as Count
      FROM Equipments e
      LEFT JOIN SetupDetails sd ON e.EquipmentTypeSetupDetailID = sd.SetupDetailID
      WHERE e.isActive = 1
      GROUP BY sd.SetupDetailName
      ORDER BY Count DESC
    `);

    res.json({
      success: true,
      data: result.recordset
    });
  } catch (error) {
    console.error('Error getting equipment by type:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching equipment by type',
      error: error.message
    });
  }
};

// Get equipment by status
export const getEquipmentByStatus = async (req, res) => {
  try {
    const pool = await getConnection();
    
    const result = await pool.request().query(`
      SELECT 
        Status,
        COUNT(*) as Count
      FROM Equipments
      WHERE isActive = 1
      GROUP BY Status
      ORDER BY Count DESC
    `);

    res.json({
      success: true,
      data: result.recordset
    });
  } catch (error) {
    console.error('Error getting equipment by status:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching equipment by status',
      error: error.message
    });
  }
};

// Get equipment by command
export const getEquipmentByCommand = async (req, res) => {
  try {
    const pool = await getConnection();
    
    const result = await pool.request().query(`
      SELECT 
        cmd.UnitID,
        cmd.UnitName as CommandName,
        cmd.CompanyID,
        COUNT(e.EquipmentID) as Count
      FROM Unit cmd
      LEFT JOIN Unit childUnit ON childUnit.ParentUnit = cmd.UnitID OR childUnit.UnitID = cmd.UnitID
      LEFT JOIN Equipments e ON CAST(e.Unit AS INT) = childUnit.UnitID AND e.isActive = 1
      WHERE cmd.CompanyID = 1 
        AND cmd.IsActive = 1 
        AND cmd.UnitName != 'NHQ'
        AND cmd.ParentUnit IS NOT NULL
      GROUP BY cmd.UnitID, cmd.UnitName, cmd.CompanyID
      HAVING COUNT(e.EquipmentID) > 0
      ORDER BY Count DESC
    `);

    res.json({
      success: true,
      data: result.recordset
    });
  } catch (error) {
    console.error('Error getting equipment by command:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching equipment by command',
      error: error.message
    });
  }
};

// Get equipment by units under a specific command
export const getEquipmentByUnitsInCommand = async (req, res) => {
  try {
    const { commandId } = req.params;
    const pool = await getConnection();
    
    const result = await pool.request()
      .input('CommandID', sql.Int, commandId)
      .query(`
        SELECT 
          un.UnitID,
          un.UnitName,
          COUNT(e.EquipmentID) as Count
        FROM Unit un
        LEFT JOIN Equipments e ON CAST(e.Unit AS INT) = un.UnitID AND e.isActive = 1
        WHERE (un.ParentUnit = @CommandID OR un.UnitID = @CommandID) AND un.IsActive = 1
        GROUP BY un.UnitID, un.UnitName
        HAVING COUNT(e.EquipmentID) > 0
        ORDER BY Count DESC
      `);

    res.json({
      success: true,
      data: result.recordset
    });
  } catch (error) {
    console.error('Error getting equipment by units in command:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching equipment by units',
      error: error.message
    });
  }
};

