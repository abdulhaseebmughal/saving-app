#!/bin/bash

# SaveIt.AI - Migration Script
# Migrates to optimized structure

echo "🚀 SaveIt.AI - Migration to Optimized Structure"
echo "================================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Backup old files
echo "📦 Step 1: Creating backups..."
mkdir -p .backups

if [ -f "app/admin/page.tsx" ]; then
  cp app/admin/page.tsx .backups/admin-page.old.tsx
  echo -e "${GREEN}✓${NC} Backed up admin page"
fi

if [ -f "components/add-package-dialog-simple.tsx" ]; then
  cp components/add-package-dialog-simple.tsx .backups/
  echo -e "${GREEN}✓${NC} Backed up package dialog (simple)"
fi

if [ -f "components/add-package-dialog.tsx" ]; then
  cp components/add-package-dialog.tsx .backups/
  echo -e "${GREEN}✓${NC} Backed up package dialog (advanced)"
fi

if [ -f "components/admin-shortcut.tsx" ]; then
  cp components/admin-shortcut.tsx .backups/
  echo -e "${GREEN}✓${NC} Backed up admin shortcut"
fi

echo ""

# Step 2: Environment variables
echo "🔧 Step 2: Setting up environment variables..."

if [ ! -f ".env.local" ]; then
  if [ -f ".env.example" ]; then
    cp .env.example .env.local
    echo -e "${GREEN}✓${NC} Created .env.local from .env.example"
    echo -e "${YELLOW}⚠${NC}  Please edit .env.local and add your admin credentials!"
  else
    echo -e "${RED}✗${NC} .env.example not found!"
  fi
else
  echo -e "${YELLOW}⚠${NC}  .env.local already exists, skipping..."
fi

echo ""

# Step 3: Replace admin page
echo "📝 Step 3: Replacing admin page..."

if [ -f "app/admin/page.new.tsx" ]; then
  if [ -f "app/admin/page.tsx" ]; then
    mv app/admin/page.tsx app/admin/page.old.tsx
    echo -e "${GREEN}✓${NC} Moved old admin page to page.old.tsx"
  fi

  mv app/admin/page.new.tsx app/admin/page.tsx
  echo -e "${GREEN}✓${NC} Activated new optimized admin page"
else
  echo -e "${RED}✗${NC} app/admin/page.new.tsx not found!"
fi

echo ""

# Step 4: Summary
echo "✅ Migration Complete!"
echo "===================="
echo ""
echo "Next steps:"
echo "1. Edit .env.local and set your admin credentials"
echo "2. Update app/layout.tsx to include AdminShortcut component"
echo "3. Test the admin panel at /admin or Ctrl+Shift+A"
echo "4. Review OPTIMIZATION_GUIDE.md for detailed migration steps"
echo ""
echo "Backups saved to: .backups/"
echo ""
echo -e "${GREEN}Happy coding! 🎉${NC}"
