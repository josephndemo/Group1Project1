const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://group1project1-1.onrender.com').replace(/\/$/, '');

const buildUrl = (path) => `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;

const getToken = () => localStorage.getItem('library_token');
const SESSION_EXPIRED_MESSAGE = 'Your session has expired due to inactivity. Please log in again.';

class ApiError extends Error {
    constructor(message, status, payload) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.payload = payload;
    }
}

const handleUnauthorized = () => {
    localStorage.removeItem('library_token');
    localStorage.removeItem('library_user');

    window.dispatchEvent(
        new CustomEvent('library:session-expired', {
            detail: { message: SESSION_EXPIRED_MESSAGE },
        })
    );
};

const request = async (path, options = {}) => {
    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {})
    };

    const token = getToken();
    const hadAuthToken = Boolean(token);
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    try {
        const response = await fetch(buildUrl(path), {
            ...options,
            headers,
        });

        const contentType = response.headers.get('content-type') || '';
        const data = contentType.includes('application/json') ? await response.json() : await response.text();

        if (!response.ok) {
            const message = typeof data === 'object' && data !== null ? (data.error || data.message || 'Request failed') : data || 'Request failed';
            if (response.status === 401 && hadAuthToken) {
                handleUnauthorized();
            }
            throw new ApiError(message, response.status, data);
        }

        return data;
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }

        throw new Error('Request failed', { cause: error });
    }
};

export const authApi = {
    register: (payload) => request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
    login: (payload) => request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
    refresh: (payload) => request('/auth/refresh', { method: 'POST', body: JSON.stringify(payload) }),
};

export const booksApi = {
    list: () => request('/books'),
    create: (payload) => request('/books', { method: 'POST', body: JSON.stringify(payload) }),
    update: (id, payload) => request(`/books/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
    remove: (id) => request(`/books/${id}`, { method: 'DELETE' }),
};

export const shelvesApi = {
    list: () => request('/shelves'),
    create: (payload) => request('/shelves', { method: 'POST', body: JSON.stringify(payload) }),
    listBooks: (shelfId) => request(`/shelves/${shelfId}/books`),
    addBook: (shelfId, payload) => request(`/shelves/${shelfId}/books`, { method: 'POST', body: JSON.stringify(payload) }),
    updateBook: (shelfId, bookId, payload) => request(`/shelves/${shelfId}/books/${bookId}`, { method: 'PUT', body: JSON.stringify(payload) }),
    removeBook: (shelfId, bookId) => request(`/shelves/${shelfId}/books/${bookId}`, { method: 'DELETE' }),
};

export const favoritesApi = {
    list: () => request('/favorites'),
    create: (payload) => request('/favorites', { method: 'POST', body: JSON.stringify(payload) }),
    removeByExternalId: (externalId) => request(`/favorites/${encodeURIComponent(externalId)}`, { method: 'DELETE' }),
};

export const usersApi = {
    list: () => request('/admin/users'),
    update: (id, payload) => request(`/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
    remove: (id) => request(`/admin/users/${id}`, { method: 'DELETE' }),
};


export const reviewsApi = {
 list: () => request('/reviews'),
 create: (payload) => request('/reviews', { method: 'POST', body: JSON.stringify(payload) }),
 update: (id, payload) => request(`/reviews/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
 remove: (id) => request(`/reviews/${id}`, { method: 'DELETE' }),
 listByBook: (bookId) => request(`/books/${bookId}/reviews`),
};

export const bookClubApi = {
 recommendations: () => request('/book-club/recommendations'),
};

export const systemApi = {
 health: () => request('/health'),
};
