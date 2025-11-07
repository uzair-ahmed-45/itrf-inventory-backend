import express from 'express';
import { login, getCurrentUser, verifyToken } from '../controllers/authController.js';

const router = express.Router();

// Public routes
router.post('/login', login);

// Protected routes
router.get('/me', verifyToken, getCurrentUser);

export default router;

