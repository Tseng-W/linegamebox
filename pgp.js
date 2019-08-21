const initOptions = {
    promiseLib: Promise
};

const pgp = require('pg-promise')(initOptions);
const connectionString = 'postgres://yfqwtlcqklltsf:123fcb85f17cc4233729ea77e0fa69e5a8048e5269a6c3af49e576867c59be5d@ec2-174-129-227-205.compute-1.amazonaws.com:5432/dai9s7ljceh6ei';
// const connectionString = process.env.DATABASE_URL;
const db = pgp(connectionString);

// console.log('process.env.DATABASE_URL = '+process.env.DATABASE_URL);

module.exports = {
    getServantsByStar: async function(star) {
        return db.any(`SELECT * FROM public."servant_data" WHERE star = $1 AND "islimited" IS NOT true`, star)
            .then(data => {
                console.log('PGP.js -------  get data : ', data);
                return (data);
            })
            .catch(err => {
                console.log(err);
                return (err);
            });
    },
    getCurrentPU: async function(name) {
        return db.any(`SELECT * FROM public."servant_data" WHERE "isPickUp" = true`)
            .then(data => {
                console.log('PGP.js -------  get data : ', data);
                return (data);
            })
            .catch(err => {
                console.log(err);
            });
    },
	getServantsByNickName: async function(servantNames){
		let sql = `SELECT * FROM public."servant_data" WHERE `;
		servantNames.forEach(name =>{
			nameSQL += `"servantName" = '`+name+`' or`;
		});
		return db.any(nameSQL)
			.then(data =>{
				return data;
			});
	},
    setPickUpServants: async function(servants, star) {
        return db.any(`UPDATE public."servant_data" SET "isPickUp" = false WHERE "star" = $1`,star)
            .then(data1 => {
                let setPUSql = `UPDATE public."servant_data" SET "isPickUp" = 'true' WHERE "star" = `+star + ' AND (';
                servants.forEach(servant => {
                    if (servant != "")
                        setPUSql += `"nickName" like '%` + servant + `%' or`;
                });
                setPUSql = setPUSql.slice(0, setPUSql.length - 2);
				setPUSql += `)`
                console.log("setPUSql = " + setPUSql);
                return db.any(setPUSql)
                    .then(data2 => {
                        return db.many(`SELECT "servantName" FROM public."servant_data" WHERE "isPickUp" = true`)
                            .then(data3 => {
                                console.log('data3 : ' + data3);
                                return data3;
                            })
                            .catch(err3 => {
                                console.log(err3);
                            });
                    })
                    .catch(err2 => {
                        console.log(err2);
                    });
            })
            .catch(err1 => {
                console.log(err1);
            });
    },
};