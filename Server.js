const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const app = express();
const port = 3030;

let digit = 100;

const db = mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "",
    database: "ridetable"
});

app.use(cors());
app.use(express.json())

//Completion Rate EndPoint
app.post('/compRate', (req, res) => {
    let driverId = req.body.Driver_id;
    let m1 = `Your completion rate is very low. You will get suspended if you do not increase your completion rate.`
    let m2 = `Your completion rate is low. You will get less requests if you do not increase your completion rate.`
    let m3 = `Please complete more to get more requests.`
    //DB query
        let ratio = `select count(Status) as CompletedRides from(select Status from ridetable where Rider_ID="${driverId}" order by Timestamp desc limit 100) sub where Status="completed";`;
        let check_assigned = `select count(Status) as count from ridetable where Rider_id="${driverId}"`
        let check_rider = `select name from driverinfotable where driver_id="${driverId}"`

        //Checking if the driver is valid or invalid
        db.query(check_rider, (err, nameResult) => {
            let valid = true;
            if (err) throw err;
            if (nameResult.length == 0) {
                res.json({
                    "Error": "invalid driver id"
                })
                valid =  false;
            }
        
        //Checking if the driver has been assigned 100 rides or not
        db.query(check_assigned, (err, result) => {
            let object = { "completion_rate": 85 / 100 };
            if (err) throw err;
            let count = result[0].count;
            if (count < 100) {
                if(valid){
                    object["name"] = nameResult[0].name;
                }
                object["message"] = m3;
                res.json(object);
            }
        })
        //Sending the completion ratio to client
        db.query(ratio, (err, result) => {
            if (err) throw err;
            let completed = JSON.stringify(result[0].CompletedRides);
            let object = { "completion_rate": completed / 100 };
            if(valid){
                object["name"] = nameResult[0].name;
            }
            if (completed <= 50) {
                object["message"] = m1;
            } else if (completed <= 70) {
                object["message"] = m2;
            } else {
                object["message"] = m3;
            }
            res.json(object)
        })
    })
})

//Warning Check EndPoint With Ban 
app.post('/checkWarning', (req, res) => {

    let comfort_speed = req.body.comfort_speed;
    let rider_speed = req.body.rider_speed;
    let driver_id = req.body.Driver_id;

    if (rider_speed < comfort_speed + 5) {
        res.json({
            "message": "Hurray!! It was a comfortable ride for your passenger"
        })
    } else {
        let checkWarning = `select warningLevel from driverinfotable where driver_id="${driver_id}"`
        let updateWarning = `update driverinfotable set warningLevel=warningLevel+1 where driver_id="${driver_id}"`
        let banUser = ` update driverinfotable set banned=1,warningLevel=warningLevel+1 where driver_id="${driver_id}"`

            db.query(checkWarning, (err, result) => {
                if (err) throw err;
                let warningLevel = result[0].warningLevel;
                let warningMessage = `Dear Rider, The last ride was not comfortable for your passenger, you have exceeded the comfort speed limit, your current warning level is ${warningLevel + 1}, Please be careful next time. Drive Safe Drive Q`
                let banMessage = `Dear Rider, You have been banned from taking rides for too much warning, Please contact DriveQ support for further info`;
                if (warningLevel < 10) {
                    //Warn User
                    db.query(updateWarning, (err, result) => {
                        if (err) throw err;
                        console.log(result);
                    })
                    res.json({
                        "message": warningMessage
                    });
                } else {
                    //Ban User
                    db.query(banUser, (err, result) => {
                        if (err) throw err;
                        console.log(result);
                    })
                    res.json({
                        "message": banMessage
                    });
                }
            })
    }
});

//Reward check end point
app.post('/checkReward', (req, res) => {
    let driverId = req.body.Driver_id;
        let updateReward = ` update driverinfotable set rewardPoint=rewardPoint+50 where driver_id="${driverId}"`
        let checkReward = `select rewardPoint from driverinfotable where driver_id="${driverId}"`
        let checkLastRides = `select count(Warning) as WarningCount from ( select Warning from ridetable where Rider_ID="${driverId}" and Status="Completed" order by Timestamp desc limit 10 ) sub where Warning=0`

        //checking last rides and updating the reward
        db.query(checkLastRides, (err, result) => {
            if (err) throw err;
            let warningCount = result[0].WarningCount;
            //updating reward if it is zero warning in last 10 rides
            if (warningCount == 0) {
                db.query(updateReward, (err, result) => {
                    if (err) throw err;
                })
            }
        })

        //responding the reward amount to the client
        db.query(checkReward, (err, result) => {
            if (err) throw err;
            console.log(result)
            res.json(result);
        })
})

//Viewing Driver info as User
app.post('/checkDriver', (req,res) => {
    let driver_Id = req.body.Driver_id;
        let checkDriver = `select name,phone,vehicle_id from driverinfotable where driver_id="${driver_Id}"`
        db.query(checkDriver, (err, result) => {
            if (err) throw err;
            res.json(result);
        })
})


//New User Registrar
app.post('/userReg',(req,res) => {
    console.log(req.body);
    let name = req.body.name;
    let phone = req.body.phone;
    let vehicle_id = req.body.vehicle_id;
    let nid = req.body.nid;
    let driver_id = "RIDERID_"+digit;
    let userReg = `insert into driverinfotable (driver_id, nid_number, name, phone, vehicle_id, banned, warningLevel, rewardPoint) VALUES ("${driver_id}", "${nid}", "${name}", "${phone}", "${vehicle_id}", 0, 0, 0)`;
    db.query(userReg,(err)=>{
        if(err){
            res.json({
                "message":"Register Unsuccessfull"
            })
            throw err;
        }else{
            res.json({
                "message":"Registered Successfully"
            })
            digit++;
        }
    })
})



app.use(express.static(__dirname+'/public'));



app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})