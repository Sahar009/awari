'use client';

import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, Flag, MessageCircle, Edit, Trash2, Plus } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  createReview,
  getReviews,
  getReviewById,
  updateReview,
  deleteReview,
  addOwnerResponse,
  markReviewHelpful,
  reportReview,
  getReviewStats,
  getPropertyRatingSummary,
  getUserReviewHistory,
  clearError,
  selectReviews,
  selectCurrentReview,
  selectReviewStats,
  selectPropertySummary,
  selectUserReviews,
  selectReviewsPagination,
  selectUserReviewsPagination,
  selectReviewsLoading,
  selectCreatingReview,
  selectUpdatingReview,
  selectDeletingReview,
  selectMarkingHelpful,
  selectReportingReview,
  selectAddingResponse,
  selectStatsLoading,
  selectSummaryLoading,
  selectUserReviewsLoading,
  selectReviewsError,
  selectCreateReviewError,
  selectUpdateReviewError,
  selectDeleteReviewError,
  selectHelpfulError,
  selectReportError,
  selectResponseError,
  selectStatsError,
  selectSummaryError,
  selectUserReviewsError,
  type Review,
  type CreateReviewRequest,
  type UpdateReviewRequest,
  type ReviewFilters,
} from '@/store/slices/reviewsSlice';
import { selectUser } from '@/store/slices/authSlice';

const ReviewsExample: React.FC = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  
  // State selectors
  const reviews = useAppSelector(selectReviews);
  const currentReview = useAppSelector(selectCurrentReview);
  const stats = useAppSelector(selectReviewStats);
  const propertySummary = useAppSelector(selectPropertySummary);
  const userReviews = useAppSelector(selectUserReviews);
  const pagination = useAppSelector(selectReviewsPagination);
  const userReviewsPagination = useAppSelector(selectUserReviewsPagination);
  
  // Loading selectors
  const loading = useAppSelector(selectReviewsLoading);
  const creating = useAppSelector(selectCreatingReview);
  const updating = useAppSelector(selectUpdatingReview);
  const deleting = useAppSelector(selectDeletingReview);
  const markingHelpful = useAppSelector(selectMarkingHelpful);
  const reporting = useAppSelector(selectReportingReview);
  const addingResponse = useAppSelector(selectAddingResponse);
  const statsLoading = useAppSelector(selectStatsLoading);
  const summaryLoading = useAppSelector(selectSummaryLoading);
  const userReviewsLoading = useAppSelector(selectUserReviewsLoading);
  
  // Error selectors
  const error = useAppSelector(selectReviewsError);
  const createError = useAppSelector(selectCreateReviewError);
  const updateError = useAppSelector(selectUpdateReviewError);
  const deleteError = useAppSelector(selectDeleteReviewError);
  const helpfulError = useAppSelector(selectHelpfulError);
  const reportError = useAppSelector(selectReportError);
  const responseError = useAppSelector(selectResponseError);
  const statsError = useAppSelector(selectStatsError);
  const summaryError = useAppSelector(selectSummaryError);
  const userReviewsError = useAppSelector(selectUserReviewsError);

  // Local state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [respondingToReview, setRespondingToReview] = useState<Review | null>(null);
  const [reportingReview, setReportingReview] = useState<Review | null>(null);
  
  // Form data
  const [createFormData, setCreateFormData] = useState<CreateReviewRequest>({
    propertyId: '',
    reviewType: 'property',
    rating: 5,
    title: '',
    content: '',
    cleanliness: 5,
    communication: 5,
    checkIn: 5,
    accuracy: 5,
    location: 5,
    value: 5,
  });
  
  const [updateFormData, setUpdateFormData] = useState<UpdateReviewRequest>({
    rating: 5,
    title: '',
    content: '',
    cleanliness: 5,
    communication: 5,
    checkIn: 5,
    accuracy: 5,
    location: 5,
    value: 5,
  });
  
  const [responseText, setResponseText] = useState('');
  const [reportData, setReportData] = useState({ reason: '', description: '' });
  
  // Filters
  const [filters, setFilters] = useState<ReviewFilters>({
    page: 1,
    limit: 10,
    reviewType: 'property',
    status: 'approved',
  });

  // Load initial data
  useEffect(() => {
    dispatch(getReviews(filters));
    dispatch(getReviewStats(filters));
    if (user?.id) {
      dispatch(getUserReviewHistory({ userId: user.id }));
    }
  }, [dispatch, user?.id, filters]);

  // Handle form submissions
  const handleCreateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    
    await dispatch(createReview(createFormData));
    setShowCreateForm(false);
    setCreateFormData({
      propertyId: '',
      reviewType: 'property',
      rating: 5,
      title: '',
      content: '',
      cleanliness: 5,
      communication: 5,
      checkIn: 5,
      accuracy: 5,
      location: 5,
      value: 5,
    });
    dispatch(getReviews(filters));
  };

  const handleUpdateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReview?.id) return;
    
    await dispatch(updateReview({ reviewId: editingReview.id, updateData: updateFormData }));
    setShowUpdateForm(false);
    setEditingReview(null);
    dispatch(getReviews(filters));
  };

  const handleAddResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!respondingToReview?.id) return;
    
    await dispatch(addOwnerResponse({ reviewId: respondingToReview.id, response: responseText }));
    setShowResponseForm(false);
    setRespondingToReview(null);
    setResponseText('');
    dispatch(getReviews(filters));
  };

  const handleReportReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingReview?.id) return;
    
    await dispatch(reportReview({ reviewId: reportingReview.id, reportData }));
    setShowReportForm(false);
    setReportingReview(null);
    setReportData({ reason: '', description: '' });
  };

  const handleMarkHelpful = (reviewId: string) => {
    dispatch(markReviewHelpful(reviewId));
  };

  const handleDeleteReview = (reviewId: string) => {
    if (confirm('Are you sure you want to delete this review?')) {
      dispatch(deleteReview(reviewId));
    }
  };

  const handleGetPropertySummary = (propertyId: string) => {
    dispatch(getPropertyRatingSummary(propertyId));
  };

  // Clear errors
  useEffect(() => {
    if (error || createError || updateError || deleteError || helpfulError || reportError || responseError || statsError || summaryError || userReviewsError) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, createError, updateError, deleteError, helpfulError, reportError, responseError, statsError, summaryError, userReviewsError, dispatch]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const renderReviewCard = (review: Review) => (
    <div key={review.id} className="border rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex">{renderStars(review.rating)}</div>
            <span className="text-sm text-gray-600">{review.rating}/5</span>
            {review.title && <h3 className="font-medium">{review.title}</h3>}
          </div>
          <p className="text-gray-700 mb-2">{review.content}</p>
          <div className="text-sm text-gray-500">
            By {review.reviewer?.firstName} {review.reviewer?.lastName} • {new Date(review.createdAt).toLocaleDateString()}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleMarkHelpful(review.id)}
            disabled={markingHelpful}
            className="flex items-center gap-1 px-2 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200 transition-colors"
          >
            <ThumbsUp className="h-3 w-3" />
            {review.helpfulCount}
          </button>
          <button
            onClick={() => {
              setReportingReview(review);
              setShowReportForm(true);
            }}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
            title="Report"
          >
            <Flag className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {review.ownerResponse && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
          <div className="flex items-center gap-2 mb-1">
            <MessageCircle className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-blue-800">Owner Response</span>
          </div>
          <p className="text-blue-700">{review.ownerResponse}</p>
          <div className="text-xs text-blue-600 mt-1">
            {new Date(review.ownerResponseAt || '').toLocaleDateString()}
          </div>
        </div>
      )}
      
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span>Status: {review.status}</span>
        <span>Type: {review.reviewType}</span>
        {review.isVerified && <span className="text-green-600">✓ Verified</span>}
      </div>
      
      <div className="flex items-center gap-2">
        {user?.id === review.reviewerId && (
          <>
            <button
              onClick={() => {
                setEditingReview(review);
                setUpdateFormData({
                  rating: review.rating,
                  title: review.title || '',
                  content: review.content,
                  cleanliness: review.cleanliness || 5,
                  communication: review.communication || 5,
                  checkIn: review.checkIn || 5,
                  accuracy: review.accuracy || 5,
                  location: review.location || 5,
                  value: review.value || 5,
                });
                setShowUpdateForm(true);
              }}
              className="flex items-center gap-1 px-2 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
            >
              <Edit className="h-3 w-3" />
              Edit
            </button>
            <button
              onClick={() => handleDeleteReview(review.id)}
              disabled={deleting}
              className="flex items-center gap-1 px-2 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
            >
              <Trash2 className="h-3 w-3" />
              Delete
            </button>
          </>
        )}
        {user?.id === review.ownerId && !review.ownerResponse && (
          <button
            onClick={() => {
              setRespondingToReview(review);
              setShowResponseForm(true);
            }}
            className="flex items-center gap-1 px-2 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
          >
            <MessageCircle className="h-3 w-3" />
            Respond
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Reviews Management</h1>
      
      {/* Error Messages */}
      {(error || createError || updateError || deleteError || helpfulError || reportError || responseError || statsError || summaryError || userReviewsError) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800">
            {error || createError || updateError || deleteError || helpfulError || reportError || responseError || statsError || summaryError || userReviewsError}
          </div>
        </div>
      )}
      
      {/* Stats */}
      {stats && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">Review Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="font-medium">Total Reviews</div>
              <div className="text-blue-600">{stats.totalReviews}</div>
            </div>
            <div>
              <div className="font-medium">Approved</div>
              <div className="text-green-600">{stats.approvedReviews}</div>
            </div>
            <div>
              <div className="font-medium">Pending</div>
              <div className="text-yellow-600">{stats.pendingReviews}</div>
            </div>
            <div>
              <div className="font-medium">Average Rating</div>
              <div className="text-blue-600">{stats.averageRating.toFixed(1)}/5</div>
            </div>
          </div>
        </div>
      )}
      
      {/* Property Summary */}
      {propertySummary && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-green-900 mb-2">Property Rating Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="font-medium">Average Rating</div>
              <div className="text-green-600">{propertySummary.averageRating.toFixed(1)}/5</div>
            </div>
            <div>
              <div className="font-medium">Total Reviews</div>
              <div className="text-green-600">{propertySummary.totalReviews}</div>
            </div>
            <div>
              <div className="font-medium">Cleanliness</div>
              <div className="text-green-600">{propertySummary.categoryRatings.cleanliness?.toFixed(1) || 'N/A'}</div>
            </div>
            <div>
              <div className="font-medium">Location</div>
              <div className="text-green-600">{propertySummary.categoryRatings.location?.toFixed(1) || 'N/A'}</div>
            </div>
          </div>
        </div>
      )}
      
      {/* Actions */}
      <div className="flex flex-wrap gap-4">
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Create Review
        </button>
        <button
          onClick={() => dispatch(getReviews(filters))}
          disabled={loading}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Refresh Reviews'}
        </button>
        <button
          onClick={() => handleGetPropertySummary('sample-property-id')}
          disabled={summaryLoading}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          {summaryLoading ? 'Loading...' : 'Get Property Summary'}
        </button>
      </div>
      
      {/* Reviews List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Reviews ({reviews.length})</h2>
        {loading ? (
          <div className="text-center py-8">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No reviews found</div>
        ) : (
          reviews.map(renderReviewCard)
        )}
      </div>
      
      {/* User Reviews */}
      {userReviews.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Your Reviews ({userReviews.length})</h2>
          {userReviews.map(renderReviewCard)}
        </div>
      )}
      
      {/* Create Review Form */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Create Review</h2>
            <form onSubmit={handleCreateReview} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Property ID</label>
                  <input
                    type="text"
                    value={createFormData.propertyId}
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, propertyId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter property ID"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Review Type</label>
                  <select
                    value={createFormData.reviewType}
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, reviewType: e.target.value as 'property' | 'owner' | 'guest' | 'platform' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="property">Property</option>
                    <option value="owner">Owner</option>
                    <option value="guest">Guest</option>
                    <option value="platform">Platform</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                <select
                  value={createFormData.rating}
                  onChange={(e) => setCreateFormData(prev => ({ ...prev, rating: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={1}>1 Star</option>
                  <option value={2}>2 Stars</option>
                  <option value={3}>3 Stars</option>
                  <option value={4}>4 Stars</option>
                  <option value={5}>5 Stars</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={createFormData.title}
                  onChange={(e) => setCreateFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Review title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea
                  value={createFormData.content}
                  onChange={(e) => setCreateFormData(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Write your review..."
                  required
                />
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Update Review Form */}
      {showUpdateForm && editingReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Update Review</h2>
            <form onSubmit={handleUpdateReview} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                <select
                  value={updateFormData.rating}
                  onChange={(e) => setUpdateFormData(prev => ({ ...prev, rating: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={1}>1 Star</option>
                  <option value={2}>2 Stars</option>
                  <option value={3}>3 Stars</option>
                  <option value={4}>4 Stars</option>
                  <option value={5}>5 Stars</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={updateFormData.title}
                  onChange={(e) => setUpdateFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Review title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea
                  value={updateFormData.content}
                  onChange={(e) => setUpdateFormData(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Write your review..."
                  required
                />
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowUpdateForm(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {updating ? 'Updating...' : 'Update Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Add Response Form */}
      {showResponseForm && respondingToReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-xl font-semibold mb-4">Add Owner Response</h2>
            <form onSubmit={handleAddResponse} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Response</label>
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Write your response..."
                  required
                />
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowResponseForm(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingResponse}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {addingResponse ? 'Adding...' : 'Add Response'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Report Form */}
      {showReportForm && reportingReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-xl font-semibold mb-4">Report Review</h2>
            <form onSubmit={handleReportReview} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <input
                  type="text"
                  value={reportData.reason}
                  onChange={(e) => setReportData(prev => ({ ...prev, reason: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Reason for reporting"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={reportData.description}
                  onChange={(e) => setReportData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Additional details..."
                />
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowReportForm(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reporting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {reporting ? 'Reporting...' : 'Report Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewsExample;
