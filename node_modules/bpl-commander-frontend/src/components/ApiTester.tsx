import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { useAuth } from '../contexts/AuthContext';

export function ApiTester() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { accessToken } = useAuth();

  const addResult = (endpoint: string, method: string, result: any, duration: number) => {
    const newResult = {
      id: Date.now(),
      endpoint,
      method,
      result,
      duration,
      timestamp: new Date().toLocaleTimeString(),
      success: result.success
    };
    setResults(prev => [newResult, ...prev.slice(0, 9)]); // Keep last 10 results
  };

  const testEndpoint = async (endpoint: string, method: string, testFn: () => Promise<any>) => {
    setLoading(true);
    const startTime = Date.now();
    
    try {
      const result = await testFn();
      const duration = Date.now() - startTime;
      addResult(endpoint, method, result, duration);
    } catch (error) {
      const duration = Date.now() - startTime;
      addResult(endpoint, method, { success: false, error: error instanceof Error ? error.message : 'Unknown error' }, duration);
    } finally {
      setLoading(false);
    }
  };

  const makeAuthenticatedRequest = async (endpoint: string, method: string = 'GET', body?: any) => {
    const url = endpoint.startsWith('/') ? `http://localhost:3001${endpoint}` : endpoint;
    
    const config: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      },
    };

    if (body && method !== 'GET') {
      config.body = JSON.stringify(body);
    }

    console.log(`🌐 API Request: ${method} ${url}`, {
      headers: config.headers,
      body: config.body,
    });

    const response = await fetch(url, config);
    const data = await response.json();

    console.log(`📡 API Response: ${response.status}`, data);

    return {
      success: response.ok,
      status: response.status,
      data: response.ok ? data : undefined,
      error: !response.ok ? (data.error || `HTTP ${response.status}`) : undefined,
    };
  };

  const tests = [
    {
      name: 'Health Check',
      endpoint: '/health',
      method: 'GET',
      fn: () => makeAuthenticatedRequest('/health')
    },
    {
      name: 'Get Users',
      endpoint: '/api/users',
      method: 'GET',
      fn: () => makeAuthenticatedRequest('/api/users')
    },
    {
      name: 'Get Projects',
      endpoint: '/api/projects',
      method: 'GET',
      fn: () => makeAuthenticatedRequest('/api/projects')
    },
    {
      name: 'Get Analytics',
      endpoint: '/api/analytics',
      method: 'GET',
      fn: () => makeAuthenticatedRequest('/api/analytics')
    },
    {
      name: 'Login Test',
      endpoint: '/api/auth/login',
      method: 'POST',
      fn: () => makeAuthenticatedRequest('/api/auth/login', 'POST', { email: 'admin@bpl.com', password: 'password123' })
    }
  ];

  const clearResults = () => setResults([]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🧪 API Tester
            <Badge variant="outline">Backend: localhost:3001</Badge>
          </CardTitle>
          <CardDescription>
            Test API endpoints and monitor network requests in DevTools → Network tab
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">Auth Status:</span>
              {accessToken ? (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  ✅ Authenticated
                </Badge>
              ) : (
                <Badge variant="destructive">
                  ❌ Not Authenticated
                </Badge>
              )}
              {accessToken && (
                <span className="text-xs text-gray-500 ml-2">
                  Token: {accessToken.substring(0, 20)}...
                </span>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
            {tests.map((test, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                disabled={loading}
                onClick={() => testEndpoint(test.endpoint, test.method, test.fn)}
                className="text-xs"
              >
                {test.method} {test.name}
              </Button>
            ))}
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={clearResults} 
              variant="ghost" 
              size="sm"
              disabled={results.length === 0}
            >
              Clear Results
            </Button>
            <Badge variant="secondary">
              {results.length} requests logged
            </Badge>
          </div>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>API Call Results</CardTitle>
            <CardDescription>
              Open DevTools → Network tab to see detailed request/response data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {results.map((result) => (
                <div
                  key={result.id}
                  className={`p-3 rounded-lg border ${
                    result.success 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={result.success ? 'default' : 'destructive'}>
                        {result.method}
                      </Badge>
                      <code className="text-sm">{result.endpoint}</code>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{result.timestamp}</span>
                      <span>{result.duration}ms</span>
                    </div>
                  </div>
                  
                  <div className="text-sm">
                    <strong>Response:</strong>
                    <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                      {JSON.stringify(result.result, null, 2)}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800">📋 How to Monitor API Calls</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <div><strong>1. Open DevTools:</strong> Press F12 or right-click → Inspect</div>
          <div><strong>2. Go to Network tab:</strong> Click on "Network" in DevTools</div>
          <div><strong>3. Filter requests:</strong> Type "localhost:3001" in the filter box</div>
          <div><strong>4. Test API calls:</strong> Click the buttons above</div>
          <div><strong>5. View details:</strong> Click on any request to see headers, payload, and response</div>
          <div className="mt-3 p-2 bg-blue-100 rounded">
            <strong>💡 Pro Tip:</strong> Check the Console tab for detailed API logs with request/response data!
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
