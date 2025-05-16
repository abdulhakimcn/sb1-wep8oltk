#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting deployment process for Dr.Zone AI...${NC}"

# Step 1: Build the project
echo -e "${GREEN}Building the project...${NC}"
npm run build

# Check if build was successful
if [ $? -ne 0 ]; then
  echo -e "${RED}Build failed. Aborting deployment.${NC}"
  exit 1
fi

# Step 2: Initialize git if not already initialized
if [ ! -d ".git" ]; then
  echo -e "${GREEN}Initializing git repository...${NC}"
  git init
fi

# Step 3: Add all files to git
echo -e "${GREEN}Adding files to git...${NC}"
git add .

# Step 4: Commit changes
echo -e "${GREEN}Committing changes...${NC}"
git commit -m "Initial commit: Dr.Zone AI platform"

# Step 5: Add remote if not already added
if ! git remote | grep -q "origin"; then
  echo -e "${GREEN}Adding remote repository...${NC}"
  git remote add origin https://github.com/abdulhakimcn/www.dronze.ai.git
else
  echo -e "${GREEN}Updating remote repository URL...${NC}"
  git remote set-url origin https://github.com/abdulhakimcn/www.dronze.ai.git
fi

# Step 6: Push to remote repository
echo -e "${GREEN}Pushing to remote repository...${NC}"
git push -u origin main

# Check if push was successful
if [ $? -ne 0 ]; then
  echo -e "${YELLOW}Push failed. Trying to force push...${NC}"
  git push -u origin main --force
  
  if [ $? -ne 0 ]; then
    echo -e "${RED}Force push also failed. Please check your repository settings and try again.${NC}"
    exit 1
  fi
fi

echo -e "${GREEN}Deployment completed successfully!${NC}"
echo -e "${GREEN}Repository URL: https://github.com/abdulhakimcn/www.dronze.ai${NC}"