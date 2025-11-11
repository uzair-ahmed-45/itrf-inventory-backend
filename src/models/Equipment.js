import sql from 'mssql';
import { getConnection } from '../config/database.js';

export class Equipment {
  // Get all equipments with joined data (only active ones)
  static async getAll() {
    const pool = await getConnection();
    const result = await pool.request()
      .query(`
        SELECT e.*, 
               sd.SetupDetailName as EquipmentTypeName,
               s.SetupName,
               un.UnitName as UnitName,
               un.UnitCode as UnitCode,
               usr.Username as CreatedByUsername,
               usr.FullName as CreatedByFullName
        FROM Equipments e
        LEFT JOIN SetupDetails sd ON e.EquipmentTypeSetupDetailID = sd.SetupDetailID
        LEFT JOIN Setup s ON sd.SMSID = s.SMSID
        LEFT JOIN Unit un ON CAST(e.Unit AS INT) = un.UnitID
        LEFT JOIN Users usr ON e.CreatedBy = usr.UserID
        WHERE e.isActive = 1
        ORDER BY e.UpdatedAt DESC, e.CreatedAt DESC
      `);
    return result.recordset;
  }

  // Get equipment by ID (only if active)
  static async getById(equipmentId) {
    const pool = await getConnection();
    const result = await pool.request()
      .input('EquipmentID', sql.Int, equipmentId)
      .query(`
        SELECT e.*, 
               sd.SetupDetailName as EquipmentTypeName,
               s.SetupName,
               un.UnitName as UnitName,
               un.UnitCode as UnitCode,
               usr.Username as CreatedByUsername,
               usr.FullName as CreatedByFullName
        FROM Equipments e
        LEFT JOIN SetupDetails sd ON e.EquipmentTypeSetupDetailID = sd.SetupDetailID
        LEFT JOIN Setup s ON sd.SMSID = s.SMSID
        LEFT JOIN Unit un ON CAST(e.Unit AS INT) = un.UnitID
        LEFT JOIN Users usr ON e.CreatedBy = usr.UserID
        WHERE e.EquipmentID = @EquipmentID AND e.isActive = 1
      `);
    return result.recordset[0];
  }

  // Get equipments by Equipment Type SetupDetail ID (only active ones)
  static async getByEquipmentTypeSetupDetailId(equipmentTypeSetupDetailId) {
    const pool = await getConnection();
    const result = await pool.request()
      .input('EquipmentTypeSetupDetailID', sql.Int, equipmentTypeSetupDetailId)
      .query(`
        SELECT e.*, 
               sd.SetupDetailName as EquipmentTypeName,
               s.SetupName,
               un.UnitName as UnitName,
               un.UnitCode as UnitCode,
               usr.Username as CreatedByUsername,
               usr.FullName as CreatedByFullName
        FROM Equipments e
        LEFT JOIN SetupDetails sd ON e.EquipmentTypeSetupDetailID = sd.SetupDetailID
        LEFT JOIN Setup s ON sd.SMSID = s.SMSID
        LEFT JOIN Unit un ON CAST(e.Unit AS INT) = un.UnitID
        LEFT JOIN Users usr ON e.CreatedBy = usr.UserID
        WHERE e.EquipmentTypeSetupDetailID = @EquipmentTypeSetupDetailID AND e.isActive = 1
        ORDER BY e.Equipment
      `);
    return result.recordset;
  }

  // Get equipment by Serial Number (only active ones)
  static async getBySerialNo(serialNo) {
    const pool = await getConnection();
    const result = await pool.request()
      .input('SerialNo', sql.NVarChar, serialNo)
      .query(`
        SELECT e.*, 
               sd.SetupDetailName as EquipmentTypeName,
               s.SetupName,
               un.UnitName as UnitName,
               un.UnitCode as UnitCode,
               usr.Username as CreatedByUsername,
               usr.FullName as CreatedByFullName
        FROM Equipments e
        LEFT JOIN SetupDetails sd ON e.EquipmentTypeSetupDetailID = sd.SetupDetailID
        LEFT JOIN Setup s ON sd.SMSID = s.SMSID
        LEFT JOIN Unit un ON CAST(e.Unit AS INT) = un.UnitID
        LEFT JOIN Users usr ON e.CreatedBy = usr.UserID
        WHERE e.SerialNo = @SerialNo AND e.isActive = 1
      `);
    return result.recordset[0];
  }

  // Search equipments (only active ones)
  static async search(searchTerm) {
    const pool = await getConnection();
    const searchPattern = `%${searchTerm}%`;
    const result = await pool.request()
      .input('SearchTerm', sql.NVarChar, searchPattern)
      .query(`
        SELECT e.*, 
               sd.SetupDetailName as EquipmentTypeName,
               s.SetupName,
               un.UnitName as UnitName,
               un.UnitCode as UnitCode,
               usr.Username as CreatedByUsername,
               usr.FullName as CreatedByFullName
        FROM Equipments e
        LEFT JOIN SetupDetails sd ON e.EquipmentTypeSetupDetailID = sd.SetupDetailID
        LEFT JOIN Setup s ON sd.SMSID = s.SMSID
        LEFT JOIN Unit un ON CAST(e.Unit AS INT) = un.UnitID
        LEFT JOIN Users usr ON e.CreatedBy = usr.UserID
        WHERE e.isActive = 1 
          AND (e.Equipment LIKE @SearchTerm 
           OR e.SerialNo LIKE @SearchTerm 
           OR e.MakeModel LIKE @SearchTerm
           OR sd.SetupDetailName LIKE @SearchTerm
           OR un.UnitName LIKE @SearchTerm)
        ORDER BY e.Equipment
      `);
    return result.recordset;
  }

  // Create new equipment
  static async create(equipmentData) {
    const pool = await getConnection();
    
    // Helper function to handle empty strings
    const sanitizeString = (value) => {
      if (value === null || value === undefined || value === '') return null;
      return value.toString().trim() || null;
    };

    const result = await pool.request()
      .input('Unit', sql.NVarChar, sanitizeString(equipmentData.unit))
      .input('EquipmentTypeSetupDetailID', sql.Int, equipmentData.equipmentTypeSetupDetailID)
      .input('Equipment', sql.NVarChar, equipmentData.equipment)
      .input('SerialNo', sql.NVarChar, sanitizeString(equipmentData.serialNo))
      .input('MakeModel', sql.NVarChar, sanitizeString(equipmentData.makeModel))
      .input('Processor', sql.NVarChar, sanitizeString(equipmentData.processor))
      .input('RAM', sql.NVarChar, sanitizeString(equipmentData.ram))
      .input('Storage', sql.NVarChar, sanitizeString(equipmentData.storage))
      .input('OpticalDrive', sql.NVarChar, sanitizeString(equipmentData.opticalDrive))
      .input('NIC', sql.NVarChar, sanitizeString(equipmentData.nic))
      .input('PowerSupply', sql.NVarChar, sanitizeString(equipmentData.powerSupply))
      .input('DateOfPurchase', sql.Date, equipmentData.dateOfPurchase || null)
      .input('SourceOfProcurement', sql.NVarChar, sanitizeString(equipmentData.sourceOfProcurement))
      .input('ContractLPONoDate', sql.NVarChar, sanitizeString(equipmentData.contractLPONoDate))
      .input('Cost', sql.Decimal(18, 2), equipmentData.cost || null)
      .input('OEMInfo', sql.NVarChar, sanitizeString(equipmentData.oemInfo))
      .input('LocalOEMRep', sql.NVarChar, sanitizeString(equipmentData.localOEMRep))
      .input('WarrantyExpiryDate', sql.Date, equipmentData.warrantyExpiryDate || null)
      .input('SLARecDMDetails', sql.NVarChar, sanitizeString(equipmentData.slaRecDMDetails))
      .input('Status', sql.NVarChar, sanitizeString(equipmentData.status))
      .input('Remarks', sql.NVarChar, sanitizeString(equipmentData.remarks))
      .input('ReferenceNo', sql.NVarChar, sanitizeString(equipmentData.referenceNo))
      .input('CreatedBy', sql.Int, equipmentData.createdBy || null)
      .input('IsActive', sql.Bit, 1)
      .query(`
        INSERT INTO Equipments (
          Unit, EquipmentTypeSetupDetailID, Equipment, SerialNo, MakeModel, Processor, RAM, Storage,
          OpticalDrive, NIC, PowerSupply, DateOfPurchase, SourceOfProcurement, 
          ContractLPONoDate, Cost, OEMInfo, LocalOEMRep, WarrantyExpiryDate, 
          SLARecDMDetails, Status, Remarks, ReferenceNo, CreatedBy, isActive
        )
        OUTPUT INSERTED.*
        VALUES (
          @Unit, @EquipmentTypeSetupDetailID, @Equipment, @SerialNo, @MakeModel, @Processor, @RAM, @Storage,
          @OpticalDrive, @NIC, @PowerSupply, @DateOfPurchase, @SourceOfProcurement,
          @ContractLPONoDate, @Cost, @OEMInfo, @LocalOEMRep, @WarrantyExpiryDate,
          @SLARecDMDetails, @Status, @Remarks, @ReferenceNo, @CreatedBy, @IsActive
        )
      `);
    return result.recordset[0];
  }

  // Update equipment
  static async update(equipmentId, equipmentData) {
    const pool = await getConnection();
    
    // Helper function to handle empty strings
    const sanitizeString = (value) => {
      if (value === null || value === undefined || value === '') return null;
      return value.toString().trim() || null;
    };

    const result = await pool.request()
      .input('EquipmentID', sql.Int, equipmentId)
      .input('Unit', sql.NVarChar, sanitizeString(equipmentData.unit))
      .input('EquipmentTypeSetupDetailID', sql.Int, equipmentData.equipmentTypeSetupDetailID)
      .input('Equipment', sql.NVarChar, equipmentData.equipment)
      .input('SerialNo', sql.NVarChar, sanitizeString(equipmentData.serialNo))
      .input('MakeModel', sql.NVarChar, sanitizeString(equipmentData.makeModel))
      .input('Processor', sql.NVarChar, sanitizeString(equipmentData.processor))
      .input('RAM', sql.NVarChar, sanitizeString(equipmentData.ram))
      .input('Storage', sql.NVarChar, sanitizeString(equipmentData.storage))
      .input('OpticalDrive', sql.NVarChar, sanitizeString(equipmentData.opticalDrive))
      .input('NIC', sql.NVarChar, sanitizeString(equipmentData.nic))
      .input('PowerSupply', sql.NVarChar, sanitizeString(equipmentData.powerSupply))
      .input('DateOfPurchase', sql.Date, equipmentData.dateOfPurchase || null)
      .input('SourceOfProcurement', sql.NVarChar, sanitizeString(equipmentData.sourceOfProcurement))
      .input('ContractLPONoDate', sql.NVarChar, sanitizeString(equipmentData.contractLPONoDate))
      .input('Cost', sql.Decimal(18, 2), equipmentData.cost || null)
      .input('OEMInfo', sql.NVarChar, sanitizeString(equipmentData.oemInfo))
      .input('LocalOEMRep', sql.NVarChar, sanitizeString(equipmentData.localOEMRep))
      .input('WarrantyExpiryDate', sql.Date, equipmentData.warrantyExpiryDate || null)
      .input('SLARecDMDetails', sql.NVarChar, sanitizeString(equipmentData.slaRecDMDetails))
      .input('Status', sql.NVarChar, sanitizeString(equipmentData.status))
      .input('Remarks', sql.NVarChar, sanitizeString(equipmentData.remarks))
      .input('ReferenceNo', sql.NVarChar, sanitizeString(equipmentData.referenceNo))
      .query(`
        UPDATE Equipments
        SET Unit = @Unit, EquipmentTypeSetupDetailID = @EquipmentTypeSetupDetailID, 
            Equipment = @Equipment, SerialNo = @SerialNo, MakeModel = @MakeModel,
            Processor = @Processor, RAM = @RAM, Storage = @Storage,
            OpticalDrive = @OpticalDrive, NIC = @NIC, PowerSupply = @PowerSupply,
            DateOfPurchase = @DateOfPurchase, SourceOfProcurement = @SourceOfProcurement,
            ContractLPONoDate = @ContractLPONoDate, Cost = @Cost, OEMInfo = @OEMInfo,
            LocalOEMRep = @LocalOEMRep, WarrantyExpiryDate = @WarrantyExpiryDate,
            SLARecDMDetails = @SLARecDMDetails, Status = @Status, Remarks = @Remarks,
            ReferenceNo = @ReferenceNo, UpdatedAt = GETDATE()
        OUTPUT INSERTED.*
        WHERE EquipmentID = @EquipmentID
      `);
    return result.recordset[0];
  }

  // Delete equipment (soft delete - set isActive to 0)
  static async delete(equipmentId) {
    const pool = await getConnection();
    const result = await pool.request()
      .input('EquipmentID', sql.Int, equipmentId)
      .query(`
        UPDATE Equipments
        SET isActive = 0, UpdatedAt = GETDATE()
        WHERE EquipmentID = @EquipmentID AND isActive = 1
      `);
    return result.rowsAffected[0] > 0;
  }
}

