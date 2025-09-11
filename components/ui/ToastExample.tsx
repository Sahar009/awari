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
        <Button onClick={showSuccessToast} variant="success">
          Success Toast
        </Button>
        <Button onClick={showErrorToast} variant="destructive">
          Error Toast
        </Button>
        <Button onClick={showWarningToast} variant="warning">
          Warning Toast
        </Button>
        <Button onClick={showInfoToast} variant="outline">
          Info Toast
        </Button>
        <Button onClick={showPersistentToast} variant="secondary">
          Persistent Toast
        </Button>
        <Button onClick={toast.clear} variant="outline">
          Clear All
        </Button>
      </div>
    </div>
  );
};

export default ToastExample;

