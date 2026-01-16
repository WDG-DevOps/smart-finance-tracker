import { Goal } from '../models/index.js';
import { calculateGoalProgress } from '../utils/forecasting.js';

export const createGoal = async (req, res) => {
  try {
    const { name, targetAmount, targetDate, description } = req.body;

    const goal = await Goal.create({
      userId: req.user.id,
      name,
      targetAmount,
      targetDate,
      description,
      currentAmount: 0
    });

    const progress = calculateGoalProgress(goal.targetAmount, goal.currentAmount, goal.targetDate);

    res.status(201).json({
      message: 'Goal created successfully',
      goal: {
        ...goal.toJSON(),
        ...progress
      }
    });
  } catch (error) {
    console.error('Create goal error:', error);
    res.status(500).json({ error: 'Failed to create goal' });
  }
};

export const getGoals = async (req, res) => {
  try {
    const goals = await Goal.findAll({
      where: { userId: req.user.id },
      order: [['targetDate', 'ASC']]
    });

    const goalsWithProgress = goals.map(goal => {
      const progress = calculateGoalProgress(goal.targetAmount, goal.currentAmount, goal.targetDate);
      return {
        ...goal.toJSON(),
        ...progress
      };
    });

    res.json({ goals: goalsWithProgress });
  } catch (error) {
    console.error('Get goals error:', error);
    res.status(500).json({ error: 'Failed to fetch goals' });
  }
};

export const updateGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, targetAmount, targetDate, description, currentAmount } = req.body;

    const goal = await Goal.findOne({
      where: { id, userId: req.user.id }
    });

    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    if (name) goal.name = name;
    if (targetAmount) goal.targetAmount = targetAmount;
    if (targetDate) goal.targetDate = targetDate;
    if (description !== undefined) goal.description = description;
    if (currentAmount !== undefined) goal.currentAmount = currentAmount;

    // Check if goal is completed
    if (parseFloat(goal.currentAmount) >= parseFloat(goal.targetAmount)) {
      goal.isCompleted = true;
    }

    await goal.save();

    const progress = calculateGoalProgress(goal.targetAmount, goal.currentAmount, goal.targetDate);

    res.json({
      message: 'Goal updated successfully',
      goal: {
        ...goal.toJSON(),
        ...progress
      }
    });
  } catch (error) {
    console.error('Update goal error:', error);
    res.status(500).json({ error: 'Failed to update goal' });
  }
};

export const deleteGoal = async (req, res) => {
  try {
    const { id } = req.params;

    const goal = await Goal.findOne({
      where: { id, userId: req.user.id }
    });

    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    await goal.destroy();

    res.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    console.error('Delete goal error:', error);
    res.status(500).json({ error: 'Failed to delete goal' });
  }
};

export const addToGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    const goal = await Goal.findOne({
      where: { id, userId: req.user.id }
    });

    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    goal.currentAmount = parseFloat(goal.currentAmount) + parseFloat(amount);

    if (parseFloat(goal.currentAmount) >= parseFloat(goal.targetAmount)) {
      goal.isCompleted = true;
    }

    await goal.save();

    const progress = calculateGoalProgress(goal.targetAmount, goal.currentAmount, goal.targetDate);

    res.json({
      message: 'Amount added to goal successfully',
      goal: {
        ...goal.toJSON(),
        ...progress
      }
    });
  } catch (error) {
    console.error('Add to goal error:', error);
    res.status(500).json({ error: 'Failed to add amount to goal' });
  }
};
