const urlBase = "http://leineckerspages.xyz/LAMPAPI";
const extension = "php";
/*need to add validation functions for signup and apss and username */
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
    ";expires=" +
    date.toGMTString();
}

function readCookie() {
  userId = -1;
  let data = document.cookie;
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
  } else {
    document.getElementById("userName").innerHTML =
      "Logged in as " + firstName + " " + lastName;
  }
}

// document.getElementById("addUserButton").addEventListener("click", openAddContactForm);
//   document.getElementById("addButton").addEventListener("click", doAddContact);
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
        let jsonObject = JSON.parse(xhr.responseText);
        if (jsonObject.error) {
          document.getElementById("addResult").innerHTML = jsonObject.error;
          return;
        }
        userId = jsonObject.id;
        firstName = jsonObject.firstName;
        lastName = jsonObject.lastName;
        document.getElementById("addResult").innerHTML =
          "Contact successfully added";

        document.getElementById("cFirstName").value = "";
        document.getElementById("cLastName").value = "";
        document.getElementById("cPhoneNumber").value = "";
        document.getElementById("cEmail").value = "";
        //saveCookie();
      }
    };
    xhr.send(jsonPayload);
  } catch (err) {
    document.getElementById("addResult").innerHTML = err.message;
  }
}

//logoout
//delete
//update
//search

function doSearch() {
  let srch = document.getElementById("searchInput"); //get user imput
  document.getElementById("searchResult").innerHTML = ""; //clear prev searrch

  //nothing to search
  if (srch === "") {
    return;
  }

  let userList = "";

  let tmp = {
    search: srch,
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
        let jsonObject = JSON.parse(xhr.responseText);
        let users = document.getElementById("userlist");

        for (let i = 0; i < jsonObject.results.length; i++) {
          userList += jsonObject.results[i];
          if (i < jsonObject.results.length - 1) {
            userList += "<br />\r\n";
          }
        }

        document.getElementsByTagName("p")[0].innerHTML = userList;
      }
    };
    xhr.send(jsonPayload);
  } catch (err) {
    document.getElementById("searchResult").innerHTML = err.message;
  }
}

/* 4331paradise's search ftn... above search is based on leineckers code.js
function searchContacts() {
  const content = document.getElementById("searchText");
  const selections = content.value.toUpperCase().split(" ");
  const table = document.getElementById("contacts");
  const tr = table.getElementsByTagName("tr"); // Table Row

  for (let i = 0; i < tr.length; i++) {
    const td_fn = tr[i].getElementsByTagName("td")[0]; // Table Data: First Name
    const td_ln = tr[i].getElementsByTagName("td")[1]; // Table Data: Last Name

    if (td_fn && td_ln) {
      const txtValue_fn = td_fn.textContent || td_fn.innerText;
      const txtValue_ln = td_ln.textContent || td_ln.innerText;
      tr[i].style.display = "none";

      for (selection of selections) {
        if (txtValue_fn.toUpperCase().indexOf(selection) > -1) {
          tr[i].style.display = "";
        }
        if (txtValue_ln.toUpperCase().indexOf(selection) > -1) {
          tr[i].style.display = "";
        }
      }
    }
  }
}

*/

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
      errors.email = "Email must be in email@mail.com format";
    }
  }
  if (Object.keys(errors).length > 0) {
    const errorMessages = Object.values(errors).join("<br>");
    document.getElementById("addResult").innerHTML = errorMessages;
    return false;
  }

  return true;
}
