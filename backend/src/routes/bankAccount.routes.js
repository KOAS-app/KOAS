import express from 'express';
import {
  getBankAccounts,
  createBankAccount,
  updateBankAccount,
  deleteBankAccount,
  setDefaultBankAccount,
} from '../controllers/bankAccount.controller.js';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = express.Router();

// All routes require OWNER role
router.use(authenticate, authorizeRoles('OWNER'));

router.get('/my', getBankAccounts);
router.post('/', createBankAccount);
router.put('/:id', updateBankAccount);
router.delete('/:id', deleteBankAccount);
router.patch('/:id/set-default', setDefaultBankAccount);

export default router;
