# Forgot Password Feature - Complete Implementation Guide

## Overview
This guide provides a complete, copy-paste ready implementation of a "Forgot Password" feature for your clinic dashboard system.

---

## What This Feature Does

1. User clicks "Forgot Password?" on login page
2. User enters their email address
3. System generates a unique reset token and stores it in database
4. System sends reset link to user's email (or displays it for testing)
5. User clicks the reset link
6. User enters new password
7. System validates token and updates password
8. User can now login with new password

---

## Implementation Steps

### Step 1: Create Database Table for Reset Tokens

**File:** `scripts/XXX_create_password_resets_table.sql`

\`\`\`sql
-- Create password_resets table to store reset tokens
CREATE TABLE IF NOT EXISTS password_resets (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  used BOOLEAN DEFAULT FALSE
);

-- Add index for faster lookups
CREATE INDEX idx_password_resets_token ON password_resets(token);
CREATE INDEX idx_password_resets_email ON password_resets(email);
\`\`\`

**What it does:** Creates a table to store password reset tokens with expiration times.

---

### Step 2: Create Forgot Password API Route

**File:** `app/api/auth/forgot-password/route.js`

\`\`\`javascript
import { neon } from '@neondatabase/serverless';
import crypto from 'crypto';

const sql = neon(process.env.DATABASE_URL);

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return Response.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const users = await sql`
      SELECT id, email, full_name 
      FROM users 
      WHERE email = ${email}
    `;

    if (users.length === 0) {
      // Don't reveal if email exists or not (security best practice)
      return Response.json(
        { message: 'If an account exists with this email, you will receive a password reset link.' },
        { status: 200 }
      );
    }

    const user = users[0];

    // Generate secure random token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Token expires in 1 hour
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    // Store token in database
    await sql`
      INSERT INTO password_resets (email, token, expires_at)
      VALUES (${email}, ${resetToken}, ${expiresAt})
    `;

    // Create reset link
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    // TODO: Send email with reset link
    // For now, we'll just log it (in production, use an email service)
    console.log('[v0] Password reset link:', resetLink);
    console.log('[v0] For user:', email);

    // In development, return the link in the response
    // In production, remove this and only send via email
    if (process.env.NODE_ENV === 'development') {
      return Response.json({
        message: 'Password reset link generated',
        resetLink, // Only for testing!
      });
    }

    return Response.json({
      message: 'If an account exists with this email, you will receive a password reset link.',
    });

  } catch (error) {
    console.error('[v0] Forgot password error:', error);
    return Response.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
\`\`\`

**What it does:** 
- Validates email exists in database
- Generates secure random token
- Stores token with expiration time
- Returns reset link (in development mode)

---

### Step 3: Create Reset Password API Route

**File:** `app/api/auth/reset-password/route.js`

\`\`\`javascript
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

const sql = neon(process.env.DATABASE_URL);

export async function POST(request) {
  try {
    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      return Response.json(
        { error: 'Token and new password are required' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (newPassword.length < 6) {
      return Response.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Find valid token
    const resetRequests = await sql`
      SELECT * FROM password_resets
      WHERE token = ${token}
        AND used = FALSE
        AND expires_at > NOW()
      ORDER BY created_at DESC
      LIMIT 1
    `;

    if (resetRequests.length === 0) {
      return Response.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    const resetRequest = resetRequests[0];

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    await sql`
      UPDATE users
      SET password = ${hashedPassword}
      WHERE email = ${resetRequest.email}
    `;

    // Mark token as used
    await sql`
      UPDATE password_resets
      SET used = TRUE
      WHERE id = ${resetRequest.id}
    `;

    console.log('[v0] Password reset successful for:', resetRequest.email);

    return Response.json({
      message: 'Password reset successful. You can now login with your new password.',
    });

  } catch (error) {
    console.error('[v0] Reset password error:', error);
    return Response.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}
\`\`\`

**What it does:**
- Validates reset token is valid and not expired
- Hashes new password
- Updates user password in database
- Marks token as used

---

### Step 4: Create Forgot Password Page

**File:** `app/forgot-password/page.jsx`

\`\`\`jsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [resetLink, setResetLink] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    setResetLink('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to send reset link');
        return;
      }

      setMessage(data.message);
      
      // In development, show the reset link
      if (data.resetLink) {
        setResetLink(data.resetLink);
      }

    } catch (err) {
      console.error('[v0] Forgot password error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Forgot Password</CardTitle>
          <CardDescription>
            Enter your email address and we'll send you a link to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10"
                  disabled={loading}
                />
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {message && (
              <Alert>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            {resetLink && (
              <Alert>
                <AlertDescription className="space-y-2">
                  <p className="font-medium">Development Mode - Reset Link:</p>
                  <Link 
                    href={resetLink} 
                    className="text-blue-600 hover:underline break-all text-sm"
                  >
                    {resetLink}
                  </Link>
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>

            <div className="text-center">
              <Link
                href="/login"
                className="text-sm text-blue-600 hover:underline inline-flex items-center gap-1"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
\`\`\`

**What it does:**
- Provides form for user to enter email
- Calls forgot password API
- Shows success message
- In development, displays the reset link directly

---

### Step 5: Create Reset Password Page

**File:** `app/reset-password/page.jsx`

\`\`\`jsx
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, Eye, EyeOff } from 'lucide-react';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Invalid reset link. Please request a new password reset.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password length
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to reset password');
        return;
      }

      setMessage(data.message);
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login');
      }, 2000);

    } catch (err) {
      console.error('[v0] Reset password error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Reset Password</CardTitle>
          <CardDescription>
            Enter your new password below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="newPassword" className="text-sm font-medium">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="pl-10 pr-10"
                  disabled={loading || !token}
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="pl-10"
                  disabled={loading || !token}
                  minLength={6}
                />
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {message && (
              <Alert>
                <AlertDescription>
                  {message}
                  <br />
                  <span className="text-sm text-gray-600">Redirecting to login...</span>
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !token}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </Button>

            <div className="text-center">
              <Link
                href="/login"
                className="text-sm text-blue-600 hover:underline"
              >
                Back to Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
\`\`\`

**What it does:**
- Gets reset token from URL
- Provides form for new password
- Validates password strength and match
- Calls reset password API
- Redirects to login on success

---

### Step 6: Add "Forgot Password?" Link to Login Page

**File:** `app/login/page.jsx` (or wherever your login page is)

Add this link below your password field:

\`\`\`jsx
<div className="text-right">
  <Link
    href="/forgot-password"
    className="text-sm text-blue-600 hover:underline"
  >
    Forgot password?
  </Link>
</div>
\`\`\`

**Full example of password field section:**

\`\`\`jsx
<div className="space-y-2">
  <label htmlFor="password" className="text-sm font-medium">
    Password
  </label>  
  <Input
    id="password"
    type="password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    required
  />
  <div className="text-right">
    <Link
      href="/forgot-password" 
      className="text-sm text-blue-600 hover:underline"
    >
      Forgot password?
    </Link>
  </div>
</div>
\`\`\`

---

## Testing Steps

### 1. Run the Database Migration
\`\`\`bash
# The system will automatically run the SQL script
# Or you can run it manually from the scripts folder
\`\`\`

### 2. Test fpot Password Flow
1. Go to login page
2. Click "Forgot password?" link
3. Enter a valid email address from your users table
4. Click "Send Reset Link"
5. Copy the reset link from the response (in development mode)

### 3. Test Reset Password
1. Paste the reset link in browser
2. Enter new password (at least 6 characters)
3. Confirm password
4. Click "Reset Password"
5. Should redirect to login page
6. Login with new password

### 4. Test Token Expiration
1. Request a password reset
2. Wait 1 hour (or modify the expiration time in the code for testing)
3. Try to use the reset link
4. Should show "Invalid or expired reset token"

### 5. Test Token Reuse Prevention
1. Request a password reset
2. Use the token to reset password
3. Try to use the same token again
4. Should show "Invalid or expired reset token"

---

## Common Issues & Solutions

### Issue 1: "crypto is not defined"
**Solution:** The `crypto` module is built into Node.js. Make sure you're using it in a server component or API route, not a client component.

### Issue 2: Reset link doesn't work
**Solution:** Check that:
- The token is being passed correctly in the URL
- The `password_resets` table exists
- The token hasn't expired (check `expires_at` column)

### Issue 3: Password not updating
**Solution:** Check that:
- `bcryptjs` is installed: `npm install bcryptjs`
- The users table has a `password` column
- The email in `password_resets` matches the email in `users` table

---

## Production Considerations

### Email Service Integration
In production, you should send actual emails instead of displaying the reset link. Popular options:

**Using Resend (recommended for Vercel):**
\`\`\`javascript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'noreply@yourdomain.com',
  to: email,
  subject: 'Reset Your Password',
  html: `
    <h1>Reset Your Password</h1>
    <p>Click the link below to reset your password:</p>
    <a href="${resetLink}">${resetLink}</a>
    <p>This link will expire in 1 hour.</p>
  `,
});
\`\`\`

**Using Nodemailer:**
\`\`\`javascript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

await transporter.sendMail({
  from: 'noreply@yourdomain.com',
  to: email,
  subject: 'Reset Your Password',
  html: `
    <h1>Reset Your Password</h1>
    <p>Click the link below to reset your password:</p>
    <a href="${resetLink}">${resetLink}</a>
    <p>This link will expire in 1 hour.</p>
  `,
});
\`\`\`

### Security Enhancements
1. **Rate limiting:** Limit password reset requests per email (e.g., max 3 per hour)
2. **HTTPS only:** Ensure reset links only work over HTTPS in production
3. **Token length:** Use longer tokens (64+ characters) for better security
4. **Cleanup:** Periodically delete expired tokens from database

---

## Quick Reference

### Files to Create:
1. `scripts/XXX_create_password_resets_table.sql` - Database table
2. `app/api/auth/forgot-password/route.js` - Request reset API
3. `app/api/auth/reset-password/route.js` - Reset password API
4. `app/forgot-password/page.jsx` - Forgot password form
5. `app/reset-password/page.jsx` - Reset password form

### Files to Modify:
1. `app/login/page.jsx` - Add "Forgot password?" link

### Environment Variables Needed:
- `DATABASE_URL` - Already configured
- `NEXT_PUBLIC_APP_URL` - Your app URL (optional, defaults to localhost:3000)
- `RESEND_API_KEY` - For email sending (production only)

---

## Time Estimate
- Database setup: 2 minutes
- API routes: 5 minutes
- UI pages: 5 minutes
- Testing: 3 minutes
- **Total: ~15 minutes**

Good luck with your skills test! 🚀
