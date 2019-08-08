const pgPromise = require('pg-promise')
const pg = 'postgres://yfqwtlcqklltsf:123fcb85f17cc4233729ea77e0fa69e5a8048e5269a6c3af49e576867c59be5d@ec2-174-129-227-205.compute-1.amazonaws.com:5432/dai9s7ljceh6ei';
const db = pgPromise(pg);

module.export = {
    pgPromise, db
};