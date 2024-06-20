const rootDir = {root: './views'};

const home = (req, res) => {
    res.sendFile('home.html', rootDir)
};

module.exports = {home};
