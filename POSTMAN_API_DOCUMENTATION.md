# Globpay Dashboard API - Postman Collection

This document provides instructions for using the Postman collection to test the Globpay Dashboard APIs.

## 📥 Importing the Collection

1. Open Postman
2. Click **Import** button (top left)
3. Select the file: `Globpay_Dashboard_API.postman_collection.json`
4. The collection will be imported with all API endpoints organized in folders

## 🔐 Authentication Setup

### Step 1: Get Your Authentication Token

1. Open the **Authentication** folder
2. Select the **Login** request
3. Update the request body with your credentials:
   ```json
   {
     "user": {
       "email": "your-email@example.com",
       "password": "your-password"
     }
   }
   ```
4. Click **Send**
5. The token will be automatically saved to the collection variable `auth_token`

### Step 2: Verify Token is Set

- All other requests in the collection use Bearer token authentication
- The token is automatically included in the Authorization header
- If you need to manually set it, go to Collection Variables and set `auth_token`

## 📋 API Endpoints

### Authentication
- **POST** `/api/users/login` - Login and get authentication token

### Transactions
- **GET** `/api/v1/merchants/transaction/list` - Get paginated transaction list (Recommended)
  - Query Parameters:
    - `page` (integer, default: 1) - Page number
    - `limit` (integer, default: 50, max: 100) - Records per page
- **GET** `/api/v1/transaction/list` - Get all transactions (Legacy)
- **GET** `/api/v1/transaction/read/balance` - Get payout balance
- **GET** `/api/v1/transaction/read/payins/balance` - Get payin balance
- **GET** `/api/v1/transaction/read/payins` - Get mobile payin transactions
- **GET** `/api/v1/transaction/read/bank` - Get bank transactions
- **GET** `/api/v1/transaction/read/card` - Get card transactions
- **GET** `/api/v1/transaction/read/mobile/payouts` - Get mobile payout transactions

### Users
- **GET** `/api/users/list` - Get list of all users
- **POST** `/api/users/create` - Create a new user
- **PUT** `/api/users/update/:userId` - Update an existing user

### Merchants
- **GET** `/api/merchants/list` - Get list of all merchants
- **PUT** `/api/merchants/update/:merchantId` - Update merchant details

### Forex
- **GET** `/api/forex/list` - Get list of all forex rates
- **POST** `/api/forex/create` - Create a new forex rate
- **PUT** `/api/forex/update/:forexId` - Update an existing forex rate
- **DELETE** `/api/forex/delete/:forexId` - Delete a forex rate

### Payment Links
- **GET** `/api/links/list` - Get list of all payment links
- **POST** `/api/links/generate` - Generate a new payment link
- **POST** `/api/links/process` - Process a payment using a payment link

### Wallet Transfers
- **GET** `/api/v1/drawings/view` - View platform earnings/drawings
- **POST** `/api/v1/drawings/transfer/toPayout` - Transfer funds to payout

## 🔧 Configuration

### Base URL
The default base URL is set to: `https://merchants.globpay.ai`

To change it:
1. Click on the collection name
2. Go to **Variables** tab
3. Update the `base_url` variable

### Collection Variables
- `base_url` - API base URL (default: `https://merchants.globpay.ai`)
- `auth_token` - Authentication token (automatically set after login)

## 📝 Example Requests

### Transaction List (Paginated)
```
GET {{base_url}}/api/v1/merchants/transaction/list?page=1&limit=50
```

**Response:**
```json
{
  "transactions": [
    {
      "impalaMerchantId": "merchant123",
      "transaction_status": "SUCCESS",
      "transaction_report": "collection",
      "currency": "KES",
      "amount": 1000,
      "secure_id": "abc123xyz",
      "source_of_funds": "MPESA",
      "external_id": "order_12345",
      "callback_url": "https://merchant.com/webhook",
      "date_added": 1699123456
    }
  ],
  "pagination": {
    "current_page": 1,
    "per_page": 50,
    "total": 245,
    "total_pages": 5,
    "has_next": true,
    "has_prev": false
  }
}
```

### Create User
```
POST {{base_url}}/api/users/create
Content-Type: application/json

{
  "user": {
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+254712345678",
    "password": "securePassword123",
    "role": 2,
    "status": "active",
    "location": "Nairobi",
    "merchantId": "merchant123",
    "BaseCurrencyID": 1
  }
}
```

## 🚀 Quick Start

1. **Import the collection** into Postman
2. **Run the Login request** to get your authentication token
3. **Start testing** other endpoints - they will automatically use the token

## ⚠️ Important Notes

- All endpoints (except Login) require authentication
- The authentication token expires after a certain period - re-login if you get 401 errors
- For paginated endpoints, use the new `/api/v1/merchants/transaction/list` endpoint for better performance
- Maximum limit for pagination is 100 records per page
- Replace path variables (like `:userId`, `:merchantId`) with actual IDs when testing

## 🐛 Troubleshooting

### 401 Unauthorized
- Your token may have expired
- Run the Login request again to get a new token

### 500 Server Error
- Check if the request body format is correct
- Verify all required fields are included

### Timeout Errors
- The legacy transaction endpoints may take longer for large datasets
- Use the paginated endpoint instead: `/api/v1/merchants/transaction/list`

## 📚 Additional Resources

- API Base URL: `https://merchants.globpay.ai`
- All requests use Bearer token authentication
- Content-Type: `application/json` for POST/PUT requests

---

**Last Updated:** 2024
**Collection Version:** 1.0

