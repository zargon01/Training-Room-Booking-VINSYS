import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth';
import axios from '../../utils/axiosInstance';
import moment from 'moment';
import { 
  Calendar, Clock, Home, 
  Filter, Eye, ChevronLeft, ChevronRight, Check, X, Plus
} from 'lucide-react';
import CreateBookingModal from '../../components/CreateBookingModal';

export default function UserDashboard() {
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({ active: 0, upcoming: 0, totalApproved: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentMonth, setCurrentMonth] = useState(moment());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showBookingPopup, setShowBookingPopup] = useState(false);
  const [dateBookings, setDateBookings] = useState([]);
  const [showBookingForm, setShowBookingForm] = useState(false);

  const fetchUserBookings = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/bookings');
      const now = new Date();
const userBookings = res.data.data.filter(b => {
  const bookingUserId = typeof b.userId === 'string' ? b.userId : b.userId._id;
  return bookingUserId === user._id;
});

      const active = userBookings.filter(b =>
        b.status === 'approved' &&
        new Date(b.startTime) <= now &&
        new Date(b.endTime) >= now
      ).length;

      const upcoming = userBookings.filter(b => b.status === 'approved' && new Date(b.startTime) > now).length;
      const totalApproved = userBookings.filter(b => b.status === 'approved').length;

      setStats({ active, upcoming, totalApproved });
      setBookings(userBookings.sort((a, b) => new Date(b.startTime) - new Date(a.startTime)));
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        logout();
        navigate('/login');
      } else {
        setError('Failed to load bookings.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user._id]);

  const daysInMonth = currentMonth.daysInMonth();
  const startOfMonth = currentMonth.clone().startOf('month').day();
  const monthLabel = currentMonth.format('MMMM YYYY');
  const handlePrevMonth = () => setCurrentMonth(prev => prev.clone().subtract(1, 'month'));
  const handleNextMonth = () => setCurrentMonth(prev => prev.clone().add(1, 'month'));

  const handleDateClick = (day) => {
    const clickedDate = currentMonth.clone().date(day);
    const bookingsForDate = bookings.filter(b => {
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

  const renderCalendarDays = () => {
    const days = [];
    for (let i = 0; i < startOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-8" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = currentMonth.clone().date(day);
      const bookingsOnDay = bookings.filter(b => {
        const bookingStart = moment(b.startTime);
        const bookingEnd = moment(b.endTime);
        return date.isBetween(bookingStart, bookingEnd, 'day', '[]') || 
               date.isSame(bookingStart, 'day') || 
               date.isSame(bookingEnd, 'day');
      });

      const isToday = moment().isSame(date, 'day');
      let statusClass = 'hover:bg-gray-50';
      let dotColor = '';

      if (bookingsOnDay.length > 0) {
        const statuses = bookingsOnDay.map(b => b.status);
        if (statuses.includes('approved')) {
          statusClass = 'bg-blue-50 text-blue-600 border-blue-200';
          dotColor = 'bg-blue-500';
        } else if (statuses.includes('pending')) {
          statusClass = 'bg-yellow-50 text-yellow-600 border-yellow-200';
          dotColor = 'bg-yellow-500';
        } else if (statuses.includes('rejected')) {
          statusClass = 'bg-red-50 text-red-600 border-red-200';
          dotColor = 'bg-red-500';
        }
      }

      const todayClass = isToday ? 'bg-gradient-to-br from-red-500 to-orange-500 text-white font-bold' : '';

      days.push(
        <div 
          key={day} 
          className={`h-8 flex items-center justify-center text-sm border rounded cursor-pointer transition-all relative ${statusClass} ${todayClass}`}
          onClick={() => handleDateClick(day)}
        >
          {day}
          {dotColor && (
            <div className={`absolute bottom-1 w-1 h-1 rounded-full ${dotColor}`}></div>
          )}
        </div>
      );
    }
    return days;
  };

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

  const QuickAction = ({ title, icon: Icon, to, color = "text-red-600 hover:bg-red-50", onClick }) => (
    <a
      href={to}
      onClick={onClick}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg border border-gray-200 ${color} transition-all text-sm font-medium hover:shadow-sm`}
    >
      {Icon && <Icon className="w-4 h-4" />}
      <span>{title}</span>
    </a>
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
            {moment(booking.startTime).format('MMM D')} • {moment(booking.startTime).format('h:mm A')} - {moment(booking.endTime).format('h:mm A')}
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
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Welcome, {user?.name || 'User'} 👋</h1>
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Bookings" value={stats.active} icon={Clock} color="text-green-600 bg-green-50" />
        <StatCard title="Upcoming Bookings" value={stats.upcoming} icon={Calendar} color="text-blue-600 bg-blue-50" />
        <StatCard title="Approved Bookings" value={stats.totalApproved} icon={Check} color="text-purple-600 bg-purple-50" />
        <StatCard title="Profile" value={user?.email} icon={Home} color="text-red-600 bg-red-50" />
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <QuickAction title="New Booking" icon={Plus} to="#" onClick={(e) => { e.preventDefault(); setShowBookingForm(true); }} />
          <QuickAction title="My Bookings" icon={Calendar} to="/bookings" />
          <QuickAction title="Room List" icon={Home} to="/rooms" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Recent Bookings</h2>
          
          </div>
          <div className="space-y-3">
            {loading ? (
              <p className="text-gray-500 text-center py-4">Loading bookings...</p>
            ) : bookings.length > 0 ? (
              bookings.slice(0, 5).map((booking) => (
                <BookingItem key={booking._id} booking={booking} />
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No bookings yet</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Booking Calendar</h2>
            <div className="flex space-x-2">
              <button onClick={handlePrevMonth} className="p-1 text-gray-400 hover:text-red-600">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={handleNextMonth} className="p-1 text-gray-400 hover:text-red-600">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
          <h3 className="text-md font-medium text-center mb-3">{monthLabel}</h3>
          <div className="grid grid-cols-7 gap-1 mb-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs text-gray-500 font-medium py-1">{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 auto-rows-fr">
            {renderCalendarDays()}
          </div>
          <div className="flex justify-center space-x-4 mt-4 text-xs text-gray-600">
            <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-blue-500 mr-1" /> Approved</div>
            <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-yellow-500 mr-1" /> Pending</div>
            <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-red-500 mr-1" /> Rejected</div>
          </div>
        </div>
      </div>

      {showBookingPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Bookings for {selectedDate?.format('MMMM D, YYYY')}
              </h3>
              <button onClick={() => setShowBookingPopup(false)} className="text-gray-400 hover:text-red-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            {dateBookings.length > 0 ? (
              <div className="space-y-3">
                {dateBookings.map(booking => (
                  <div key={booking._id} className="p-3 border border-gray-200 rounded-lg">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium text-gray-800">{booking.roomId?.name || 'Room'}</p>
                        <p className="text-sm text-gray-600">
                          {moment(booking.startTime).format('h:mm A')} - {moment(booking.endTime).format('h:mm A')}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        booking.status === 'approved' 
                          ? 'bg-green-100 text-green-700' 
                          : booking.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Purpose: {booking.purpose || 'Not specified'}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No bookings for this date</p>
            )}
          </div>
        </div>
      )}

      {showBookingForm && (
        <CreateBookingModal 
          onClose={() => setShowBookingForm(false)} 
          onSuccess={fetchUserBookings} 
        />
      )}
    </div>
  );
}
