# Auth Integration Guide

This document explains exactly how the mobile app should integrate with the backend auth flow in `local-trip-backend`.

The backend supports these user creation and sync scenarios:

- email + password
- phone number + password
- Google via Firebase
- Apple via Firebase

Important distinction:

- `POST /api/auth/signup` is used only for backend-managed signup flows
- `GET /api/auth/me` and `POST /api/auth/sync-profile` are used for Firebase-first flows and recovery/sync flows
- login itself happens on the mobile side with Firebase Auth

## Base URL

Local backend base URL:

```text
http://localhost:5001/api
```

Adjust this for staging/production.

## Auth Endpoints

### `POST /api/auth/signup`

Use this when the mobile app wants the backend to create the Firebase user and the Postgres user together.

Payload rules:

- `fullName` is required
- `role` is required
- `password` is required
- exactly one of `email` or `phoneNumber` must be sent

Example with email:

```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "role": "TOURIST",
  "password": "StrongPass123"
}
```

Example with phone number:

```json
{
  "fullName": "John Doe",
  "phoneNumber": "+491234567890",
  "role": "TOUR_GUIDE",
  "password": "StrongPass123"
}
```

Success response shape:

```json
{
  "success": true,
  "user": {
    "id": "postgres_id_here",
    "firebaseUid": "firebase_uid_here",
    "role": "TOURIST",
    "fullName": "John Doe",
    "email": "john@example.com",
    "phoneNumber": null,
    "createdAt": "2026-03-13T00:00:00.000Z",
    "updatedAt": "2026-03-13T00:00:00.000Z"
  }
}
```

### `GET /api/auth/me`

Use this after every Firebase login on mobile.

Headers:

```text
Authorization: Bearer <firebase_id_token>
```

Success response shape:

```json
{
  "isSynced": true,
  "firebaseUser": {
    "uid": "firebase_uid_here",
    "email": "john@example.com",
    "phoneNumber": null,
    "name": "John Doe",
    "signInProvider": "password"
  },
  "user": {
    "id": "postgres_id_here",
    "firebaseUid": "firebase_uid_here",
    "role": "TOURIST",
    "fullName": "John Doe",
    "email": "john@example.com",
    "phoneNumber": null,
    "createdAt": "2026-03-13T00:00:00.000Z",
    "updatedAt": "2026-03-13T00:00:00.000Z"
  }
}
```

If the Firebase user exists but Postgres user does not exist yet:

```json
{
  "isSynced": false,
  "firebaseUser": {
    "uid": "firebase_uid_here",
    "email": "john@example.com",
    "phoneNumber": null,
    "name": "John Doe",
    "signInProvider": "google.com"
  },
  "user": null
}
```

### `POST /api/auth/sync-profile`

Use this when:

- the user authenticated successfully with Firebase
- `/auth/me` returns `isSynced: false`
- you need to create the Postgres user record from the mobile app

Headers:

```text
Authorization: Bearer <firebase_id_token>
```

Payload:

```json
{
  "fullName": "John Doe",
  "role": "TOURIST",
  "email": "john@example.com"
}
```

or:

```json
{
  "fullName": "John Doe",
  "role": "TOUR_GUIDE",
  "phoneNumber": "+491234567890"
}
```

Success response shape:

```json
{
  "success": true,
  "user": {
    "id": "postgres_id_here",
    "firebaseUid": "firebase_uid_here",
    "role": "TOURIST",
    "fullName": "John Doe",
    "email": "john@example.com",
    "phoneNumber": null,
    "createdAt": "2026-03-13T00:00:00.000Z",
    "updatedAt": "2026-03-13T00:00:00.000Z"
  }
}
```

## Supported Roles

Current backend enum values:

- `ADMIN`
- `TOUR_GUIDE`
- `TOURIST`
- `GUEST`

The mobile app must send one of these exact values.

## Recommended Mobile Flow By Provider

### 1. Email + Password

Recommended path:

1. Call `POST /api/auth/signup` with `fullName`, `email`, `role`, and `password`.
2. If signup succeeds, sign the user in on mobile using Firebase email/password sign-in.
3. Get the Firebase ID token from Firebase Auth.
4. Call `GET /api/auth/me`.
5. If `isSynced` is `true`, continue into the app.

Reason:

- backend creates Firebase user and Postgres user atomically
- backend rollback handles partial failure if Postgres creation fails after Firebase creation

### 2. Phone Number + Password

Current backend accepts:

- `fullName`
- `phoneNumber`
- `role`
- `password`

But there is an important Firebase product note:

- Firebase Auth on the client does not normally use `phone number + password` as a standard login flow
- Firebase phone auth is usually OTP/SMS based

So for mobile implementation:

- backend signup endpoint can create a Firebase user with phone number
- but frontend login flow must be validated against the exact Firebase SDK/provider strategy you want to use

Recommended action for frontend:

1. Confirm whether product really wants phone + password login.
2. If yes, validate the exact Firebase-supported login approach before implementation.
3. If phone auth should actually be OTP-based, then use Firebase phone authentication on mobile and treat it like the Google/Apple sync flow below.

Important:

- `phoneNumber` must be sent in E.164 format, for example `+491234567890`

### 3. Google Sign-In

Recommended path:

1. Perform Google sign-in on the mobile app using Firebase Auth.
2. Firebase returns the authenticated user.
3. Get the Firebase ID token.
4. Call `GET /api/auth/me` with the token.
5. If `isSynced` is `true`, continue into the app.
6. If `isSynced` is `false`, show the profile completion form.
7. Submit `fullName`, `role`, and optionally `email` or `phoneNumber` to `POST /api/auth/sync-profile`.

Important:

- do not call backend `/auth/signup` for Google users
- Firebase is the source of truth for authentication
- backend only syncs the app profile into Postgres

### 4. Apple Sign-In

Recommended path:

1. Perform Apple sign-in on the mobile app using Firebase Auth.
2. Firebase returns the authenticated user.
3. Get the Firebase ID token.
4. Call `GET /api/auth/me`.
5. If `isSynced` is `true`, continue into the app.
6. If `isSynced` is `false`, show the profile completion form.
7. Submit `fullName`, `role`, and optionally `email` or `phoneNumber` to `POST /api/auth/sync-profile`.

Important Apple note:

- Apple may not provide full profile information every time
- email may be missing or may be an Apple relay email
- because of that, backend supports optional `email`

## What The App Should Do On Every Login

After any successful Firebase login:

1. get Firebase ID token
2. call `GET /api/auth/me`
3. inspect the response

If:

- `isSynced === true`
  - use `user.role`, `user.id`, `user.fullName`, etc.

- `isSynced === false`
  - user exists in Firebase but not in Postgres
  - show a profile completion screen
  - call `POST /api/auth/sync-profile`

This is important for:

- Google sign-in
- Apple sign-in
- any recovery case where Firebase account exists but Postgres sync failed

## Frontend Decision Table

### Email/password signup

- call backend `/auth/signup`
- then sign in with Firebase on mobile
- then call `/auth/me`

### Phone/password signup

- call backend `/auth/signup`
- validate actual Firebase mobile login strategy before finalizing implementation

### Google signup/login

- use Firebase Auth on mobile
- do not call backend `/auth/signup`
- call `/auth/me`
- if needed call `/auth/sync-profile`

### Apple signup/login

- use Firebase Auth on mobile
- do not call backend `/auth/signup`
- call `/auth/me`
- if needed call `/auth/sync-profile`

## Error Handling Expectations

Frontend should handle these cases cleanly:

- email already exists
- phone number already exists
- invalid phone number format
- weak or invalid password
- invalid or expired Firebase token
- Firebase account exists but backend profile does not exist yet

Recommended UX:

- show backend error message when available
- if `/auth/me` returns `isSynced: false`, redirect to profile completion instead of treating it as a fatal error

## Minimal Data Backend Needs For Postgres User

To create the backend profile, the backend ultimately needs:

- `firebaseUid`
- `fullName`
- `role`
- optional `email`
- optional `phoneNumber`

`firebaseUid` always comes from Firebase.

## Summary

Use backend signup only for:

- email/password
- phone/password

Use Firebase-first login + backend sync for:

- Google
- Apple
- any user recovery flow where Firebase exists but Postgres does not

The safest frontend rule is:

- after every successful Firebase authentication, call `/auth/me`
- if not synced, call `/auth/sync-profile`
