const urlBase = 'http://leineckerspages.xyz/LAMPAPI';
const extension = 'php';
/*need to add validation functions for signup and apss and username */
let userId = 0;
let firstName = "";
let lastName = "";

function doLogin()
{
	userId = 0;
	firstName = "";
	lastName = "";
	
	let login = document.getElementById("loginName").value;
	let password = document.getElementById("loginPassword").value;
    let hash = md5( password );
	
	document.getElementById("loginResult").innerHTML = "";

	let tmp = {login:login,password:hash};
      //let tmp = {login:login,password:hash};
	let jsonPayload = JSON.stringify( tmp );
	
	let url = urlBase + '/Login.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4 && this.status == 200) 
			{
				let jsonObject = JSON.parse( xhr.responseText );
				userId = jsonObject.id;
		
				if( userId < 1 )
				{		
					document.getElementById("loginResult").innerHTML = "User/Password combination incorrect";
					return;
				}
		
				firstName = jsonObject.firstName;
				lastName = jsonObject.lastName;

				saveCookie();
	
				window.location.href = "color.html";
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		document.getElementById("loginResult").innerHTML = err.message;
	}

}

//click rehister link to view sign up form
document.getElementById("hideLogin").addEventListener("click", function(event){
    event.preventDefault();
    document.getElementById("loginForm").style.display="none";
    document.getElementById("registerForm").style.display="flex";
});

//click rehister link to view sign up form
document.getElementById("showLogin").addEventListener("click", function(event){
    event.preventDefault();
    document.getElementById("registerForm").style.display="none";
    document.getElementById("loginForm").style.display="flex";
});


function doRegister(){
    
    //input field info
firstName = document.getElementById("newFname").value;
lastName = document.getElementById("newLname").value;
let userName=document.getElementById("newUser").value;
let password = document.getElementById("newPass").value;

if (!validSignUpForm(firstName, lastName, userName, password)) {
    document.getElementById("signupResult").innerHTML = "Invalid signup data";
    return;
}

//md5 hashing
let hash=md5(password);
document.getElementById("signupResult").innerHTML = "";

let tmp= {
    firstName: firstName,
    lastName: lastName,
    login:userName,
    password: hash
}; //paylodo bject

let jsonPayload = JSON.stringify(tmp);
let url = urlBase + '/Register.' + extension;
let xhr = new XMLHttpRequest();
xhr.open("POST", url, true);
xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

try {
    xhr.onreadystatechange = function() {
        if(this.readyState == 4 && this.status == 200) {
            let jsonObject = JSON.parse(xhr.responseText);
            
            if(jsonObject.error) {
                document.getElementById("signupResult").innerHTML = jsonObject.error;
                return;
            }
            userId = jsonObject.id;
            document.getElementById("signupResult").innerHTML = "User added";
            firstName = jsonObject.firstName;
            lastName = jsonObject.lastName;
            saveCookie();
            
            document.getElementById("newFname").value = "";
            document.getElementById("newLname").value = "";
            document.getElementById("newUser").value = "";
            document.getElementById("newPass").value = "";
        }
    };
    xhr.send(jsonPayload);
}catch(err){
    document.getElementById("signupResult").innerHTML = err.message;
}


}


function saveCookie()
{
	let minutes = 20;
	let date = new Date();
	date.setTime(date.getTime()+(minutes*60*1000));	
	document.cookie = "firstName=" + firstName + ",lastName=" + lastName + ",userId=" + userId + ";expires=" + date.toGMTString();
}

function readCookie()
{
	userId = -1;
	let data = document.cookie;
	let splits = data.split(",");
	for(var i = 0; i < splits.length; i++) 
	{
		let thisOne = splits[i].trim();
		let tokens = thisOne.split("=");
		if( tokens[0] == "firstName" )
		{
			firstName = tokens[1];
		}
		else if( tokens[0] == "lastName" )
		{
			lastName = tokens[1];
		}
		else if( tokens[0] == "userId" )
		{
			userId = parseInt( tokens[1].trim() );
		}
	}
	
	if( userId < 0 )
	{
		window.location.href = "index.html";
	}
	else
	{
		document.getElementById("userName").innerHTML = "Logged in as " + firstName + " " + lastName;
	}
}

