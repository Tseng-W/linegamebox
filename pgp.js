const initOptions = {
    promiseLib: Promise
};

const pgp = require('pg-promise')(initOptions);
const connectionString = 'postgres://yfqwtlcqklltsf:123fcb85f17cc4233729ea77e0fa69e5a8048e5269a6c3af49e576867c59be5d@ec2-174-129-227-205.compute-1.amazonaws.com:5432/dai9s7ljceh6ei';
// const connectionString = process.env.DATABASE_URL;
const db = pgp(connectionString);

// console.log('process.env.DATABASE_URL = '+process.env.DATABASE_URL);

module.exports = {
    getHerosByStar: async function(star) {
        return db.any(`SELECT * FROM public."HERO_DATA" WHERE star = $1 AND "islimited" IS NOT true`, star)
            .then(data => {
                console.log('PGP.js -------  get data : ', data);
                return(data);
            })
            .catch(err => {
                console.log(err);
                return(err);
            });
    },
    getHerosByName: async function(name){
    	return db.any(`SELECT * FROM public."HERO_DATA" WHERE "nickName" LIKE '%`+name+`%'`)
    		.then(data =>{
                console.log('PGP.js -------  get data : ', data);
                return(data);
    		})
    		.catch(err=>{
    			console.log(err);
    		});
    },
	setPickUpHeros: async function(heros){
		return db.any(`UPDATE public."HERO_DATA" SET "isPickUp" = false`)
			.then(data1 =>{
				let setPUSql = `update public."HERO_DATA" SET "isPickUp" = 'true' WHERE `;
				heros.forEach(hero=>{
					setPUSql += `"nickName" = '%`+hero+`%' or`;
				});
				setPUSql = setPUSql.slice(0,setPUSql.length-2);
				console.log("setPUSql = "+setPUSql);
				return db.any(setPUSql)
					.then(data2=>{
						return db.any(`SELECT "heroName" FROM public."HERO_DATA" WHERE "isPickUp" = true`)
							.then(data3 =>{
								console.log('data3 : '+data3);
								return data3;
							})
							.catch(err3=>{
								console.log(err3);
							});
					})
					.catch(err2=>{
						console.log(err2);
					});
			})
			.catch(err1=>{
				console.log(err1);
			});
	},
};