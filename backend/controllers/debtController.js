import { Debt } from '../models/index.js';
import { Op } from 'sequelize';

export const createDebt = async (req, res) => {
  try {
    const { type, personName, amount, description, dueDate } = req.body;

    const debt = await Debt.create({
      userId: req.user.id,
      type,
      personName,
      amount,
      description,
      dueDate
    });

    res.status(201).json({
      message: 'Debt record created successfully',
      debt
    });
  } catch (error) {
    console.error('Create debt error:', error);
    res.status(500).json({ error: 'Failed to create debt record' });
  }
};

export const getDebts = async (req, res) => {
  try {
    const { type, isPaid } = req.query;

    const where = { userId: req.user.id };
    if (type) where.type = type;
    if (isPaid !== undefined) where.isPaid = isPaid === 'true';

    const debts = await Debt.findAll({
      where,
      order: [['dueDate', 'ASC']]
    });

    // Add overdue status
    const debtsWithStatus = debts.map(debt => {
      const debtObj = debt.toJSON();
      const now = new Date();
      const dueDate = new Date(debt.dueDate);

      if (!debt.isPaid && dueDate < now) {
        debtObj.isOverdue = true;
        debtObj.daysOverdue = Math.ceil((now - dueDate) / (1000 * 60 * 60 * 24));
      } else {
        debtObj.isOverdue = false;
      }

      return debtObj;
    });

    res.json({ debts: debtsWithStatus });
  } catch (error) {
    console.error('Get debts error:', error);
    res.status(500).json({ error: 'Failed to fetch debts' });
  }
};

export const updateDebt = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, personName, amount, description, dueDate, isPaid } = req.body;

    const debt = await Debt.findOne({
      where: { id, userId: req.user.id }
    });

    if (!debt) {
      return res.status(404).json({ error: 'Debt record not found' });
    }

    if (type) debt.type = type;
    if (personName) debt.personName = personName;
    if (amount) debt.amount = amount;
    if (description !== undefined) debt.description = description;
    if (dueDate) debt.dueDate = dueDate;
    if (isPaid !== undefined) {
      debt.isPaid = isPaid;
      if (isPaid) {
        debt.paidDate = new Date();
      }
    }

    await debt.save();

    res.json({
      message: 'Debt record updated successfully',
      debt
    });
  } catch (error) {
    console.error('Update debt error:', error);
    res.status(500).json({ error: 'Failed to update debt record' });
  }
};

export const deleteDebt = async (req, res) => {
  try {
    const { id } = req.params;

    const debt = await Debt.findOne({
      where: { id, userId: req.user.id }
    });

    if (!debt) {
      return res.status(404).json({ error: 'Debt record not found' });
    }

    await debt.destroy();

    res.json({ message: 'Debt record deleted successfully' });
  } catch (error) {
    console.error('Delete debt error:', error);
    res.status(500).json({ error: 'Failed to delete debt record' });
  }
};

export const getUpcomingDebts = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + parseInt(days));

    const debts = await Debt.findAll({
      where: {
        userId: req.user.id,
        isPaid: false,
        dueDate: {
          [Op.between]: [now, futureDate]
        }
      },
      order: [['dueDate', 'ASC']]
    });

    res.json({ debts });
  } catch (error) {
    console.error('Get upcoming debts error:', error);
    res.status(500).json({ error: 'Failed to fetch upcoming debts' });
  }
};
