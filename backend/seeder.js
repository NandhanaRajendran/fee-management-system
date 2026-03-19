const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Student = require('./models/Student');

dotenv.config({ path: './.env' });
connectDB();

const roomsData = {
"1101":[{ name:"Anjana" },{ name:"Devika" },{ name:"Sreya" }],
"1102":[{ name:"Megha" },{ name:"Lakshmi" }],
"1103":[{ name:"Athulya Babu" },{ name:"Aswathy A" },{ name:"Nandhana" },{ name: "Tiyana"}],
"1104":[{ name:"Arya" },{ name:"Gayathri" }],
"1105":[{ name:"Meera" },{ name:"Sneha" },{ name:"Diya" }],
"1106":[{ name:"Anu" },{ name:"Reshma" }],
"1107":[{ name:"Krishna" },{ name:"Gopika" }],
"1108":[{ name:"Aiswarya" },{ name:"Sandra" }],
"1109":[{ name:"Nimisha" },{ name:"Fathima" }],
"1110":[{ name:"Maria" },{ name:"Helen" }],
"1111":[{ name:"Anagha" },{ name:"Bhavana" }],
"1112":[{ name:"Keerthana" },{ name:"Neha" }],
"1113":[{ name:"Amrutha" },{ name:"Nitya" }],
"1114":[{ name:"Divya" },{ name:"Swathi" }]
};

const importData = async () => {
    try {
        await Student.deleteMany();

        const students = [];
        
        for (const [roomNumber, members] of Object.entries(roomsData)) {
            for (const member of members) {
                students.push({
                    name: member.name,
                    room: roomNumber,
                    attendanceRecords: {},
                    messCutRecords: {}
                });
            }
        }

        await Student.insertMany(students);

        console.log('Data Imported!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

importData();
