const mysql = require('mysql2/promise');
const credentials = {
    host: 'jw1448.brighton.domains',
    user: 'jw1448_STPuser',
    password: '7{1v(0k*sxG=',
    database: 'jw1448_savethepangolin'
};

async function query(sql, params) {
    const connection = await mysql.createConnection(credentials);
    const [results, ] = await connection.execute(sql, params);
    return results;
}

module.exports = {
    query
}
