import Booking from '../models/booking.model.js';
import Room from '../models/room.model.js';
import User from '../models/user.model.js';
import moment from 'moment';

// GET /api/stats/admin
export const getAdminStats = async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const pendingApprovals = await Booking.countDocuments({ status: 'pending' });
    const totalRooms = await Room.countDocuments();
    const totalUsers = await User.countDocuments({ role: 'user' });

    const now = new Date();

    // Active approved bookings for utilization
    const activeBookings = await Booking.find({
      status: 'approved',
      startTime: { $lte: now },
      endTime: { $gte: now }
    }).select('roomId');

    const bookedRoomIds = new Set(activeBookings.map(b => b.roomId.toString()));
    const allRooms = await Room.find().select('_id');
    const availableRooms = allRooms.filter(room => !bookedRoomIds.has(room._id.toString())).length;

    // Booking status counts
    const statusCounts = await Booking.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const bookingStatusCount = { approved: 0, pending: 0, rejected: 0 };
    statusCounts.forEach(s => {
      bookingStatusCount[s._id] = s.count;
    });

    // Weekly user signups (last 7 days)
    const today = moment().endOf('day');
    const weekAgo = moment().startOf('day').subtract(6, 'days');

    const weeklySignupsAgg = await User.aggregate([
      {
        $match: {
          role: 'user',
          createdAt: { $gte: weekAgo.toDate(), $lte: today.toDate() }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const weeklySignupsMap = {};
    for (let i = 0; i < 7; i++) {
      const day = moment().startOf('day').subtract(6 - i, 'days').format('YYYY-MM-DD');
      weeklySignupsMap[day] = 0;
    }
    weeklySignupsAgg.forEach(day => {
      weeklySignupsMap[day._id] = day.count;
    });
    const weeklySignups = Object.values(weeklySignupsMap);

    // ✅ Today's bookings
    const startOfDay = moment().startOf('day').toDate();
    const endOfDay = moment().endOf('day').toDate();

    const todaysBookingsRaw = await Booking.find({
  status: 'approved',
  startTime: { $lte: endOfDay },
  endTime: { $gte: startOfDay }
})
      .populate('roomId', 'name')
      .populate('userId', 'name')
      .sort({ startTime: 1 });

    const todaysBookings = todaysBookingsRaw.map(b => ({
      time: `${moment(b.startTime).format('h:mm A')} - ${moment(b.endTime).format('h:mm A')}`,
      room: b.roomId?.name || 'Unknown Room',
      user: b.userId?.name || 'Unknown User'
    }));

    // ✅ Approved bookings for calendar
    const approvedBookings = await Booking.find({ status: 'approved' })
      .populate('roomId', 'name')
      .populate('userId', 'name email');

    // ✅ Static recent activity (can be replaced with actual audit logs later)
    const recentActivities = [
      'Approved booking for Room A by John',
      'Rejected booking for Room C by Jane',
      'Added new room: Conference Hall',
      'Updated profile info',
      'Created new admin account'
    ];

    // ✅ Response
    return res.status(200).json({
      success: true,
      data: {
        totalBookings,
        pendingApprovals,
        availableRooms,
        totalRooms,
        totalUsers,
        bookingStatusCount,
        weeklySignups,
        todaysBookings,
        recentActivities,
        bookings: approvedBookings, // used in admin calendar
      },
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching statistics.',
    });
  }
};
