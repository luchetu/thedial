# Telephony Setup Requirements - Code Verified

## Summary of Findings

After reviewing the codebase, here's what's **actually required** vs what was initially assumed.

---

## ✅ ACTUALLY REQUIRED

### For Outbound Calls:

1. **Twilio Configuration** (via UI or env vars)

   - Account SID
   - Auth Token
   - SIP Trunk Address (e.g., `abc123.pstn.twilio.com`)
   - SIP Trunk Username
   - SIP Trunk Password
   - **Location:** `/dashboard/settings/admin/telephony/twilio`

2. **LiveKit Configuration** (env vars)

   - `DIAL_LIVEKIT_URL`
   - `DIAL_LIVEKIT_API_KEY`
   - `DIAL_LIVEKIT_API_SECRET`
   - `DIAL_ENCRYPTION_KEY` (for encrypting sensitive data)

3. **Phone Number Purchased**

   - **Location:** `/dashboard/phone-numbers`
   - Phone numbers are automatically linked to users when purchased

4. **That's it!** Trunks are **auto-created** when needed.

### For Inbound Calls:

- All of the above, plus:
- **Webhook URL configured** (in Twilio config or Twilio Console)
- Inbound trunk (may be auto-created, verify inbound call handling)

---

## ❌ NOT REQUIRED (But Optional/For Organization)

1. **Manual Trunk Creation** - Trunks are auto-created by `ensureSIPTrunkForPhoneNumber()`
2. **Routing Profile Assignment** - Not used in actual call routing
3. **Routing Profile Trunk References** - Not used in call flow

---

## 🔍 Code Evidence

### Outbound Call Flow (`internal/handler/livekit_handler.go`)

```go
// POST /livekit/calls/outbound
func (h *LiveKitHandler) CreateOutboundCall(...) {
    // 1. Validates phone number exists
    phoneNumber, err := h.phoneSvc.GetByID(r.Context(), phoneNumberID)

    // 2. Auto-creates/finds trunk (NO routing profile check)
    sipTrunkID, err := h.ensureSIPTrunkForPhoneNumber(phoneNumber.PhoneNumber)

    // 3. Creates SIP participant and calls
    sipParticipant, err := h.sipClient.CreateSIPParticipant(...)
}
```

### Trunk Auto-Creation (`ensureSIPTrunkForPhoneNumber()`)

**Priority order:**

1. Checks database for existing trunks (from `livekit_outbound_trunks` table)
2. Checks LiveKit for matching trunks
3. **Auto-creates** new trunk if none exist

**Key code:**

```go
// Lines 313-333: Auto-creates trunk if needed
trunk, err := h.sipClient.CreateSIPOutboundTrunk(context.Background(), &livekit.CreateSIPOutboundTrunkRequest{
    Trunk: &livekit.SIPOutboundTrunkInfo{
        Name:         fmt.Sprintf("Twilio Trunk for %s", phoneNumber),
        Address:      h.twilioSIPTrunkAddr,  // From Twilio config
        AuthUsername: h.twilioSIPTrunkUser,  // From Twilio config
        AuthPassword: h.twilioSIPTrunkPass,  // From Twilio config
        Numbers:      []string{phoneNumber},
    },
})
```

### Routing Profiles - NOT Used in Call Routing

**Evidence:** `CreateOutboundCall()` does NOT reference:

- `routing_profile_id` from phone_numbers table
- `outbound_trunk_ref` from routing_profiles table
- Any routing profile data

**What routing profiles ARE for:**

- Organization/metadata (grouping by plan/country)
- Future features (infrastructure exists but not implemented)
- Compliance tracking
- **NOT used for actual call routing**

---

## 📊 Database Schema

### Phone Numbers Table (`phone_numbers`)

```sql
-- Has routing_profile_id column (added in migration 000009)
ALTER TABLE phone_numbers
    ADD COLUMN routing_profile_id UUID NULL,
    ADD COLUMN assignment_status routing_assignment_status NOT NULL DEFAULT 'pending',
    ADD COLUMN compliance_state JSONB NOT NULL DEFAULT '{}'::jsonb;
```

**Note:** `routing_profile_id` exists but is **NOT used** in call routing code.

### Routing Profiles Table (`routing_profiles`)

```sql
CREATE TABLE routing_profiles (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    plan_code TEXT NOT NULL,
    country VARCHAR(2) NOT NULL,
    outbound_provider TEXT NOT NULL DEFAULT 'twilio',
    outbound_trunk_ref TEXT,  -- NOT used in call routing
    inbound_trunk_ref TEXT,   -- NOT used in call routing
    ...
);
```

**Note:** Trunk references exist but are **NOT used** in call routing code.

### LiveKit Outbound Trunks Table (`livekit_outbound_trunks`)

```sql
CREATE TABLE livekit_outbound_trunks (
    id UUID PRIMARY KEY,
    livekit_trunk_id TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    numbers TEXT[] NOT NULL,
    twilio_trunk_sid TEXT,
    twilio_sip_domain TEXT NOT NULL,
    twilio_username TEXT,
    twilio_password_enc BYTEA,
    ...
);
```

**Note:** This table is checked FIRST before auto-creating trunks.

---

## 🧪 Testing Checklist

### Minimal Setup for Outbound Calls:

- [ ] Twilio config set (`/dashboard/settings/admin/telephony/twilio`)
  - Account SID
  - Auth Token
  - SIP Trunk Address
  - SIP Trunk Username
  - SIP Trunk Password
- [ ] LiveKit env vars configured
- [ ] Phone number purchased (`/dashboard/phone-numbers`)
- [ ] Test outbound call

### For Inbound Calls:

- [ ] All of the above, plus:
- [ ] Webhook URL configured (in Twilio config)
- [ ] Test inbound call

---

## 🔧 Makefile Scripts to Check

When checking the database, verify:

1. **Twilio Config:**

   ```sql
   SELECT account_sid, default_sip_domain, default_username
   FROM twilio_config;
   ```

2. **Phone Numbers:**

   ```sql
   SELECT id, phone_number, country, routing_profile_id, assignment_status
   FROM phone_numbers;
   ```

3. **Routing Profiles:**

   ```sql
   SELECT id, name, plan_code, country, outbound_provider, outbound_trunk_ref
   FROM routing_profiles;
   ```

4. **Outbound Trunks:**
   ```sql
   SELECT id, livekit_trunk_id, name, numbers, twilio_sip_domain
   FROM livekit_outbound_trunks;
   ```

---

## 📝 Key Takeaways

1. **Trunks are auto-created** - No manual creation needed for basic testing
2. **Routing profiles are metadata only** - Not used in call routing
3. **Phone number → routing profile link exists** - But not used in call flow
4. **Simplest path:** Configure Twilio → Buy number → Test call

---

## 🚨 Common Misconceptions (Corrected)

❌ **Wrong:** "You must create trunks manually before testing"
✅ **Correct:** Trunks are auto-created when making calls

❌ **Wrong:** "Routing profiles control call routing"
✅ **Correct:** Routing profiles are organizational metadata only

❌ **Wrong:** "Phone numbers must be assigned to routing profiles to work"
✅ **Correct:** Phone numbers work independently of routing profiles

---

## 📍 Files to Review Together

- `thedial-server/internal/handler/livekit_handler.go` - Call routing logic
- `thedial-server/internal/handler/telephony_handler.go` - Routing profile CRUD
- `thedial-server/internal/repository/sqlc/migrations/000009_alter_phone_numbers_add_routing.up.sql` - Routing profile link
- `thedial-server/internal/repository/sqlc/migrations/000008_create_routing_profiles_table.up.sql` - Routing profile schema

---

**Last Updated:** Based on code review of actual implementation
**Status:** Verified against codebase - Twilio only
