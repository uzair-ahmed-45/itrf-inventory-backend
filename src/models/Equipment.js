import sql from 'mssql';
import { getConnection } from '../config/database.js';

export class Equipment {
  // Get all equipments with joined data
  static async getAll() {
    const pool = await getConnection();
    const result = await pool.request()
      .query(`
        SELECT e.*, 
               sd.SetupDetailName as EquipmentTypeName,
               s.SetupName,
               u.Username as CreatedByUsername,
               u.FullName as CreatedByFullName
        FROM Equipments e
        LEFT JOIN SetupDetails sd ON e.EquipmentTypeSetupDetailID = sd.SetupDetailID
        LEFT JOIN Setup s ON sd.SMSID = s.SMSID
        LEFT JOIN Users u ON e.CreatedBy = u.UserID
        ORDER BY e.CreatedAt DESC
      `);
    return result.recordset;
  }

  // Get equipment by ID
  static async getById(equipmentId) {
    const pool = await getConnection();
    const result = await pool.request()
      .input('EquipmentID', sql.Int, equipmentId)
      .query(`
        SELECT e.*, 
               sd.SetupDetailName as EquipmentTypeName,
               s.SetupName,
               u.Username as CreatedByUsername,
               u.FullName as CreatedByFullName
        FROM Equipments e
        LEFT JOIN SetupDetails sd ON e.EquipmentTypeSetupDetailID = sd.SetupDetailID
        LEFT JOIN Setup s ON sd.SMSID = s.SMSID
        LEFT JOIN Users u ON e.CreatedBy = u.UserID
        WHERE e.EquipmentID = @EquipmentID
      `);
    return result.recordset[0];
  }

  // Get equipments by Equipment Type SetupDetail ID
  static async getByEquipmentTypeSetupDetailId(equipmentTypeSetupDetailId) {
    const pool = await getConnection();
    const result = await pool.request()
      .input('EquipmentTypeSetupDetailID', sql.Int, equipmentTypeSetupDetailId)
      .query(`
        SELECT e.*, 
               sd.SetupDetailName as EquipmentTypeName,
               s.SetupName,
               u.Username as CreatedByUsername,
               u.FullName as CreatedByFullName
        FROM Equipments e
        LEFT JOIN SetupDetails sd ON e.EquipmentTypeSetupDetailID = sd.SetupDetailID
        LEFT JOIN Setup s ON sd.SMSID = s.SMSID
        LEFT JOIN Users u ON e.CreatedBy = u.UserID
        WHERE e.EquipmentTypeSetupDetailID = @EquipmentTypeSetupDetailID
        ORDER BY e.Equipment
      `);
    return result.recordset;
  }

  // Get equipment by Serial Number
  static async getBySerialNo(serialNo) {
    const pool = await getConnection();
    const result = await pool.request()
      .input('SerialNo', sql.NVarChar, serialNo)
      .query(`
        SELECT e.*, 
               sd.SetupDetailName as EquipmentTypeName,
               s.SetupName,
               u.Username as CreatedByUsername,
               u.FullName as CreatedByFullName
        FROM Equipments e
        LEFT JOIN SetupDetails sd ON e.EquipmentTypeSetupDetailID = sd.SetupDetailID
        LEFT JOIN Setup s ON sd.SMSID = s.SMSID
        LEFT JOIN Users u ON e.CreatedBy = u.UserID
        WHERE e.SerialNo = @SerialNo
      `);
    return result.recordset[0];
  }

  // Search equipments
  static async search(searchTerm) {
    const pool = await getConnection();
    const searchPattern = `%${searchTerm}%`;
    const result = await pool.request()
      .input('SearchTerm', sql.NVarChar, searchPattern)
      .query(`
        SELECT e.*, 
               sd.SetupDetailName as EquipmentTypeName,
               s.SetupName,
               u.Username as CreatedByUsername,
               u.FullName as CreatedByFullName
        FROM Equipments e
        LEFT JOIN SetupDetails sd ON e.EquipmentTypeSetupDetailID = sd.SetupDetailID
        LEFT JOIN Setup s ON sd.SMSID = s.SMSID
        LEFT JOIN Users u ON e.CreatedBy = u.UserID
        WHERE e.Equipment LIKE @SearchTerm 
           OR e.SerialNo LIKE @SearchTerm 
           OR e.MakeModel LIKE @SearchTerm
           OR sd.SetupDetailName LIKE @SearchTerm
        ORDER BY e.Equipment
      `);
    return result.recordset;
  }

  // Create new equipment
  static async create(equipmentData) {
    const pool = await getConnection();
    const result = await pool.request()
      .input('SNO', sql.NVarChar, equipmentData.sno || null)
      .input('Unit', sql.NVarChar, equipmentData.unit || null)
      .input('EquipmentTypeSetupDetailID', sql.Int, equipmentData.equipmentTypeSetupDetailID)
      .input('Equipment', sql.NVarChar, equipmentData.equipment)
      .input('SerialNo', sql.NVarChar, equipmentData.serialNo || null)
      .input('MakeModel', sql.NVarChar, equipmentData.makeModel || null)
      .input('Processor', sql.NVarChar, equipmentData.processor || null)
      .input('RAM', sql.NVarChar, equipmentData.ram || null)
      .input('Storage', sql.NVarChar, equipmentData.storage || null)
      .input('OpticalDrive', sql.NVarChar, equipmentData.opticalDrive || null)
      .input('NIC', sql.NVarChar, equipmentData.nic || null)
      .input('PowerSupply', sql.NVarChar, equipmentData.powerSupply || null)
      .input('DateOfPurchase', sql.Date, equipmentData.dateOfPurchase || null)
      .input('SourceOfProcurement', sql.NVarChar, equipmentData.sourceOfProcurement || null)
      .input('ContractLPONoDate', sql.NVarChar, equipmentData.contractLPONoDate || null)
      .input('Cost', sql.Decimal(18, 2), equipmentData.cost || null)
      .input('OEMInfo', sql.NVarChar, equipmentData.oemInfo || null)
      .input('LocalOEMRep', sql.NVarChar, equipmentData.localOEMRep || null)
      .input('WarrantyExpiryDate', sql.Date, equipmentData.warrantyExpiryDate || null)
      .input('SLARecDMDetails', sql.NVarChar, equipmentData.slaRecDMDetails || null)
      .input('Status', sql.NVarChar, equipmentData.status || null)
      .input('Remarks', sql.NVarChar, equipmentData.remarks || null)
      .input('ReferenceNo', sql.NVarChar, equipmentData.referenceNo || null)
      .input('CreatedBy', sql.Int, equipmentData.createdBy || null)
      .query(`
        INSERT INTO Equipments (
          SNO, Unit, EquipmentTypeSetupDetailID, Equipment, SerialNo, MakeModel, Processor, RAM, Storage,
          OpticalDrive, NIC, PowerSupply, DateOfPurchase, SourceOfProcurement, 
          ContractLPONoDate, Cost, OEMInfo, LocalOEMRep, WarrantyExpiryDate, 
          SLARecDMDetails, Status, Remarks, ReferenceNo, CreatedBy
        )
        OUTPUT INSERTED.*
        VALUES (
          @SNO, @Unit, @EquipmentTypeSetupDetailID, @Equipment, @SerialNo, @MakeModel, @Processor, @RAM, @Storage,
          @OpticalDrive, @NIC, @PowerSupply, @DateOfPurchase, @SourceOfProcurement,
          @ContractLPONoDate, @Cost, @OEMInfo, @LocalOEMRep, @WarrantyExpiryDate,
          @SLARecDMDetails, @Status, @Remarks, @ReferenceNo, @CreatedBy
        )
      `);
    return result.recordset[0];
  }

  // Update equipment
  static async update(equipmentId, equipmentData) {
    const pool = await getConnection();
    const result = await pool.request()
      .input('EquipmentID', sql.Int, equipmentId)
      .input('SNO', sql.NVarChar, equipmentData.sno || null)
      .input('Unit', sql.NVarChar, equipmentData.unit || null)
      .input('EquipmentTypeSetupDetailID', sql.Int, equipmentData.equipmentTypeSetupDetailID)
      .input('Equipment', sql.NVarChar, equipmentData.equipment)
      .input('SerialNo', sql.NVarChar, equipmentData.serialNo || null)
      .input('MakeModel', sql.NVarChar, equipmentData.makeModel || null)
      .input('Processor', sql.NVarChar, equipmentData.processor || null)
      .input('RAM', sql.NVarChar, equipmentData.ram || null)
      .input('Storage', sql.NVarChar, equipmentData.storage || null)
      .input('OpticalDrive', sql.NVarChar, equipmentData.opticalDrive || null)
      .input('NIC', sql.NVarChar, equipmentData.nic || null)
      .input('PowerSupply', sql.NVarChar, equipmentData.powerSupply || null)
      .input('DateOfPurchase', sql.Date, equipmentData.dateOfPurchase || null)
      .input('SourceOfProcurement', sql.NVarChar, equipmentData.sourceOfProcurement || null)
      .input('ContractLPONoDate', sql.NVarChar, equipmentData.contractLPONoDate || null)
      .input('Cost', sql.Decimal(18, 2), equipmentData.cost || null)
      .input('OEMInfo', sql.NVarChar, equipmentData.oemInfo || null)
      .input('LocalOEMRep', sql.NVarChar, equipmentData.localOEMRep || null)
      .input('WarrantyExpiryDate', sql.Date, equipmentData.warrantyExpiryDate || null)
      .input('SLARecDMDetails', sql.NVarChar, equipmentData.slaRecDMDetails || null)
      .input('Status', sql.NVarChar, equipmentData.status || null)
      .input('Remarks', sql.NVarChar, equipmentData.remarks || null)
      .input('ReferenceNo', sql.NVarChar, equipmentData.referenceNo || null)
      .input('UpdatedAt', sql.DateTime, new Date())
      .query(`
        UPDATE Equipments
        SET SNO = @SNO, Unit = @Unit, EquipmentTypeSetupDetailID = @EquipmentTypeSetupDetailID, 
            Equipment = @Equipment, SerialNo = @SerialNo, MakeModel = @MakeModel,
            Processor = @Processor, RAM = @RAM, Storage = @Storage,
            OpticalDrive = @OpticalDrive, NIC = @NIC, PowerSupply = @PowerSupply,
            DateOfPurchase = @DateOfPurchase, SourceOfProcurement = @SourceOfProcurement,
            ContractLPONoDate = @ContractLPONoDate, Cost = @Cost, OEMInfo = @OEMInfo,
            LocalOEMRep = @LocalOEMRep, WarrantyExpiryDate = @WarrantyExpiryDate,
            SLARecDMDetails = @SLARecDMDetails, Status = @Status, Remarks = @Remarks,
            ReferenceNo = @ReferenceNo, UpdatedAt = @UpdatedAt
        OUTPUT INSERTED.*
        WHERE EquipmentID = @EquipmentID
      `);
    return result.recordset[0];
  }

  // Delete equipment
  static async delete(equipmentId) {
    const pool = await getConnection();
    const result = await pool.request()
      .input('EquipmentID', sql.Int, equipmentId)
      .query('DELETE FROM Equipments WHERE EquipmentID = @EquipmentID');
    return result.rowsAffected[0] > 0;
  }
}

