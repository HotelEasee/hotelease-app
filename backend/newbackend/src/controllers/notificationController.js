const { query } = require('../config/database');

// Helper function to create notification
exports.createNotification = async (userId, title, message, type = 'info', actionUrl = null) => {
  try {
    const result = await query(
      `INSERT INTO notifications (user_id, title, message, is_read, created_at)
       VALUES ($1, $2, $3, false, NOW())
       RETURNING *`,
      [userId, title, message]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Create notification error:', error);
    return null;
  }
};

// @desc    Get user notifications
// @route   GET /api/users/notifications
// @access  Private
exports.getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const unreadOnly = req.query.unreadOnly === 'true';
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '20', 10), 1), 50);
    const offset = (page - 1) * limit;

    // Build where clause
    let whereClause = 'WHERE user_id = $1';
    const params = [userId];
    let paramIndex = 2;

    if (unreadOnly) {
      whereClause += ` AND is_read = false`;
    }

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*)::int AS count FROM notifications ${whereClause}`,
      params
    );
    const total = countResult.rows[0].count;

    // Get unread count
    const unreadCountResult = await query(
      'SELECT COUNT(*)::int AS count FROM notifications WHERE user_id = $1 AND is_read = false',
      [userId]
    );
    const unreadCount = unreadCountResult.rows[0].count;

    params.push(limit, offset);

    // Get notifications
    const notificationsResult = await query(
      `SELECT * FROM notifications 
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    res.status(200).json({
      success: true,
      data: {
        notifications: notificationsResult.rows,
        unreadCount,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    next(error);
  }
};

// @desc    Mark notification as read
// @route   PUT /api/users/notifications/:id/read
// @access  Private
exports.markNotificationRead = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const notificationId = req.params.id;

    // Check if notification belongs to user
    const notificationResult = await query(
      'SELECT notification_id FROM notifications WHERE notification_id = $1 AND user_id = $2',
      [notificationId, userId]
    );

    if (notificationResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Mark as read
    const result = await query(
      `UPDATE notifications 
       SET is_read = true, updated_at = NOW()
       WHERE notification_id = $1 AND user_id = $2
       RETURNING *`,
      [notificationId, userId]
    );

    res.status(200).json({
      success: true,
      data: {
        notification: result.rows[0]
      },
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Mark notification read error:', error);
    next(error);
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/users/notifications/read-all
// @access  Private
exports.markAllRead = async (req, res, next) => {
  try {
    const userId = req.user.user_id;

    await query(
      `UPDATE notifications 
       SET is_read = true, updated_at = NOW()
       WHERE user_id = $1 AND is_read = false`,
      [userId]
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    next(error);
  }
};

// @desc    Delete notification
// @route   DELETE /api/users/notifications/:id
// @access  Private
exports.deleteNotification = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const notificationId = req.params.id;

    const result = await query(
      'DELETE FROM notifications WHERE notification_id = $1 AND user_id = $2',
      [notificationId, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    next(error);
  }
};

// @desc    Get unread count
// @route   GET /api/users/notifications/unread-count
// @access  Private
exports.getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user.user_id;

    const result = await query(
      'SELECT COUNT(*)::int AS count FROM notifications WHERE user_id = $1 AND is_read = false',
      [userId]
    );

    res.status(200).json({
      success: true,
      data: {
        unreadCount: result.rows[0].count
      }
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    next(error);
  }
};

