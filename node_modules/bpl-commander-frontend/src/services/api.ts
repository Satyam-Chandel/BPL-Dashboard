// API Service for connecting to the backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('bpl-token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`, {
        headers: config.headers,
        body: options.body,
      });

      const response = await fetch(url, config);
      const data = await response.json();

      console.log(`📡 API Response: ${response.status}`, data);

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('❌ API Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Auth methods
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: any) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  // User methods
  async getUsers() {
    return this.request('/users');
  }

  async getUser(id: string) {
    return this.request(`/users/${id}`);
  }

  async updateUser(id: string, userData: any) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Project methods
  async getProjects() {
    return this.request('/projects');
  }

  async getProject(id: string) {
    return this.request(`/projects/${id}`);
  }

  async createProject(projectData: any) {
    return this.request('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  }

  async updateProject(id: string, projectData: any) {
    return this.request(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    });
  }

  async deleteProject(id: string) {
    return this.request(`/projects/${id}`, {
      method: 'DELETE',
    });
  }

  // Initiative methods
  async getInitiatives() {
    return this.request('/initiatives');
  }

  async createInitiative(initiativeData: any) {
    return this.request('/initiatives', {
      method: 'POST',
      body: JSON.stringify(initiativeData),
    });
  }

  // Analytics methods
  async getAnalytics() {
    return this.request('/analytics');
  }

  // Health check
  async healthCheck() {
    try {
      const response = await fetch('http://localhost:3001/health');
      const data = await response.json();
      console.log('🏥 Backend Health Check:', data);
      return data;
    } catch (error) {
      console.error('❌ Backend Health Check Failed:', error);
      return { success: false, error: 'Backend not available' };
    }
  }

  // Set token for authenticated requests
  setToken(token: string) {
    this.token = token;
    localStorage.setItem('bpl-token', token);
  }

  // Clear token
  clearToken() {
    this.token = null;
    localStorage.removeItem('bpl-token');
  }
}

export const apiService = new ApiService();
export default apiService;
