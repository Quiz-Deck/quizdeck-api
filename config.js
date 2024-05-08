module.exports = {
    'port': process.env.PORT || 3000,

    'database': process.env.DATABASE || 'mongodb://127.0.0.1:27017/quizdeck',
    'secret': process.env.SECRET_KEY,
    'hash' : process.env.HASH,
    generateCode: function () {
        var length = 10,
            charset = "01234567890ABCDEFGHIJKLMNOPQRSTUVWXY",
            retVal = "";
        for (var i = 0, n = charset.length; i < length; ++i) {
            retVal += charset.charAt(Math.floor(Math.random() * n));
        }
        return retVal;
    },

    validateEmail: function (email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    },
}