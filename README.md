## Table of Contents

* [Installation](#installation)
* [Requirements](#requirements)
* [Usage](#usage)
  * [Running the Application](#running-the-application)
* [API Documentation](#api-documentation)


Here's a comprehensive README for Health Management System application including API documentation and installation process:

---

# Health Management System Server

This server-side application provides RESTful APIs for user management and administrative tasks related to a health management system.

## Installation

1. **Clone the Repository:**

```bash
git clone https://github.com/Saif-Rahman-801/Health-Management-System-Server.git
```

2. **Install Dependencies:**

Navigate into the cloned directory and install the required dependencies using npm:

```bash
cd Health-Management-System-Server
npm install
```

## Requirements

- Node.js
- MongoDB

## Usage

### Running the Application

To start the server, run the following command:

```bash
npm start
```

The server will start running on the specified port (default port is 3000).

## API Documentation

### User Management APIs

#### Register a New User

```http
POST /api/user/register
```

Allows users to register with the system.

**Request Body:**

- `username`: User's username.
- `email`: User's email.
- `role`: User's role (e.g., admin, user).
- `password`: User's password.

**Response:**

```json
{
  "status": 200,
  "data": {
    "user": {
      // User object
    },
    "accessToken": "access token",
    "refreshToken": "refresh token"
  },
  "message": "User registration successful"
}
```

#### Log In User

```http
POST /api/user/login
```

Allows users to log in to the system.

**Request Body:**

- `email`: User's email.
- `password`: User's password.

**Response:**

```json
{
  "status": 200,
  "data": {
    "user": {
      // User object
    },
    "accessToken": "access token",
    "refreshToken": "refresh token"
  },
  "message": "User loggedIn successfully"
}
```

#### Refresh Access Token

```http
POST /api/user/refresh-token
```

Allows users to refresh their access token using a refresh token.

**Request Body:**

- `refreshToken`: User's refresh token.

**Response:**

```json
{
  "status": 200,
  "data": {
    "accessToken": "new access token",
    "refreshToken": "new refresh token"
  },
  "message": "Token refreshed"
}
```

#### Log Out User

```http
POST /api/user/logout
```

Allows users to log out of the system.

**Response:**

```json
{
  "status": 200,
  "data": {},
  "message": "User logged out successfully"
}
```

#### Change Current Password

```http
POST /api/user/change-password
```

Allows users to change their current password.

**Request Body:**

- `oldPassword`: User's old password.
- `newPassword`: User's new password.

**Response:**

```json
{
  "status": 200,
  "data": {},
  "message": "Your password changed successfully"
}
```

#### Get Current User

```http
GET /api/user/get-user
```

Retrieves information about the current logged-in user.

**Response:**

```json
{
  "status": 200,
  "data": {
    // User object
  },
  "message": "current user fetched successfully"
}
```

#### Forgot Password

```http
POST /api/user/forget-password
```

Initiates the process for resetting a user's password by sending a reset token via email.

**Request Body:**

- `email`: User's email.

**Response:**

```json
{
  "status": 200,
  "data": {},
  "message": "Reset password token has been sent to user's email"
}
```

#### Reset Password

```http
PUT /api/user/resetPass/:token
```

Resets a user's password using the reset token sent via email.

**Request Parameters:**

- `token`: Reset token.

**Request Body:**

- `password`: User's new password.

**Response:**

```json
{
  "status": 200,
  "data": {},
  "message": "Password reset successful"
}
```

### Administrative APIs

#### Get Admin Information

```http
GET /api/admin/admin-info
```

Retrieves information about the logged-in user's admin role.

**Response:**

```json
{
  "status": 200,
  "data": {
    "user": {
      // User object
    },
    "adminRole": true
  },
  "message": "role authorized"
}
```

#### Get All Users

```http
GET /api/admin/users
```

Retrieves a list of all users in the system.

**Response:**

```json
{
  "status": 200,
  "data": {
    "users": [
      // List of user objects
    ]
  },
  "message": "users fetched successfully"
}
```

#### Search User

```http
GET /api/admin/search-user?username=query
```

Searches for users based on the provided username.

**Query Parameters:**

- `username`: User's username.

**Response:**

```json
{
  "status": 200,
  "data": {
    "data": [
      // List of user objects matching the criteria
    ]
  },
  "message": "users fetched successfully"
}
```

#### Sort Users

```http
GET /api/admin/sort-users?role=role
```

Retrieves a list of users sorted by role.

**Query Parameters:**

- `role`: Role by which to sort users (e.g., admin, user).

**Response:**

```json
{
  "status": 200,
  "data": {
    "data": [
      // List of sorted user objects
    ]
  },
  "message": "users fetched successfully"
}
```

#### Get a User

```http
GET /api/admin/user?id=user_id
```

Retrieves information about a specific user.

**Query Parameters:**

- `id`: User ID.

**Response:**

```json
{
  "status": 200,
  "data": {
    "data": {
      // User object
    }
  },
  "message": "user fetched successfully"
}
```

#### Update User Role

```http
PUT /api/admin/update-role
```

Updates the role of a specific user.

**Request Body:**

- `id`: User ID.
- `role`: New role for the user.

**Response:**

```json
{
  "status": 200,
  "data": {
    // Updated user object
  },
  "message": "User role updated successfully"
}
```

#### Deactivate Account

```http
PUT /api/admin/deactivate-account
```

Deactivates the account of a specific user.

**Request Body:**

- `id`: User ID.

**Response:**

```json
{
  "status": 200,
  "data": {},
  "message": "User account deactivated successfully"
}
```

#### Activate Account

```http
PUT /api/admin/activate-account
```

Activates the account



#### Verification Pending Doctors

```http
GET /api/admin/pending-doctors
```

Retrieves a list of unverified doctors pending for verification.

**Response:**

```json
{
  "status": 200,
  "data": {
    // List of unverified doctor objects
  },
  "message": "Unverified doctors fetched successfully"
}
```

#### Confirm Doctor Verification

```http
PUT /api/admin/verify-doctor
```

Verifies a doctor based on their registration ID and provided details.

**Request Body:**

- `registrationId`: Doctor's registration ID.

**Response:**

```json
{
  "status": 200,
  "data": {
    // Doctor object with updated verification status
  },
  "message": "Doctor verified successfully"
}
```

### Doctors APIs

#### Verify As Doctor

```http
POST /api/verifyAs-doctor
```

Allows a user with a doctor role to submit verification details.

**Request Body:**

- `registrationId`: Doctor's registration ID.
- `degrees`: Array of degrees.
- `collegeName`: Name of the college.
- `appointmentEmail`: Doctor's appointment email.
- `phoneNumber`: Doctor's phone number.

**Response:**

```json
{
  "status": 200,
  "data": {
    // Verified doctor object
  },
  "message": "Doctor verification request sent"
}
```







