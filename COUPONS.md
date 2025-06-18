# Coupon Management System

This document provides information about the coupon management system in the Success Slips Cameroon GCE application.

## Features

- Create and manage discount coupons
- Support for both percentage and fixed-amount discounts
- Set usage limits and validity periods
- Track coupon usage
- Admin dashboard for managing coupons
- API endpoints for coupon validation and management

## Setup

1. **Database Setup**
   - Ensure you have PostgreSQL installed and running
   - Create a `.env` file in the project root with the following variables:
     ```
     DATABASE_URL="postgresql://username:password@localhost:5432/your_database_name?schema=public"
     NEXTAUTH_SECRET=your_nextauth_secret
     NEXTAUTH_URL=http://localhost:3000
     ```

2. **Run Database Migrations**
   ```bash
   npx prisma migrate dev --name init
   ```

3. **Generate Prisma Client**
   ```bash
   npx prisma generate
   ```

## Using the Coupon System

### Admin Interface

1. Access the admin dashboard at `/admin/coupons`
2. Log in with an admin account
3. Use the interface to:
   - Create new coupons
   - View all coupons
   - Activate/deactivate coupons
   - Delete coupons
   - View usage statistics

### Creating Coupons

1. In the admin dashboard, click "Create New Coupon"
2. Fill in the coupon details:
   - **Code**: The coupon code users will enter (or generate one)
   - **Type**: Percentage or fixed amount
   - **Discount**: The discount value (percentage or fixed amount)
   - **Max Uses**: Maximum number of times the coupon can be used (0 for unlimited)
   - **Valid From/Until**: The date range when the coupon is valid
3. Click "Create Coupon"

### Validating Coupons

Coupons can be validated in two ways:

1. **In the registration form**:
   - Users can enter a coupon code during checkout
   - The system will validate the coupon in real-time
   - The discount will be automatically applied to the total

2. **Via API**:
   ```typescript
   import { couponService } from '@/services/couponService';
   
   // Validate a coupon
   const result = await couponService.validateCoupon('YOUR_COUPON_CODE');
   
   if (result.isValid) {
     // Apply discount
     const discount = result.coupon;
   }
   ```

## API Endpoints

### Get All Coupons (Admin only)
```
GET /api/coupons
```

### Create Coupon (Admin only)
```
POST /api/coupons
Content-Type: application/json

{
  "code": "SUMMER20",
  "discount": 20,
  "type": "percentage",
  "maxUses": 100,
  "validFrom": "2023-06-01T00:00:00.000Z",
  "validUntil": "2023-08-31T23:59:59.999Z"
}
```

### Validate Coupon
```
GET /api/coupons/validate?code=YOUR_COUPON_CODE
```

### Update Coupon (Admin only)
```
PATCH /api/coupons/:id
Content-Type: application/json

{
  "isActive": false
}
```

### Delete Coupon (Admin only)
```
DELETE /api/coupons/:id
```

## Security Considerations

- Only authenticated admin users can create, update, or delete coupons
- Coupon validation is rate-limited to prevent abuse
- Sensitive operations require authentication
- All API endpoints validate input data

## Troubleshooting

- **Coupon not found**: Ensure the coupon code is correct and hasn't expired
- **Permission denied**: Make sure you're logged in as an admin
- **Validation errors**: Check that all required fields are provided and in the correct format

For additional help, contact the development team.
