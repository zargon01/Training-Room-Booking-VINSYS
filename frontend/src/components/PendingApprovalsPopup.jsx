import { X, Check, XCircle, Loader2 } from 'lucide-react';
import moment from 'moment';
import { useEffect, useState } from 'react';

export const PendingApprovalsPopup = ({ 
  pendingApprovals, 
  onClose, 
  onApprove, 
  onReject,
  loading = false,
  error = null 
}) => {
  const [processingId, setProcessingId] = useState(null);
  const [localApprovals, setLocalApprovals] = useState(pendingApprovals);

  // Keep local state in sync with props
  useEffect(() => {
    setLocalApprovals(pendingApprovals);
  }, [pendingApprovals]);

  const handleApprove = async (id) => {
    setProcessingId(id);
    try {
      await onApprove(id);
      setLocalApprovals(prev => prev.filter(a => a._id !== id));
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id) => {
    setProcessingId(id);
    try {
      await onReject(id);
      setLocalApprovals(prev => prev.filter(a => a._id !== id));
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto animate-scaleIn">
        <div className="flex justify-between items-center border-b p-4 sticky top-0 bg-white z-10">
          <h3 className="text-lg font-semibold">Pending Approvals</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-red-600 transition-colors"
            disabled={!!processingId}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 space-y-4">
          {error ? (
            <div className="text-center py-4 text-red-500">
              Failed to load approvals: {error.message || 'Unknown error'}
            </div>
          ) : loading && localApprovals.length === 0 ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : localApprovals.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No pending approvals</p>
          ) : (
            localApprovals.map((approval) => (
              <div 
                key={approval._id} 
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors relative"
              >
                {processingId === approval._id && (
                  <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                  </div>
                )}

                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">
                      {approval.roomId?.name || 'Unnamed Room'}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {approval.userId?.name || 'Unknown User'} ({approval.userId?.email || 'No email'})
                    </p>
                  </div>
                  <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">
                    Pending
                  </span>
                </div>
                
                <div className="mt-3 space-y-1">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">When:</span> {moment(approval.startTime).format('MMM D, h:mm A')} - {moment(approval.endTime).format('MMM D, h:mm A')}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Created:</span> {moment(approval.createdAt).format('MMM D, YYYY')}
                  </p>
                  {approval.purpose && (
                    <p className="text-sm">
                      <span className="font-medium">Purpose:</span> {approval.purpose}
                    </p>
                  )}
                </div>
                
                <div className="flex justify-end space-x-2 mt-3">
                  <button 
                    onClick={() => handleReject(approval._id)}
                    disabled={!!processingId}
                    className="flex items-center px-3 py-1.5 text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                  >
                    {processingId === approval._id ? (
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    ) : (
                      <XCircle className="w-4 h-4 mr-1" />
                    )}
                    Reject
                  </button>
                  <button 
                    onClick={() => handleApprove(approval._id)}
                    disabled={!!processingId}
                    className="flex items-center px-3 py-1.5 text-sm text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
                  >
                    {processingId === approval._id ? (
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4 mr-1" />
                    )}
                    Approve
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};