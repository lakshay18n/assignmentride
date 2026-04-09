const BASE_URL = "https://assignmentride.onrender.com";

const tabLogin = document.getElementById('tab-login');
const tabRegister = document.getElementById('tab-register');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const authError = document.getElementById('auth-error');

if (tabLogin && tabRegister) {
    tabLogin.addEventListener('click', () => {
        tabLogin.classList.add('active');
        tabRegister.classList.remove('active');
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        authError.innerText = '';
    });

    tabRegister.addEventListener('click', () => {
        tabRegister.classList.add('active');
        tabLogin.classList.remove('active');
        registerForm.style.display = 'block';
        loginForm.style.display = 'none';
        authError.innerText = '';
    });
}

const handleAuth = async (endpoint, body, btnId) => {
    const btn = document.getElementById(btnId);
    const originalText = btn.innerText;
    btn.innerText = 'Processing...';
    btn.disabled = true;
    authError.innerText = '';

    try {
        const res = await fetch(`${BASE_URL}/api/auth/${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.message || "Something went wrong");

        localStorage.setItem('token', data.data.token);
        if (data.data.user) {
            localStorage.setItem('username', data.data.user.name);
        }
        window.location.href = 'dashboard.html';
    } catch (err) {
        authError.innerText = err.message;
    } finally {
        btn.innerText = originalText;
        btn.disabled = false;
    }
};

if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        handleAuth('login', { email, password }, 'login-btn');
    });
}

if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('reg-name').value;
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;
        handleAuth('register', { name, email, password }, 'reg-btn');
    });
}

const welcomeUser = document.getElementById('welcome-user');
const logoutBtn = document.getElementById('logout-btn');
const bookForm = document.getElementById('book-form');
const rideHistoryList = document.getElementById('ride-history-list');

if (window.location.pathname.includes('dashboard.html')) {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html';
    } else if (welcomeUser) {
        welcomeUser.innerText = `Hi, ${localStorage.getItem('username') || 'User'}`;
    }
}

if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        localStorage.clear();
        window.location.href = 'index.html';
    });
}

const loadRides = async () => {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${BASE_URL}/api/rides/my-rides`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load rides");

        if (data.success) {
            rideHistoryList.innerHTML = data.data.length ? data.data.map(ride => `
                <div class="ride-card">
                    <div class="ride-info">
                        <div>
                            <div class="ride-route">${ride.pickupLocation} → ${ride.dropLocation}</div>
                            <div class="ride-meta">
                                Fare: $${ride.fare} | 
                                Driver: ${ride.driverId ? ride.driverId.name : 'Searching...'}
                            </div>
                        </div>
                        <span class="status-badge status-${ride.status}">${ride.status}</span>
                    </div>
                    ${(ride.status === 'pending' || ride.status === 'assigned') ? 
                        `<button class="cancel-btn" onclick="cancelRide('${ride._id}')">Cancel Ride</button>` : ''}
                </div>
            `).reverse().join('') : '<p style="color: #666; text-align: center;">No ride history found.</p>';
        }
    } catch (err) {
        console.error(err.message);
    }
};

const cancelRide = async (id) => {
    if (!confirm('Are you sure you want to cancel this ride?')) return;
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${BASE_URL}/api/rides/cancel/${id}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Cancel failed");
        
        loadRides();
    } catch (err) {
        alert(err.message);
    }
};

if (bookForm) {
    bookForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('book-btn');
        const token = localStorage.getItem('token');
        const pickupLocation = document.getElementById('pickup').value;
        const dropLocation = document.getElementById('drop').value;

        btn.innerText = 'Booking...';
        btn.disabled = true;

        try {
            const res = await fetch(`${BASE_URL}/api/rides/create`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ pickupLocation, dropLocation })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Booking failed");

            bookForm.reset();
            loadRides();
        } catch (err) {
            alert(err.message);
        } finally {
            btn.innerText = 'Book Now';
            btn.disabled = false;
        }
    });

    loadRides();
    setInterval(loadRides, 5000);
}
window.cancelRide = cancelRide;
