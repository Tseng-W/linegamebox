const initOptions = {
    promiseLib: Promise
};

const pgp = require('pg-promise')(initOptions);
const connectionString = 'postgres://yfqwtlcqklltsf:123fcb85f17cc4233729ea77e0fa69e5a8048e5269a6c3af49e576867c59be5d@ec2-174-129-227-205.compute-1.amazonaws.com:5432/dai9s7ljceh6ei';
// const connectionString = process.env.DATABASE_URL;
const db = pgp(connectionString);

// console.log('process.env.DATABASE_URL = '+process.env.DATABASE_URL);

module.exports = {
    initalUserData: async function(id) {
        return db.any(`INSERT INTO PUBLIC."user_data" VALUES ('$1',0,0,0,0)`,[id])
            .then(data => {
                console.log(data);
                return "初始化成功~";
            })
            .catch(err => {
                console.log(err);
                return "好像有東西出錯啦！！";
            });
    },
    getUserDataById: async function(id) {
        return db.oneOrNone(`SELECT * FROM PUBLIC."user_data" WHERE "id" = '` + id + `';`)
            .then(data => {
                console.log(data);
                return data;
            })
            .catch(err => { return (err); });
    },
    updateUserDataById: async function(id, drawTimes, s5Pu, s5) {
        return db.any(`UPDATE PUBLIC."user_data" SET `);
    },
    getServants: async function(star, islimited, isPickUp) {
        let sql;
        if (star)
            sql = `SELECT * FROM public."servant_data" WHERE "star" = ` + star;
        else
            sql = `SELECT * FROM public."servant_data" WHERE "star" > 2 `;
        if (islimited == true)
            sql += ` AND "islimited" IS true`;
        else if (islimited == false)
            sql += ` AND "islimited" IS false`;
        if (isPickUp == true)
            sql += ` AND "isPickUp" IS true`;
        else if (isPickUp == false)
            sql += ` AND "isPickUp" IS false`;

        return db.any(sql)
            .then(data => {
                console.log('PGP.js -------  get data : ', data);
                return (data);
            })
            .catch(err => {
                console.log(err);
                return (err);
            });
    },
    getCurrentPU: async function() {
        return db.any(`SELECT * FROM public."servant_data" WHERE "isPickUp" = true`)
            .then(data => {
                console.log('PGP.js -------  get data : ', data);
                return (data);
            })
            .catch(err => {
                console.log(err);
            });
    },
    setPickUpServants: async function(servants) {
        return db.any(`UPDATE public."servant_data" SET "isPickUp" = false`)
            .then(data1 => {
                let setPUSql = `update public."servant_data" SET "isPickUp" = 'true' WHERE `;
                servants.forEach(servant => {
                    if (servant != "")
                        setPUSql += `"nickName" like '%` + servant + `%' or`;
                });
                setPUSql = setPUSql.slice(0, setPUSql.length - 2);
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