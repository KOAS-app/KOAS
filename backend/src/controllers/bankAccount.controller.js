import prisma from '../config/prisma.js';

// Get all bank accounts for the owner's stadium
export const getBankAccounts = async (req, res) => {
  try {
    const stadium = await prisma.stadium.findUnique({
      where: { ownerId: req.user.id },
      include: {
        bankAccounts: {
          orderBy: [
            { isDefault: 'desc' }, // Default account first
            { createdAt: 'asc' },
          ],
        },
      },
    });

    if (!stadium) {
      return res.status(404).json({ message: 'Stadium not found. Please create a stadium first.' });
    }

    res.json(stadium.bankAccounts);
  } catch (error) {
    console.error('Get bank accounts error:', error);
    res.status(500).json({ message: 'Failed to fetch bank accounts.' });
  }
};

// Create a new bank account
export const createBankAccount = async (req, res) => {
  try {
    const { bankName, accountNumber, accountHolderName, isDefault } = req.body;

    // Validate required fields
    if (!bankName || !accountNumber || !accountHolderName) {
      return res.status(400).json({ message: 'Bank name, account number, and account holder name are required.' });
    }

    // Get owner's stadium
    const stadium = await prisma.stadium.findUnique({
      where: { ownerId: req.user.id },
      include: { bankAccounts: true },
    });

    if (!stadium) {
      return res.status(404).json({ message: 'Stadium not found. Please create a stadium first.' });
    }

    // Check limit of 5 bank accounts
    if (stadium.bankAccounts.length >= 5) {
      return res.status(400).json({ message: 'Maximum of 5 bank accounts allowed.' });
    }

    // If this is the first account or isDefault is true, set as default
    const shouldBeDefault = stadium.bankAccounts.length === 0 || isDefault === true;

    // If setting as default, unset other defaults
    if (shouldBeDefault) {
      await prisma.bankAccount.updateMany({
        where: { stadiumId: stadium.id },
        data: { isDefault: false },
      });
    }

    // Create the bank account
    const bankAccount = await prisma.bankAccount.create({
      data: {
        stadiumId: stadium.id,
        bankName,
        accountNumber,
        accountHolderName,
        isDefault: shouldBeDefault,
      },
    });

    res.status(201).json(bankAccount);
  } catch (error) {
    console.error('Create bank account error:', error);
    res.status(500).json({ message: 'Failed to create bank account.' });
  }
};

// Update a bank account
export const updateBankAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const { bankName, accountNumber, accountHolderName } = req.body;

    // Verify ownership
    const stadium = await prisma.stadium.findUnique({
      where: { ownerId: req.user.id },
    });

    if (!stadium) {
      return res.status(404).json({ message: 'Stadium not found.' });
    }

    const bankAccount = await prisma.bankAccount.findUnique({
      where: { id },
    });

    if (!bankAccount || bankAccount.stadiumId !== stadium.id) {
      return res.status(404).json({ message: 'Bank account not found.' });
    }

    // Update the bank account
    const updated = await prisma.bankAccount.update({
      where: { id },
      data: {
        ...(bankName && { bankName }),
        ...(accountNumber && { accountNumber }),
        ...(accountHolderName && { accountHolderName }),
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Update bank account error:', error);
    res.status(500).json({ message: 'Failed to update bank account.' });
  }
};

// Delete a bank account
export const deleteBankAccount = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const stadium = await prisma.stadium.findUnique({
      where: { ownerId: req.user.id },
      include: { bankAccounts: true },
    });

    if (!stadium) {
      return res.status(404).json({ message: 'Stadium not found.' });
    }

    const bankAccount = await prisma.bankAccount.findUnique({
      where: { id },
    });

    if (!bankAccount || bankAccount.stadiumId !== stadium.id) {
      return res.status(404).json({ message: 'Bank account not found.' });
    }

    // Delete the bank account
    await prisma.bankAccount.delete({
      where: { id },
    });

    // If deleted account was default and there are other accounts, set the first one as default
    if (bankAccount.isDefault && stadium.bankAccounts.length > 1) {
      const remainingAccounts = stadium.bankAccounts.filter(acc => acc.id !== id);
      if (remainingAccounts.length > 0) {
        await prisma.bankAccount.update({
          where: { id: remainingAccounts[0].id },
          data: { isDefault: true },
        });
      }
    }

    res.json({ message: 'Bank account deleted successfully.' });
  } catch (error) {
    console.error('Delete bank account error:', error);
    res.status(500).json({ message: 'Failed to delete bank account.' });
  }
};

// Set a bank account as default
export const setDefaultBankAccount = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const stadium = await prisma.stadium.findUnique({
      where: { ownerId: req.user.id },
    });

    if (!stadium) {
      return res.status(404).json({ message: 'Stadium not found.' });
    }

    const bankAccount = await prisma.bankAccount.findUnique({
      where: { id },
    });

    if (!bankAccount || bankAccount.stadiumId !== stadium.id) {
      return res.status(404).json({ message: 'Bank account not found.' });
    }

    // Unset all defaults for this stadium
    await prisma.bankAccount.updateMany({
      where: { stadiumId: stadium.id },
      data: { isDefault: false },
    });

    // Set this account as default
    const updated = await prisma.bankAccount.update({
      where: { id },
      data: { isDefault: true },
    });

    res.json(updated);
  } catch (error) {
    console.error('Set default bank account error:', error);
    res.status(500).json({ message: 'Failed to set default bank account.' });
  }
};
