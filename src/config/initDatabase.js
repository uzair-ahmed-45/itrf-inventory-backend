import { getConnection } from './database.js';

// Initialize database with all tables
export const initializeDatabase = async () => {
  const pool = await getConnection();
  const request = pool.request();

  try {
    console.log('Initializing database tables...');

    // Create Setup table (EquipmentType, Command, SubCommand, etc.)
    await request.query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Setup' AND xtype='U')
      CREATE TABLE Setup (
        SMSID INT PRIMARY KEY IDENTITY(1,1),
        SetupName NVARCHAR(100) NOT NULL UNIQUE,
        CreatedAt DATETIME DEFAULT GETDATE(),
        UpdatedAt DATETIME DEFAULT GETDATE()
      );
    `);

    // Create SetupDetails table
    await request.query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='SetupDetails' AND xtype='U')
      CREATE TABLE SetupDetails (
        SetupDetailID INT PRIMARY KEY IDENTITY(1,1),
        SMSID INT NOT NULL,
        SetupDetailName NVARCHAR(200) NOT NULL,
        CreatedAt DATETIME DEFAULT GETDATE(),
        UpdatedAt DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (SMSID) REFERENCES Setup(SMSID) ON DELETE CASCADE
      );
    `);

    // Create Users table
    await request.query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Users' AND xtype='U')
      CREATE TABLE Users (
        UserID INT PRIMARY KEY IDENTITY(1,1),
        Username NVARCHAR(50) NOT NULL UNIQUE,
        Password NVARCHAR(255) NOT NULL,
        FullName NVARCHAR(100) NOT NULL,
        Role NVARCHAR(50) NOT NULL DEFAULT 'user',
        CommandSetupDetailID INT,
        CreatedAt DATETIME DEFAULT GETDATE(),
        UpdatedAt DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (CommandSetupDetailID) REFERENCES SetupDetails(SetupDetailID) ON DELETE SET NULL
      );
    `);

    // Create Equipments table
    await request.query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Equipments' AND xtype='U')
      CREATE TABLE Equipments (
        EquipmentID INT PRIMARY KEY IDENTITY(1,1),
        SNO NVARCHAR(50),
        Unit NVARCHAR(100),
        EquipmentTypeSetupDetailID INT NOT NULL,
        Equipment NVARCHAR(200) NOT NULL,
        SerialNo NVARCHAR(100),
        MakeModel NVARCHAR(200),
        Processor NVARCHAR(200),
        RAM NVARCHAR(100),
        Storage NVARCHAR(200),
        OpticalDrive NVARCHAR(100),
        NIC NVARCHAR(200),
        PowerSupply NVARCHAR(100),
        DateOfPurchase DATE,
        SourceOfProcurement NVARCHAR(200),
        ContractLPONoDate NVARCHAR(200),
        Cost DECIMAL(18, 2),
        OEMInfo NVARCHAR(500),
        LocalOEMRep NVARCHAR(200),
        WarrantyExpiryDate DATE,
        SLARecDMDetails NVARCHAR(500),
        Status NVARCHAR(50),
        Remarks NVARCHAR(1000),
        ReferenceNo NVARCHAR(100),
        CreatedAt DATETIME DEFAULT GETDATE(),
        UpdatedAt DATETIME DEFAULT GETDATE(),
        CreatedBy INT,
        FOREIGN KEY (EquipmentTypeSetupDetailID) REFERENCES SetupDetails(SetupDetailID) ON DELETE CASCADE,
        FOREIGN KEY (CreatedBy) REFERENCES Users(UserID) ON DELETE SET NULL
      );
    `);

    // Create indexes for better query performance
    await request.query(`
      IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='IX_Equipments_SerialNo')
      CREATE INDEX IX_Equipments_SerialNo ON Equipments(SerialNo);
      
      IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='IX_Equipments_EquipmentTypeSetupDetailID')
      CREATE INDEX IX_Equipments_EquipmentTypeSetupDetailID ON Equipments(EquipmentTypeSetupDetailID);
      
      IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='IX_Users_CommandSetupDetailID')
      CREATE INDEX IX_Users_CommandSetupDetailID ON Users(CommandSetupDetailID);
      
      IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='IX_SetupDetails_SMSID')
      CREATE INDEX IX_SetupDetails_SMSID ON SetupDetails(SMSID);
    `);

    console.log('All database tables initialized successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

