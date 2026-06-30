const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000';

const buildUrl = (path) => `${API_BASE_URL}${path}`;

const getToken = () => localStorage.getItem('library_token');

const request = async (path, options = {}) => {
    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {})
    };

    const token = getToken();
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
            throw new Error(message);
        }

        return data;
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('Request failed');
    }
};

export const authApi = {
    register: (payload) => request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
    login: (payload) => request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
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
