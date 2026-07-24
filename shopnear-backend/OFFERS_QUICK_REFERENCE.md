# Offers System - Quick Reference Guide

## 🚀 Getting Started

The offers management system is ready to use. Here are the quickest ways to get started:

---

## 📋 Quick API Reference

### Admin Creates Offer
```bash
curl -X POST http://localhost:9110/v1/api/offers/admin/create \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Save up to 50% + Extra Discount",
    "offerType": "category",
    "priceStartsAt": 150,
    "discountPercentage": 50,
    "image": "https://example.com/offer.jpg",
    "bgColor": "#FFE9C6",
    "startDate": "2026-01-03T00:00:00Z",
    "endDate": "2026-02-03T23:59:59Z",
    "displayOnHome": true,
    "priority": 5
  }'
```

### Admin Lists All Offers
```bash
curl -X GET "http://localhost:9110/v1/api/offers/admin/list?page=1&limit=10"
```

### Customer Views Home Page with Offers
```bash
curl -X GET http://localhost:9110/v1/api/home
# Response includes "offers" array with dynamic data from database
```

### Admin Updates Offer
```bash
curl -X PUT http://localhost:9110/v1/api/offers/admin/{offerId} \
  -H "Content-Type: application/json" \
  -d '{"discountPercentage": 40, "priority": 10}'
```

### Admin Toggles Offer
```bash
curl -X PATCH http://localhost:9110/v1/api/offers/admin/{offerId}/toggle
```

### Admin Deletes Offer
```bash
curl -X DELETE http://localhost:9110/v1/api/offers/admin/{offerId}
```

---

## 📊 Offer Creation Fields

### Required Fields
```json
{
  "title": "Offer Title",
  "offerType": "category",  // or: brand, product, general
  "priceStartsAt": 150,
  "image": "https://example.com/offer.jpg",
  "startDate": "2026-01-03T00:00:00Z",
  "endDate": "2026-02-03T23:59:59Z"
}
```

### Optional Fields
```json
{
  "description": "Detailed description",
  "discountPercentage": 50,      // Use either percentage OR fixed amount
  "discountAmount": null,
  "bgColor": "#FFE9C6",
  "priority": 5,                 // 0-10, higher shows first
  "categories": ["category-id"],
  "brands": ["brand-id"],
  "products": ["product-id"],
  "isActive": true,
  "displayOnHome": true
}
```

---

## 🎨 Offer Types Quick Reference

| Type | Use Case | Example |
|------|----------|---------|
| **category** | Offers for entire categories | "All T-shirts 50% off" |
| **brand** | Offers for specific brands | "GUCCI 30% off" |
| **product** | Offers for specific products | "Blue Jeans Special" |
| **general** | Offers for all products | "Sitewide 20% off" |

---

## 🎯 Display Rules

**Offer shows on home page when:**
1. ✅ `isActive` = `true`
2. ✅ `displayOnHome` = `true`
3. ✅ Current date >= `startDate`
4. ✅ Current date <= `endDate`

**Sorting:**
- By `priority` (highest first)
- Then by `createdAt` (newest first)

**Maximum:** 10 offers per page

---

## 📱 Home Page Response

Old response:
```json
{
  "banners": [...],
  "nearShops": [...],
  "discounts": [...],        // ❌ Hardcoded
  "brands": [...]
}
```

New response:
```json
{
  "banners": [...],
  "nearShops": [...],
  "offers": [...],           // ✅ Dynamic from database
  "brands": [...]
}
```

---

## 🧪 Test Scenarios

### Scenario 1: Create and Display Offer
1. Admin creates offer with future dates
2. Make offer active and set `displayOnHome: true`
3. Call `/v1/api/home`
4. Verify offer appears in response

### Scenario 2: Priority Ordering
1. Create 3 offers with different priorities (1, 5, 10)
2. Call `/v1/api/home`
3. Verify order: priority 10 → 5 → 1

### Scenario 3: Date Filtering
1. Create offer with past end date
2. Call `/v1/api/home`
3. Verify offer doesn't appear

### Scenario 4: Category Filtering
1. Create offer for specific category
2. Call `/v1/api/offers/category/{categoryId}`
3. Verify offer appears

---

## 💡 Tips & Tricks

### Setting Up Offers
- Always use ISO 8601 date format: `2026-01-03T00:00:00Z`
- Use priority 0-10 (10 = highest)
- Match bgColor to image theme
- Keep priceStartsAt realistic

### Managing Offers
- Don't delete, just deactivate with toggle
- Update priority to change display order
- Use search to find offers quickly
- Monitor statistics for performance

### Performance
- Offers are indexed for fast queries
- Home page shows max 10 offers
- Automatic date-based filtering
- No manual archiving needed

---

## 📝 Field Validation Rules

| Field | Type | Min/Max | Notes |
|-------|------|---------|-------|
| title | String | 1-100 | Required |
| priceStartsAt | Number | 0-999999 | Required |
| discountPercentage | Number | 0-100 | Optional |
| discountAmount | Number | 0-999999 | Optional |
| priority | Number | 0-10 | Default: 0 |
| startDate | Date | - | Required, ISO format |
| endDate | Date | - | Required, must be > startDate |

---

## 🔗 Related Endpoints

### Customer Filtering
```
GET /v1/api/offers/category/{categoryId}  - Category offers
GET /v1/api/offers/brand/{brandId}        - Brand offers
GET /v1/api/offers/product/{productId}    - Product offers
GET /v1/api/offers/home                   - Home page offers
```

### Admin Management
```
POST /v1/api/offers/admin/create          - Create
GET /v1/api/offers/admin/list             - List all
GET /v1/api/offers/admin/{id}             - Get detail
PUT /v1/api/offers/admin/{id}             - Update
DELETE /v1/api/offers/admin/{id}          - Delete
PATCH /v1/api/offers/admin/{id}/toggle    - Toggle status
GET /v1/api/offers/admin/stats/overview   - Statistics
```

---

## ❓ FAQ

**Q: How often should I create offers?**
A: Create as needed. No limits. Old offers automatically hide when endDate passes.

**Q: Can I edit an offer?**
A: Yes! Use PUT endpoint to update any field.

**Q: What happens when endDate passes?**
A: Offer automatically disappears from home page. No manual archiving needed.

**Q: Can I have multiple offers active?**
A: Yes! Display up to 10 sorted by priority.

**Q: How do I feature an offer?**
A: Increase its priority number. Higher = shows first.

**Q: What if I delete an offer by mistake?**
A: Currently permanent. Use toggle to deactivate instead.

---

## 📚 Documentation Files

- **OFFERS_API.md** - Complete API reference (all endpoints with examples)
- **OFFERS_IMPLEMENTATION.md** - Implementation details and features
- **OFFERS_QUICK_REFERENCE.md** - This file (quick commands)

---

## ⚡ Quick Checklist

- [ ] Read OFFERS_API.md for complete reference
- [ ] Create first offer using admin endpoint
- [ ] Call `/v1/api/home` to see offer on home page
- [ ] Test update and toggle functionality
- [ ] Verify offer disappears when date expires
- [ ] Try category/brand filtering

---

**Status:** ✅ Ready to Use - No setup required!

Start creating offers now and they'll appear on your customer home page automatically.
