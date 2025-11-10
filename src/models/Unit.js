import sql from 'mssql';
import { getConnection } from '../config/database.js';

export class Unit {
  // Get all units
  static async getAll() {
    const pool = await getConnection();
    const result = await pool.request()
      .query(`
        SELECT u.*,
               parent.UnitName as ParentUnitName
        FROM Unit u
        LEFT JOIN Unit parent ON u.ParentUnit = parent.UnitID
        WHERE u.IsActive = 1
        ORDER BY u.UnitName
      `);
    return result.recordset;
  }

  // Get unit by ID
  static async getById(unitId) {
    const pool = await getConnection();
    const result = await pool.request()
      .input('UnitID', sql.Int, unitId)
      .query(`
        SELECT u.*,
               parent.UnitName as ParentUnitName
        FROM Unit u
        LEFT JOIN Unit parent ON u.ParentUnit = parent.UnitID
        WHERE u.UnitID = @UnitID
      `);
    return result.recordset[0];
  }

  // Get units by parent unit
  static async getByParentUnit(parentUnitId) {
    const pool = await getConnection();
    const result = await pool.request()
      .input('ParentUnit', sql.Int, parentUnitId)
      .query(`
        SELECT u.*,
               parent.UnitName as ParentUnitName
        FROM Unit u
        LEFT JOIN Unit parent ON u.ParentUnit = parent.UnitID
        WHERE u.ParentUnit = @ParentUnit AND u.IsActive = 1
        ORDER BY u.UnitName
      `);
    return result.recordset;
  }

  // Get units by company ID
  static async getByCompanyId(companyId) {
    const pool = await getConnection();
    const result = await pool.request()
      .input('CompanyID', sql.Int, companyId)
      .query(`
        SELECT u.*,
               parent.UnitName as ParentUnitName
        FROM Unit u
        LEFT JOIN Unit parent ON u.ParentUnit = parent.UnitID
        WHERE u.CompanyID = @CompanyID AND u.IsActive = 1
        ORDER BY u.UnitName
      `);
    return result.recordset;
  }

  // Get unit by UnitCode
  static async getByUnitCode(unitCode) {
    const pool = await getConnection();
    const result = await pool.request()
      .input('UnitCode', sql.NVarChar, unitCode)
      .query(`
        SELECT u.*,
               parent.UnitName as ParentUnitName
        FROM Unit u
        LEFT JOIN Unit parent ON u.ParentUnit = parent.UnitID
        WHERE u.UnitCode = @UnitCode
      `);
    return result.recordset[0];
  }

  // Get all commands (units with CompanyID = 1)
  static async getCommands() {
    const pool = await getConnection();
    const result = await pool.request()
      .query(`
        SELECT u.*
        FROM Unit u
        WHERE u.CompanyID = 1 AND u.IsActive = 1
        ORDER BY u.UnitName
      `);
    return result.recordset;
  }

  // Get units by command (parent unit)
  static async getUnitsByCommand(commandId) {
    const pool = await getConnection();
    const result = await pool.request()
      .input('CommandID', sql.Int, commandId)
      .query(`
        SELECT u.*,
               parent.UnitName as ParentUnitName
        FROM Unit u
        LEFT JOIN Unit parent ON u.ParentUnit = parent.UnitID
        WHERE (u.ParentUnit = @CommandID OR u.UnitID = @CommandID) AND u.IsActive = 1
        ORDER BY u.UnitName
      `);
    return result.recordset;
  }

  // Create new unit
  static async create(unitData) {
    const pool = await getConnection();
    const result = await pool.request()
      .input('UnitCode', sql.NVarChar, unitData.unitCode)
      .input('UnitName', sql.NVarChar, unitData.unitName)
      .input('ParentUnit', sql.Int, unitData.parentUnit || null)
      .input('CompanyID', sql.Int, unitData.companyId || null)
      .input('IsActive', sql.Bit, unitData.isActive !== undefined ? unitData.isActive : true)
      .input('Remarks', sql.NVarChar, unitData.remarks || null)
      .query(`
        INSERT INTO Unit (UnitCode, UnitName, ParentUnit, CompanyID, IsActive, Remarks)
        OUTPUT INSERTED.*
        VALUES (@UnitCode, @UnitName, @ParentUnit, @CompanyID, @IsActive, @Remarks)
      `);
    return result.recordset[0];
  }

  // Update unit
  static async update(unitId, unitData) {
    const pool = await getConnection();
    const result = await pool.request()
      .input('UnitID', sql.Int, unitId)
      .input('UnitCode', sql.NVarChar, unitData.unitCode)
      .input('UnitName', sql.NVarChar, unitData.unitName)
      .input('ParentUnit', sql.Int, unitData.parentUnit || null)
      .input('CompanyID', sql.Int, unitData.companyId || null)
      .input('IsActive', sql.Bit, unitData.isActive)
      .input('Remarks', sql.NVarChar, unitData.remarks || null)
      .query(`
        UPDATE Unit
        SET UnitCode = @UnitCode,
            UnitName = @UnitName,
            ParentUnit = @ParentUnit,
            CompanyID = @CompanyID,
            IsActive = @IsActive,
            Remarks = @Remarks
        OUTPUT INSERTED.*
        WHERE UnitID = @UnitID
      `);
    return result.recordset[0];
  }

  // Delete unit (soft delete by setting IsActive to 0)
  static async delete(unitId) {
    const pool = await getConnection();
    const result = await pool.request()
      .input('UnitID', sql.Int, unitId)
      .query(`
        UPDATE Unit
        SET IsActive = 0
        WHERE UnitID = @UnitID
      `);
    return result.rowsAffected[0] > 0;
  }
}

