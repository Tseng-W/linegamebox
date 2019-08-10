const initOptions = {
    promiseLib: Promise
};

const pgp = require('pg-promise')(initOptions);
const connectionString = 'postgres://yfqwtlcqklltsf:123fcb85f17cc4233729ea77e0fa69e5a8048e5269a6c3af49e576867c59be5d@ec2-174-129-227-205.compute-1.amazonaws.com:5432/dai9s7ljceh6ei';
// const connectionString = process.env.DATABASE_URL;
const db = pgp(connectionString);

// console.log('process.env.DATABASE_URL = '+process.env.DATABASE_URL);

module.exports = {
    getHerosByStar: function(star) {
        db.any(`SELECT * FROM public."HERO_DATA"`)
            .then(data => {

                console.log('data = ', data);
                console.log('data.heroName = ', data[0]);
                console.log('data.star = ', data[1]);
                console.log('data.nickName = ', data[2]);

                return data;
            })
            .catch(err => {
                console.log(err);
            });
    }
};