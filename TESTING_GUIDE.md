# Testing Guide - Improved Gift Recommendations

## Quick Start

### 1. Start the Development Server

```bash
npm run dev
```

Then visit: **http://localhost:3000**

---

## Testing the Improved Dataset

### Test Profile 1: Tech Enthusiast 🎮

**Input:**
- Occasion: **Birthday**
- Relationship: **Friend**
- Age: **25-34**
- Budget: **$50 - $150**
- Interests: Add **"gaming"** and **"tech"**
- Daily Life: Select **"Gamer"** and **"Office"**

**Expected Results:**
- ✅ Gaming Mouse, Gaming Headset, or Gaming Keyboard
- ✅ Wireless Earbuds or Bluetooth Speaker
- ✅ Smart Watch or Fitness Tracker
- ✅ All products should be within $50-$150 range
- ✅ Products should have gaming/tech tags

---

### Test Profile 2: Fitness Enthusiast 💪

**Input:**
- Occasion: **Birthday**
- Relationship: **Friend**
- Age: **25-34**
- Budget: **$20 - $80**
- Interests: Add **"fitness"** and **"wellness"**
- Daily Life: Select **"Gym"**

**Expected Results:**
- ✅ Yoga Mat, Resistance Bands, or Foam Roller
- ✅ Smart Water Bottle or Fitness Tracker
- ✅ Massage Gun (if budget allows)
- ✅ All products fitness/wellness related

---

### Test Profile 3: Cooking Lover 👨‍🍳

**Input:**
- Occasion: **Housewarming**
- Relationship: **Friend** or **Partner**
- Age: **30-40**
- Budget: **$40 - $120**
- Interests: Add **"cooking"**
- Daily Life: Select **"Cooking"**

**Expected Results:**
- ✅ Cast Iron Skillet, Knife Set, or Air Fryer
- ✅ Espresso Machine or Dutch Oven
- ✅ Spice Rack or Kitchen tools
- ✅ Products tagged with cooking/kitchen

---

### Test Profile 4: New Parent 👶

**Input:**
- Occasion: **Baby Shower**
- Relationship: **Friend**
- Age: **25-34** or **35-44**
- Budget: **$30 - $100**
- Interests: Add **"baby"**
- Daily Life: Select **"New Parent"**

**Expected Results:**
- ✅ Baby Monitor or Diaper Bag
- ✅ Baby Books or Night Light
- ✅ Baby-focused products only
- ✅ Practical items for new parents

---

## Comparing ML vs Keyword Ranking

### Test WITHOUT ML (Keyword-only)

1. Make sure `.env` has:
   ```env
   USE_ML=false
   ```

2. Restart the dev server:
   ```bash
   npm run dev
   ```

3. Complete a quiz and note the results

### Test WITH ML (Model-based ranking)

1. Update `.env`:
   ```env
   USE_ML=true
   ```

2. Restart the dev server:
   ```bash
   npm run dev
   ```

3. Complete the **exact same quiz**
4. Compare results - ML should provide better ordering

**What to Look For:**
- ML mode should rank more relevant items higher
- Top 3 picks should be noticeably better than alternatives
- Better matching based on occasion + age + interests combined

---

## Verification Checklist

### ✅ Product Quality
- [ ] All products have clear, descriptive names
- [ ] Budget constraints are respected
- [ ] No duplicate products in results
- [ ] 3 top picks + 3 alternatives returned

### ✅ Recommendation Relevance
- [ ] Products match the selected occasion
- [ ] Products align with user interests
- [ ] Age-appropriate recommendations
- [ ] Relationship context considered (partner vs coworker)

### ✅ ML Model Performance
- [ ] ML mode shows "Ranked with our ML model" in steps
- [ ] Results differ from keyword-only mode
- [ ] Top 3 are more relevant than alternatives

### ✅ Edge Cases
- [ ] Very low budget ($10-$20) returns results
- [ ] Very high budget ($200+) returns results
- [ ] Multiple interests handled well
- [ ] Niche combinations work (e.g., "pet lover" + "outdoors")

---

## Performance Benchmarks

### Expected Response Times

**First Request (Cold Start):**
- Without ML: ~200-500ms
- With ML: ~500-1000ms (model loading)

**Subsequent Requests (Cached):**
- Without ML: ~50-150ms
- With ML: ~100-300ms

**Test Command:**
```bash
time curl -X POST http://localhost:3000/api/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "occasion": "birthday",
    "relationship": "friend",
    "age_range": "25-34",
    "budget_min": 30,
    "budget_max": 80,
    "interests": ["gaming", "tech"],
    "daily_life": ["gamer"],
    "avoid_list": [],
    "notes": ""
  }'
```

---

## Troubleshooting

### Issue: "Not enough products match your criteria"

**Solution:**
- Widen the budget range
- Remove some interests
- Check database has products seeded:
  ```bash
  npm run db:seed
  ```

### Issue: ML ranking not working

**Check:**
1. ML files exist:
   ```bash
   ls -lh ml/model.onnx ml/feature_spec.json
   ```

2. ONNX runtime installed:
   ```bash
   npm list onnxruntime-node
   ```

3. Enable ML in `.env`:
   ```env
   USE_ML=true
   ```

### Issue: Recommendations seem random

**Debug:**
1. Check console logs for errors
2. Verify product tags match your quiz answers
3. Try increasing budget range
4. Test with common profiles (see examples above)

---

## Next Steps

After testing:

1. **Try different combinations** - Mix and match occasions, ages, interests
2. **Note any gaps** - Missing product categories? Let me know!
3. **Compare results** - ML on vs off, see the difference
4. **Check diversity** - Do you see variety across categories?

Happy testing! 🎉
