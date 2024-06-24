const rootDir = {root: './views'};

const home = (req, res) => {
    res.sendFile('home.html', rootDir)
};

const channel = (req, res) => {
    res.sendFile('channels.html', rootDir)
};

const invite = (req, res) => {
    res.sendFile('invite.html', rootDir)
};

const login = (req, res) => {
    res.sendFile('auth/login.html', rootDir)
};

const register = (req, res) => {
    res.sendFile('auth/register.html', rootDir)
}

const logout = (req, res) => {
    res.sendFile('auth/logout.html', rootDir)
}

const admin_home = (req, res) => {
    res.sendFile('admin/admin_home.html', rootDir)
};

const admin_user = (req, res) => {
    res.sendFile('admin/admin_user.html', rootDir)
};

module.exports = {home, channel, invite ,login, register, logout, admin_home, admin_user};
