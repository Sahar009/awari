# Toast Component

A customizable toast notification system built for the Awari project with modern design and smooth animations.

## Features

- 🎨 **Project-styled**: Matches your design system with emerald, red, amber, and blue color schemes
- ⚡ **Smooth animations**: Slide-in from right with fade effects
- 🔄 **Auto-dismiss**: Configurable duration with progress bar
- 🎯 **Multiple types**: Success, error, warning, and info toasts
- 📱 **Responsive**: Works perfectly on all screen sizes
- 🎛️ **Customizable**: Support for actions, custom durations, and styling

## Usage

### Basic Usage

```tsx
import { useToast } from '@/components/ui/useToast';

function MyComponent() {
  const toast = useToast();

  const handleSuccess = () => {
    toast.success('Success!', 'Your action was completed successfully.');
  };

  const handleError = () => {
    toast.error('Error!', 'Something went wrong. Please try again.');
  };

  const handleWarning = () => {
    toast.warning('Warning!', 'Please check your input before proceeding.');
  };

  const handleInfo = () => {
    toast.info('Info', 'Here is some useful information for you.');
  };

  return (
    <div>
      <button onClick={handleSuccess}>Show Success</button>
      <button onClick={handleError}>Show Error</button>
      <button onClick={handleWarning}>Show Warning</button>
      <button onClick={handleInfo}>Show Info</button>
    </div>
  );
}
```

### Advanced Usage

```tsx
import { useToast } from '@/components/ui/useToast';

function MyComponent() {
  const toast = useToast();

  const handleCustomToast = () => {
    toast.success('Custom Toast', 'This toast has custom settings.', {
      duration: 10000, // 10 seconds
      action: {
        label: 'Undo',
        onClick: () => console.log('Undo clicked')
      }
    });
  };

  const handlePersistentToast = () => {
    toast.info('Persistent Toast', 'This toast will stay until manually closed.', 0);
  };

  return (
    <div>
      <button onClick={handleCustomToast}>Custom Toast</button>
      <button onClick={handlePersistentToast}>Persistent Toast</button>
    </div>
  );
}
```

## API Reference

### useToast Hook

The `useToast` hook provides the following methods:

#### `toast.success(title, message?, duration?)`
Shows a success toast with emerald styling.

#### `toast.error(title, message?, duration?)`
Shows an error toast with red styling.

#### `toast.warning(title, message?, duration?)`
Shows a warning toast with amber styling.

#### `toast.info(title, message?, duration?)`
Shows an info toast with blue styling.

#### `toast.remove(id)`
Manually remove a specific toast by ID.

#### `toast.clear()`
Clear all visible toasts.

### Toast Interface

```tsx
interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number; // 0 = persistent, default = 5000ms
  action?: {
    label: string;
    onClick: () => void;
  };
}
```

## Styling

The toast component uses Tailwind CSS classes and follows your project's design system:

- **Success**: Emerald colors (`emerald-50`, `emerald-600`, etc.)
- **Error**: Red colors (`red-50`, `red-600`, etc.)
- **Warning**: Amber colors (`amber-50`, `amber-600`, etc.)
- **Info**: Blue colors (`blue-50`, `blue-600`, etc.)

## Setup

The ToastProvider is already integrated into your app's providers in `app/providers.tsx`. No additional setup is required.

## Examples

Check out `components/ui/ToastExample.tsx` for a complete example of all toast types and features.


