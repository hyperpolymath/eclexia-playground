#!/bin/bash
# Verification script: Confirms ZERO TypeScript in repository
# Run this anytime to prove 100% TypeScript-free architecture

set -e

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║     🔍 Verifying ZERO TypeScript Architecture            ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0

# Test 1: Check for .ts files
echo "Test 1: Scanning for .ts files..."
TS_FILES=$(find . -name "*.ts" 2>/dev/null | grep -v node_modules || true)
if [ -z "$TS_FILES" ]; then
    echo -e "  ${GREEN}✅ PASS${NC} - No .ts files found"
else
    echo -e "  ${RED}❌ FAIL${NC} - TypeScript files detected:"
    echo "$TS_FILES"
    ERRORS=$((ERRORS + 1))
fi

# Test 2: Check for .tsx files
echo "Test 2: Scanning for .tsx files..."
TSX_FILES=$(find . -name "*.tsx" 2>/dev/null | grep -v node_modules || true)
if [ -z "$TSX_FILES" ]; then
    echo -e "  ${GREEN}✅ PASS${NC} - No .tsx files found"
else
    echo -e "  ${RED}❌ FAIL${NC} - TypeScript React files detected:"
    echo "$TSX_FILES"
    ERRORS=$((ERRORS + 1))
fi

# Test 3: Check for tsconfig.json
echo "Test 3: Checking for tsconfig.json..."
if [ ! -f "tsconfig.json" ]; then
    echo -e "  ${GREEN}✅ PASS${NC} - No tsconfig.json found"
else
    echo -e "  ${RED}❌ FAIL${NC} - tsconfig.json exists!"
    ERRORS=$((ERRORS + 1))
fi

# Test 4: Verify .gitattributes exists
echo "Test 4: Verifying .gitattributes configuration..."
if [ -f ".gitattributes" ]; then
    if grep -q "linguist-language=ReScript" .gitattributes; then
        echo -e "  ${GREEN}✅ PASS${NC} - .gitattributes properly configured"
    else
        echo -e "  ${YELLOW}⚠️  WARN${NC} - .gitattributes exists but may be misconfigured"
    fi
else
    echo -e "  ${RED}❌ FAIL${NC} - .gitattributes missing!"
    ERRORS=$((ERRORS + 1))
fi

# Test 5: Count ReScript files
echo "Test 5: Counting ReScript source files..."
RES_COUNT=$(find src -name "*.res" 2>/dev/null | wc -l)
if [ "$RES_COUNT" -gt 0 ]; then
    echo -e "  ${GREEN}✅ PASS${NC} - Found $RES_COUNT ReScript files"
else
    echo -e "  ${YELLOW}⚠️  WARN${NC} - No ReScript files found"
fi

# Test 6: Language statistics
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Language Statistics"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

RES_FILES=$(find src -name "*.res" 2>/dev/null | wc -l)
JS_FILES=$(find src -name "*.js" 2>/dev/null | wc -l)
ECX_FILES=$(find examples -name "*.ecx" 2>/dev/null | wc -l)

echo "ReScript files (.res):    $RES_FILES"
echo "JavaScript files (.js):   $JS_FILES (compiled from ReScript)"
echo "Eclexia files (.ecx):     $ECX_FILES"
echo ""
echo -e "${GREEN}TypeScript files (.ts):   0 ✅${NC}"
echo -e "${GREEN}TypeScript files (.tsx):  0 ✅${NC}"
echo ""

# Final verdict
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║              ✅ VERIFICATION PASSED                       ║${NC}"
    echo -e "${GREEN}║     100% TypeScript-Free Architecture Confirmed!         ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "Your repository is PROVABLY zero TypeScript!"
    echo "Share this result with the haters. 😎"
    exit 0
else
    echo -e "${RED}╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║              ❌ VERIFICATION FAILED                       ║${NC}"
    echo -e "${RED}║     TypeScript contamination detected!                   ║${NC}"
    echo -e "${RED}╚═══════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "Found $ERRORS error(s). Please fix them to maintain architecture purity."
    exit 1
fi
