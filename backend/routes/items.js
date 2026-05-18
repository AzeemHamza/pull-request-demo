const express = require('express');
const { body, query, validationResult } = require('express-validator');
const createError = require('http-errors');
const Item = require('../models/Item');
const auth = require('../middleware/auth');

const router = express.Router();

// All routes require auth
router.use(auth);

// GET /api/items?search=&category=&completed=&page=1&limit=8
router.get('/', async (req, res, next) => {
  try {
    const { search, category, completed, page = 1, limit = 8 } = req.query;
    const filter = { user: req.userId };
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }
    if (category && category !== 'All') {
      filter.category = category;
    }
    if (completed !== undefined && completed !== '') {
      filter.completed = completed === 'true';
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      Item.find(filter).sort({ order: 1, createdAt: -1 }).skip(skip).limit(limitNum),
      Item.countDocuments(filter)
    ]);

    res.json({
      items,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum)
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/items
router.post('/', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('category').optional().isIn(['Work', 'Personal', 'Shopping', 'Health']),
  body('dueDate').optional({ nullable: true }).isISO8601().toDate(),
], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return next(createError(400, errors.array()[0].msg));
  try {
    const { name, category, dueDate, completed } = req.body;
    const order = await Item.countDocuments({ user: req.userId });
    const item = new Item({
      name,
      category: category || 'Personal',
      dueDate: dueDate || null,
      completed: completed || false,
      user: req.userId,
      order
    });
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
});

// PUT /api/items/reorder (bulk update order)
router.put('/reorder', [
  body('items').isArray().withMessage('Items array required'),
  body('items.*._id').isMongoId(),
  body('items.*.order').isNumeric()
], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return next(createError(400, errors.array()[0].msg));
  try {
    const bulkOps = req.body.items.map(item => ({
      updateOne: {
        filter: { _id: item._id, user: req.userId },
        update: { order: item.order }
      }
    }));
    await Item.bulkWrite(bulkOps);
    res.json({ message: 'Reordered' });
  } catch (err) {
    next(err);
  }
});

// PUT /api/items/:id
router.put('/:id', async (req, res, next) => {
  try {
    const item = await Item.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!item) return next(createError(404, 'Item not found'));
    res.json(item);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/items/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const item = await Item.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!item) return next(createError(404, 'Item not found'));
    res.json({ message: 'Item deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;