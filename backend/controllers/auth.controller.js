const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const crypto = require('crypto');
const User = require('../models/user.model');
const logger = require('../utils/logger');
const { sendEmail } = require('../utils/email');

// Helper function to generate JWT token
const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRATION || '1d' }
  );
};

// Helper function to generate refresh token
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d' }
  );
};

// Register a new user
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'Email already in use'
      });
    }

    // Only admin can create another admin
    if (role === 'admin' && (!req.user || req.user.role !== 'admin')) {
      return res.status(403).json({
        status: 'error',
        message: 'Unauthorized to create admin user'
      });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      role: role || 'client'
    });

    await user.save();

    // Send welcome email
    try {
      await sendEmail({
        to: email,
        subject: 'Welcome to Newcash Bank',
        text: `Hello ${name},\n\nWelcome to Newcash Bank! Your account has been created successfully.\n\nBest regards,\nNewcash Bank Team`
      });
    } catch (emailError) {
      logger.error(`Failed to send welcome email: ${emailError.message}`);
      // Don't fail registration if email fails
    }

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    logger.error(`Registration error: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Error registering user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email }).select('+password +twoFactorSecret +twoFactorEnabled');

    // Check if user exists and password is correct
    if (!user || !(await user.comparePassword(password))) {
      if (user) {
        // Increment failed login attempts if user exists
        await user.incrementLoginAttempts();
      }
      
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }

    // Check if account is locked
    if (user.isAccountLocked()) {
      return res.status(403).json({
        status: 'error',
        message: 'Account is locked. Please contact support for assistance.'
      });
    }

    // Reset failed login attempts on successful login
    await user.resetLoginAttempts();

    // Check if two-factor authentication is enabled
    if (user.twoFactorEnabled) {
      return res.status(200).json({
        status: 'success',
        message: 'Two-factor authentication required',
        data: {
          userId: user._id,
          requireTwoFactor: true
        }
      });
    }

    // Generate JWT token
    const token = generateToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        token,
        refreshToken
      }
    });
  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Verify two-factor authentication
exports.verifyTwoFactor = async (req, res) => {
  try {
    const { userId, token } = req.body;

    // Find user
    const user = await User.findById(userId).select('+twoFactorSecret');
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Verify token
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 1 // Allow 1 time step drift (30 seconds before/after)
    });

    if (!verified) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid verification code'
      });
    }

    // Generate JWT token
    const jwtToken = generateToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    res.status(200).json({
      status: 'success',
      message: 'Two-factor verification successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        token: jwtToken,
        refreshToken
      }
    });
  } catch (error) {
    logger.error(`Two-factor verification error: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Error during two-factor verification',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Refresh token
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        status: 'error',
        message: 'Refresh token is required'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    
    // Find user
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Generate new tokens
    const newToken = generateToken(user._id, user.role);
    const newRefreshToken = generateRefreshToken(user._id);

    res.status(200).json({
      status: 'success',
      message: 'Token refreshed successfully',
      data: {
        token: newToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    logger.error(`Token refresh error: ${error.message}`);
    res.status(401).json({
      status: 'error',
      message: 'Invalid or expired refresh token'
    });
  }
};

// Logout
exports.logout = (req, res) => {
  // Client-side logout (clear tokens)
  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully'
  });
};

// Forgot password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Hash token and save to user
    user.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
      
    // Set expiration to 1 hour
    user.passwordResetExpires = Date.now() + 60 * 60 * 1000;
    
    await user.save();

    // Send reset email
    const resetURL = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;
    
    try {
      await sendEmail({
        to: user.email,
        subject: 'Password Reset Request',
        text: `You requested a password reset. Please use the following link to reset your password (valid for 1 hour): ${resetURL}\n\nIf you didn't request this, please ignore this email.`
      });

      res.status(200).json({
        status: 'success',
        message: 'Password reset link sent to email'
      });
    } catch (emailError) {
      logger.error(`Failed to send reset email: ${emailError.message}`);
      
      // Reset the token and expiration
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();

      res.status(500).json({
        status: 'error',
        message: 'Error sending password reset email'
      });
    }
  } catch (error) {
    logger.error(`Forgot password error: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Error processing forgot password request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    // Hash token to compare with stored hash
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user with the token and check if token is still valid
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        status: 'error',
        message: 'Token is invalid or has expired'
      });
    }

    // Update password and remove reset token fields
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    
    await user.save();

    // Send confirmation email
    try {
      await sendEmail({
        to: user.email,
        subject: 'Password Reset Successful',
        text: `Your password has been changed successfully. If you didn't make this change, please contact us immediately.`
      });
    } catch (emailError) {
      logger.error(`Failed to send password reset confirmation: ${emailError.message}`);
      // Don't fail the reset if email fails
    }

    res.status(200).json({
      status: 'success',
      message: 'Password reset successful'
    });
  } catch (error) {
    logger.error(`Reset password error: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Error resetting password',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Change password (for logged-in users)
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Find user
    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Verify current password
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({
        status: 'error',
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Send confirmation email
    try {
      await sendEmail({
        to: user.email,
        subject: 'Password Changed',
        text: `Your password has been changed successfully. If you didn't make this change, please contact us immediately.`
      });
    } catch (emailError) {
      logger.error(`Failed to send password change confirmation: ${emailError.message}`);
      // Don't fail the password change if email fails
    }

    res.status(200).json({
      status: 'success',
      message: 'Password changed successfully'
    });
  } catch (error) {
    logger.error(`Change password error: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Error changing password',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Generate two-factor authentication secret
exports.generateTwoFactorSecret = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Generate new secret
    const secret = speakeasy.generateSecret({
      length: 20,
      name: `Newcash Bank:${user.email}`
    });

    // Generate QR code URL
    const otpauth_url = secret.otpauth_url;

    res.status(200).json({
      status: 'success',
      data: {
        secret: secret.base32,
        otpauth_url
      }
    });
  } catch (error) {
    logger.error(`Generate 2FA secret error: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Error generating 2FA secret',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Enable two-factor authentication
exports.enableTwoFactor = async (req, res) => {
  try {
    const { secret, token } = req.body;
    const userId = req.user.id;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Verify token
    const verified = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 1
    });

    if (!verified) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid verification code'
      });
    }

    // Save secret and enable 2FA
    user.twoFactorSecret = secret;
    user.twoFactorEnabled = true;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Two-factor authentication enabled successfully'
    });
  } catch (error) {
    logger.error(`Enable 2FA error: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Error enabling 2FA',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Disable two-factor authentication
exports.disableTwoFactor = async (req, res) => {
  try {
    const { token } = req.body;
    const userId = req.user.id;

    // Find user
    const user = await User.findById(userId).select('+twoFactorSecret');
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Verify token
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 1
    });

    if (!verified) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid verification code'
      });
    }

    // Disable 2FA
    user.twoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Two-factor authentication disabled successfully'
    });
  } catch (error) {
    logger.error(`Disable 2FA error: ${error.message}`);
    res.status(500).json({
      status: 'error',
      message: 'Error disabling 2FA',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
