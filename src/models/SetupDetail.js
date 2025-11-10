import sql from 'mssql';
import { getConnection } from '../config/database.js';

export class SetupDetail {
  // Get all setup details
  static async getAll() {
    const pool = await getConnection();
    const result = await pool.request()
      .query(`
        SELECT sd.*, s.SetupName 
        FROM SetupDetails sd
        LEFT JOIN Setup s ON sd.SMSID = s.SMSID
        ORDER BY s.SetupName, sd.SetupDetailName
      `);
    return result.recordset;
  }

  // Get setup detail by ID
  static async getById(setupDetailId) {
    const pool = await getConnection();
    const result = await pool.request()
      .input('SetupDetailID', sql.Int, setupDetailId)
      .query(`
        SELECT sd.*, s.SetupName 
        FROM SetupDetails sd
        LEFT JOIN Setup s ON sd.SMSID = s.SMSID
        WHERE sd.SetupDetailID = @SetupDetailID
      `);
    return result.recordset[0];
  }

  // Get setup details by SMS ID
  static async getBySMSId(smsId) {
    const pool = await getConnection();
    const result = await pool.request()
      .input('SMSID', sql.Int, smsId)
      .query(`
        SELECT sd.*, s.SetupName 
        FROM SetupDetails sd
        LEFT JOIN Setup s ON sd.SMSID = s.SMSID
        WHERE sd.SMSID = @SMSID
        ORDER BY sd.SetupDetailName
      `);
    return result.recordset;
  }

  // Create new setup detail
  static async create(setupDetailData) {
    const pool = await getConnection();
    const result = await pool.request()
      .input('SMSID', sql.Int, setupDetailData.smsID)
      .input('SetupDetailName', sql.NVarChar, setupDetailData.setupDetailName)
      .query(`
        INSERT INTO SetupDetails (SMSID, SetupDetailName)
        OUTPUT INSERTED.*
        VALUES (@SMSID, @SetupDetailName)
      `);
    return result.recordset[0];
  }

  // Update setup detail
  static async update(setupDetailId, setupDetailData) {
    const pool = await getConnection();
    const result = await pool.request()
      .input('SetupDetailID', sql.Int, setupDetailId)
      .input('SMSID', sql.Int, setupDetailData.smsID)
      .input('SetupDetailName', sql.NVarChar, setupDetailData.setupDetailName)
      .query(`
        UPDATE SetupDetails
        SET SMSID = @SMSID, SetupDetailName = @SetupDetailName, UpdatedAt = GETDATE()
        OUTPUT INSERTED.*
        WHERE SetupDetailID = @SetupDetailID
      `);
    return result.recordset[0];
  }

  // Delete setup detail
  static async delete(setupDetailId) {
    const pool = await getConnection();
    const result = await pool.request()
      .input('SetupDetailID', sql.Int, setupDetailId)
      .query('DELETE FROM SetupDetails WHERE SetupDetailID = @SetupDetailID');
    return result.rowsAffected[0] > 0;
  }
}

