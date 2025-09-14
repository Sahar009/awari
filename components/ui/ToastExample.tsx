"use client";

import React from 'react';
import { useToast } from './useToast';
import { Button } from './Button';

const ToastExample: React.FC = () => {
  const toast = useToast();

  const showSuccessToast = () => {
    toast.success('Success!', 'Your action was completed successfully.');
  };

  const showErrorToast = () => {
    toast.error('Error!', 'Something went wrong. Please try again.');
  };

  const showWarningToast = () => {
    toast.warning('Warning!', 'Please check your input before proceeding.');
  };

  const showInfoToast = () => {
    toast.info('Info', 'Here is some useful information for you.');
  };

  const showPersistentToast = () => {
    toast.info('Persistent Toast', 'This toast will stay until manually closed.', 0);
  };

  return (
    <div className="p-6 space-y-4">
      <h3 className="text-lg font-semibold mb-4">Toast Examples</h3>
      <div className="flex flex-wrap gap-3">
        <Button 
          onClick={showSuccessToast} 
          variant="primary" 
          className="bg-green-600 hover:bg-green-700"
          label="Success Toast"
        />
        <Button 
          onClick={showErrorToast} 
          variant="primary" 
          className="bg-red-600 hover:bg-red-700"
          label="Error Toast"
        />
        <Button 
          onClick={showWarningToast} 
          variant="primary" 
          className="bg-yellow-600 hover:bg-yellow-700"
          label="Warning Toast"
        />
        <Button 
          onClick={showInfoToast} 
          variant="outline"
          label="Info Toast"
        />
        <Button 
          onClick={showPersistentToast} 
          variant="secondary"
          label="Persistent Toast"
        />
        <Button 
          onClick={toast.clear} 
          variant="outline"
          label="Clear All"
        />
      </div>
    </div>
  );
};

export default ToastExample;

