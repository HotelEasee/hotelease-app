const { query } = require('../config/database');

// List hotels with pagination and optional search filters
exports.listHotels = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '10', 10), 1), 50);
    const offset = (page - 1) * limit;

    const { q, location, minPrice, maxPrice, minRating } = req.query;

    const conditions = [];
    const params = [];

    if (q) {
      params.push(`%${q}%`);
      conditions.push(`(name ILIKE $${params.length} OR description ILIKE $${params.length})`);
    }
    if (location) {
      params.push(`%${location}%`);
      conditions.push(`location ILIKE $${params.length}`);
    }
    if (minPrice) {
      params.push(Number(minPrice));
      conditions.push(`price_per_night >= $${params.length}`);
    }
    if (maxPrice) {
      params.push(Number(maxPrice));
      conditions.push(`price_per_night <= $${params.length}`);
    }
    if (minRating) {
      params.push(Number(minRating));
      conditions.push(`rating >= $${params.length}`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const totalResult = await query(`SELECT COUNT(*)::int AS count FROM hotels ${whereClause}`, params);
    const total = totalResult.rows[0].count;

    params.push(limit);
    params.push(offset);

    const hotelsResult = await query(
      `SELECT * FROM hotels ${whereClause} ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    res.json({ page, limit, total, items: hotelsResult.rows });
  } catch (err) {
    next(err);
  }
};

// Get single hotel
exports.getHotel = async (req, res, next) => {
  try {
    const id = req.params.id;
    const result = await query('SELECT * FROM hotels WHERE id = $1', [id]);
    if (result.rowCount === 0) return res.status(404).json({ message: 'Hotel not found' });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

// Create hotel
exports.createHotel = async (req, res, next) => {
  try {
    const {
      name,
      location,
      address,
      description,
      price_per_night,
      rating = 0,
      images = [],
      amenities = [],
      policies = []
    } = req.body;

    if (!name || !location || !price_per_night) {
      return res.status(400).json({ message: 'name, location and price_per_night are required' });
    }

    const insertResult = await query(
      `INSERT INTO hotels(name, location, address, description, price_per_night, rating, images, amenities, policies)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [
        name,
        location,
        address || null,
        description || null,
        Number(price_per_night),
        Number(rating) || 0,
        images,
        amenities,
        policies
      ]
    );

    res.status(201).json(insertResult.rows[0]);
  } catch (err) {
    next(err);
  }
};

// Update hotel
exports.updateHotel = async (req, res, next) => {
  try {
    const id = req.params.id;
    const existing = await query('SELECT * FROM hotels WHERE id = $1', [id]);
    if (existing.rowCount === 0) return res.status(404).json({ message: 'Hotel not found' });

    const current = existing.rows[0];
    const {
      name = current.name,
      location = current.location,
      address = current.address,
      description = current.description,
      price_per_night = current.price_per_night,
      rating = current.rating
    } = req.body;

    const updateResult = await query(
      `UPDATE hotels SET name=$1, location=$2, address=$3, description=$4, price_per_night=$5, rating=$6, updated_at=NOW()
       WHERE id=$7 RETURNING *`,
      [
        name,
        location,
        address,
        description,
        Number(price_per_night),
        Number(rating),
        id
      ]
    );

    res.json(updateResult.rows[0]);
  } catch (err) {
    next(err);
  }
};

// Delete hotel
exports.deleteHotel = async (req, res, next) => {
  try {
    const id = req.params.id;
    const result = await query('DELETE FROM hotels WHERE id = $1', [id]);
    if (result.rowCount === 0) return res.status(404).json({ message: 'Hotel not found' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};




