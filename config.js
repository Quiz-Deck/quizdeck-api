module.exports = {
    'port': process.env.PORT || 3000,

    'baseurl': "",
    'database': 'mongodb://127.0.0.1:27017/quizdeck',

    // 'baseurl': "https://quizdeckapp.herokuapp.com",
    // 'database' : 'mongodb+srv://ada-h:ifo2zg53dEW8WfhQ@cluster0.urvrm.mongodb.net/quizdeck?retryWrites=true&w=majority',
    'secret': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InVnd3VhbnlpMDQyQGdtYWlsLmNvbSIsImlhdCI6MTU1NjM2Mzk0OCwiZXhwIjoxNTU2MzY0MzA4fQ',
    'hash' : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InVnd3VhbnlpMDQyQGdtYWlsLmNvbSIsImlhdCI6MTU1NjM2Mzk0OCwiZXhwIjoxNTU2MzY0MzA4fQ.hlvsog5NVcZphKxpJPPBBoMww9XRNZ-_h51osqyBqPg/',
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