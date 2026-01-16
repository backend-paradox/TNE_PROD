const express = require('express');
const cors = require('cors');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

const db = require('./shared/db');
const { errorHandler } = require('./shared/middleware');

const app = express();
const PORT = process.env.PORT || 3004;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'booking-service' });
});

app.post('/quotes', [
  body('name').trim().notEmpty(),
  body('email').isEmail().normalizeEmail(),
  body('phone').trim().notEmpty(),
  body('message').optional().trim(),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, phone, message } = req.body;

    const result = await db.query(
      `INSERT INTO quotes (name, email, phone, message, status) 
       VALUES ($1, $2, $3, $4, 'pending') 
       RETURNING *`,
      [name, email, phone, message]
    );


    res.status(201).json({
      message: 'Quote request submitted successfully',
      quote: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
});

app.get('/quotes', async (req, res, next) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;
    
    let query = 'SELECT * FROM quotes WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (status) {
      query += ` AND status = $${paramCount++}`;
      params.push(status);
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    const countResult = await db.query('SELECT COUNT(*) FROM quotes');

    res.json({
      quotes: result.rows,
      count: result.rows.length,
      total: parseInt(countResult.rows[0].count),
    });
  } catch (error) {
    next(error);
  }
});

app.get('/quotes/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'SELECT * FROM quotes WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Quote not found' });
    }

    res.json({ quote: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

app.patch('/quotes/:id/status', [
  body('status').isIn(['pending', 'contacted', 'converted', 'rejected']),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { status } = req.body;

    const result = await db.query(
      'UPDATE quotes SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Quote not found' });
    }

    res.json({
      message: 'Quote status updated successfully',
      quote: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
});

app.delete('/quotes/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'DELETE FROM quotes WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Quote not found' });
    }

    res.json({ message: 'Quote deleted successfully' });
  } catch (error) {
    next(error);
  }
});

app.post('/bookings', [
  body('user_id').optional().isUUID(),
  body('package_type').isIn(['destination', 'experience', 'service']),
  body('package_id').isUUID(),
  body('start_date').optional().isISO8601(),
  body('end_date').optional().isISO8601(),
  body('total_price').optional().isNumeric(),
  body('notes').optional().trim(),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { user_id, package_type, package_id, start_date, end_date, total_price, notes } = req.body;

    const result = await db.query(
      `INSERT INTO bookings (user_id, package_type, package_id, start_date, end_date, total_price, notes, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending') 
       RETURNING *`,
      [user_id, package_type, package_id, start_date, end_date, total_price, notes]
    );

    res.status(201).json({
      message: 'Booking created successfully',
      booking: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
});

app.get('/bookings', async (req, res, next) => {
  try {
    const { user_id, status, limit = 50, offset = 0 } = req.query;
    
    let query = 'SELECT * FROM bookings WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (user_id) {
      query += ` AND user_id = $${paramCount++}`;
      params.push(user_id);
    }

    if (status) {
      query += ` AND status = $${paramCount++}`;
      params.push(status);
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    res.json({
      bookings: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    next(error);
  }
});

app.get('/bookings/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'SELECT * FROM bookings WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json({ booking: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

app.patch('/bookings/:id/status', [
  body('status').isIn(['pending', 'confirmed', 'cancelled', 'completed']),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { status } = req.body;

    const result = await db.query(
      'UPDATE bookings SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json({
      message: 'Booking status updated successfully',
      booking: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
});

app.put('/bookings/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { start_date, end_date, total_price, notes } = req.body;

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (start_date !== undefined) {
      updates.push(`start_date = $${paramCount++}`);
      values.push(start_date);
    }
    if (end_date !== undefined) {
      updates.push(`end_date = $${paramCount++}`);
      values.push(end_date);
    }
    if (total_price !== undefined) {
      updates.push(`total_price = $${paramCount++}`);
      values.push(total_price);
    }
    if (notes !== undefined) {
      updates.push(`notes = $${paramCount++}`);
      values.push(notes);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);

    const result = await db.query(
      `UPDATE bookings SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $${paramCount} 
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json({
      message: 'Booking updated successfully',
      booking: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
});

app.delete('/bookings/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'DELETE FROM bookings WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    next(error);
  }
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Booking Service running on port ${PORT}`);
});
