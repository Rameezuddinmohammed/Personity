#!/bin/bash

# Personity Authentication Test Script
# This script tests the authentication endpoints

BASE_URL="http://localhost:3000"
COOKIE_FILE="test-cookies.txt"

echo "🧪 Personity Authentication Test Suite"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Signup
echo "📝 Test 1: User Signup"
echo "----------------------"
SIGNUP_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test-'$(date +%s)'@example.com",
    "password": "TestPass123!"
  }' \
  -c "$COOKIE_FILE" \
  -w "\n%{http_code}")

HTTP_CODE=$(echo "$SIGNUP_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$SIGNUP_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "201" ]; then
  echo -e "${GREEN}✓ Signup successful${NC}"
  echo "Response: $RESPONSE_BODY"
else
  echo -e "${RED}✗ Signup failed (HTTP $HTTP_CODE)${NC}"
  echo "Response: $RESPONSE_BODY"
fi
echo ""

# Test 2: Login with valid credentials
echo "🔐 Test 2: Login with Valid Credentials"
echo "----------------------------------------"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }' \
  -c "$COOKIE_FILE" \
  -w "\n%{http_code}")

HTTP_CODE=$(echo "$LOGIN_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$LOGIN_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✓ Login successful${NC}"
  echo "Response: $RESPONSE_BODY"
else
  echo -e "${YELLOW}⚠ Login failed - user may not exist yet${NC}"
  echo "Response: $RESPONSE_BODY"
fi
echo ""

# Test 3: Access protected route with cookie
echo "🔒 Test 3: Access Protected Route (with auth)"
echo "----------------------------------------------"
PROTECTED_RESPONSE=$(curl -s "$BASE_URL/api/surveys" \
  -b "$COOKIE_FILE" \
  -w "\n%{http_code}")

HTTP_CODE=$(echo "$PROTECTED_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$PROTECTED_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✓ Protected route accessible${NC}"
  echo "Response: $RESPONSE_BODY"
else
  echo -e "${RED}✗ Protected route failed (HTTP $HTTP_CODE)${NC}"
  echo "Response: $RESPONSE_BODY"
fi
echo ""

# Test 4: Login with invalid credentials
echo "❌ Test 4: Login with Invalid Credentials"
echo "------------------------------------------"
INVALID_LOGIN=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "WrongPassword123!"
  }' \
  -w "\n%{http_code}")

HTTP_CODE=$(echo "$INVALID_LOGIN" | tail -n1)
RESPONSE_BODY=$(echo "$INVALID_LOGIN" | head -n-1)

if [ "$HTTP_CODE" = "401" ]; then
  echo -e "${GREEN}✓ Correctly rejected invalid credentials${NC}"
  echo "Response: $RESPONSE_BODY"
else
  echo -e "${RED}✗ Should have returned 401 (got HTTP $HTTP_CODE)${NC}"
  echo "Response: $RESPONSE_BODY"
fi
echo ""

# Test 5: Logout
echo "👋 Test 5: Logout"
echo "-----------------"
LOGOUT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/logout" \
  -b "$COOKIE_FILE" \
  -c "$COOKIE_FILE" \
  -w "\n%{http_code}")

HTTP_CODE=$(echo "$LOGOUT_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$LOGOUT_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✓ Logout successful${NC}"
  echo "Response: $RESPONSE_BODY"
else
  echo -e "${RED}✗ Logout failed (HTTP $HTTP_CODE)${NC}"
  echo "Response: $RESPONSE_BODY"
fi
echo ""

# Test 6: Access protected route after logout
echo "🚫 Test 6: Access Protected Route (after logout)"
echo "------------------------------------------------"
UNAUTH_RESPONSE=$(curl -s "$BASE_URL/api/surveys" \
  -b "$COOKIE_FILE" \
  -w "\n%{http_code}")

HTTP_CODE=$(echo "$UNAUTH_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$UNAUTH_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "401" ]; then
  echo -e "${GREEN}✓ Correctly rejected unauthorized request${NC}"
  echo "Response: $RESPONSE_BODY"
else
  echo -e "${RED}✗ Should have returned 401 (got HTTP $HTTP_CODE)${NC}"
  echo "Response: $RESPONSE_BODY"
fi
echo ""

# Cleanup
rm -f "$COOKIE_FILE"

echo "========================================"
echo "✅ Test suite complete!"
echo ""
echo "Note: Make sure your dev server is running:"
echo "  cd personity && npm run dev"
