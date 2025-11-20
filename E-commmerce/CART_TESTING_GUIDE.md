# Cart Feature Testing Guide

## Summary
This guide shows how to test the "Add to Cart" feature. When you click "Add to Cart" on a product (from Products page or Product Detail page), the item should appear in the Cart page.

## What Was Fixed
- **Frontend**: Normalized `cartService.js` to handle different backend response shapes
- **Backend**: Updated `persistent-server.js` cart endpoints to return consistent cart objects with product details
- **UI**: Fixed React warnings about `imageUrl` prop by using transient props (`$imageUrl`)
- **Integration Test**: Added `scripts/integration-test-cart.js` to verify the cart flow programmatically

## How to Run the App Locally

### 1. Start Backend Server
Open a PowerShell terminal and run:
```powershell
cd C:\craftify\E-commmerce\backend
node .\persistent-server.js
```

**Expected output:**
- Server URL: `http://localhost:5000`
- API endpoints listed including:
  - `GET /api/cart`
  - `POST /api/cart/add`
  - `GET /api/products`

Leave this terminal running (the server must stay active).

### 2. Start Frontend Dev Server
Open a **second** PowerShell terminal and run:
```powershell
cd C:\craftify\E-commmerce\frontend
npm start
```

**Expected output:**
- Dev server starts on `http://localhost:3000`
- Browser opens automatically

### 3. Test the Add to Cart Flow

#### Register/Login
1. Go to `http://localhost:3000/register` (or click Register)
2. Create an account (first name, last name, email, password)
3. You'll be automatically logged in after registration

#### Add Product to Cart
**Option A: From Products Page**
1. Go to `http://localhost:3000/products`
2. Click "Add to Cart" button on any product card
3. You should see an alert: "Product added to cart successfully!"

**Option B: From Product Detail Page**
1. Click on any product to open its detail page
2. Select quantity (if desired)
3. Click "Add to Cart" button
4. You should see an alert: "Product added to cart successfully!"

#### View Cart
1. Click "Your Cart" in the navigation (or go to `http://localhost:3000/cart`)
2. **Expected result**: The product(s) you added should appear in the cart with:
   - Product image or emoji
   - Product name
   - Price
   - Seller name
   - Quantity controls (+ / -)
   - Remove button
3. Cart summary should show total items and total price

#### Update Quantity
- Click `+` or `-` buttons to change quantity
- Cart totals update automatically

#### Remove Item
- Click the trash icon to remove an item
- Item disappears from cart

#### Checkout (Optional)
- Click "Proceed to Checkout"
- Order is created and you're redirected to Orders page

## Run Integration Test (Automated)

To verify the cart API endpoints work without using the browser:

```powershell
cd C:\craftify\E-commmerce\backend
node .\scripts\integration-test-cart.js
```

**Expected output:**
```
=== Integration Test: login -> add to cart -> fetch cart ===

1) Registering test user: test+<timestamp>@example.com
  -> Registered. Received token: yes

2) Fetching products to select an item to add
  -> Selected product: product-1 - Handmade Ceramic Vase ($45.99)

3) Adding product to cart

4) Fetching cart for the test user

=== Test Results ===
SUCCESS: Product product-1 present in cart (quantity: 1)

Integration test completed.
```

If you see `SUCCESS`, the backend cart endpoints are working correctly.

## Troubleshooting

### Issue: "Route not found" when clicking Add to Cart

**Cause**: Backend server not running or using a different server file

**Fix**:
1. Make sure `persistent-server.js` is running (check terminal for startup banner)
2. If you normally run a different backend (e.g., `mongodb-server.js`), use that instead
3. Restart the frontend after starting backend:
   ```powershell
   # In frontend terminal press Ctrl+C, then:
   npm start
   ```

### Issue: Cart page shows empty after adding items

**Cause**: Backend returned 404 or different response shape

**Fix**:
1. Open browser DevTools → Console
2. Look for the line: `CartService -> POST /api/cart/add { productId: '...', quantity: 1 }`
3. Check Network tab for the `/api/cart/add` request status
4. If status is 404, the backend route doesn't exist (wrong server running)
5. If status is 200 but cart is empty, check Console for parsing errors

### Issue: "Please login to add items to cart"

**Cause**: Not authenticated

**Fix**:
1. Register or login first
2. Make sure you see your name in the navigation bar (top right)
3. Token is stored in localStorage automatically after login

### Issue: Images not showing

**Cause**: Products don't have uploaded images (sample data uses emoji fallbacks)

**Expected**: Products without images show category emoji (🎁, 💎, 🏠, etc.)

## Files Modified

### Frontend
- `frontend/src/services/cartService.js` - Normalized backend response shapes
- `frontend/src/services/authService.js` - Use relative `/api` URL
- `frontend/src/services/productService.js` - Use relative `/api` URL
- `frontend/src/utils/getImageUrl.js` - Use relative `/uploads` URL
- `frontend/src/contexts/CartContext.js` - Already had add-to-cart logic
- `frontend/src/pages/ProductDetail.js` - Fixed `$imageUrl` transient prop
- `frontend/src/pages/Products.js` - Fixed `$imageUrl` transient prop
- `frontend/src/pages/Cart.js` - Fixed `$imageUrl` transient prop
- `frontend/src/pages/Orders.js` - Fixed `$imageUrl` transient prop

### Backend
- `backend/persistent-server.js` - Updated `/api/cart` and `/api/cart/add` to return normalized cart object with product details
- `backend/scripts/integration-test-cart.js` - Added integration test script

## Next Steps

If you want to extend the cart feature:
- Add persistent cart across sessions (already implemented via backend API)
- Add "Remove from Cart" endpoints (backend has `/api/cart/remove/:productId` in `mongodb-server.js` but not in `persistent-server.js`)
- Add quantity update endpoint (backend can be extended)
- Add cart item count badge in navigation
- Add animations when adding to cart
- Add "Continue Shopping" vs "Checkout" flow

## Questions?

If the cart still doesn't work after following this guide:
1. Check both terminal outputs (backend and frontend) for errors
2. Open DevTools Console and paste any error messages
3. Run the integration test and paste the output
4. Verify you're logged in (check localStorage for `token` key in DevTools → Application)
