
# ARCHIVO 27: scripts/backup-excel.js
#!/usr/bin/env node
// MIA Health Calculator - Excel Backup Script

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const EXCEL_FILE = 'MIA Health IMASS.xlsx';
const BACKUP_DIR = 'backups/excel';

function createBackup() {
    console.log('📂 MIA Health - Excel Backup Script');
    console.log('===================================');
    
    // Check if Excel file exists
    if (!fs.existsSync(EXCEL_FILE)) {
        console.error('❌ Excel file not found:', EXCEL_FILE);
        process.exit(1);
    }
    
    // Create backup directory if it doesn't exist
    if (!fs.existsSync(BACKUP_DIR)) {
        fs.mkdirSync(BACKUP_DIR, { recursive: true });
        console.log('📁 Created backup directory:', BACKUP_DIR);
    }
    
    // Generate backup filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFilename = `MIA_Health_IMASS_${timestamp}.xlsx`;
    const backupPath = path.join(BACKUP_DIR, backupFilename);
    
    // Read original file
    const originalData = fs.readFileSync(EXCEL_FILE);
    
    // Calculate checksum
    const checksum = crypto.createHash('sha256').update(originalData).digest('hex');
    
    // Copy file
    fs.copyFileSync(EXCEL_FILE, backupPath);
    
    // Create metadata file
    const metadata = {
        originalFile: EXCEL_FILE,
        backupFile: backupFilename,
        timestamp: new Date().toISOString(),
        size: originalData.length,
        checksum: checksum,
        version: require('../package.json').version
    };
    
    const metadataPath = path.join(BACKUP_DIR, `${backupFilename}.meta.json`);
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    
    console.log('✅ Backup created successfully:');
    console.log('   File:', backupPath);
    console.log('   Size:', (originalData.length / 1024).toFixed(2), 'KB');
    console.log('   Checksum:', checksum.substring(0, 16) + '...');
    
    // Clean old backups (keep last 10)
    cleanOldBackups();
}

function cleanOldBackups() {
    const files = fs.readdirSync(BACKUP_DIR)
        .filter(file => file.endsWith('.xlsx'))
        .map(file => ({
            name: file,
            path: path.join(BACKUP_DIR, file),
            mtime: fs.statSync(path.join(BACKUP_DIR, file)).mtime
        }))
        .sort((a, b) => b.mtime - a.mtime);
    
    if (files.length > 10) {
        const filesToDelete = files.slice(10);
        filesToDelete.forEach(file => {
            fs.unlinkSync(file.path);
            // Also delete metadata file
            const metaPath = file.path + '.meta.json';
            if (fs.existsSync(metaPath)) {
                fs.unlinkSync(metaPath);
            }
            console.log('🗑️  Deleted old backup:', file.name);
        });
    }
}

function listBackups() {
    console.log('📋 Available Backups:');
    console.log('====================');
    
    if (!fs.existsSync(BACKUP_DIR)) {
        console.log('No backups found');
        return;
    }
    
    const files = fs.readdirSync(BACKUP_DIR)
        .filter(file => file.endsWith('.xlsx'))
        .map(file => {
            const filePath = path.join(BACKUP_DIR, file);
            const metaPath = filePath + '.meta.json';
            const stats = fs.statSync(filePath);
            
            let metadata = {};
            if (fs.existsSync(metaPath)) {
                metadata = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
            }
            
            return {
                name: file,
                size: stats.size,
                mtime: stats.mtime,
                checksum: metadata.checksum || 'unknown'
            };
        })
        .sort((a, b) => b.mtime - a.mtime);
    
    files.forEach((file, index) => {
        console.log(`${index + 1}. ${file.name}`);
        console.log(`   Size: ${(file.size / 1024).toFixed(2)} KB`);
        console.log(`   Date: ${file.mtime.toISOString()}`);
        console.log(`   Hash: ${file.checksum.substring(0, 16)}...`);
        console.log('');
    });
}

function verifyBackup(filename) {
    const backupPath = path.join(BACKUP_DIR, filename);
    const metaPath = backupPath + '.meta.json';
    
    if (!fs.existsSync(backupPath)) {
        console.error('❌ Backup file not found:', filename);
        return false;
    }
    
    if (!fs.existsSync(metaPath)) {
        console.error('❌ Metadata file not found for:', filename);
        return false;
    }
    
    const backupData = fs.readFileSync(backupPath);
    const metadata = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
    
    const actualChecksum = crypto.createHash('sha256').update(backupData).digest('hex');
    
    if (actualChecksum === metadata.checksum) {
        console.log('✅ Backup verified successfully:', filename);
        return true;
    } else {
        console.error('❌ Backup verification failed:', filename);
        console.error('   Expected:', metadata.checksum);
        console.error('   Actual:  ', actualChecksum);
        return false;
    }
}

// Command line interface
const command = process.argv[2];

switch (command) {
    case 'create':
        createBackup();
        break;
    case 'list':
        listBackups();
        break;
    case 'verify':
        const filename = process.argv[3];
        if (!filename) {
            console.error('Usage: node backup-excel.js verify <filename>');
            process.exit(1);
        }
        verifyBackup(filename);
        break;
    default:
        console.log('Usage: node backup-excel.js [create|list|verify]');
        console.log('');
        console.log('Commands:');
        console.log('  create  - Create a new backup of the Excel file');
        console.log('  list    - List all available backups');
        console.log('  verify  - Verify integrity of a backup file');
        break;
}
