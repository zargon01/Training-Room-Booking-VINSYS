// src/components/BookingDetailsPopup.jsx
import { X } from 'lucide-react';
import moment from 'moment';

export const BookingDetailsPopup = ({ bookings, onClose, selectedDate }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto animate-scaleIn">
        <div className="flex justify-between items-center border-b p-4">
          <div>
            <h3 className="text-lg font-semibold">Booking Details</h3>
            {selectedDate && (
              <p className="text-sm text-gray-500">
                {selectedDate.format('MMMM D, YYYY')}
              </p>
            )}
          </div>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-red-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 space-y-4">
          {bookings.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No bookings for this date</p>
          ) : (
            bookings.map((booking, index) => (
              <div key={index} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{booking.roomId?.name || 'Room'}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {booking.userId?.name || 'User'}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    booking.status === 'approved' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {booking.status}
                  </span>
                </div>
                
                <div className="mt-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Time:</span> {moment(booking.startTime).format('h:mm A')} - {moment(booking.endTime).format('h:mm A')}
                  </p>
                  {booking.purpose && (
                    <p className="text-sm mt-1">
                      <span className="font-medium">Purpose:</span> {booking.purpose}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};