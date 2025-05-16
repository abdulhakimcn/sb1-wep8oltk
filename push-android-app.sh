#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting deployment process for Dr.Zone AI Android App...${NC}"

# Create a temporary directory for the Android app
TEMP_DIR="drzone-android-app"
echo -e "${GREEN}Creating temporary directory for Android app...${NC}"
mkdir -p $TEMP_DIR

# Copy necessary files to the Android app directory
echo -e "${GREEN}Copying files to Android app directory...${NC}"
cp -r mydrzone-app/* $TEMP_DIR/
cp README.md $TEMP_DIR/
cp LICENSE $TEMP_DIR/ 2>/dev/null || echo "No LICENSE file to copy"

# Initialize git in the Android app directory
echo -e "${GREEN}Initializing git repository in Android app directory...${NC}"
cd $TEMP_DIR
git init

# Add all files to git
echo -e "${GREEN}Adding files to git...${NC}"
git add .

# Commit changes
echo -e "${GREEN}Committing changes...${NC}"
git commit -m "Initial commit: Dr.Zone AI Android App"

# Add remote
echo -e "${GREEN}Adding remote repository...${NC}"
git remote add origin https://github.com/abdulhakimcn/drzone-ai-app.git

# Push to remote repository
echo -e "${GREEN}Pushing to remote repository...${NC}"
git push -u origin main --force

# Check if push was successful
if [ $? -ne 0 ]; then
  echo -e "${RED}Push failed. Please check your repository settings and try again.${NC}"
  exit 1
fi

echo -e "${GREEN}Android app deployment completed successfully!${NC}"
echo -e "${GREEN}Repository URL: https://github.com/abdulhakimcn/drzone-ai-app${NC}"

# Clean up
cd ..
echo -e "${GREEN}Cleaning up temporary directory...${NC}"
rm -rf $TEMP_DIR

echo -e "${GREEN}All done!${NC}"