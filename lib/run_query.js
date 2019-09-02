const mysql = require('mysql');

module.exports = query => new Promise((resolve, reject) => {
    const connecion = mysql.createConnection({
        host: '85.122.23.50',
        user: 'andrei.gherasim',
        password: 'HGYHyr4kMWkr1Q5A',
        database: 'andrei.gherasim'
    });

    return connecion.query(query, (error, result) => {
        connecion.end();
        if(error) return reject(error);
        return resolve(result);
    })
});