/**
 * Debug utilities for API and authentication issues
 */

export const debugUtils = {
  /**
   * Log current authentication state
   */
  logAuthState: () => {
    if (typeof window === 'undefined') return;
    
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    console.group('🔍 Authentication Debug Info');
    console.log('Token exists:', !!token);
    console.log('Token length:', token?.length || 0);
    console.log('Token preview:', token ? token.substring(0, 20) + '...' : 'None');
    console.log('User data:', user ? JSON.parse(user) : 'None');
    console.groupEnd();
  },

  /**
   * Test API connectivity
   */
  testApiConnection: async () => {
    try {
      const response = await fetch('https://awari-backend.onrender.com/api/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.group('🌐 API Connection Test');
      console.log('Status:', response.status);
      console.log('Status Text:', response.statusText);
      console.log('Headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        const data = await response.json();
        console.log('Response data:', data);
      } else {
        console.log('Response text:', await response.text());
      }
      console.groupEnd();
      
      return response.ok;
    } catch (error) {
      console.group('🌐 API Connection Test - Failed');
      console.error('Error:', error);
      console.groupEnd();
      return false;
    }
  },

  /**
   * Test authentication with current token
   */
  testAuth: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('⚠️ No token found for auth test');
      return false;
    }

    try {
      const response = await fetch('https://awari-backend.onrender.com/api/auth/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.group('🔐 Authentication Test');
      console.log('Status:', response.status);
      console.log('Status Text:', response.statusText);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Profile data:', data);
        console.groupEnd();
        return true;
      } else {
        const errorData = await response.json();
        console.error('Auth failed:', errorData);
        console.groupEnd();
        return false;
      }
    } catch (error) {
      console.group('🔐 Authentication Test - Failed');
      console.error('Error:', error);
      console.groupEnd();
      return false;
    }
  },

  /**
   * Test favorites API specifically
   */
  testFavoritesApi: async (propertyId: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('⚠️ No token found for favorites test');
      return false;
    }

    try {
      console.group('❤️ Favorites API Test');
      console.log('Testing property ID:', propertyId);
      
      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      console.log('Is valid UUID:', uuidRegex.test(propertyId));
      
      // Test GET favorites status first
      const statusResponse = await fetch(`https://awari-backend.onrender.com/api/favorites/${propertyId}/status`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Status check - Status:', statusResponse.status);
      
      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        console.log('Status data:', statusData);
      } else {
        const errorData = await statusResponse.json();
        console.error('Status check failed:', errorData);
      }

      // Test different POST request formats
      const requestFormats = [
        { name: 'Empty object', body: {} },
        { name: 'Notes field empty', body: { notes: '' } },
        { name: 'Notes field null', body: { notes: null } },
        { name: 'Notes field undefined', body: { notes: undefined } },
      ];

      for (const format of requestFormats) {
        console.log(`\n🔍 Testing ${format.name}:`, format.body);
        
        try {
          const postResponse = await fetch(`https://awari-backend.onrender.com/api/favorites/${propertyId}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(format.body),
          });
          
          console.log(`${format.name} - Status:`, postResponse.status);
          console.log(`${format.name} - Status Text:`, postResponse.statusText);
          
          if (postResponse.ok) {
            const postData = await postResponse.json();
            console.log(`${format.name} - Success:`, postData);
            console.groupEnd();
            return true;
          } else {
            const errorData = await postResponse.json();
            console.error(`${format.name} - Failed:`, errorData);
          }
        } catch (error) {
          console.error(`${format.name} - Error:`, error);
        }
      }
      
      console.groupEnd();
      return false;
    } catch (error) {
      console.group('❤️ Favorites API Test - Failed');
      console.error('Error:', error);
      console.groupEnd();
      return false;
    }
  },

  /**
   * Test the specific property that's causing issues
   */
  testProblematicProperty: async () => {
    const propertyId = '23e5d216-f292-4b7d-8241-805667839a3a';
    console.group('🔍 Testing Problematic Property');
    console.log('Property ID:', propertyId);
    
    // Test if it's already in favorites
    await debugUtils.testFavoritesApi(propertyId);
    
    console.groupEnd();
  },

  /**
   * Test the fetch favorites API directly
   */
  testFetchFavorites: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('⚠️ No token found for fetch favorites test');
      return false;
    }

    try {
      console.group('🔍 Testing Fetch Favorites API');
      
      const response = await fetch('http://localhost:8000/api/favorites', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Status:', response.status);
      console.log('Status Text:', response.statusText);
      console.log('Headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Raw API Response:', data);
        console.log('Response structure:', {
          hasSuccess: 'success' in data,
          hasMessage: 'message' in data,
          hasData: 'data' in data,
          dataKeys: data.data ? Object.keys(data.data) : [],
          favoritesCount: data.data?.favorites?.length || 0,
          paginationKeys: data.data?.pagination ? Object.keys(data.data.pagination) : []
        });
        
        if (data.data?.favorites) {
          console.log('First favorite structure:', data.data.favorites[0]);
        }
      } else {
        const errorData = await response.json();
        console.error('❌ API Error:', errorData);
      }
      
      console.groupEnd();
      return response.ok;
    } catch (error) {
      console.group('🔍 Testing Fetch Favorites API - Failed');
      console.error('Error:', error);
      console.groupEnd();
      return false;
    }
  },

  /**
   * Run all debug tests
   */
  runAllTests: async (propertyId?: string) => {
    console.group('🧪 Running All Debug Tests');
    
    debugUtils.logAuthState();
    
    const apiConnected = await debugUtils.testApiConnection();
    const authWorking = await debugUtils.testAuth();
    
    if (propertyId) {
      await debugUtils.testFavoritesApi(propertyId);
    }
    
    console.groupEnd();
    
    return {
      apiConnected,
      authWorking,
      hasToken: !!localStorage.getItem('token')
    };
  }
};

// Make it available globally for debugging
if (typeof window !== 'undefined') {
  (window as typeof window & { debugUtils: typeof debugUtils }).debugUtils = debugUtils;
}
