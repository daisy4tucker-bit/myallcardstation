import { Router } from 'express';
import { checkCardValidation, getAdminValidationRequests } from '../controllers/validationController.js';
import { authenticateUser, optionalAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/check', optionalAuth, checkCardValidation);
router.get('/admin', authenticateUser, getAdminValidationRequests);

export default router;
