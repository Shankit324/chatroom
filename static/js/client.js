const socket = io(); // building connection

const form = document.getElementById('send-container');
const message = document.getElementById('msi');
const nam = document.getElementById('msi1');
const container = document.getElementsByClassName('container')[0];

function dat(c, e, n) {
    const cDecimal = BigInt(c);
    const eDecimal = BigInt(e);
    const nDecimal = BigInt(n);
  
    const result = BigInt((cDecimal**eDecimal)%nDecimal);
    return result;
}

const append = (message, position) => {
  const messageEl = document.createElement('div'); // creating a div
  messageEl.innerText = message; // storing the message
  messageEl.classList.add(position); // adding class to classlist
  container.appendChild(messageEl); // appending the child in html document
};

form.addEventListener('submit', (e) => {
  e.preventDefault();
  let message1 = message.value; // storing the message to be sent in variable message1
  message1 = message1.split(""); // converting to array
  const name = nam.value; // storing the name of the user to whom message is sent
  console.log(name);
  // using map function to store the ascii values of the characters
  let message_encoded = message1.map((val) => {
    return (val.charCodeAt());
  });
  console.log(message_encoded);
  append(`You to ${name}: ${message1.join("")}`, "right"); // using append function to display set message in chat-room
  socket.emit('send', { message: message_encoded, name: name }); // emitting 'send' event from client side (who sends the message)
  message.value = ""; // re-setting the values as empty string: ""
  nam.value = "";
});

const name = prompt("Enter your name to join:"); // taking the name of the user joined as prompt
socket.emit('new-user-joined', name); // emitting the 'new-user-joined' event

socket.on('user-joined', name => {
  if (name != null) {
    append(`${name} joined the chat`, "center"); // to show someone have joined the chst with a message
  }
}); // defining user-joined event

// defining 'receive' event
socket.on('receive', data => {
  console.log(data);
  let a;
  let message = data.message.map((val) => {
    console.log(val);
    a = dat(val, data.d, data.n); 
    // calling dat function to retrieve the ascii values of the characters in the message by using receiver's private key
    console.log(a);
    return String.fromCharCode(Number(a)); // converting ascii value to char
  });
  message = message.join(""); // rebuilding the message
  console.log(message);
  append(`${data.name}: ${message}`, 'left'); // append function is use to show the message received
});

socket.on('left', name => {
  if (name != null) append(`${name} left the chat`, "disconnect"); // to give a leaving message when anyone left the chat
});