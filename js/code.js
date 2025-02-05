const urlBase = "http://leineckerspages.xyz/LAMPAPI";
const extension = "php";
let userId = 0;
let firstName = "";
let lastName = "";

function doLogin() {
  userId = 0;
  firstName = "";
  lastName = "";

  let login = document.getElementById("loginName").value;
  let password = document.getElementById("loginPassword").value;

  if (login === "" || password === "") {
    document.getElementById("loginResult").innerHTML =
      "Please fill in all fields.";
    return;
  }
  document.getElementById("loginResult").innerHTML = "";

  let hash = md5(password);

  let tmp = { login: login, password: hash };
  //let tmp = {login:login,password:hash};
  let jsonPayload = JSON.stringify(tmp);

  let url = urlBase + "/Login." + extension;

  let xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
  try {
    xhr.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        console.log("Server Response:", xhr.responseText);
        let jsonObject = JSON.parse(xhr.responseText);
        userId = jsonObject.id;

        if (userId < 1) {
          document.getElementById("loginResult").innerHTML =
            "User/Password combination incorrect";
          return;
        }

        firstName = jsonObject.firstName;
        lastName = jsonObject.lastName;
        saveCookie();

        window.location.href = "color.html";
      }
    };
    xhr.send(jsonPayload);
  } catch (err) {
    document.getElementById("loginResult").innerHTML = err.message;
  }
}

//event listeners fro clicking on the form to replace the onclick attributes
document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("hideLogin").addEventListener("click", openReg);
  document.getElementById("showLogin").addEventListener("click", closeReg);
});

//openReg --> upon clicking sign up here lnik, close login form and open register form
function openReg(event) {
  event.preventDefault();
  document.getElementById("loginForm").style.display = "none";
  document.getElementById("registerForm").style.display = "flex";
}
//closeReg --> upon clicking return to login link, close register form and open login form
function closeReg(event) {
  //click rehister link to view sign up form
  event.preventDefault();
  document.getElementById("registerForm").style.display = "none";
  document.getElementById("loginForm").style.display = "flex";
}

function doRegister() {
  //retrieve input field info
  firstName = document.getElementById("newFname").value;
  lastName = document.getElementById("newLname").value;
  let userName = document.getElementById("newUser").value;
  let password = document.getElementById("newPass").value;

  //checking for whether the inputted info in the sign up field is valid
  if (!validateRegister(firstName, lastName, userName, password)) {
    return;
  }
  let hash = md5(password);
  document.getElementById("signupResult").innerHTML = ""; //clearing any potential error mesages

  //creating payload obj from the inputted info
  let tmp = {
    firstName: firstName,
    lastName: lastName,
    login: userName,
    password: hash,
  };

  let jsonPayload = JSON.stringify(tmp); //convert obj to string obj
  let url = urlBase + "/Register." + extension; //tells us where to go
  let xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8"); //tells servre its retrieving json obj

  try {
    xhr.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        let jsonObject = JSON.parse(xhr.responseText);

        if (jsonObject.error) {
          document.getElementById("signupResult").innerHTML = jsonObject.error;
          return;
        }
        //   userId = jsonObject.id;
        document.getElementById("signupResult").innerHTML = "User added";
        firstName = jsonObject.firstName;
        lastName = jsonObject.lastName;
        saveCookie();
      }
    };
    xhr.send(jsonPayload);
  } catch (err) {
    document.getElementById("signupResult").innerHTML = err.message;
  }
}

function saveCookie() {
  let minutes = 20;
  let date = new Date();
  date.setTime(date.getTime() + minutes * 60 * 1000);
  document.cookie =
    "firstName=" +
    firstName +
    ",lastName=" +
    lastName +
    ",userId=" +
    userId +
    ",expires=" +
    date.toGMTString();
}

function readCookie() {
  userId = -1;
  let data = document.cookie;
  console.log(document.cookie);
  let splits = data.split(",");
  for (var i = 0; i < splits.length; i++) {
    let thisOne = splits[i].trim();
    let tokens = thisOne.split("=");
    if (tokens[0] == "firstName") {
      firstName = tokens[1];
    } else if (tokens[0] == "lastName") {
      lastName = tokens[1];
    } else if (tokens[0] == "userId") {
      userId = parseInt(tokens[1].trim());
    }
  }

  if (userId < 0) {
    window.location.href = "index.html";
  }
}

// document.getElementById("addUserButton").addEventListener("click", openAddContactForm);
document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("addButton").addEventListener("click", doAddContact);
});
//
//   document.querySelector(".closeForm").addEventListener("click", closeAddContactForm);

//then once clicking on the x button, add from disappears and contact form retunrs

function openAddContactForm() {
  document.getElementById("overlay").style.display = "flex";
  document.getElementById("entireContactSection").style.display = "flex";
}

function closeAddContactForm() {
  document.getElementById("overlay").style.display = "none";
  document.getElementById("entireContactSection").style.display = "none";
}

function doAddContact() {
  readCookie();
  let firstName = document.getElementById("cFirstName").value;
  let lastName = document.getElementById("cLastName").value;
  let phone = document.getElementById("cPhoneNumber").value;
  let email = document.getElementById("cEmail").value;

  if (!validateAdd(firstName, lastName, phone, email)) {
    return;
  }

  let tmp = {
    userId: userId,
    firstName: firstName,
    lastName: lastName,
    phone: phone,
    email: email,
  };

  let jsonPayload = JSON.stringify(tmp);
  let url = urlBase + "/AddContact." + extension;
  let xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

  try {
    xhr.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        console.log("contact has been added.");

        /*  if (jsonObject.error) {
          document.getElementById("addResult").innerHTML = jsonObject.error;
          return;
        }*/
        document.getElementById("addResult").innerHTML =
          "Contact successfully added";

        document.getElementById("cFirstName").value = "";
        document.getElementById("cLastName").value = "";
        document.getElementById("cPhoneNumber").value = "";
        document.getElementById("cEmail").value = "";

        //add card here
        addRow(jsonPayload);
        //saveCookie();
      }
    };
    xhr.send(jsonPayload);
  } catch (err) {
    document.getElementById("addResult").innerHTML = err.message;
  }
}

function addRow(jsonPayload) {
  const contactJSON = JSON.parse(jsonPayload); //the json info but put back as a json object
  //retrieve the element containing all of our cards
  const cards = document.querySelector(".contactCards");

  const singleCard = document.createElement("div"); //ref. the html divs..
  singleCard.className = "singleCard";

  const singleCardInfo = document.createElement("div");
  singleCardInfo.className = "singleCardInfo";

  const contactInfo = `
       <div class="contactName">
           <h3>${contactJSON.firstName} ${contactJSON.lastName}</h3>
       </div>
       <div class="contactDetails">
           <p><strong>Phone:</strong> ${contactJSON.phone}</p>
           <p><strong>Email:</strong> ${contactJSON.email}</p>
       </div>
       <div class="cardActions">
           <button onclick="editContact(this)" class="editBtn">Edit</button>
           <button onclick="deleteContact(this)" class="deleteBtn">Delete</button>
       </div>
   `;

  //Change the HTML content of an element with id="demo":  https://www.w3schools.com/Jsref/prop_html_innerhtml.asp
  singleCardInfo.innerHTML = contactInfo;

  //append to existing card(s) (they will be in a list formatting iirc)
  singleCard.appendChild(singleCardInfo);
  cards.appendChild(singleCard);
}

//logoout
//delete
//update

function doSearch() {
  readCookie();
  let searchString = document.getElementById("searchInput").value;
  if (searchString == "") return;

  let tmp = {
    search: searchString,
    userId: userId,
  };

  let jsonPayload = JSON.stringify(tmp);

  let url = urlBase + "/SearchContacts." + extension;

  let xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
  try {
    xhr.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        document.getElementById("searchResult").innerHTML =
          "User has been retrieved";
        console.log(xhr.responseText);
        let jsonObject = JSON.parse(xhr.responseText);
      }
    };
    xhr.send(jsonPayload);
  } catch (err) {
    document.getElementById("searchResult").innerHTML = err.message;
  }
}

//validation functions
function validateRegister(firstName, lastName, userName, password) {
  let errors = {};

  //fname val
  if (firstName === "") {
    errors.firstName = "Please enter a first name";
  }

  //lname val
  if (lastName === "") {
    errors.lastName = "Please enter a last name";
  }
  //uname val
  if (userName === "") {
    errors.userName = "Please enter a username";
  } else {
    let usernameRegex = /(?=.*[a-zA-Z])([a-zA-Z0-9-_]).{3,18}$/;
    if (!usernameRegex.test(userName)) {
      errors.userName =
        "Username must be 3-18 characters and contain at least one letter";
    }
  }

  //passwrod vall
  if (password === "") {
    errors.password = "Please enter a password";
  } else {
    let passwordRegex = /(?=.*\d)(?=.*[A-Za-z])(?=.*[!@#$%^&*]).{8,32}/;
    if (!passwordRegex.test(password)) {
      errors.password =
        "Password must be 8-32 characters with at least one letter, number, and special character";
    }
  }
  if (Object.keys(errors).length > 0) {
    const errorMessages = Object.values(errors).join("<br>");
    document.getElementById("signupResult").innerHTML = errorMessages;
    return false;
  }

  return true;
}

//validate add contact
function validateAdd(firstName, lastName, phone, email) {
  let errors = {};

  //fname val
  if (firstName === "") {
    errors.firstName = "Please enter a first name";
  }

  //lname val
  if (lastName === "") {
    errors.lastName = "Please enter a last name";
  }
  //phone val
  if (phone === "") {
    errors.phone = "Please enter a phone number";
  } else {
    let phoneRegex = /^\d+$/; //nums, 10-11 char
    if (!phoneRegex.test(phone)) {
      errors.phone = "Only numbers allowed";
    }
  }

  //email vall
  if (email === "") {
    errors.email = "Please enter an email";
  } else {
    let emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(email)) {
      errors.email = "Email must be in name@mail.com format";
    }
  }
  if (Object.keys(errors).length > 0) {
    const errorMessages = Object.values(errors).join("<br>");
    document.getElementById("addResult").innerHTML = errorMessages;
    return false;
  }

  return true;
}

//validate login
function validLoginForm(loginUser, loginPass) {}

doFlowerAnimation();
{
  var falling = true;

  TweenLite.set("#container", { perspective: 600 });
  //TweenLite.set("img",{xPercent:"-50%",yPercent:"-50%"})

  var total = 10;
  var container = document.getElementById("container"),
    w = window.innerWidth,
    h = window.innerHeight;

  for (i = 0; i < total; i++) {
    var Div = document.createElement("div");
    var Div2 = document.createElement("div");
    var Div3 = document.createElement("div");
    TweenLite.set(Div, {
      attr: { class: "dot" },
      x: R(0, w),
      y: R(-200, -150),
      z: R(-200, 200),
      xPercent: "-50%",
      yPercent: "-50%",
    });
    TweenLite.set(Div2, {
      attr: { class: "dot2" },
      x: R(0, w),
      y: R(-200, -150),
      z: R(-200, 200),
      xPercent: "-50%",
      yPercent: "-50%",
    });
    TweenLite.set(Div3, {
      attr: { class: "dot3" },
      x: R(0, w),
      y: R(-200, -150),
      z: R(-200, 200),
      xPercent: "-50%",
      yPercent: "-50%",
    });
    container.appendChild(Div);
    container.appendChild(Div2);
    container.appendChild(Div3);
    animm(Div);
    animm2(Div2);
    animm3(Div3);
  }

  function animm(elm) {
    TweenMax.to(elm, R(6, 15), {
      y: h + 100,
      ease: Linear.easeNone,
      repeat: -1,
      delay: -15,
    });
    TweenMax.to(elm, R(4, 8), {
      x: "+=100",
      rotationZ: R(0, 180),
      repeat: -1,
      yoyo: true,
      ease: Sine.easeInOut,
    });
    TweenMax.to(elm, R(2, 8), {
      repeat: -1,
      yoyo: true,
      ease: Sine.easeInOut,
      delay: -5,
    });
  }
  function animm2(elm) {
    TweenMax.to(elm, R(6, 15), {
      y: h + 100,
      ease: Linear.easeNone,
      repeat: -1,
      delay: -25,
    });
    TweenMax.to(elm, R(4, 8), {
      x: "+=100",
      rotationZ: R(0, 180),
      repeat: -1,
      yoyo: true,
      ease: Sine.easeInOut,
    });
    TweenMax.to(elm, R(2, 8), {
      repeat: -1,
      yoyo: true,
      ease: Sine.easeInOut,
      delay: -5,
    });
  }
  function animm3(elm) {
    TweenMax.to(elm, R(6, 15), {
      y: h + 100,
      ease: Linear.easeNone,
      repeat: -1,
      delay: -5,
    });
    TweenMax.to(elm, R(4, 8), {
      x: "+=100",
      rotationZ: R(0, 180),
      repeat: -1,
      yoyo: true,
      ease: Sine.easeInOut,
    });
    TweenMax.to(elm, R(2, 8), {
      repeat: -1,
      yoyo: true,
      ease: Sine.easeInOut,
      delay: -5,
    });
  }

  function R(min, max) {
    return min + Math.random() * (max - min);
  }
}
