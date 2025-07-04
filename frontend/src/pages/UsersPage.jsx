import { useEffect, useState } from 'react';
import { useUserStore } from '../store/user';
import { User, Edit, Trash2, Plus, Shield, User as UserIcon, X } from 'lucide-react';

export default function UsersPage() {
  const { users, getUsers, createUser, updateUser, deleteUser, loading, error } = useUserStore();
  const [showUserModal, setShowUserModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isEditMode) {
      await updateUser(editingUserId, formData);
    } else {
      await createUser(formData);
    }
    resetForm();
    getUsers();
  };

  const handleEdit = (user) => {
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role || 'user',
    });
    setIsEditMode(true);
    setEditingUserId(user._id);
    setShowUserModal(true);
  };

  const handleDelete = async (id, name, email) => {
    if (name === 'root' && email === 'root@vinsys.com') return;
    const confirm = window.confirm(`Are you sure you want to delete user "${name}"?`);
    if (confirm) {
      await deleteUser(id);
      getUsers();
    }
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', password: '', role: 'user' });
    setIsEditMode(false);
    setEditingUserId(null);
    setShowUserModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <User className="w-5 h-5 mr-2" />
            Users Management
          </h1>
          <button
            onClick={() => setShowUserModal(true)}
            className="flex items-center px-4 py-2 bg-gradient-to-br from-red-500 to-orange-500 text-white rounded-md shadow-sm hover:opacity-90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            Error: {error}
          </div>
        )}

        {/* Users List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-5 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">All Users</h2>
            <p className="text-sm text-gray-600">{users.length} users registered</p>
          </div>
          
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              Loading users...
            </div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No users found. Click "Add User" to create your first user.
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {users.map((user) => (
                <div key={user._id} className="p-5 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="mb-4 md:mb-0">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3 ${
                          user.role === 'admin' ? 'bg-gradient-to-br from-red-500 to-orange-500' : 'bg-blue-500'
                        }`}>
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-800">{user.name}</h3>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        user.role === 'admin' 
                          ? 'bg-red-100 text-red-800 flex items-center' 
                          : 'bg-blue-100 text-blue-800 flex items-center'
                      }`}>
                        {user.role === 'admin' ? (
                          <>
                            <Shield className="w-3 h-3 mr-1" />
                            Admin
                          </>
                        ) : (
                          <>
                            <UserIcon className="w-3 h-3 mr-1" />
                            User
                          </>
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(user)}
                          disabled={user.name === 'root' && user.email === 'root@vinsys.com'}
                          title={user.name === 'root' && user.email === 'root@vinsys.com' ? 'Cannot edit root user' : ''}
                          className={`p-2 rounded-full transition-colors ${
                            user.name === 'root' && user.email === 'root@vinsys.com'
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
                          }`}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user._id, user.name, user.email)}
                          disabled={user.name === 'root' && user.email === 'root@vinsys.com'}
                          title={user.name === 'root' && user.email === 'root@vinsys.com' ? 'Cannot delete root user' : ''}
                          className={`p-2 rounded-full transition-colors ${
                            user.name === 'root' && user.email === 'root@vinsys.com'
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                          }`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User Modal */}
        {showUserModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold">
                  {isEditMode ? 'Update User' : 'Create New User'}
                </h3>
                <button 
                  onClick={resetForm}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Full Name"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email Address"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {isEditMode ? 'New Password (optional)' : 'Password'}
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder={isEditMode ? 'Leave blank to keep current' : 'Password'}
                    required={!isEditMode}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`px-4 py-2 rounded-md shadow-sm text-white font-medium flex items-center ${
                      loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-br from-red-500 to-orange-500 hover:opacity-90'
                    }`}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {isEditMode ? 'Updating...' : 'Creating...'}
                      </>
                    ) : isEditMode ? 'Update User' : 'Create User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}