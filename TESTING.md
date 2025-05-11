# Real Estate System Testing Guide

This guide provides instructions for testing the fullstack application after deployment to Render.

## Prerequisites

- Backend deployed to Render
- Frontend deployed to Render
- Access to both frontend and backend URLs

## Testing Process

### 1. Backend Health Check

First, verify that the backend is running correctly:

```bash
curl https://your-backend-url.render.com/healthz
```

Expected response:
```json
{"status":"ok","service":"Real Estate System API"}
```

Alternatively, use the provided test script:
```bash
python backend/real_estate_api/test_render_deployment.py https://your-backend-url.render.com
```

### 2. Frontend Access

Access the frontend URL in your browser. You should see the login page.

### 3. Authentication Testing

#### Login
1. Navigate to the login page
2. Use the following credentials:
   - Email: `admin@example.com`
   - Password: `password`
3. Verify you are redirected to the dashboard

#### Registration
1. Navigate to the registration page
2. Fill out the registration form with test data
3. Submit the form
4. Verify you can log in with the new credentials

### 4. Dashboard Testing

After logging in, verify the dashboard displays:
- Recent customer list
- Status breakdowns
- Key metrics
- Sales performance charts

### 5. Customer Management Testing

#### List Customers
1. Navigate to the Customers page
2. Verify the customer list loads correctly
3. Test filtering and sorting options

#### Add Customer
1. Click "Add Customer"
2. Fill out the customer form
3. Submit the form
4. Verify the new customer appears in the list

#### Edit Customer
1. Click on a customer in the list
2. Modify customer details
3. Save changes
4. Verify changes are reflected in the list

#### Delete Customer
1. Select a customer
2. Click delete
3. Confirm deletion
4. Verify customer is removed from the list

#### Add Activity
1. Open a customer record
2. Add a new activity record
3. Verify the activity appears in the customer's activity list

### 6. Registry Upload Testing

1. Navigate to the Registry Upload page
2. Upload a test PDF file
3. Verify data extraction
4. Link to a customer record
5. Verify the registry data is associated with the customer

### 7. Member Management Testing (Owner only)

1. Log in as an owner
2. Navigate to the Member Management page
3. Add a new team member
4. Edit an existing team member
5. Delete a team member
6. Verify changes are reflected in the member list

### 8. Billing Management Testing (Owner only)

1. Log in as an owner
2. Navigate to the Billing Management page
3. Add a new billing record
4. Edit an existing billing record
5. Delete a billing record
6. Verify changes are reflected in the billing list

### 9. External Integration Testing

#### Postal Code Lookup
1. Add or edit a customer
2. Enter a postal code
3. Verify address fields are automatically populated

#### Phone Number Lookup
1. Add or edit a customer
2. Enter a phone number
3. Verify phone number validation

### 10. Analytics & Reporting Testing

1. Navigate to the Analytics page
2. Verify dashboard data loads correctly
3. Test different date ranges
4. Verify status-based aggregates
5. Verify sales-rep performance metrics

## Common Issues and Troubleshooting

### Authentication Issues
- Verify the backend URL is correctly set in the frontend environment variables
- Check browser console for CORS errors
- Verify JWT token is being properly stored and sent with requests

### API Connection Issues
- Verify the backend is running (health check endpoint)
- Check network requests in browser developer tools
- Verify environment variables are correctly set

### Database Issues
- Check backend logs for database connection errors
- Verify database migrations have run successfully

### CORS Issues
- Verify the frontend URL is included in the backend CORS configuration
- Check for protocol mismatches (http vs https)

## Performance Testing

- Test loading large customer lists
- Test concurrent user access
- Test file upload with large PDFs

## Security Testing

- Verify role-based access control
- Test authentication token expiration
- Verify secure data transmission (HTTPS)
- Test input validation and sanitization

## Reporting Issues

If you encounter any issues during testing, please:
1. Take screenshots of the error
2. Note the steps to reproduce
3. Check browser console and network logs
4. Check backend logs in Render dashboard
