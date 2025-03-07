const express = require('express');
const router = express.Router();

// Temporary controller for testing
const userController = {
  getUsers: (req, res) => {
    res.json({
      status: 'success',
      data: [
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
        id: 'admin-001',
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@newcash.com',
        role: 'ADMIN',
        createdAt: new Date()
      }
    });
  },
  updateProfile: (req, res) => {
    res.json({
      status: 'success',
      message: 'Perfil atualizado com sucesso',
      data: {
        ...req.body,
        id: 'admin-001',
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
