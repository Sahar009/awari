import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  getAvailabilityCalendar,
  getUnavailableDates,
  getAvailableDates,
  checkDateRangeAvailability,
  blockDate,
  unblockDate,
  blockMultipleDates,
  unblockMultipleDates,
  getPropertyAvailabilityRecords,
  clearCalendar,
  clearUnavailableDates,
  clearAvailableDates,
  clearAvailabilityCheck,
  clearRecords,
  clearAllErrors,
  selectCalendar,
  selectCalendarLoading,
  selectCalendarError,
  selectUnavailableDates,
  selectUnavailableDatesLoading,
  selectUnavailableDatesError,
  selectAvailableDates,
  selectAvailableDatesLoading,
  selectAvailableDatesError,
  selectAvailabilityCheck,
  selectAvailabilityCheckLoading,
  selectAvailabilityCheckError,
  selectBlockLoading,
  selectBlockError,
  selectUnblockLoading,
  selectUnblockError,
  selectBlockMultipleLoading,
  selectBlockMultipleError,
  selectUnblockMultipleLoading,
  selectUnblockMultipleError,
  selectRecords,
  selectRecordsLoading,
  selectRecordsError,
  selectIsAnyLoading,
  selectHasAnyError,
} from '@/store/slices/availabilitySlice';
import { Button } from '@/components/ui/Button';
import { Loader } from '@/components/ui/Loader';

const AvailabilityExample: React.FC = () => {
  const dispatch = useAppDispatch();

  // Form states
  const [propertyId, setPropertyId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [blockDateValue, setBlockDateValue] = useState('');
  const [blockReason, setBlockReason] = useState<'maintenance' | 'owner_blocked' | 'admin_blocked' | 'unavailable'>('maintenance');
  const [blockNotes, setBlockNotes] = useState('');
  const [multipleDates, setMultipleDates] = useState('');
  const [unblockDateValue, setUnblockDateValue] = useState('');
  const [unblockMultipleDatesValue, setUnblockMultipleDatesValue] = useState('');

  // Selectors
  const calendar = useAppSelector(selectCalendar);
  const calendarLoading = useAppSelector(selectCalendarLoading);
  const calendarError = useAppSelector(selectCalendarError);

  const unavailableDates = useAppSelector(selectUnavailableDates);
  const unavailableDatesLoading = useAppSelector(selectUnavailableDatesLoading);
  const unavailableDatesError = useAppSelector(selectUnavailableDatesError);

  const availableDates = useAppSelector(selectAvailableDates);
  const availableDatesLoading = useAppSelector(selectAvailableDatesLoading);
  const availableDatesError = useAppSelector(selectAvailableDatesError);

  const availabilityCheck = useAppSelector(selectAvailabilityCheck);
  const availabilityCheckLoading = useAppSelector(selectAvailabilityCheckLoading);
  const availabilityCheckError = useAppSelector(selectAvailabilityCheckError);

  const blockLoading = useAppSelector(selectBlockLoading);
  const blockError = useAppSelector(selectBlockError);

  const unblockLoading = useAppSelector(selectUnblockLoading);
  const unblockError = useAppSelector(selectUnblockError);

  const blockMultipleLoading = useAppSelector(selectBlockMultipleLoading);
  const blockMultipleError = useAppSelector(selectBlockMultipleError);

  const unblockMultipleLoading = useAppSelector(selectUnblockMultipleLoading);
  const unblockMultipleError = useAppSelector(selectUnblockMultipleError);

  const records = useAppSelector(selectRecords);
  const recordsLoading = useAppSelector(selectRecordsLoading);
  const recordsError = useAppSelector(selectRecordsError);

  const isLoading = useAppSelector(selectIsAnyLoading);
  const hasError = useAppSelector(selectHasAnyError);

  // Handlers
  const handleGetCalendar = () => {
    if (propertyId && startDate && endDate) {
      dispatch(getAvailabilityCalendar({ propertyId, startDate, endDate }));
    }
  };

  const handleGetUnavailableDates = () => {
    if (propertyId && startDate && endDate) {
      dispatch(getUnavailableDates({ propertyId, startDate, endDate }));
    }
  };

  const handleGetAvailableDates = () => {
    if (propertyId && startDate && endDate) {
      dispatch(getAvailableDates({ propertyId, startDate, endDate }));
    }
  };

  const handleCheckAvailability = () => {
    if (propertyId && checkInDate && checkOutDate) {
      dispatch(checkDateRangeAvailability({ propertyId, checkInDate, checkOutDate }));
    }
  };

  const handleBlockDate = () => {
    if (propertyId && blockDateValue && blockReason) {
      dispatch(blockDate({
        propertyId,
        date: blockDateValue,
        reason: blockReason,
        notes: blockNotes || undefined
      }));
    }
  };

  const handleUnblockDate = () => {
    if (propertyId && unblockDateValue) {
      dispatch(unblockDate({ propertyId, date: unblockDateValue }));
    }
  };

  const handleBlockMultipleDates = () => {
    if (propertyId && multipleDates && blockReason) {
      const datesArray = multipleDates.split(',').map(date => date.trim()).filter(Boolean);
      dispatch(blockMultipleDates({
        propertyId,
        dates: datesArray,
        reason: blockReason,
        notes: blockNotes || undefined
      }));
    }
  };

  const handleUnblockMultipleDates = () => {
    if (propertyId && unblockMultipleDatesValue) {
      const datesArray = unblockMultipleDatesValue.split(',').map(date => date.trim()).filter(Boolean);
      dispatch(unblockMultipleDates({ propertyId, dates: datesArray }));
    }
  };

  const handleGetRecords = () => {
    if (propertyId) {
      dispatch(getPropertyAvailabilityRecords({ 
        propertyId, 
        options: { 
          page: 1, 
          limit: 20, 
          includeInactive: false 
        } 
      }));
    }
  };

  const handleClearAll = () => {
    dispatch(clearAllErrors());
    dispatch(clearCalendar());
    dispatch(clearUnavailableDates());
    dispatch(clearAvailableDates());
    dispatch(clearAvailabilityCheck());
    dispatch(clearRecords());
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader />
        <span className="ml-2">Loading availability data...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Availability Management Example</h1>
        
        {hasError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">Error occurred:</p>
            <p>Check console for details</p>
          </div>
        )}

        {/* Property ID Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Property ID
          </label>
          <input
            type="text"
            value={propertyId}
            onChange={(e) => setPropertyId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter property UUID"
          />
        </div>

        {/* Date Range Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Calendar Operations */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold mb-4">Calendar Operations</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              label="Get Calendar"
              onClick={handleGetCalendar}
              disabled={!propertyId || !startDate || !endDate || calendarLoading}
              className="w-full"
            />
            <Button
              label="Get Unavailable Dates"
              onClick={handleGetUnavailableDates}
              disabled={!propertyId || !startDate || !endDate || unavailableDatesLoading}
              className="w-full"
            />
            <Button
              label="Get Available Dates"
              onClick={handleGetAvailableDates}
              disabled={!propertyId || !startDate || !endDate || availableDatesLoading}
              className="w-full"
            />
          </div>
        </div>

        {/* Availability Check */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold mb-4">Availability Check</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Check-in Date
              </label>
              <input
                type="date"
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Check-out Date
              </label>
              <input
                type="date"
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <Button
            label="Check Availability"
            onClick={handleCheckAvailability}
            disabled={!propertyId || !checkInDate || !checkOutDate || availabilityCheckLoading}
            className="w-full"
          />
        </div>

        {/* Block Operations */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold mb-4">Block Operations</h3>
          
          {/* Single Date Block */}
          <div className="mb-4">
            <h4 className="font-medium mb-2">Block Single Date</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={blockDateValue}
                  onChange={(e) => setBlockDateValue(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason
                </label>
                <select
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value as 'maintenance' | 'owner_blocked' | 'admin_blocked' | 'unavailable')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="maintenance">Maintenance</option>
                  <option value="owner_blocked">Owner Blocked</option>
                  <option value="admin_blocked">Admin Blocked</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  value={blockNotes}
                  onChange={(e) => setBlockNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Additional notes"
                />
              </div>
              <div className="flex items-end">
                <Button
                  label="Block Date"
                  onClick={handleBlockDate}
                  disabled={!propertyId || !blockDateValue || !blockReason || blockLoading}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Multiple Dates Block */}
          <div>
            <h4 className="font-medium mb-2">Block Multiple Dates</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dates (comma-separated)
                </label>
                <input
                  type="text"
                  value={multipleDates}
                  onChange={(e) => setMultipleDates(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="2024-01-01, 2024-01-02, 2024-01-03"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason
                </label>
                <select
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value as 'maintenance' | 'owner_blocked' | 'admin_blocked' | 'unavailable')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="maintenance">Maintenance</option>
                  <option value="owner_blocked">Owner Blocked</option>
                  <option value="admin_blocked">Admin Blocked</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  value={blockNotes}
                  onChange={(e) => setBlockNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Additional notes"
                />
              </div>
              <div className="flex items-end">
                <Button
                  label="Block Multiple"
                  onClick={handleBlockMultipleDates}
                  disabled={!propertyId || !multipleDates || !blockReason || blockMultipleLoading}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Unblock Operations */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold mb-4">Unblock Operations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unblock Single Date
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={unblockDateValue}
                  onChange={(e) => setUnblockDateValue(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button
                  label="Unblock"
                  onClick={handleUnblockDate}
                  disabled={!propertyId || !unblockDateValue || unblockLoading}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unblock Multiple Dates
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={unblockMultipleDatesValue}
                  onChange={(e) => setUnblockMultipleDatesValue(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="2024-01-01, 2024-01-02"
                />
                <Button
                  label="Unblock Multiple"
                  onClick={handleUnblockMultipleDates}
                  disabled={!propertyId || !unblockMultipleDatesValue || unblockMultipleLoading}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Records */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold mb-4">Availability Records</h3>
          <Button
            label="Get Records"
            onClick={handleGetRecords}
            disabled={!propertyId || recordsLoading}
            className="w-full"
          />
        </div>

        {/* Clear All */}
        <div className="bg-red-50 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold mb-4 text-red-800">Clear All Data</h3>
          <Button
            label="Clear All"
            onClick={handleClearAll}
            className="w-full bg-red-600 hover:bg-red-700"
          />
        </div>

        {/* Results Display */}
        <div className="space-y-6">
          {/* Calendar Results */}
          {calendar && (
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2 text-green-800">Calendar Data</h3>
              <pre className="bg-white p-3 rounded text-sm overflow-auto">
                {JSON.stringify(calendar, null, 2)}
              </pre>
            </div>
          )}

          {/* Unavailable Dates Results */}
          {unavailableDates && (
            <div className="bg-yellow-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2 text-yellow-800">Unavailable Dates</h3>
              <pre className="bg-white p-3 rounded text-sm overflow-auto">
                {JSON.stringify(unavailableDates, null, 2)}
              </pre>
            </div>
          )}

          {/* Available Dates Results */}
          {availableDates && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2 text-blue-800">Available Dates</h3>
              <pre className="bg-white p-3 rounded text-sm overflow-auto">
                {JSON.stringify(availableDates, null, 2)}
              </pre>
            </div>
          )}

          {/* Availability Check Results */}
          {availabilityCheck && (
            <div className="bg-purple-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2 text-purple-800">Availability Check</h3>
              <pre className="bg-white p-3 rounded text-sm overflow-auto">
                {JSON.stringify(availabilityCheck, null, 2)}
              </pre>
            </div>
          )}

          {/* Records Results */}
          {records && (
            <div className="bg-indigo-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2 text-indigo-800">Availability Records</h3>
              <pre className="bg-white p-3 rounded text-sm overflow-auto">
                {JSON.stringify(records, null, 2)}
              </pre>
            </div>
          )}

          {/* Error Messages */}
          {(calendarError || unavailableDatesError || availableDatesError || availabilityCheckError || 
            blockError || unblockError || blockMultipleError || unblockMultipleError || recordsError) && (
            <div className="bg-red-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2 text-red-800">Errors</h3>
              <div className="space-y-2 text-sm">
                {calendarError && <p className="text-red-600">Calendar: {calendarError}</p>}
                {unavailableDatesError && <p className="text-red-600">Unavailable Dates: {unavailableDatesError}</p>}
                {availableDatesError && <p className="text-red-600">Available Dates: {availableDatesError}</p>}
                {availabilityCheckError && <p className="text-red-600">Availability Check: {availabilityCheckError}</p>}
                {blockError && <p className="text-red-600">Block: {blockError}</p>}
                {unblockError && <p className="text-red-600">Unblock: {unblockError}</p>}
                {blockMultipleError && <p className="text-red-600">Block Multiple: {blockMultipleError}</p>}
                {unblockMultipleError && <p className="text-red-600">Unblock Multiple: {unblockMultipleError}</p>}
                {recordsError && <p className="text-red-600">Records: {recordsError}</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AvailabilityExample;