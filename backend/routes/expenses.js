const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');

// GET all expenses
router.get('/', async (req, res) => {
    try {
        const expenses = await Expense.find({});
        res.json(expenses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST a new expense
router.post('/', async (req, res) => {
    const expense = new Expense({
        title: req.body.title,
        amount: req.body.amount,
        date: req.body.date,
        billMonth: req.body.billMonth
    });

    try {
        const newExpense = await expense.save();
        res.status(201).json(newExpense);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE an expense
router.delete('/:id', async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id);
        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }
        await expense.deleteOne();
        res.json({ message: 'Expense removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
