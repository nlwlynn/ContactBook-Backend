import _ from "lodash";

const urlBase = "http://leineckerspages.xyz/LAMPAPI";
const extension = "php";
let userId = 0;
let firstName = "";
let lastName = "";

//let contactCache = [];
//let lastFetchTime = 0;
//const CACHE_DURATION = 60000;
// document.getElementById("addUserButton").addEventListener("click", openAddContactForm);

//this set of code initializes event listeners
// openreg = open sign up form, closereg does the oppsoite
//one for logout just leads the user back to the login page upon clicking the button but maybe more functionalty
//bc its not actually logging out, its just redirecting the user
document.addEventListener("DOMContentLoaded", function () {
  loadContacts(); //loads existing contacts from database. without this , the contacts on teh screen kept disappearing
  document.getElementById("hideLogin").addEventListener("click", openReg);
  document.getElementById("showLogin").addEventListener("click", closeReg);
  document.getElementById("logOut").addEventListener("click", function () {
    window.location.href = "http://www.leineckerspages.xyz/index.html";
  });

  //event listener for the "X" button on the addcontact form. should probaly put this in a ftn but its not necssary ..
  document
    .querySelector(".closeForm")
    .addEventListener("click", closeAddContactForm);

  document.getElementById("searchInput")?.addEventListener("input", doSearch);
});

function doLogin() {
  userId = 0;
  firstName = "";
  lastName = "";

  //retrievese the login credentials entered into the username and password fields
  let login = document.getElementById("loginName").value;
  let password = document.getElementById("loginPassword").value;

  //if the user doesnt enter anythng and still clicks the login button, this message appears
  if (login === "" || password === "") {
    document.getElementById("loginResult").innerHTML =
      "Please fill in all fields.";
    return;
  }
  document.getElementById("loginResult").innerHTML = ""; //clears the space where that "please fill in all fields"
  //alert would have appeared, if it does

  let hash = md5(password); //password hashing using md5.js

  let tmp = { login: login, password: hash }; //creating payload using the information from above
  let jsonPayload = JSON.stringify(tmp);

  let url = urlBase + "/Login." + extension; //creating url using the urlbase @ top of document and "login.php"

  let xhr = new XMLHttpRequest(); //xhr is an object that will be used to send and receive data from the server
  xhr.open("POST", url, true); //prepares request [like, packages it in a box]
  xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8"); //tell server its being sent info in json format
  try {
    xhr.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        //our req has been fulfilled and server responded w 200
        console.log("Server Response:", xhr.responseText); //uhhh this cud b deleted but i had it  for debugging
        let jsonObject = JSON.parse(xhr.responseText);
        userId = jsonObject.id; //extract the id from our jsonobj for validation

        if (userId < 1) {
          //basically means login failed
          document.getElementById("loginResult").innerHTML =
            "User/Password combination incorrect";
          return;
        }

        firstName = jsonObject.firstName;
        lastName = jsonObject.lastName;
        saveCookie(); //otherwise we save the info in the cookie for the users login info

        window.location.href = "color.html"; //and redirectthe user to where the contact cards are
      }
    };
    xhr.send(jsonPayload); //the actual sending of rrequests to the server. "xhr.open("POST", url, true);" is asynchronous so
  } catch (err) {
    document.getElementById("loginResult").innerHTML = err.message;
  }
}

//openReg --> upon clicking sign up here link, close login form and open register form
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

  //creating payload obj from the inputted info, same stuff from the login function
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
  xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

  try {
    xhr.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        let jsonObject = JSON.parse(xhr.responseText);

        if (jsonObject.error) {
          document.getElementById("signupResult").innerHTML = jsonObject.error;
          return;
        }
        //   userId = jsonObject.id; i commented this out bc i dont believe its necessary? like im not validating anything here
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

  console.log("USERID READ COOKIE: " + userId);

  if (userId < 0) {
    window.location.href = "index.html";
  }
}

//adding and closing of the contact form
function openAddContactForm() {
  document.getElementById("overlay").style.display = "flex";
  document.getElementById("entireContactSection").style.display = "flex";
}

function closeAddContactForm() {
  document.getElementById("overlay").style.display = "none";
  document.getElementById("entireContactSection").style.display = "none";
}

//adding a new contact to our db
function doAddContact() {
  readCookie(); //checking user session; if diff user or its expired i think

  //get the info from the input fiedls
  let firstName = document.getElementById("cFirstName").value;
  let lastName = document.getElementById("cLastName").value;
  let phone = document.getElementById("cPhoneNumber").value;
  let email = document.getElementById("cEmail").value;

  //thisi s the regex stuff.. making sure we have numbers where nums should be and so on
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

        if (jsonObject.error) {
          document.getElementById("addResult").innerHTML = jsonObject.error;
          return;
        }
        document.getElementById("addResult").innerHTML =
          "Contact successfully added";

        //clear the input fields after weve properly added a user
        document.getElementById("cFirstName").value = "";
        document.getElementById("cLastName").value = "";
        document.getElementById("cPhoneNumber").value = "";
        document.getElementById("cEmail").value = "";

        //displays the newly made contact card
        addRow(jsonPayload);
        //saveCookie();
      }
    };
    xhr.send(jsonPayload);
  } catch (err) {
    document.getElementById("addResult").innerHTML = err.message;
  }
}

//add new contact card
function addRow(jsonPayload) {
  //the console log statements r from my debuggin u can delete or keep them if youd like

  console.log("Raw JSON Payload:", jsonPayload);
  const contactJSON = JSON.parse(jsonPayload); //the json info but put back as a json object bc we converted it to a JSON string
  //whats WEIRD here is that the server, though it receives info in lowercase (firstName), when it responds, it is w FirstName
  //hence why the below stuff is FirstName, Phone, so on.. i think bc the php casing is inconsistent
  console.log("Parsed Contact Data:", contactJSON);
  //retrieve the element containing all of our cards

  //if we;re missing any info frm the server
  if (
    !contactJSON.FirstName ||
    !contactJSON.LastName ||
    !contactJSON.Phone ||
    !contactJSON.Email
  ) {
    console.error("Missing required information:", contactJSON);
    return;
  }

  const cards = document.querySelector(".contactCards"); //retrieving the HTML container that will hold all our cards

  //this creates the actual card containers createElement creates new elements/cards "Dynamically" aka directly into the dom.
  //meanign u can style them in the styles.css as long as u use the classnames .singleCard, .singleCardInfo, and so on
  const singleCard = document.createElement("div"); //ref. the html divs..
  singleCard.className = "singleCard";

  //another container for contact info SPECIFICALLY (like the area where phone, names, etc).
  const singleCardInfo = document.createElement("div");
  singleCardInfo.className = "singleCardInfo";

  //actual html for the card info
  const contactInfo = `
       <div class="contactName">
          <h3 data-firstname="${contactJSON.FirstName}" data-lastname="${contactJSON.LastName}">
                ${contactJSON.FirstName} ${contactJSON.LastName}
            </h3>
       </div>
       <div class="contactDetails">
           <p><strong>Phone:</strong> ${contactJSON.Phone}</p>
           <p><strong>Email:</strong> ${contactJSON.Email}</p>
       </div>
       <div class="cardActions">
           <button onclick="updateCard(this)" class="editBtn">Edit</button> 
           <button onclick="deleteCard(this)" class="deleteBtn">Delete</button>
       </div>
   `;

  //Change the HTML content of an element with id="demo":  https://www.w3schools.com/Jsref/prop_html_innerhtml.asp
  singleCardInfo.innerHTML = contactInfo; //in other words setting the inner html of the stuff in the contaiber

  // I am adding this because its too annoying to figure out how to get the first and last names from the html - Brian
  singleCard.setAttribute("fname", contactJSON.FirstName);
  singleCard.setAttribute("lname", contactJSON.LastName);

  //append to existing card(s) (they will be in a list formatting iirc)
  singleCard.setAttribute("ccID", contactJSON.ID); //add unique id that we'll be using in updateCard and delete as well
  singleCard.appendChild(singleCardInfo); //actually adding to the div w cards, first the card info
  cards.appendChild(singleCard); //then the entire card.
  // they have to be added in this hierarchy so that the card is sturctured properly (not incomplete or empty). inner elements, then outer
}

//logoout
document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("logOut").addEventListener("click", function () {
    window.location.href = "http://www.leineckerspages.xyz/index.html";
  });
});

//update
function updateCard(editBtn) {
  //see the html in addRow. this ftn is called when the edit button is clicked
  const card = editBtn.closest(".singleCard"); //find parent card containing the contact info

  //get allll the elements of the addcontact form
  //bc im actually reusing the addContact for edit.
  const formLabel = document.querySelector(".formLabel");
  const newFname = document.getElementById("cFirstName");
  const newLname = document.getElementById("cLastName");
  const newPhone = document.getElementById("cPhoneNumber");
  const newEmail = document.getElementById("cEmail");
  const addButton = document.getElementById("addButton");
  const resultSpan = document.getElementById("addResult");

  //retrieve the info from the card that contaisn the info we want to change
  const nameElement = card.querySelector(".contactName h3");
  const phoneElement = card.querySelector(".contactDetails p:first-child");
  const emailElement = card.querySelector(".contactDetails p:last-child");

  //changing the ui from addContacts [temporarily] to edit
  formLabel.textContent = "Edit Contact";
  addButton.textContent = "Save Changes";

  //addd the original info in the card to our copied form
  newFname.value = nameElement.getAttribute("data-firstname");
  newLname.value = nameElement.getAttribute("data-lastname");
  newPhone.value = phoneElement.textContent.replace("Phone:", "").trim();
  newEmail.value = emailElement.textContent.replace("Email:", "").trim();

  //and now display the changed addcontact form as an edit form
  document.getElementById("overlay").style.display = "flex";
  document.getElementById("entireContactSection").style.display = "flex";

  //inner function so we can access all thes tuff from above without making a separate ftn
  const handleEdit = function () {
    const updateData = {
      ID: card.getAttribute("ccID"),
      userId: userId,
      FirstName: newFname.value,
      LastName: newLname.value,
      Phone: newPhone.value,
      Email: newEmail.value,
    };

    if (
      //reemmber my note abt the casing of the js object... also this is just the same logic/code from login, register, add
      !validateAdd(
        updateData.FirstName,
        updateData.LastName,
        updateData.Phone,
        updateData.Email
      )
    ) {
      return;
    }

    let jsonPayload = JSON.stringify(updateData);
    let url = urlBase + "/UpdateContact." + extension;

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

          //updating the contact card now.
          // ALL  the stuff inside the xhr.onreadystatechange does NOT happen until the server processes
          //the sent request ("xhr.send(jsonPayload);")
          //so dont let the ordering confuse u
          nameElement.textContent = `${updateData.FirstName} ${updateData.LastName}`;
          nameElement.setAttribute("data-firstname", updateData.FirstName);
          nameElement.setAttribute("data-lastname", updateData.LastName);
          phoneElement.innerHTML = `<strong>Phone:</strong> ${updateData.Phone}`; //i kept inner html cuz i had <strong> but this
          //can be removed once styles.css styles this stuff
          emailElement.innerHTML = `<strong>Email:</strong> ${updateData.Email}`;

          document.getElementById("addResult").innerHTML =
            "Contact successfully updated";

          //now that we're done using the addContact-form-turned-edit-form, we put things back where we found them
          //by changing the form title back, changing the save changes button back to add button, clearing the input sfields, etc.
          document.getElementById("overlay").style.display = "none";
          document.getElementById("entireContactSection").style.display =
            "none";

          formLabel.textContent = "Add Contact";
          addButton.textContent = "Add";
          document.getElementById("addContactForm").reset();

          //also restoring the og event handling so we can use it to add contacts
          addButton.removeEventListener("click", handleEdit);
          addButton.addEventListener("click", doAddContact);
        }
      };
      xhr.send(jsonPayload);
    } catch (err) {
      document.getElementById("addResult").innerHTML = err.message;
    }
  };

  addButton.removeEventListener("click", doAddContact);
  addButton.addEventListener("click", handleEdit);

  document.querySelector(".closeForm").addEventListener("click", function () {
    formLabel.textContent = "Add Contact";
    addButton.textContent = "Add";
    document.getElementById("addContactForm").reset();
    document.getElementById("addResult").innerHTML = "";

    addButton.removeEventListener("click", handleEdit);
    addButton.addEventListener("click", doAddContact);
  });
}
//so whenever i refreshed, the contact cards would all disappear. this lads  them when the page loads by fetching the info from the database
function loadContacts() {
  readCookie();

  let tmp = {
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
        console.log("API Response:", xhr.responseText); //raw resonse

        let jsonObject = JSON.parse(xhr.responseText);
        console.log("Parsed JSON:", jsonObject); //parsed JSON

        //clear exisiitng card
        document.querySelector(".contactCards").innerHTML = "";

        jsonObject.results.forEach((contact) => {
          console.log("Contact Data:", contact);
          //render each card
          addRow(JSON.stringify(contact));
        });
      }
    };
    xhr.send(jsonPayload);
  } catch (err) {
    console.error("Unable to retrieve contact s", err);
  }
}

//delete
function deleteCard(deleteBtn) {
  // find button parent
  const card = deleteBtn.closest(".singleCard");

  // jsonning
  let tmp = {
    userId: userId,
    firstName: card.getAttribute("fname"),
    lastName: card.getAttribute("lname"),
    id: card.getAttribute("ccID"),
  };

  let jsonPayload = JSON.stringify(tmp);
  console.log(jsonPayload);
  let url = urlBase + "/DeleteContact." + extension;

  let xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

  try {
    xhr.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        console.log("API Response:", xhr.responseText); //raw response

        let jsonObject = JSON.parse(xhr.responseText);
        if (jsonObject.error) {
          console.log("Failed to delete!");
          return;
        }
        console.log("Parsed JSON:", jsonObject); //parsed JSON

        // clear the card
        card.innerHTML = "";
      }
    };
    xhr.send(jsonPayload);
  } catch (err) {
    console.error("Unable to retrieve contact s", err);
  }
}

const doSearch = _.debounce(function () {
  readCookie();
  let searchString = document.getElementById("searchInput").value;
  if (searchString == "") {
    loadContacts();
    return;
  }

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
        console.log("API Response:", xhr.responseText);

        let jsonObject = JSON.parse(xhr.responseText);
        console.log("Parsed JSON:", jsonObject);

        // 1. clear the guys
        // uhhhhhh
        const cards = document.querySelector(".contactCards");
        cards.innerHTML = "";

        // 2. display the matching guys
        let numResults = 0; // number of search results retrieved
        // this is for checking if we got any so we can msg if we didn't

        // add rows for the results that the search applies to
        // TODO: the forEach seems bugged when nothing is returned(?)
        jsonObject.results.forEach((contact) => {
          numResults++;
          console.log("Contact Data:", contact);
          addRow(JSON.stringify(contact));
        });

        // report info
        if (numResults > 0) {
          document.getElementById("searchResult").innerHTML =
            "User(s) have been retrieved";
        } else {
          document.getElementById("searchResult").innerHTML =
            "Unable to find a user matching the search string.";
        }

        console.log(xhr.responseText);
      }
    };
    xhr.send(jsonPayload);
  } catch (err) {
    document.getElementById("searchResult").innerHTML = err.message;
  }
}, 300);

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

/*
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
*/
