/*======================================
		Global Variables
======================================*/
var SignedUser = null;
var signUpInfo = {};
//var interests = [];
var moveNext = false;
var myNextPage = 1;
var arrayInterest = [];
var myEmail = null;
var selectedQuestion = null;
var questionCategories = [];
var file = null;

/*======================================
		Firebase initialisation
======================================*/
var firebaseConfig = {
	apiKey: "AIzaSyBxVbJlWDTaD_alHRj-XsbNjQU6jo86U0Q",
	authDomain: "mvpsesyme.firebaseapp.com",
	databaseURL: "https://mvpsesyme.firebaseio.com",
	projectId: "mvpsesyme",
	storageBucket: "mvpsesyme.appspot.com",
	messagingSenderId: "767388610357",
	appId: "1:767388610357:web:f74b60d10055590538267c",
	measurementId: "G-FGF841VKKX"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();
var db = firebase.firestore();
var auth = firebase.auth();
var storage = firebase.storage();
var UsersRef = db.collection("UserDetails");
var QuestionsCollection = db.collection("Questions");
var LikesCollection = db.collection("liked");


/*=====================================
	Loading appropriate functions
======================================*/
window.onload = function(){
	if (sessionStorage.getItem("selectedQuestion") != null) {
		selectedQuestion = sessionStorage.getItem("selectedQuestion");
	}
			var url = window.location.href.split("/");
	    page = url[url.length - 1].trim();
	    switch(page){

	      case "signup.html":
	          loadSignUp();
	      break;

	      case "home.html":
					if(sessionStorage.getItem("user_id") != null)
					{
	          loadQuestionsPage();
					}else
					{
						loadLogIn();
					}
				break;

	      case "replies.html":
					if(sessionStorage.getItem("user_id") != null)
					{
	          loadReplies();
					}else
					{
						loadLogIn();
					}
				break;

	      case "write_question.html":
					if(sessionStorage.getItem("user_id") != null)
					{
	          loadWriteQuestion();
					}else
					{
						loadLogIn();
					}
				break;

	      case "write_reply.html":
						if(sessionStorage.getItem("user_id") != null)
						{
			          loadPostReply();
							}else
							{
								loadLogIn();
							}
					break;

					case "profile.html":
							if(sessionStorage.getItem("user_id") != null)
							{
				          loadProfile();

							}else
							{
								loadLogIn();
							}
					break;
	      default:
	          loadLogIn();
	        break;
	    }


    firebase.auth().onAuthStateChanged(function(user) {
  		if (user) {
				checkSession();
    		myEmail = user.email;
				console.log(user.email);

    		var emailVerified = user.emailVerified;
    		var isAnonymous = user.isAnonymous;
    		var uid = user.uid;
    		if (page == "index.html" || page == "") {
  				window.location.href= "q_and_a/home.html";
  			}else if (page == "signup.html"){
  				window.location.href= "../q_and_a/home.html";
  			}
  		} else {
  			console.log("User is signed out");
  			if (page != "index.html" && page != "" && page != "signup.html") {
  				window.location.href= "../index.html";
  			}
  		}
	});
}

$('#userProfile').on('click', '.logout', function(e){
		firebase.auth().signOut().then(function(){
			sessionStorage.clear();
		});
})

function checkSession()
{
	if(sessionStorage.getItem("user_id") == null)
	{
		firebase.auth().signOut().then(function(){
			sessionStorage.clear();
		});
	}
}

/*======================================
			Sign Up process
=======================================*/
function loadSignUp(){
	pagination();
	$('#email_sign_up').focus();
	$('#email_sign_up').focusout(function(){
		var email = $(this).val().trim();
		var error = null;
		if (validateEmail(email)) {
			signUpInfo.email = email;
		}else{
			error = "Please Enter a valid Email address";
		}
		showSignUpError(error);
	});

	$('#password_sign_up').on('keyup', function(){
		var password = $(this).val().trim();
		if (validatePassword(password)) {
			showSignUpError(null);
		}
	});

	$('#verify_password_sign_up').on('keyup', function(){
		var password = $(this).val().trim();
		verifyPassword();
	});

	$('#fullName_sign_up').focusout(function(){
		var fullname = $(this).val().trim();
		var error = null;
		if(verifyFullname(fullname)){
			signUpInfo.fullname = fullname;
		}
	});

	$('#datepicker_sign_up').focusout(function(){
		var birthDate = $(this).val().trim();
		if(ageRestrict(birthDate))
		{
			signUpInfo.birthDate = birthDate;
		}

	});

	$('#gender_sign_up').change(function(){
		var gender = $(this).val();
		var error = null;
		if(genderVerify(gender)){
			signUpInfo.gender = gender;
		}
	});

	$('#course_sign_up').focusout(function(){
		var course = $(this).val().trim();
		if(verifyCourse(course)){
			signUpInfo.course = course;
		}
	});

	$('#phone_sign_up').focusout(function(){
		var phone = $(this).val().trim();
		if(cellNumberVerify(phone)){
			signUpInfo.phone = phone;
		}
	});

	$('#student_no_sign_up').focusout(function(){
		var studentNo = $(this).val().trim();
		if(verifyStudentNumber(studentNo)){
			signUpInfo.studentNo = studentNo;
		}
	});

	$('#university_selector').change(function(){
		var university = $(this).val();
		if(verifyUniversity(university)){
			signUpInfo.university = university;
		}
	});

	$('#Affiliation_selector').change(function(){
		var affiliation = $(this).val();
		if(verifyAffiliation(affiliation)){
				signUpInfo.affiliation = affiliation;
		}
	});

	$('#select_interests').on('click', '.custom-control-label', function(){
		var id = $(this).closest('.col-md-3').find('input').attr("id");
		tickedInterest(id);
	});


	$('.continue-btn').on('click', function(){

	});
}

function signUpMethod(){
	var email = signUpInfo.email;
	var password = signUpInfo.password;
	console.log(password);
	firebase.auth().createUserWithEmailAndPassword(email, password)
	.then(function(){
		UsersRef.doc(email).set({
			fullname: signUpInfo.fullname,
			dateOfBirth: signUpInfo.birthDate,
			course: signUpInfo.course,
			affiliation: signUpInfo.affiliation,
			university: signUpInfo.university,
			gender: signUpInfo.gender,
			interests: signUpInfo.interests,
			uID: email,
		})
		.then(function(){
			window.location.href = "../q_and_a/home.html";
		}).catch(function(error){
			console.log(error.code + ": " + error.mssage);
		});
	})
	.catch(function(error) {
  		var errorCode = error.code;
  		var errorMessage = error.message;
  		alert("Error Code: " + errorCode + "\n" + "Message: " + errorMessage);
	});
}

function test(){
	console.log("Don't move to next page!");
	return false;
}

function signInWithGoogle(){
	var provider = new firebase.auth.GoogleAuthProvider();
	firebase.auth().signInWithPopup(provider).then(function(result) {
  		// This gives you a Google Access Token. You can use it to access the Google API.
  		var token = result.credential.accessToken;
  		// The signed-in user info.
  		var user = result.user;
  		var email = user.email;
	}).catch(function(error) {
	  	// Handle Errors here.
  		var errorCode = error.code;
  		var errorMessage = error.message;
  		// The email of the user's account used.
  		var email = error.email;
  		// The firebase.auth.AuthCredential type that was used.
  		var credential = error.credential;
  		// ...
	});
}

function getDeviceRegToken(){
	messaging.getToken().then((currentToken) => {
		if (currentToken) {
		    sendTokenToServer(currentToken);
		    updateUIForPushEnabled(currentToken);
		} else {
		    // Show permission request.
		    console.log('No Instance ID token available. Request permission to generate one.');
		    // Show permission UI.
		    updateUIForPushPermissionRequired();
		    setTokenSentToServer(false);
		}
	}).catch((err) => {
		console.log('An error occurred while retrieving token. ', err);
		showToken('Error retrieving Instance ID token. ', err);
		setTokenSentToServer(false);
	});
}

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

function validatePassword(password){
	var error = null;
	if (!(/[A-Z]+/.test(password))) {
		error = "Password must contain at least one capital and one small letter";
	}else if (!specialChars(password)) {
		error = "Password must contain at least one special character, e.g. ! @ # $ % ^ & *";
	}else if (!(/\d/.test(password))) {
		error = "Password must contain a number 0-9";
	}else if (password.length < 7){
		error = "Password too short, Please enter at least 7 characters";
	}else {
		error = null;
	}

	showSignUpError(error);
	if (error != null) {
		return false;
	}else{
		return true;
	}
}

function verifyPassword(){
	var error = null;
	var password = $('#password_sign_up').val();
	var verify_password = $('#verify_password_sign_up').val();

	if(password != verify_password){
		error = "Password does not match";
		showSignUpError(error);
		return false;
	}else{
		showSignUpError(error);
		signUpInfo.password = password;
		return true;
	}
}



function specialChars(password){
	var format = /[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
	if( password.match(format) ){
  		return true;
	}else{
  		return false;
	}
}

function genderVerify(gender){
	if(gender != null)
	{
		return true;
	}else{
		basicInfoErrorDisplay("Please Select your gender");
		return false;
	}
}

function verifyFullname(fullname){
	var firstname = fullname.split(' ').slice(0, -1).join(' ');
	var lastname = fullname.split(' ').slice(-1).join(' ');

	if(fullname.length < 6){
		basicInfoErrorDisplay("Full name is too short");
		return false;
	}

	if(firstname.length > 3 && lastname.length > 3){
		basicInfoErrorDisplay("");
		return true;
	}
}

function ageRestrict(date){
    var thirteenYearsAgo = moment().subtract(13, "years");
    var birthday = moment(date);

    if (!birthday.isValid()) {
        basicInfoErrorDisplay("Your date of birth is compulsory");
        return false;
    }
    else if (thirteenYearsAgo.isAfter(birthday)) {
				basicInfoErrorDisplay("");
        return true;
    }
    else {
        basicInfoErrorDisplay("sorry, you are still young");
        return false;
    }
}

function cellNumberVerify(cellNumber){
	if(isNaN(cellNumber)){
		basicInfoErrorDisplay("Please make sure you provide only numbers");
		return false;
	}else{
		var first_digit = cellNumber.charAt(0);
		if(first_digit == 0){
			if(cellNumber.length == 10){
				basicInfoErrorDisplay("");
				return true;
			}else{
				basicInfoErrorDisplay("Please provide 10 digits");
				return false;
			}
		}else{
			basicInfoErrorDisplay("Your cell number should start with 0");
			return false;
		}
	}

}

function verifyCourse(course)
{
	if(course.length >= 3)
	{
		basicInfoErrorDisplay("");
		return true;

	}else
	{
		basicInfoErrorDisplay("Course name should be at least 3 letters long");
		return false;
	}
}

function verifyStudentNumber(studentNo)
{
	if(isNaN(studentNo))
	{
		basicInfoErrorDisplay("Student number must be only digits");
		return false;
	}else
	{
		if(studentNo.length < 5)
		{
			basicInfoErrorDisplay("Student number must be more than 5 digits");
			return false;
		}else
		{
			basicInfoErrorDisplay("");
			return true;
		}

	}
}

function verifyUniversity(university)
{
	if(university != "")
	{
		basicInfoErrorDisplay("");
		return true;
	}else
	{
		basicInfoErrorDisplay("Please select your university");
		return false;
	}
}

function verifyAffiliation(affiliation)
{
	if(affiliation != "")
	{
		basicInfoErrorDisplay("");
		return true;
	}else
	{
		basicInfoErrorDisplay("Please select your affiliation");
		return false;
	}
}

function basicInfoErrorDisplay(error)
{
	if(error != "")
	{
			$('#basic_info').html("<div class='text-danger'>"+error+"</div>");
			moveNext = false;
	}else
	{
			$('#basic_info').html("<div class='text-danger'>"+error+"</div>");
			moveNext = true;
	}


}

function tickedInterest(interest){
	var interest_that = $('#'+interest).val();
	var idx = $.inArray(interest_that, arrayInterest);
	if (idx == -1) {
	  arrayInterest.push(interest_that);
	} else {
	  arrayInterest.splice(idx, 1);
	}
}

function saveInterest(){
	if(arrayInterest.length > 2){
		signUpInfo.interests = arrayInterest;
		moveNext = true;
		$('#interest_status').html("");
		return true;
	}else{
		$('#interest_status').html("<div class='text-danger'>Please select at least 3 interests</div>");
		moveNext = false;
	}
}




function showSignUpError (error){
	if (error != null) {
		$('#error_message_sign_up').text(error);
		$('#error_message_sign_up').show();
		moveNext = false;
	}else{
		$('#error_message_sign_up').hide();
		moveNext = true;
	}
}


function verifyQuestion(title, description)
{
	var error = "";

	var title_ = title.toLowerCase();

	console.log();

	if(title.length < 6)
	{
		error = "Your question should be at least 6 words long";
	}else if(description.length < 15)
	{
		error = "Your description should be at least 15 words long";
	}else  if(!title_.includes("what") && !title_.includes("how") && !title_.includes("when") &&  !title_.includes("who"))
	 {
		 error = "Your question should contain What or How or When or Who";
	 }else
	 {
	 		error = "";
	 }

	questionStatus(error);
	if(error == "")
	{
		return true;
	}else
	{
		return false;
	}
}

function questionStatus(error)
{
	$('.question_status').html('<div class="text-danger">'+error+'</div>');
}

function verify_reply(description)
{

	var error = "";

	if(description.length < 3)
	{
		error = "Your reply should be at least 3 letters long";
	}else
	 {
	 		error = "";
	 }

	replyStatus(error);
	if(error == "")
	{
		return true;
	}else
	{
		return false;
	}

}

function replyStatus(error)
{
	$('.reply_status').html('<div class="text-danger">'+error+'</div>');
}

function addCategory(value)
{
		console.log(value);
}

function changePage(){

	//sign up
	var email = $('#email_sign_up').val().trim();
	var password = $('#password_sign_up').val().trim();

	//basic information
	var fullname = $('#fullName_sign_up').val().trim();
	var studentNo = $('#student_no_sign_up').val().trim();
	var datepicker = $('#datepicker_sign_up').val();
	var phone = $('#phone_sign_up').val().trim();
	var gender = $('#gender_sign_up').val();
	var course = $('#course_sign_up').val().trim();
	var university = $('#university_selector').val();
	var affiliation = $('#Affiliation_selector').val();

	switch(myNextPage){
		case 1:
			if (password.length > 6 && email.length > 5 && moveNext) {
				moveNext = false;
				return true;
			}else{
				return false;
			}
			break;
		case 2:
			if(verifyFullname(fullname) && verifyStudentNumber(studentNo) && ageRestrict(datepicker)
				&& cellNumberVerify(phone) && genderVerify(gender) && verifyCourse(course)
				&& verifyUniversity(university) && verifyAffiliation(affiliation) && moveNext){
				return true;
			}else{
				return false;
			}
			break;
		case 3:
			return true;
			break;
		case 4:
			if(saveInterest() && moveNext){
				signUpMethod();
				return true;
			}else{
				return false;
			}
			break;
		case 5:
			return true;
			break;
		default:
			return false;
	}
}

function pagination(){
	$('#sesyme_paging').twbsPagination({
		totalPages: 5,
		// the current page that show on start
		startPage: 1,

		moveNextF: changePage,

		// maximum visible pages
		visiblePages: 5,

		initiateStartPageClick: true,

		// template for pagination links
		href: false,

		// variable name in href template for page number
		hrefVariable: '{{number}}',

		// Text labels
		first: null,
		prev: '<i class="fa fa-chevron-left"></i>',
		next: '<i class="fa fa-chevron-right"></i>',
		last: null,

		// carousel-style pagination
		loop: false,

		// callback function
		onPageClick: function (event, page) {
			$('.page-active').removeClass('page-active');
	    	$('#page'+page).addClass('page-active');
	    	currentPage = page;
	    	myNextPage = page;
		},

		// pagination Classes
		paginationClass: 'pagination',
		nextClass: 'next',
		pageClass: 'page',
		activeClass: 'active',
		disabledClass: 'disabled'

		});
}

/*======================================
			Questions Home Page
=======================================*/
function loadQuestionsPage(){
	showLoader();
	QuestionsCollection.orderBy("dateTime", "desc").limit(50)
    .onSnapshot(function(querySnapshot) {
        questions = [];
        users = [];
		$('.questions').empty();
        querySnapshot.forEach(function(doc) {
        	var question = doc.data();
        	question.id = doc.id;
        	var author = question.author;
            addQuestionToArray(questions, question);
            UsersRef.doc(author).get().then(function(userDoc){
        		var user = userDoc.data();
	    		user.uID = userDoc.id;
    			addUserToArray(users, user);
    		});
        });
        setTimeout(function(){
        	questions.forEach(function(question){
        		var author = question.author;
        		populateQuestions(question);
        	});
        }, 1500);
    });

    $('.questions').on('click', '#like_button_home', function(e){
    	e.stopPropagation();
    	var isLiked = $(this).find('i')[0].classList.contains("fa-heart");
    	var id = $(this).closest('.quest1').find('#doc_id')[0].innerHTML;
		var likeId = myEmail + "Like" + id;
		if (isLiked) {
			$(this).find('i').removeClass("fa-heart");
			$(this).find('i').addClass("fa-heart-o");
			LikesCollection.doc(likeId).delete().then(function() {
				QuestionsCollection.doc(id).update({numLikes: firebase.firestore.FieldValue.increment(-1)});
				console.log("Unliked");
			}).catch(function(error) {
    			console.error("Error removing document: ", error);
			});
		}else{
			$(this).find('i').removeClass("fa-heart-o");
			$(this).find('i').addClass("fa-heart");
			LikesCollection.doc(likeId).set({
				likedAt: firebase.firestore.FieldValue.serverTimestamp(),
				likedBy: myEmail,
				postId: id
			}).then(function(){
				QuestionsCollection.doc(id).update({numLikes: firebase.firestore.FieldValue.increment(1)});
				console.log("Liked");
			});
		}
    });

    $('.questions').on('click', '#options_btn', function(e){
    	e.stopPropagation();
    	var x = $(this).closest('.quest-options-btn').find('#dropOptions')[0];
    	if (x.className.indexOf("w3-show") == -1) {
	    	x.className += " w3-show";
	  	} else { 
	    	x.className = x.className.replace(" w3-show", "");
	  	}
    });

    $('.questions').on('focusout', '#options_btn', function(){
        var x = $(this).closest('.quest-options-btn').find('#dropOptions')[0];
    	setTimeout(function(){
        	var focus=$(document.activeElement);
        	if (focus.is(this) || $(this).has(focus).length) {
        	    console.log("still focused");
        	} else {
	    		x.className = x.className.replace(" w3-show", "");
        	}
    	},200);
    	
    });

    $('.questions').on('click', '#optionItem', function(e){
    	e.stopPropagation();
    	var option = $(this).text().trim();
    	var id = $(this).closest('.quest1').find('#doc_id')[0].innerHTML;
    	switch(option){
    		case "Report":
    			ReportPost(id);
    			break;
    		case "Hide":
    			HidePost(id);
    			break;
    		case "Edit":
    			EditPost("Question", id);
    			break;
    		case "Delete":
    			DeletePost(id);
    			break;
    	}
    });

    $('.questions').on('click', '.quest1', function(){
    	var id = $(this).closest('.quest1').find('#doc_id')[0].innerHTML;
    	sessionStorage.setItem("selectedQuestion", id);
    	window.location.href = "replies.html";
    });

    $('.interests-nav-link').click( function(){
    	var id_for = $(this).text();
		QuestionsCollection.where("category", "array-contains", id_for).limit(50)
	    .onSnapshot(function(querySnapshot) {
	        questions = [];
	        users = [];
			$('.questions').empty();
	        querySnapshot.forEach(function(doc) {
	        	var question = doc.data();
	        	question.id = doc.id;
	        	var author = question.author;
	            addQuestionToArray(questions, question);
	            UsersRef.doc(author).get().then(function(userDoc){
	        		var user = userDoc.data();
		    		user.uID = userDoc.id;
	    			addUserToArray(users, user);
	    		});
	        });
	        setTimeout(function(){
	        	questions.forEach(function(question){
	        		populateQuestions(question);
	        	});
	        }, 1500);
	    });
    });

    $('.write-questionBtn').on('click', function(){
    	sessionStorage.removeItem("EditQuestion");
    	window.location.href = "write_question.html";
    });
}

function addQuestionToArray(arr, obj){
	const index = arr.findIndex((e) => e.id === obj.id);
	if (index == -1) {
		arr.push(obj);
	}else{
		arr[index] = obj;
	}
}

function addUserToArray(arr, obj){
	const index = arr.findIndex((e) => e.uID === obj.uID);
	if (index == -1) {
		arr.push(obj);
	}else{
		arr[index] = obj;
	}
}

function getUserDetails(arr, email){
	const index = arr.findIndex((e) => e.uID === email);
	if (index == -1) {
		return null;
	}else{
		return arr[index];
	}
}

function ReportPost(id){
	sessionStorage.setItem("ReportQuestion", id);
    window.location.href = "../profile/feedback.html";
}

function HidePost(id){
	console.log("Hide: " + id);
}

function EditPost(type, id){
	if (type == "Question") {
		sessionStorage.setItem("EditQuestion", id);
    	window.location.href = "write_question.html";
	}else{
		sessionStorage.setItem("EditReply", id);
    	window.location.href = "write_reply.html";
	}
}

function DeletePost(id){
	QuestionsCollection.doc(id).delete();
}

function populateQuestions(question){
	var authorDetails = getUserDetails(users, question.author);
	var id = question.id;
	var likeId = myEmail + "Like" + id;
	var likeClass = "fa-heart-o";
	var title = question.title;
	var description = question.description;
	var author = question.author;
	var comments = question.numComments;
	var likes = question.numLikes;
	var accepted = question.accepted;
	var time = question.dateTime.toDate().toLocaleString("en-CA");
	var timeToShow = moment(time, "YYYY-MM-DD, h:mm:ss a").fromNow();
	var attType = question.attType;
	var category = question.category;
	var categories = "#" + category.join(" #");
	var isEdited = question.edited;
	var image = question.imageUrl;
	var style = "width: 100%; height: 300px; margin-bottom: 5px;";
	var edit_status = "";

	if(edited)
	{
		edit_status = "Edited";
	}
	if (image == null) {
		style = "display: none;";
	}
	var options = ["Report", "Hide"];
	if (myEmail == author) {
		options = ["Edit", "Delete"];
	}
	var edited = "";
	if (isEdited) {
		edited = "edited";
	}	
	var type = question.type;
	var name = "Unknown";
	var userImage = "../img/profilePic.jpg";
	if (authorDetails != null) {
		var name = authorDetails.fullName;
		var userImage = authorDetails.profileUrl;
	}

	LikesCollection.doc(likeId).get().then((docSnapshot) =>{
		if (docSnapshot.exists) {
			likeClass = "fa-heart";
		}
		var questionHtml = '<div class="quest1">\
				<p hidden id="doc_id">'+id+'</p>\
				<div class="author">\
				    <div class="caption">\
				        <div class="author-details">\
				            <img src='+userImage+' alt="Names profile picture" class="avatar" style="width: 40px; height: 40px;">\
				            <div class="name">'+name+'</div> <span class="edited">'+edited+'</span><br/>\
				            <div class="time"><i class="fa fa-clock-o"></i>'+timeToShow+'</div>\
				            <div class="w3-dropdown-click quest-options-btn">\
				            	<button type="button" class="btn" id="options_btn"><i class="fa fa-chevron-down"></i></button>\
				            	<div id="dropOptions" class="w3-dropdown-content w3-bar-block w3-border">\
				            		<a class="w3-bar-item w3-button" id="optionItem">'+options[0]+'</a>\
				   					<a class="w3-bar-item w3-button" id="optionItem">'+options[1]+'</a>\
				            	</div>\
				            </div>\
				        </div>\
					</div>\
				</div>\
				<div class="quest-header">\
					<h2>'+title+'</h2>\
					<ul class="categoryTags">\
						<li><a>'+categories+'</a></li>\
					</ul>\
				</div>\
				<div class="quest-discription">\
					<p>'+description+'</p>\
				</div>\
				<img class="postImage" src="'+image+'" alt="../img/cover.jpg" style="'+style+'"></image>\
				<div class="quest-footer">\
					<div class="likes-and-replays pb-2">\
						<span><i class="fa fa-heart"></i> '+likes+'</span>\
						<span class="w3-right">'+comments+' Replies</span>\
					</div>\
					<div class="user-action pt-3 pb-3 w3-center">\
						<a id="like_button_home" class="w3-left">\
							<i class="fa '+likeClass+'"></i>&nbsp;&nbsp;&nbsp;Like\
						</a>\
						<a id="reply_button_home">\
							<i class="fa fa-comment"></i>&nbsp;&nbsp;&nbsp;Replies\
						</a>\
						<a class="w3-right">\
							<i class="fa fa-share"></i>&nbsp;&nbsp;&nbsp;Share\
						</a>\
					</div>\
				</div>\
			</div>'
		$('.questions').append(questionHtml);
	});
	hideLoader();
}

/*======================================
			Replies Page
=======================================*/
function loadReplies(){
	if (selectedQuestion == null) {
		console.log("Nop");
		return;
	}
	QuestionsCollection.doc(selectedQuestion).get().then((doc) =>{
		var title = doc.get("title");
		var category = doc.get("category");
		var categories = "#" + category.join(" #");
		var author = doc.get("author");
		var description = doc.get("description");
		var likes = doc.get("numLikes");
		var replies = doc.get("numComments");
		var time = doc.get("dateTime").toDate().toLocaleString("en-CA");
		var tmoment(time, "YYYY-MM-DD, h:mm:ss a").fromNow();
		UsersRef.doc(author).get().then((userDoc) =>{
			var name = userDoc.get("fullName");
			var userImage = userDoc.get("profileUrl");
			if (userImage == null) {
				userImage = "../img/profilePic.jpg";
			}
			var html = '<div class="quest1 w3-card">\
				<div class="author">\
				    <div class="caption">\
				        <div class="author-details">\
				            <img src='+userImage+' alt="Profile picture" class="avatar" style="width: 40px; height: 40px;">\
				            <div class="name">'+name+'</div><br/>\
				            <div class="time"><i class="fa fa-clock-o"></i> '+timeToShow+'</div>\
				            <button type="button" class="btn quest-options-btn"><i class="fa fa-chevron-down"></i></button> \
				        </div>   \
					</div>\
				</div>\
				<div class="quest-header">\
					<h2>'+title+'</h2>\
					<ul class="categoryTags">\
						<li><a>'+categories+'</a></li>\
					</ul>\
				</div>\
				<div class="quest-discription">\
					<p>'+description+'</p>\
				</div>\
				<div class="quest-footer">\
					<div class="user-action pt-1 pb-3 w3-center">\
						<span class="w3-left">\
							'+likes+' Likes\
						</span>\
						<span href="replies.html" >\
							'+replies+' Replies\
						</span>\
						<a class="w3-right">\
							<i class="fa fa-share"></i>&nbsp;&nbsp;&nbsp;Share\
						</a>\
					</div>\
				</div>\
			</div>';
			$('.content').prepend(html);
		});
	});

QuestionsCollection.doc(selectedQuestion).collection("Replies")
	.orderBy("dateTime", "desc").onSnapshot((querySnapshot) =>{
		$('.replies').empty();
		querySnapshot.forEach((doc) =>{
			var id = doc.id;
			var likeId = myEmail + "Like" + id;
			var likeClass = "fa-heart-o";
			var author = doc.get("author");
			var description = doc.get("description");
			var likes = doc.get("numLikes");
			var replies = doc.get("numComments");
			var type = doc.get("type");
			var attachmentType = doc.get("attType");
			var image = doc.get("imageUrl");
			var style = "width: 100%; height: 300px; margin-bottom: 5px;";
			if (image == null) {
				style = "display: none;"
			}else if (attachmentType == "PDF") {
				image = "../img/notes.png";
			}
			var time = doc.get("dateTime").toDate().toLocaleString("en-CA");
			var timeToShow = moment(time, "YYYY-MM-DD, h:mm:ss a").fromNow();
			var options = ["Report", "Hide"];
			if (myEmail == author) {
				options = ["Edit", "Delete"];
			}
			UsersRef.doc(author).get().then((userDoc) =>{
				var name = userDoc.get("fullName");
				LikesCollection.doc(likeId).get().then((docSnapshot) =>{
					if (docSnapshot.exists) {
						likeClass = "fa-heart";
					}
					var html = '<div class="reply1">\
							<p hidden id="doc_id">'+id+'</p>\
							<div class="author">\
							    <div class="caption">\
						        	<div class="author-details"> \
						    	        <div class="name">'+name+'</div><br/>\
							            <div class="time"><i class="fa fa-clock-o"></i>'+timeToShow+'</div>\
				            			<div class="w3-dropdown-click quest-options-btn">\
				            				<button type="button" class="btn" id="options_btn"><i class="fa fa-chevron-down"></i></button>\
				            				<div id="dropOptions" class="w3-dropdown-content w3-bar-block w3-border">\
				            					<a class="w3-bar-item w3-button" id="optionItem">'+options[0]+'</a>\
				   								<a class="w3-bar-item w3-button" id="optionItem">'+options[1]+'</a>\
				            				</div>\
				            			</div>\
							            <div class="reply-type">'+type+'</div>\
						        	</div>\
								</div>\
							</div>\
							<div class="reply-content">\
								<p>'+description+'</p>\
							</div>\
							<img class="postImage" src="'+image+'" alt="This is pdf" style="'+style+'"></image>\
							<div class="reply-footer">\
								<div class="likes-and-replays pb-2">\
									<span><i class="fa fa-heart"></i>'+likes+'</span>\
									<span class="w3-right">'+replies+' Replies</span>\
								</div>\
								<div class="user-action pt-3 pb-4 w3-center">\
									<a id="like_button_replies" class="w3-left">\
										<i class="fa '+likeClass+'"></i>&nbsp;&nbsp;&nbsp;Like\
									</a>\
									<a class="w3-right">\
										<i class="fa fa-share"></i>&nbsp;&nbsp;&nbsp;Share\
									</a>\
								</div>\
							</div>\
						</div>';
					$('.replies').append(html);
				});
			});
		});
	});

	$('.replies').on('click', '#like_button_replies', function(){
		var isLiked = $(this).find('i')[0].classList.contains("fa-heart");
    	var id = $(this).closest('.reply1').find('#doc_id')[0].innerHTML;
		var likeId = myEmail + "Like" + id;
		if (isLiked) {
			$(this).find('i').removeClass("fa-heart");
			$(this).find('i').addClass("fa-heart-o");
			LikesCollection.doc(likeId).delete().then(function() {
				QuestionsCollection.doc(selectedQuestion).collection("Replies")
				.doc(id).update({numLikes: firebase.firestore.FieldValue.increment(-1)});
				console.log("Unliked");
			}).catch(function(error) {
    			console.error("Error removing document: ", error);
			});
		}else{
			$(this).find('i').removeClass("fa-heart-o");
			$(this).find('i').addClass("fa-heart");
			LikesCollection.doc(likeId).set({
				likedAt: firebase.firestore.FieldValue.serverTimestamp(),
				likedBy: myEmail,
				postId: id
			}).then(function(){
				QuestionsCollection.doc(selectedQuestion).collection("Replies")
				.doc(id).update({numLikes: firebase.firestore.FieldValue.increment(1)});
				console.log("Liked");
			});
		}
	});

    $('.replies').on('click', '#options_btn', function(){
    	var x = $(this).closest('.quest-options-btn').find('#dropOptions')[0];
    	if (x.className.indexOf("w3-show") == -1) {
	    	x.className += " w3-show";
	  	} else { 
	    	x.className = x.className.replace(" w3-show", "");
	  	}
    });

    $('.replies').on('focusout', '#options_btn', function(){
        var x = $(this).closest('.quest-options-btn').find('#dropOptions')[0];
    	setTimeout(function(){
        	var focus=$(document.activeElement);
        	if (focus.is(this) || $(this).has(focus).length) {
        	    console.log("still focused");
        	} else {
	    		x.className = x.className.replace(" w3-show", "");
        	}
    	},200);
    	
    });

    $('.replies').on('click', '#optionItem', function(){
    	var option = $(this).text().trim();
    	var id = $(this).closest('.reply1').find('#doc_id')[0].innerHTML;
    	var ref = selectedQuestion + "/Replies/" + id;
    	switch(option){
    		case "Report":
    			ReportPost(ref);
    			break;
    		case "Hide":
    			HidePost(ref);
    			break;
    		case "Edit":
    			EditPost("Reply", ref);
    			break;
    		case "Delete":
    			DeletePost(ref);
    			break;
    	}
    });

	$('.write-reply').on('click', function(){
		sessionStorage.removeItem("EditReply");
		window.location.href = "write_reply.html";
	});
}

/*======================================
			Write Question Page
=======================================*/
function loadWriteQuestion(){
	var EditQuestion = null;
	if (sessionStorage.getItem("EditQuestion") != null) {
		EditQuestion = sessionStorage.getItem("EditQuestion");
		QuestionsCollection.doc(EditQuestion).get().then((doc) =>{
			var title = doc.get("title");
			var description = doc.get("description");
			var category = doc.get("category");
			questionCategories = category;
			var image = doc.get("imageUrl");
			$('#qImage').attr('src', image);
			$('#questionTitle').val(title);
			$('#questionDiscription').val(description);
			$('.select-categories').click();
		});
	}
	$('#post_question').on('click', function(){
		var title = $('#questionTitle').val().trim();
		var description = $('#questionDiscription').val().trim();
		if(verifyQuestion(title, description)){
			postQuestion(title, description);
		}
	});

	$('.image_file').change(function(){
		readURL(this);
	});

	$('#pick_image').on('click', function(){
		$('.image_file').click();
	});

	var autocomplete = new SelectPure(".select-categories", {
    options: [
      	{
        	label: "Auditing",
        	value: "Auditing",
      	},
      	{
        	label: "Business",
        	value: "Business",
      	},
      	{
        	label: "Taxation",
        	value: "Taxation",
      	},
      	{
        	label: "Financial Mathematics",
        	value: "Financial Mathematics",
      	},
      	{
        	label: "Law",
        	value: "Law",
      	},
      	{
        	label: "Statistic",
        	value: "Statistic",
      	},
      	{
        	label: "Management Accounting",
        	value: "Management Accounting",
      	},
				{
					label: "Economics",
					value: "Economics",
				},
				{
					label: "Financial Accounting",
					value: "Financial Accounting",
				},
				{
					label: "Finance",
					value: "Finance",
				},
        ],
        value: false,
        placeholder: ["Click to select categories"],
        multiple: true,
        autocomplete: true,
        icon: "fa fa-times",
        onChange: value => { setCategory(value); },
        classNames: {
			select: "select-pure__select",
			dropdownShown: "select-pure__select--opened",
			multiselect: "select-pure__select--multiple",
			label: "select-pure__label",
			placeholder: "select-pure__placeholder",
			dropdown: "select-pure__options",
			option: "select-pure__option",
			autocompleteInput: "select-pure__autocomplete",
			selectedLabel: "select-pure__selected-label",
			selectedOption: "select-pure__option--selected",
			placeholderHidden: "select-pure__placeholder--hidden",
			optionHidden: "select-pure__option--hidden",
    	}
	});
}

function readURL(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            $('#qImage').attr('src', e.target.result);
        	file = input.files[0];
        }
        reader.readAsDataURL(input.files[0]);
    }
}

function uploadPostImage(file, id, type, attType){
	var uploadTask = storage.ref('Questions/'+id+'.jpg').put(file);
	uploadTask.on('state_changed', function(snapshot){
		var progress = (+(snapshot.bytesTransferred) / +(snapshot.totalBytes)) * 100;
		$('#progress').text((progress).toFixed(2) + " %");
  		console.log('Upload is ' + progress + '% done');
  		switch (snapshot.state) {
    		case firebase.storage.TaskState.PAUSED: // or 'paused'
      			console.log('Upload is paused');
     			break;
    		case firebase.storage.TaskState.RUNNING: // or 'running'
      			console.log('Upload is running');
      			break;
  		}
	}, function(error) {
  		console.log(error);
	}, function() {
  		uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
  			QuestionsCollection.doc(id).update({imageUrl: downloadURL, attType: attType});
  			hideLoader();
  			if (type == "Question") {
  				window.location.href = "home.html";
  			}else{
  				window.location.href = "replies.html";
  			}
  		});
	});
}

function setCategory(newArray){
	if (newArray.length < 4) {
		questionCategories = newArray;
	}else{
		newArray.pop();
		$(".select-pure__selected-label").last().remove();
		showSnackbar("You can only select a maximum of three!");
	}
}

function verifyQuestion(title, description){
	var error = "";

	var title_ = title.toLowerCase();

	if(title.length < 6){
		error = "Your question should be at least 6 words long";
	}else if(description.length < 15){
		error = "Your description should be at least 15 words long";
	}else  if(!title_.includes("what") && !title_.includes("how") && !title_.includes("when") &&  !title_.includes("who")){
		error = "Your question should contain What or How or When or Who";
 	}else if (questionCategories.length == 0) {
 		error = "Please select at least one category";
 	}else{
 		error = "";
 	}

	questionStatus(error);
	if(error == "")
	{
		return true;
	}else
	{
		return false;
	}
}

function questionStatus(error){
	$('.question_status').html('<div class="text-danger">'+error+'</div>');
}

function postQuestion(title, description){
	var d = new Date();
	var id = d.getTime().toString();
	var isEdited = false;
	showLoader();
	if (EditQuestion != null) {
		id = EditQuestion;
		isEdited = true;
		QuestionsCollection.doc(id)
		.set({
			title:title,
			description: description,
			edited: isEdited,
			category: questionCategories,
		}).then(function(){
			if (file != null) {
				uploadPostImage(file, id, "Question");
			}else{
				hideLoader();
				window.location.href = "home.html";
			}
		});
	}else{
		QuestionsCollection.doc(id)
		.set({
			title:title,
			description: description,
			edited: isEdited,
			id: id,
			dateTime: firebase.firestore.FieldValue.serverTimestamp(),
			imageUrl: null,
			numComments: 0,
			numLikes: 0,
			type: "Question",
			category: questionCategories,
			author: myEmail,
			accepted: false,
			attType: null
		}).then(function(){
			if (file != null) {
				uploadPostImage(file, id, "Question", "IMAGE");
			}else{
				hideLoader();
				window.location.href = "home.html";
			}
		});
	}
}

/*======================================
			Write Reply Page
=======================================*/
function loadPostReply(){
	var EditReply = null;
	var attType = null;
	if (sessionStorage.getItem("EditReply") != null) {
		EditReply = sessionStorage.getItem("EditReply");
		QuestionsCollection.doc(EditReply).get().then((doc) =>{
			var description = doc.get("description");
			var image = doc.get("imageUrl");
			// $('#qImage').attr('src', image);
			$('#questionDiscription').val(description);
		});
	}
	
	$('.post-btn').on('click', function(){
		var button = $(this).text().trim();
		var description = $('#questionDiscription').val();
		if(verify_reply(description)){
			var d = new Date();
			var id = d.getTime();
			if (EditReply != null) {
				var segments = EditReply.split("/");
				id = segments[segments.length - 1];
			}
			postReply(button, description, id, attType);
		}
	});

	$('#pick_pdf').on('click', function(){
		$('#pdf_input').click();
	});

	$('#pick_img').on('click', function(){
		$('#img_input').click();
	});

	$('#pdf_input').change(function(e){
		var selectedPdf = e.target.files[0];
		var PdfName = selectedPdf.name;
		var type = selectedPdf.type;
		if (type != "application/pdf") {
			showSnackbar("Please select a pdf or press the image button to select an image");
			return;
		}
		file = selectedPdf;
		attType = "PDF";
		$('#file_name').text(PdfName);
		$('#qImage').attr('src', "../img/notes.png");

	});

	$('#img_input').change(function(e){
		var selectedImg = e.target.files[0];
		var ImgName = selectedImg.name;
		var fileType = selectedImg.type;
		var validImageTypes = ["image/gif", "image/jpeg", "image/png"];
		if ($.inArray(fileType, validImageTypes) < 0) {
		    showSnackbar("Selected file is not an Image");
		    return;
		}
		readURL(this);
		attType = "IMAGE";
		$('#file_name').text(ImgName);
	});
}

function verify_reply(description){

	var error = "";

	if(description.length < 3){
		error = "Your reply should be at least 3 letters long";
	}else{
	 	error = "";
	}

	replyStatus(error);
	if(error == "")
	{
		return true;
	}else
	{
		return false;
	}

}

function replyStatus(error){
	$('.reply_status').html('<div class="text-danger">'+error+'</div>');
}


function postReply(type, description, id, attType){
	showLoader();
	var ref = selectedQuestion + "/Replies/" + id;
	QuestionsCollection.doc(selectedQuestion).collection("Replies").doc(id.toString()).set({
		accepted: null,
		attType: null,
		author: myEmail,
		category: ["Accounting"],
		dateTime: firebase.firestore.FieldValue.serverTimestamp(),
		description: description,
		edited: false,
		imageUrl: null,
		numComments: 0,
		numLikes: 0,
		title: null,
		type: type
	}).then(function(){
		QuestionsCollection.doc(selectedQuestion)
		.update({numComments: firebase.firestore.FieldValue.increment(1)});
		if (file != null) {
				uploadPostImage(file, ref, type, attType);
			}else{
				hideLoader();
				window.location.href = "replies.html";
			}
	});
}


/*=====================================
          PROFILE PAGE
=====================================*/

function loadProfile()
{
	var html = "";
	UsersRef.doc(sessionStorage.getItem("user_id")).get().then(function(user)
	{
		console.log(user);
		var data = user.data();
		var profile_pic = null;
		var cover_pic = null;

		if(data.coverUrl == null)
		{
			cover_pic = "../img/profilePic.jpg";
		}else
		{
			cover_pic = data.coverUrl;
		}

		if(data.profileUrl == null)
		{
			profile_pic = "../img/cover.jpg";
		}else
		{
			profile_pic = data.profileUrl;
		}
		html = `<div class="content mx-auto">
					    <div class="fb-profile">
					        <img align="left" class="fb-image-lg" src=${cover_pic} alt="Cover image"/>
					        <img align="left" class="fb-image-profile thumbnail" src=${profile_pic} alt="Profile image"/>
					        <div class="fb-profile-text">
					            <h1>${data.fullName}</h1>
					            <h4>${data.course}</h4>
					            <h4>${data.university}</h4>
					        </div>

					        <a href="editProfile.html" class="edit-profile-btn">Edit Profile</a>
					    </div>


					    <div class="profile-btn row">
					    	<a href="#" class="col mr-2">Questions</a>
					    	<a href="#" class="col mr-2">Answers</a>
					    	<a href="#reading_stats" class="col open-popup">Reading Stats</a>
					    </div>

					    <div class="manage-account">
					    	<div class="row"><a class="bdr-btm bdr-top">Manage Interests</a></div>
					    	<div class="row"><a class="bdr-btm">Invite Friends</a></div>
					    	<div class="row"><a href="feedback.html" class="bdr-btm">Feedback</a></div>
					    	<div class="row"><a class="bdr-btm settings">Settings</a></div>
					    	<div class="row"><a class="bdr-btm logout">Logout</a></div>
					    </div>
				</div>

				<div id="reading_stats" class="popup">
					<div class="content">
						<div class="header">
							<div class="row">
								<div class="col">
									<h3>Average Rating</h3>
									<p class="rating">2.5</p>
								</div>
							</div>
						</div>

						<div class="row">
							<div class="col-sm-6">
								<div class="pages-read mx-auto">
									<h2>892</h2>
									<p>pages you read so far.</p>
								</div>
							</div>
							<div class="col-sm-6">
								<div class="books-read mx-auto">
									<p>from</p>
									<h2>3</h2>
									<p>Books</p>
								</div>
							</div>
						</div>
						<a href="#" class="popup-close">close</a>
					</div>
				</div>`;
		$('#userProfile').append(html);
	}).catch(function(error)
	{
		console.log(error);
	});


}

/*======================================
						FEEDBACK
======================================*/

$('#report').on('keyup focusout', function()
{
	var report = $(this).val();
	if(report.length < 6)
	{
		show_feedback_status("Your report should be at least 6 letters long");
	}else
	{
		show_feedback_status(null);
	}
});

$('#report_description').on('keyup focusout', function()
{
	var report_description = $(this).val();
	if(report_description.length < 6)
	{
		show_feedback_status("Your report report description should be at least 10 letters long");
	}else
	{
		show_feedback_status(null);
	}
});

$('.feedback-submit').on('click', function(e)
{
	var report = $('#report').val().trim();
	var description = $('#report_description').val().trim();

	if(validate_feedBack(report, description))
	{
		if(send_email(report, description))
		{
			send_email(report, description);
		}
	}else
	{
			validate_feedBack(report, description);
	}

});

function validate_feedBack(report, description)
{
	var error = null;
	if(report.length < 5)
	{
		error = "Report should be at least 6 letters";
	}else if(description.length < 8)
	{
		error = "Report should be at least 9 letters";
	}else
	{
		error = null;
	}

	show_feedback_status(error);
	if(error != null)
	{
		return false;
	}else
	{
			return true;
	}


}

function show_feedback_status(error)
{
		if(error != null)
		{
			$('.feedback_status').html(`<div class="text-danger">${error}</div>`);
		}else
		{
			$('.feedback_status').html("");
		}
}

function send_email(report, description)
{
	Email.send({
	    Host : "smtp.gmail.com",
	    Username : "uhtomeek.music@gmail.com",
	    Password : "MMMaaa232",
			UseDefaultCredentials : true,
	    To : "masibulelemgoqi@gmail.com",
	    From : "uhtomeek.music@gmail.com",
	    Subject : "Feedback",
	    Body : "Report: "+report+"\n\nDescription: "+description
	}).then(
	  message => alert(message)
	);
}

/*======================================
			Login
=======================================*/
function loadLogIn(){
	$('#m_email_sign_in').focus();
	$('#sign_in_error').hide();
	$('#m_email_sign_in').on('keyup', function(key){
		if (key.keyCode == 13) {
			$('#submit_login').click();
		}
	});

	$('#m_password_sign_in').on('keyup', function(key){
		if (key.keyCode == 13) {
			$('#submit_login').click();
		}
	});

	$('#submit_login').on('click', function(){
		$('#sign_in_error').hide();
		var email = $('#m_email_sign_in').val().trim();
		var password = $('#m_password_sign_in').val().trim();
		firebase.auth().signInWithEmailAndPassword(email, password)
		.then(function(){
			sessionStorage.setItem("user_id", email);
			window.location.href = "q_and_a/home.html";
		})
		.catch(function(error) {
  			var errorCode = error.code;
  			var errorMessage = error.message;
  			console.log(errorCode + " : " + errorMessage);
  			var showError = "";
  			switch(errorCode){
  				case "auth/user-not-found":
  					showError = "Invalid information, Please enter correct information or sign up!";
  					break;
  				case "auth/wrong-password":
  					showError = "Invalid information, Please enter correct information or sign up!";
  					break;
  				case "auth/invalid-email":
  					showError = "Invalid Email Format, Please enter correct email adress";
  					break;
  				default:
  					showError = "Something went wrong, Please try again or contact support.";
  			}
  			$('#sign_in_error').text(showError);
  			$('#sign_in_error').show();
		});
	});
}


/*==========================================
				Multi Page
==========================================*/
function showLoader(){
	var loaderHtml = '<div id="loader"><div></div><h4 id="progress"></h4></div>';
	if ($('body').find('#loader').length == 0) {
		$('body').append(loaderHtml);
	}
	$("#loader").addClass("loader");
}

function hideLoader(){
	$("#loader").removeClass("loader");
}

function showSnackbar(text){
	var snackbarHtml = '<div id="snackbar">'+text+'</div>';
	if ($('body').find('#snackbar').length == 0) {
		$('body').append(snackbarHtml);
	}

	var x = document.getElementById("snackbar");

	x.className = "show";

	setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
}
