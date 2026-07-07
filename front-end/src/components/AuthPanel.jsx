import { useEffect, useState } from 'react';
import { authApi, bookClubApi } from '../api/client.js';
import brandLogo from '../assets/icon1.png';
import { mockBookClubBooks } from '../features/bookClub/data/mockBookClubData.js';

const defaultCover = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400';

const fallbackHighlights = [...mockBookClubBooks]
    .sort((a, b) => {
        if ((b.averageRating || 0) !== (a.averageRating || 0)) {
            return (b.averageRating || 0) - (a.averageRating || 0);
        }

        return (b.reviewCount || 0) - (a.reviewCount || 0);
    })
    .slice(0, 3)
    .map((book) => ({
        title: book.title,
        author: book.author,
        cover_url: book.coverUrl,
        average_rating: book.averageRating || 0,
        review_count: book.reviewCount || 0,
    }));

export default function AuthPanel({ onAuthSuccess }) {
    const [mode, setMode] = useState('login');
    const [form, setForm] = useState({ username: '', email: '', password: '' });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [clubHighlights, setClubHighlights] = useState([]);
    const [highlightsLoading, setHighlightsLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        const loadHighlights = async () => {
            try {
                setHighlightsLoading(true);
                const data = await bookClubApi.recommendations();
                if (!cancelled) {
                    const highlights = (data || []).slice(0, 3);
                    setClubHighlights(highlights.length > 0 ? highlights : fallbackHighlights);
                }
            } catch {
                if (!cancelled) {
                    setClubHighlights(fallbackHighlights);
                }
            } finally {
                if (!cancelled) {
                    setHighlightsLoading(false);
                }
            }
        };

        loadHighlights();

        return () => {
            cancelled = true;
        };
    }, []);

    const sortedHighlights = [...clubHighlights].sort((a, b) => {
        const ratingA = Number(a?.average_rating || 0);
        const ratingB = Number(b?.average_rating || 0);
        if (ratingB !== ratingA) {
            return ratingB - ratingA;
        }

        return Number(b?.review_count || 0) - Number(a?.review_count || 0);
    });

    const topHighlights = sortedHighlights.slice(0, 3);
    const guestCarouselBooks = sortedHighlights.slice(0, 8);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const payload = mode === 'login'
                ? { identifier: form.username || form.email, password: form.password }
                : { username: form.username, email: form.email, password: form.password };

            const result = mode === 'login'
                ? await authApi.login(payload)
                : await authApi.register(payload);

            if (mode === 'login') {
                localStorage.setItem('library_token', result.access_token);
                localStorage.setItem('library_user', JSON.stringify(result.user));
                onAuthSuccess?.(result.user);
                setMessage('Signed in successfully');
            } else {
                setMessage('Account created. Please sign in.');
                setMode('login');
            }
        } catch (err) {
            setError(err.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="auth-page-shell">
            <div className="auth-page-grid">
                <aside className="auth-hero-panel">
                    <div className="auth-brand-row">
                        <img src={brandLogo} alt="OpenLibrary Hub logo" className="auth-brand-logo" />
                        <div>
                            <p className="auth-brand-eyebrow">OpenLibrary Hub</p>
                            <h1 className="auth-brand-heading">Read together. Track better.</h1>
                        </div>
                    </div>

                    <p className="auth-hero-copy">
                        Discover books, organize your shelves, and join the book club conversations in one place.
                    </p>

                    <ul className="auth-hero-points">
                        <li>Personal shelves for every reader</li>
                        <li>Admin-curated catalog management</li>
                        <li>Live book club reviews and commentary</li>
                    </ul>

                    <section className="auth-club-preview">
                        <div className="auth-club-preview-header">
                            <p>Book Club right now</p>
                            <span>Top picks</span>
                        </div>

                        {highlightsLoading ? (
                            <div className="auth-club-skeletons">
                                <div className="auth-club-skeleton"></div>
                                <div className="auth-club-skeleton"></div>
                                <div className="auth-club-skeleton"></div>
                            </div>
                        ) : topHighlights.length === 0 ? (
                            <p className="auth-club-empty">Sign in to join the first discussion and shape today&apos;s rankings.</p>
                        ) : (
                            <div className="auth-club-list">
                                {topHighlights.map((book, index) => (
                                    <article key={book.book_id || book.id || index} className="auth-club-card">
                                        <img
                                            src={book.cover_url || defaultCover}
                                            alt={book.title || 'Book cover'}
                                            className="auth-club-cover"
                                        />
                                        <div className="auth-club-copy">
                                            <p className="auth-club-rank">#{index + 1} trending</p>
                                            <h3>{book.title || 'Untitled'}</h3>
                                            <p>by {book.author || 'Unknown Author'}</p>
                                            <small>{book.review_count || 0} public reviews</small>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>
                </aside>

                <div className="auth-form-panel">
                    <div className="auth-form-header">
                        <p className="auth-form-kicker">Welcome</p>
                        <h2>{mode === 'login' ? 'Sign in to your account' : 'Create your account'}</h2>
                    </div>

                    <form className="auth-form" onSubmit={handleSubmit}>
                        {mode === 'register' && (
                            <>
                                <label htmlFor="username">Username</label>
                                <input id="username" name="username" value={form.username} onChange={handleChange} required />

                                <label htmlFor="email">Email</label>
                                <input id="email" type="email" name="email" value={form.email} onChange={handleChange} required />
                            </>
                        )}

                        {mode === 'login' && (
                            <>
                                <label htmlFor="identifier">Username or email</label>
                                <input id="identifier" name="username" value={form.username} onChange={handleChange} required />
                            </>
                        )}

                        <label htmlFor="password">Password</label>
                        <input id="password" type="password" name="password" value={form.password} onChange={handleChange} required />

                        <button type="submit" disabled={loading} className="auth-submit-btn">
                            {loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}
                        </button>
                    </form>

                    <p className="auth-mode-switch">
                        {mode === 'login' ? 'Need an account?' : 'Already have one?'}{' '}
                        <button type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
                            {mode === 'login' ? 'Register' : 'Sign in'}
                        </button>
                    </p>

                    {message && <p className="auth-feedback success">{message}</p>}
                    {error && <p className="auth-feedback error">{error}</p>}

                    <section className="auth-guest-preview" aria-label="Guest preview carousel">
                        <div className="auth-guest-preview-header">
                            <h3>Explore as guest</h3>
                            <span>Top rated books</span>
                        </div>

                        {highlightsLoading ? (
                            <div className="auth-guest-loading">Loading preview books...</div>
                        ) : guestCarouselBooks.length === 0 ? (
                            <div className="auth-guest-empty">Preview will appear once community recommendations are available.</div>
                        ) : (
                            <div className="auth-guest-carousel" role="presentation">
                                <div className="auth-guest-track">
                                    {[...guestCarouselBooks, ...guestCarouselBooks].map((book, index) => (
                                        <article key={`${book.book_id || book.id || index}-guest-${index}`} className="auth-guest-card">
                                            <img src={book.cover_url || defaultCover} alt={book.title || 'Book cover'} className="auth-guest-card-cover" />
                                            <div className="auth-guest-card-copy">
                                                <p>{book.title || 'Untitled'}</p>
                                                <small>{book.author || 'Unknown Author'}</small>
                                                <small className="auth-guest-rating">{Number(book.average_rating || 0).toFixed(1)} ★</small>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </section>
    );
}
