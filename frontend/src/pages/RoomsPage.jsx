import { useEffect, useState } from 'react';
import { useRoomStore } from '../store/room';
import { useAuthStore } from '../store/auth';
import { Home, Edit, Trash2, Plus, X } from 'lucide-react';

export default function RoomsPage() {
  const { rooms, getRooms, createRoom, updateRoom, deleteRoom, loading, error } = useRoomStore();
  const { user } = useAuthStore();

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    capacity: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    getRooms();
  }, [getRooms]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await updateRoom(editingId, formData);
    } else {
      await createRoom(formData);
    }
    closeModal();
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEdit = (room) => {
    setEditingId(room._id);
    setFormData({
      name: room.name,
      location: room.location,
      capacity: room.capacity
    });
    openModal();
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ name: '', location: '', capacity: '' });
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <Home className="w-5 h-5 mr-2" />
            Rooms Management
          </h1>
          {user?.role === 'admin' && (
            <button
              onClick={openModal}
              className="h-10 px-4 bg-gradient-to-br from-red-500 to-orange-500 text-white font-medium rounded-md shadow-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Room
            </button>
          )}
        </div>

        {/* Rooms List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-5 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">All Rooms</h2>
            <p className="text-sm text-gray-600">{rooms.length} rooms available</p>
          </div>
          
          <div className="divide-y divide-gray-200">
            {rooms.length > 0 ? (
              rooms.map((room) => (
                <div key={room._id} className="p-5 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="mb-4 md:mb-0">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-orange-500 rounded text-white flex items-center justify-center text-sm font-bold mr-3">
                          {room.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-800">{room.name}</h3>
                          <p className="text-sm text-gray-600">{room.location}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                        Capacity: {room.capacity}
                      </div>
                      
                      {/* Admin-only Action Buttons */}
                      {user?.role === 'admin' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(room)}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteRoom(room._id)}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                No rooms found. {user?.role === 'admin' && (
                  <button 
                    onClick={openModal}
                    className="text-red-500 hover:underline focus:outline-none"
                  >
                    Add your first room
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal for Add/Edit Room */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="flex justify-between items-center border-b border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-800">
                {editingId ? 'Edit Room' : 'Add New Room'}
              </h3>
              <button 
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Conference Room A"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Building 2, Floor 3"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  placeholder="10"
                  required
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-br from-red-500 to-orange-500 text-white font-medium rounded-md shadow-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 flex items-center"
                >
                  {editingId ? (
                    <>
                      <Edit className="w-4 h-4 mr-2" />
                      Update
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Room
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}