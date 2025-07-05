import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '@utils/axiosInstance';
import { useAuthStore } from '@store/auth';
import moment from 'moment';
import { X, Loader2 } from 'lucide-react';
import { BookingDetailsPopup } from '../../components/BookingDetailsPopup';
import { PendingApprovalsPopup } from '../../components/PendingApprovalsPopup';
import { 
  Calendar, Users, Clock, Home, 
  Bell, Search, Filter, Eye, 
  BarChart3, Plus 
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingApprovals: 0,
    availableRooms: 0,
    totalRooms: 0,
    totalUsers: 0,
    todaysBookings: [],
    bookings: [],
  });

  const [currentMonth, setCurrentMonth] = useState(moment());
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showBookingPopup, setShowBookingPopup] = useState(false);
  const [dateBookings, setDateBookings] = useState([]);
  const [showApprovalsPopup, setShowApprovalsPopup] = useState(false);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [approvalsLoading, setApprovalsLoading] = useState(false);
  const [approvalsError, setApprovalsError] = useState(null);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  // Fetch pending approvals when popup opens
  useEffect(() => {
    const fetchPendingApprovals = async () => {
      setApprovalsLoading(true);
      setApprovalsError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/bookings/pending', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Handle both possible response structures
        const approvals = res.data?.data || res.data || [];
        setPendingApprovals(approvals);
        
      } catch (err) {
        console.error('Error fetching pending approvals:', err);
        setApprovalsError(err);
      } finally {
        setApprovalsLoading(false);
      }
    };

    if (showApprovalsPopup) {
      fetchPendingApprovals();
    }
  }, [showApprovalsPopup]);

  // Fetch initial stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No auth token found');

        const res = await axios.get('/stats/admin', {
          headers: { Authorization: `Bearer ${token}` }
        });

        setStats(prev => ({
          ...prev,
          ...res.data.data,
          bookings: res.data.data.bookings || []
        }));
      } catch (err) {
        console.error('Error fetching stats:', err);
        if (err.response?.status === 401 || err.message === 'No auth token found') {
          logout();
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, [logout, navigate]);

  const utilization = stats.totalRooms > 0
    ? Math.round(((stats.totalRooms - stats.availableRooms) / stats.totalRooms) * 100)
    : 0;

  // Calendar logic
  const daysInMonth = currentMonth.daysInMonth();
  const startOfMonth = currentMonth.clone().startOf('month').day();
  const monthLabel = currentMonth.format('MMMM YYYY');
  const handlePrevMonth = () => setCurrentMonth(prev => prev.clone().subtract(1, 'month'));
  const handleNextMonth = () => setCurrentMonth(prev => prev.clone().add(1, 'month'));

  const handleDateClick = (day) => {
    const clickedDate = currentMonth.clone().date(day);
    
    const bookingsForDate = stats.bookings.filter(b => {
      const bookingStart = moment(b.startTime);
      const bookingEnd = moment(b.endTime);
      return clickedDate.isBetween(bookingStart, bookingEnd, 'day', '[]') || 
             clickedDate.isSame(bookingStart, 'day') || 
             clickedDate.isSame(bookingEnd, 'day');
    });
    
    setSelectedDate(clickedDate);
    setDateBookings(bookingsForDate);
    setShowBookingPopup(true);
  };

  const handleApprove = async (bookingId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`/bookings/${bookingId}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state immediately
      setPendingApprovals(prev => prev.filter(a => a._id !== bookingId));
      setStats(prev => ({
        ...prev,
        pendingApprovals: prev.pendingApprovals - 1
      }));

      // Refresh stats
      const statsRes = await axios.get('/stats/admin', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(prev => ({
        ...prev,
        ...statsRes.data.data,
        bookings: statsRes.data.data.bookings || []
      }));
    } catch (err) {
      console.error('Error approving booking:', err);
      setApprovalsError(err);
    }
  };

  const handleReject = async (bookingId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`/bookings/${bookingId}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state immediately
      setPendingApprovals(prev => prev.filter(a => a._id !== bookingId));
      setStats(prev => ({
        ...prev,
        pendingApprovals: prev.pendingApprovals - 1
      }));

      // Refresh stats
      const statsRes = await axios.get('/stats/admin', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(prev => ({
        ...prev,
        ...statsRes.data.data,
        bookings: statsRes.data.data.bookings || []
      }));
    } catch (err) {
      console.error('Error rejecting booking:', err);
      setApprovalsError(err);
    }
  };

  const renderCalendarDays = () => {
    const days = [];
    const approvedBookings = stats.bookings.filter(b => b.status === 'approved');

    for (let i = 0; i < startOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-8" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = currentMonth.clone().date(day);
      const bookingsOnDay = approvedBookings.filter(b => {
        const bookingStart = moment(b.startTime);
        const bookingEnd = moment(b.endTime);
        return date.isBetween(bookingStart, bookingEnd, 'day', '[]') || 
               date.isSame(bookingStart, 'day') || 
               date.isSame(bookingEnd, 'day');
      });

      const isToday = moment().isSame(date, 'day');
      const statusClass = bookingsOnDay.length 
        ? 'bg-blue-50 text-blue-600 border-blue-200' 
        : 'hover:bg-gray-50';
      const todayClass = isToday ? 'bg-gradient-to-br from-red-500 to-orange-500 text-white font-bold' : '';

      days.push(
        <div 
          key={day} 
          className={`h-8 flex items-center justify-center text-sm border rounded cursor-pointer transition-all ${statusClass} ${todayClass}`}
          onClick={() => handleDateClick(day)}
        >
          {day}
          {bookingsOnDay.length > 0 && (
            <div className="absolute bottom-1 w-1 h-1 rounded-full bg-blue-500"></div>
          )}
        </div>
      );
    }

    return days;
  };

  // Reusable Components
  const StatCard = ({ title, value, icon: Icon, color = "text-red-600 bg-red-50", trend }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`}>
            {Icon && <Icon className="w-5 h-5" />}
          </div>
          <div>
            <p className="text-xs text-gray-600 font-medium">{title}</p>
            <p className="text-lg font-bold text-gray-800">
              {loading ? '...' : value}
            </p>
          </div>
        </div>
        {trend && (
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-50 text-green-600">
            +{trend}%
          </span>
        )}
      </div>
    </div>
  );

  const QuickAction = ({ title, icon: Icon, to, color = "text-red-600 hover:bg-red-50" }) => (
    <Link
      to={to}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg border border-gray-200 ${color} transition-all text-sm font-medium hover:shadow-sm`}
    >
      {Icon && <Icon className="w-4 h-4" />}
      <span>{title}</span>
    </Link>
  );

  const BookingItem = ({ booking }) => (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gradient-to-br from-red-400 to-orange-500 rounded text-white flex items-center justify-center text-xs font-bold">
          {booking.roomId?.name?.charAt(0) || 'R'}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-800">{booking.roomId?.name || 'Room'}</p>
          <p className="text-xs text-gray-600">
            {booking.userId?.name || 'User'} • {moment(booking.startTime).format('h:mm A')} - {moment(booking.endTime).format('h:mm A')}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          booking.status === 'approved' 
            ? 'bg-green-100 text-green-700' 
            : booking.status === 'pending'
            ? 'bg-yellow-100 text-yellow-700'
            : 'bg-red-100 text-red-700'
        }`}>
          {booking.status}
        </span>
        <button className="p-1 text-gray-400 hover:text-red-600">
          <Eye className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard 
            title="Total Bookings" 
            value={stats.totalBookings} 
            icon={Calendar} 
            color="text-red-600 bg-red-50"
          />
          <StatCard 
            title="Available Rooms" 
            value={`${stats.availableRooms}/${stats.totalRooms}`} 
            icon={Home} 
            color="text-blue-600 bg-blue-50"
          />
          <StatCard 
            title="Registered Users" 
            value={stats.totalUsers} 
            icon={Users} 
            color="text-green-600 bg-green-50"
          />
          <StatCard 
            title="Pending Approvals" 
            value={stats.pendingApprovals} 
            icon={Clock} 
            color="text-yellow-600 bg-yellow-50"
          />
          <StatCard 
            title="Room Utilization" 
            value={`${utilization}%`} 
            icon={BarChart3} 
            color="text-purple-600 bg-purple-50"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <QuickAction title="Manage Bookings" icon={Calendar} to="/bookings" />
            <QuickAction title="Manage Rooms" icon={Home} to="/rooms" />
            <QuickAction title="Manage Users" icon={Users} to="http://52.66.178.111:5000/admin/users" />
            <QuickAction title="Approved Bookings" icon={Eye} to="/approvals" />
            <button
              onClick={() => setShowApprovalsPopup(true)}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-gray-200 text-red-600 hover:bg-red-50 transition-all text-sm font-medium hover:shadow-sm"
              disabled={approvalsLoading}
            >
              {approvalsLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
              <span>Pending Approvals ({stats.pendingApprovals})</span>
            </button>
            <QuickAction title="Add Room" icon={Plus} to="/rooms" />
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Bookings */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Today's Bookings</h2>
              <Filter className="w-5 h-5 text-gray-400 cursor-pointer hover:text-red-600" />
            </div>
            <div className="space-y-3">
              {loading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : stats.todaysBookings?.length > 0 ? (
                stats.todaysBookings.map((booking, index) => (
                  <BookingItem key={index} booking={booking} />
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No bookings for today</p>
              )}
            </div>
          </div>

          {/* Calendar */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Booking Calendar</h2>
              <div className="flex space-x-2">
                <button 
                  onClick={handlePrevMonth}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  disabled={loading}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button 
                  onClick={handleNextMonth}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  disabled={loading}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
            <h3 className="text-md font-medium text-center mb-3">{monthLabel}</h3>
            <div className="grid grid-cols-7 gap-1 mb-1">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-xs text-gray-500 font-medium py-1">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1 auto-rows-fr">
              {renderCalendarDays()}
            </div>
            <div className="flex justify-center space-x-4 mt-4">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
                <span className="text-xs text-gray-600">Booked</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-gray-200 mr-1"></div>
                <span className="text-xs text-gray-600">Available</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Popups */}
      {showApprovalsPopup && (
        <PendingApprovalsPopup 
          pendingApprovals={pendingApprovals}
          onClose={() => setShowApprovalsPopup(false)}
          onApprove={handleApprove}
          onReject={handleReject}
          loading={approvalsLoading}
          error={approvalsError}
        />
      )}
      
      {showBookingPopup && (
        <BookingDetailsPopup 
          bookings={dateBookings} 
          onClose={() => setShowBookingPopup(false)}
          selectedDate={selectedDate}
        />
      )}
    </div>
  );
};

export default AdminDashboard;