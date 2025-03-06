const express = require('express');
const router = express.Router();

// Temporary controller for testing
const userController = {
  getUsers: (req, res) => {
    res.json({
      status: 'success',
      data: [
        {
          _id: 'user-001',
          firstName: 'João',
          lastName: 'Silva',
          email: 'joao.silva@example.com',
          role: 'CLIENT',
          status: 'ACTIVE',
          createdAt: new Date()
        },
        {
          _id: 'user-002',
          firstName: 'Maria',
          lastName: 'Santos',
          email: 'maria.santos@example.com',
          role: 'CLIENT',
          status: 'ACTIVE',
          createdAt: new Date()
        },
        {
          _id: 'user-003',
          firstName: 'Pedro',
          lastName: 'Oliveira',
          email: 'pedro.oliveira@example.com',
          role: 'CLIENT',
          status: 'INACTIVE',
          createdAt: new Date()
        },
        {
          _id: 'admin-001',
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@newcash.com',
          role: 'ADMIN',
          status: 'ACTIVE',
          createdAt: new Date()
        }
      ]
    });
  },
  getProfile: (req, res) => {
    res.json({
      status: 'success',
      data: {
        id: '12345',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
        createdAt: new Date()
      }
    });
  },
  updateProfile: (req, res) => {
    res.json({
      status: 'success',
      message: 'Profile updated successfully',
      data: {
        ...req.body,
        id: '12345',
        updatedAt: new Date()
      }
    });
  }
};

// Routes
router.get('/', userController.getUsers);
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);

module.exports = router;
