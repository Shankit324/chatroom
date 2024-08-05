const http = require('http'); //importing http to create server for socket.IO integration
const express = require("express"); // importing express
const path = require('path');
const app = express();
const server = http.createServer(app);
const { Server } = require('socket.io'); // importing socket.io library
const io = new Server(server); // creating new Server

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.resolve('./static'))); //generating static file

app.get('/', (req, res)=>{
    res.sendFile(path.resolve('./static/index.html'));
}) // sending index.html file to / path

app.get('/users', (req, res)=>{
    let list = "";
    for(let i=0; i<users.length; i++){
        list += users[i].Name;
        if(i < users.length-1) list += ", ";
    }
    res.send(`<h2><div style="font-size: larger";>Total number of members present: ${users.length}<br>Names of the members present: ${list}</div><h2>`);
})

function is_prime(number){
    if(number<2) return false;
    for(let i=2; i<Math.pow(number, 1/2)+1; i++){
        if(number%i == 0) return false
    }
    return true
} //function to check whether a number is prime or not

// Implementing RSA algorithm
function dat(c, e, n) {
    const cDecimal = BigInt(c); // Using BigInt to handle large integers
    const eDecimal = BigInt(e);
    const nDecimal = BigInt(n);
  
    const result = BigInt((cDecimal**eDecimal)%nDecimal);
    return result;
}

function generate_random(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
} // function to generate random numbers between min and max 

function generate_prime(min_val, max_val){
    let prime = generate_random(min_val, max_val);
    while(!is_prime(prime)) prime = generate_random(min_val, max_val);
    return prime;
} // function to generate random prime number between min_val and mac_val

function gcd(a, b){
    while(a!=0){
        t = a;
        a = (b%a);
        b = t;
    }
    return b;
} // function to find gcd using Euclidean Algorithm
    

function mod_inverse(e, phi){
    for(let d=3; d<phi; d++){
        if (((d*e)%phi)==1) return d;
    }
    throw new Error("mod_inverse does not exist");
} // function to generate a number d (such that d>2 and d<phi) and e*d is congruent to 1 (mod phi) 

const users = []; // Creating an array to store the data of all the users joining in the chat room

// on connection this event runs
io.on('connection', socket => {
    // triggers new event named as 'new-user-joined' when a new user joins
    socket.on('new-user-joined', name => {
        console.log("New User joined:", name);
        let p = generate_prime(50, 500); // generating two prime numbers p & q such that p is not equal to q
        let q = generate_prime(50, 500); 
        while(p==q){
            p = generate_prime(50, 500);
        }
        let n = p*q; 
        let phi_n = (p-1)*(q-1); // It is no of co-prime number less than (application of Euler's Toshian Function)
        // generating e which is actually the public key of a user (such that e>2 and e<phi_n) and e and phi_n is co-prime
        let e = generate_random(3, phi_n-1); 
        while (gcd(e, phi_n)!=1) e = generate_random(3, phi_n-1);
        let d = mod_inverse(e, phi_n); // generating d using using mod_inverse function which is actually private key of a user
        if(name!=null){
            users.push({
            ID: socket.id,
            Name: name,
            public_key: e,
            private_key_e: d,
            punlic_key_n: n,
            }) // pushing a new user
        }
        if(name!=null) socket.broadcast.emit('user-joined', name); // triggering 'user-joined event'
    });

    socket.on('send', data => {
        let obj;
        for(let i=0; i<users.length; i++){
            if(socket.id==users[i].ID){
                obj = users[i];
                break;
            }
        } // storing current user details in obj variable
        let e, id, n, i, d;
        for(i=0; i<users.length; i++){
            if(data.name==users[i].Name){
                d = users[i].private_key_e;
                id = users[i].ID;
                n = users[i].punlic_key_n;
                e = users[i].public_key;
                break;
            }
        } // Storing the details of the user to whom the current user is sending the message
        console.log("e:", e, "n:", n);
        let ciphertext = data.message.map((val) => {
            console.log(val);
            return Number(dat(val, e, n));
        }); // converting the message to cipher text using dat function and the receiver's public key 'e'
        console.log(ciphertext);
        if(obj!=undefined && obj.Name!=null){
            console.log("d:", d, "n:", n);
            if(obj!=undefined && obj.Name!=null){
                console.log("id:", id, "name:", users[i].Name);
                console.log(users);
                socket.to(id).emit('receive', {message: ciphertext, name: obj.Name, d: d, n: n}); 
                // emitting receive event to send message from current user to a particular user with id 
                //(which is actually the socket id of that user)
            }
        }
    });
    // on disconnect this event will run
    socket.on('disconnect', () => {
        let obj;
        let i;
        for(i=0; i<users.length; i++){
            if(socket.id==users[i].ID){
                obj = users[i];
                break;
            }
        }
        if(obj!=undefined && obj.Name!=null) socket.broadcast.emit('left', obj.Name); 
        // leaving message is broadcasted to all other clients
        users.splice(i, 1); // removing the left user details froms users array
    })
})

server.listen(9000, ()=>{
    console.log('server running at http://localhost:9000');
}) // setting the listening port to 9000
