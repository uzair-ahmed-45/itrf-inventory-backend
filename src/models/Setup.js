import sql from 'mssql';
import { getConnection } from '../config/database.js';

export class Setup {
  // Get all setups
  static async getAll() {
    const pool = await getConnection();
    const result = await pool.request().query('SELECT * FROM Setup ORDER BY SetupName');
    return result.recordset;
  }

  // Get setup by ID
  static async getById(smsId) {
    const pool = await getConnection();
    const result = await pool.request()
      .input('SMSID', sql.Int, smsId)
      .query('SELECT * FROM Setup WHERE SMSID = @SMSID');
    return result.recordset[0];
  }

  // Create new setup
  static async create(setupData) {
    const pool = await getConnection();
    const result = await pool.request()
      .input('SetupName', sql.NVarChar, setupData.setupName)
      .query(`
        INSERT INTO Setup (SetupName)
        OUTPUT INSERTED.*
        VALUES (@SetupName)
      `);
    return result.recordset[0];
  }

  // Update setup
  static async update(smsId, setupData) {
    const pool = await getConnection();
    const result = await pool.request()
      .input('SMSID', sql.Int, smsId)
      .input('SetupName', sql.NVarChar, setupData.setupName)
      .query(`
        UPDATE Setup
        SET SetupName = @SetupName, UpdatedAt = GETDATE()
        OUTPUT INSERTED.*
        WHERE SMSID = @SMSID
      `);
    return result.recordset[0];
  }

  // Delete setup
  static async delete(smsId) {
    const pool = await getConnection();
    const result = await pool.request()
      .input('SMSID', sql.Int, smsId)
      .query('DELETE FROM Setup WHERE SMSID = @SMSID');
    return result.rowsAffected[0] > 0;
  }
}

