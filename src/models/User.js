import sql from 'mssql';
import { getConnection } from '../config/database.js';

export class User {
  // Get all users
  static async getAll() {
    const pool = await getConnection();
    const result = await pool.request()
      .query(`
        SELECT u.*, sd.SetupDetailName as CommandName, s.SetupName
        FROM Users u
        LEFT JOIN SetupDetails sd ON u.CommandSetupDetailID = sd.SetupDetailID
        LEFT JOIN Setup s ON sd.SMSID = s.SMSID
        ORDER BY u.Username
      `);
    return result.recordset;
  }

  // Get user by ID
  static async getById(userId) {
    const pool = await getConnection();
    const result = await pool.request()
      .input('UserID', sql.Int, userId)
      .query(`
        SELECT u.*, sd.SetupDetailName as CommandName, s.SetupName
        FROM Users u
        LEFT JOIN SetupDetails sd ON u.CommandSetupDetailID = sd.SetupDetailID
        LEFT JOIN Setup s ON sd.SMSID = s.SMSID
        WHERE u.UserID = @UserID
      `);
    return result.recordset[0];
  }

  // Get user by username
  static async getByUsername(username) {
    const pool = await getConnection();
    const result = await pool.request()
      .input('Username', sql.NVarChar, username)
      .query('SELECT * FROM Users WHERE Username = @Username');
    return result.recordset[0];
  }

  // Get users by Command SetupDetail ID
  static async getByCommandSetupDetailId(commandSetupDetailId) {
    const pool = await getConnection();
    const result = await pool.request()
      .input('CommandSetupDetailID', sql.Int, commandSetupDetailId)
      .query(`
        SELECT u.*, sd.SetupDetailName as CommandName, s.SetupName
        FROM Users u
        LEFT JOIN SetupDetails sd ON u.CommandSetupDetailID = sd.SetupDetailID
        LEFT JOIN Setup s ON sd.SMSID = s.SMSID
        WHERE u.CommandSetupDetailID = @CommandSetupDetailID
        ORDER BY u.Username
      `);
    return result.recordset;
  }

  // Create new user
  static async create(userData) {
    const pool = await getConnection();
    const result = await pool.request()
      .input('Username', sql.NVarChar, userData.username)
      .input('Password', sql.NVarChar, userData.password)
      .input('FullName', sql.NVarChar, userData.fullName)
      .input('Role', sql.NVarChar, userData.role || 'user')
      .input('CommandSetupDetailID', sql.Int, userData.commandSetupDetailID || null)
      .query(`
        INSERT INTO Users (Username, Password, FullName, Role, CommandSetupDetailID)
        OUTPUT INSERTED.*
        VALUES (@Username, @Password, @FullName, @Role, @CommandSetupDetailID)
      `);
    return result.recordset[0];
  }

  // Update user
  static async update(userId, userData) {
    const pool = await getConnection();
    const result = await pool.request()
      .input('UserID', sql.Int, userId)
      .input('Username', sql.NVarChar, userData.username)
      .input('Password', sql.NVarChar, userData.password)
      .input('FullName', sql.NVarChar, userData.fullName)
      .input('Role', sql.NVarChar, userData.role)
      .input('CommandSetupDetailID', sql.Int, userData.commandSetupDetailID || null)
      .query(`
        UPDATE Users
        SET Username = @Username, Password = @Password, FullName = @FullName, 
            Role = @Role, CommandSetupDetailID = @CommandSetupDetailID, UpdatedAt = GETDATE()
        OUTPUT INSERTED.*
        WHERE UserID = @UserID
      `);
    return result.recordset[0];
  }

  // Delete user
  static async delete(userId) {
    const pool = await getConnection();
    const result = await pool.request()
      .input('UserID', sql.Int, userId)
      .query('DELETE FROM Users WHERE UserID = @UserID');
    return result.rowsAffected[0] > 0;
  }
}

