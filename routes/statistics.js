const express = require('express');
const router = express.Router();
const moment = require('moment');

const run_query = require('../lib/run_query');


const get_date_from_expression = date_expression => {
    switch(date_expression) {
        case 'A week ago':
            return moment().subtract(1, 'weeks').toISOString();
        case 'A month ago':
            return moment().subtract(1, 'months').toISOString();
        case 'Three months ago':
            return moment().subtract(3, 'months').toISOString();
        case 'Six months ago':
            return moment().subtract(6, 'months').toISOString();
        case 'A year ago':
            return moment().subtract(1, 'years').toISOString();
        default:
            return '';                          
    }
};

router.get('/', (req, res) => {
    const list_countries_query = "SELECT country AS Country, count(disease) AS Cases FROM Tweets GROUP BY country order by 2 desc limit 5";
    return run_query(list_countries_query)
        .then(result => {
            let countries = [];
            result.forEach(({ Country }) => countries.push(Country));
            countries.push('Romania');
            return res.render('../views/statistics', { countries });
        })
});

router.get('/diseases', (req, res) => {
    let country_clause = [];
    if(typeof req.query.country === 'string') {
        country_clause.push(`'${req.query.country}'`);
    } else {
        req.query.country.forEach(country => {
            country_clause.push(`'${country}'`);
        });
    }
    const list_top_diseases_query = `SELECT country, disease AS Disease, count(disease) AS Cases FROM Tweets where country in (${country_clause.join(',')}) GROUP BY country, disease order by 1 asc, 3 desc limit 5`;
    return run_query(list_top_diseases_query)
        .then(result => {
            res.setHeader('Content-Type', 'application/json');
            let diseases = [];
            result.forEach(({ Disease }) => diseases.push(Disease));
            res.end(JSON.stringify({ diseases }));
        })
});

router.get('/bar-chart', (req, res) => {
    let countries = [];
    req.query.country.forEach(country => {
        countries.push(`'${country}'`)
    });
    const timestamp_value = get_date_from_expression(req.query.timestamp);
    let timestamp_query = '';
    if(timestamp_value) timestamp_query = `AND create_date >=  '${timestamp_value}'`;
    const list_diseases_by_country_query = `
        SELECT create_date, disease, country, count(disease) AS cases
        FROM Tweets
        WHERE country in (${countries.join(',')}) AND disease like '${req.query.disease}' ${timestamp_query}
        GROUP BY country
        ORDER BY cases desc
    `;

    return run_query(list_diseases_by_country_query)
        .then(result => {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ diseases: result }));
        });
});

router.get('/doughnut-chart', (req, res) => {
    let diseases = [];
    req.query.disease.forEach(disease => {
        diseases.push(`'${disease}'`)
    });
    const timestamp_value = get_date_from_expression(req.query.timestamp);
    let timestamp_query = '';
    if(timestamp_value) timestamp_query = `AND create_date >=  '${timestamp_value}'`;
    const list_diseases_by_country_query = `
        SELECT create_date, disease, country, count(disease) AS cases
        FROM Tweets
        WHERE country like '${req.query.country}' AND disease in (${diseases.join(',')}) ${timestamp_query}
        GROUP BY disease
        ORDER BY cases desc
    `;

    return run_query(list_diseases_by_country_query)
        .then(result => {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ diseases: result }));
        });
});


router.get('/grouped-bar-chart', (req, res) => {
    let countries = [];
    let diseases = [];
    req.query.country.forEach(country => countries.push(`'${country}'`));
    req.query.disease.forEach(disease => diseases.push(`'${disease}'`));
    const timestamp_value = get_date_from_expression(req.query.timestamp);
    let timestamp_query = '';
    if(timestamp_value) timestamp_query = `AND create_date >=  '${timestamp_value}'`;
    const list_diseases_query = `
    SELECT create_date, country, count(disease) AS cases
    FROM Tweets
    WHERE country in (${countries.join(',')}) AND disease in (${diseases.join(',')})${timestamp_query}
    GROUP BY country
    ORDER BY cases desc
    `;
    return run_query(list_diseases_query)
        .then(result => {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ diseases: result }));
        });
});

router.get('/onetoone-chart', (req, res) => {
    const timestamp_value = get_date_from_expression(req.query.timestamp);
    let timestamp_query = '';
    if(timestamp_value) timestamp_query = `AND create_date >=  '${timestamp_value}'`;
    if(req.query.timestamp.toString()=="A week ago"){
        var list_diseases_query = `select DAYNAME(create_date) as timestamp, disease, country, COUNT(create_date) as cases
        from Tweets
        where disease like '${req.query.disease}' AND country like '${req.query.country}' ${timestamp_query}
        group by timestamp
        order by timestamp desc
    `;}
    else if(req.query.timestamp.toString()=="A month ago"){
        var list_diseases_query = `select WEEKOFYEAR(create_date) as timestamp, disease, country, COUNT(create_date) as cases
        from Tweets
        where disease like '${req.query.disease}' AND country like '${req.query.country}' ${timestamp_query}
        group by timestamp
        order by timestamp
        `;}
    else {
        var list_diseases_query = `select MONTHNAME(create_date) as timestamp, disease, country, COUNT(create_date) as cases
        from Tweets
        where disease like '${req.query.disease}' AND country like '${req.query.country}' ${timestamp_query}
        group by timestamp
        order by timestamp
        `;}

    return run_query(list_diseases_query)
        .then(result => {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ diseases: result }));
        });
});


module.exports = router;