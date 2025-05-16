#!/bin/bash

# Create backup directory
mkdir -p backup

# Backup source files
cp -r src backup/
cp -r supabase backup/
cp *.json backup/
cp *.js backup/
cp *.ts backup/

# Create archive
tar -czf mydrzone-backup.tar.gz backup/

echo "Backup completed: mydrzone-backup.tar.gz"