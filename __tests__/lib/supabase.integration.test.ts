// Integration test for Supabase client - basic setup verification
// This test verifies that the Supabase client can be imported and initialized without errors

// Mock Supabase for integration tests
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
      onAuthStateChange: jest.fn(),
    },
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(),
        remove: jest.fn(),
        getPublicUrl: jest.fn(),
        list: jest.fn(),
        info: jest.fn(),
      })),
    },
  })),
}));

describe('Supabase Integration', () => {
  it('should import Supabase client without errors', () => {
    // This test verifies that the module can be imported successfully
    expect(() => {
      require('../../lib/supabase');
    }).not.toThrow();
  });

  it('should export required functions', () => {
    const supabaseModule = require('../../lib/supabase');

    expect(supabaseModule.supabase).toBeDefined();
    expect(supabaseModule.getCurrentUser).toBeDefined();
    expect(supabaseModule.getCurrentSession).toBeDefined();
    expect(supabaseModule.signOut).toBeDefined();
    expect(supabaseModule.isAuthenticated).toBeDefined();
    expect(typeof supabaseModule.getCurrentUser).toBe('function');
    expect(typeof supabaseModule.getCurrentSession).toBe('function');
    expect(typeof supabaseModule.signOut).toBe('function');
    expect(typeof supabaseModule.isAuthenticated).toBe('function');
  });

  it('should have correct environment variables', () => {
    expect(process.env.EXPO_PUBLIC_SUPABASE_URL).toBeDefined();
    expect(process.env.EXPO_PUBLIC_SUPABASE_KEY).toBeDefined();
  });
});
