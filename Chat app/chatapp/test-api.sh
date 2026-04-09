#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# test-api.sh  —  Quick smoke-test for the Nexus Chat REST API
# Usage: ./test-api.sh
# Requires: curl, jq
# ─────────────────────────────────────────────────────────────
set -e
BASE="http://localhost:8080/api"
GREEN='\033[0;32m'; RED='\033[0;31m'; NC='\033[0m'

ok()  { echo -e "${GREEN}✓${NC} $1"; }
fail(){ echo -e "${RED}✗${NC} $1"; }

echo ""
echo "Nexus Chat API Smoke Tests"
echo "=================================="

# ── 1. Register users ─────────────────────────────────────────
echo ""
echo "── Auth ──────────────────────────────────────────"

ALICE=$(curl -s -X POST "$BASE/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"username":"testAlice","email":"testalice@x.com","password":"password123","displayName":"Test Alice"}')

ALICE_TOKEN=$(echo "$ALICE" | jq -r '.accessToken')

if [ "$ALICE_TOKEN" != "null" ] && [ -n "$ALICE_TOKEN" ]; then
  ok "Register Alice → token received"
else
  fail "Register Alice failed: $ALICE"
  exit 1
fi

BOB=$(curl -s -X POST "$BASE/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"username":"testBob","email":"testbob@x.com","password":"password123","displayName":"Test Bob"}')
BOB_TOKEN=$(echo "$BOB" | jq -r '.accessToken')
BOB_ID=$(echo "$BOB"   | jq -r '.user.id')

[ -n "$BOB_TOKEN" ] && ok "Register Bob → token received" || fail "Register Bob failed"

# ── 2. Login ──────────────────────────────────────────────────
LOGIN=$(curl -s -X POST "$BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"usernameOrEmail":"testAlice","password":"password123"}')
LOGIN_TOKEN=$(echo "$LOGIN" | jq -r '.accessToken')

[ -n "$LOGIN_TOKEN" ] && ok "Login Alice → token received" || fail "Login failed"

# Use fresh token from login
AUTH="Authorization: Bearer $LOGIN_TOKEN"

# ── 3. Get current user ───────────────────────────────────────
ME=$(curl -s -X GET "$BASE/users/me" -H "$AUTH")
ME_ID=$(echo "$ME" | jq -r '.id')
ME_USER=$(echo "$ME" | jq -r '.username')

[ "$ME_USER" = "testAlice" ] && ok "GET /users/me → $ME_USER (id=$ME_ID)" || fail "GET /users/me failed: $ME"

# ── 4. Search users ───────────────────────────────────────────
SEARCH=$(curl -s -X GET "$BASE/users/search?q=testBob" -H "$AUTH")
SEARCH_COUNT=$(echo "$SEARCH" | jq '. | length')

[ "$SEARCH_COUNT" -ge 1 ] && ok "Search users → found $SEARCH_COUNT result(s)" || fail "Search failed"

# ── 5. Send message ───────────────────────────────────────────
echo ""
echo "── Messages ──────────────────────────────────────"

MSG=$(curl -s -X POST "$BASE/messages/send" \
  -H "$AUTH" -H "Content-Type: application/json" \
  -d "{\"receiverId\":$BOB_ID,\"content\":\"Hello Bob!\",\"type\":\"TEXT\"}")
MSG_ID=$(echo "$MSG" | jq -r '.id')

[ "$MSG_ID" != "null" ] && ok "Send message → id=$MSG_ID" || fail "Send message failed: $MSG"

# ── 6. Fetch message history ──────────────────────────────────
HISTORY=$(curl -s -X GET "$BASE/messages/private/$BOB_ID?page=0&size=10" -H "$AUTH")
HIST_COUNT=$(echo "$HISTORY" | jq '.content | length')

[ "$HIST_COUNT" -ge 1 ] && ok "Fetch history → $HIST_COUNT message(s)" || fail "Fetch history failed"

# ── 7. Create group ───────────────────────────────────────────
echo ""
echo "── Groups ────────────────────────────────────────"

GROUP=$(curl -s -X POST "$BASE/groups" \
  -H "$AUTH" -H "Content-Type: application/json" \
  -d "{\"name\":\"Test Group\",\"description\":\"API test group\",\"memberIds\":[$BOB_ID]}")
GROUP_ID=$(echo "$GROUP" | jq -r '.id')

[ "$GROUP_ID" != "null" ] && ok "Create group → id=$GROUP_ID" || fail "Create group failed: $GROUP"

# ── 8. Get my groups ──────────────────────────────────────────
MY_GROUPS=$(curl -s -X GET "$BASE/groups/my" -H "$AUTH")
GROUPS_COUNT=$(echo "$MY_GROUPS" | jq '. | length')

[ "$GROUPS_COUNT" -ge 1 ] && ok "My groups → $GROUPS_COUNT group(s)" || fail "My groups failed"

# ── 9. Update profile ─────────────────────────────────────────
echo ""
echo "── Users ─────────────────────────────────────────"

UPDATED=$(curl -s -X PUT "$BASE/users/me" \
  -H "$AUTH" -H "Content-Type: application/json" \
  -d '{"displayName":"Alice Updated","statusMessage":"Running API tests!"}')
UPD_NAME=$(echo "$UPDATED" | jq -r '.displayName')

[ "$UPD_NAME" = "Alice Updated" ] && ok "Update profile → displayName='$UPD_NAME'" || fail "Update profile failed"

# ── 10. Notifications ─────────────────────────────────────────
echo ""
echo "── Notifications ─────────────────────────────────"

NOTIFS=$(curl -s -X GET "$BASE/notifications" -H "$AUTH")
NOTIF_COUNT=$(echo "$NOTIFS" | jq '.content | length')
ok "Notifications → $NOTIF_COUNT notification(s)"

UNREAD=$(curl -s -X GET "$BASE/notifications/unread-count" -H "$AUTH")
UNREAD_COUNT=$(echo "$UNREAD" | jq -r '.count')
ok "Unread count → $UNREAD_COUNT"

echo ""
echo "=================================="
echo -e "${GREEN}All smoke tests passed ✓${NC}"
echo ""
