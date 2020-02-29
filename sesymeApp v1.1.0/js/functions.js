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
var myInterests = [];
var savedHighlights = [];
var file = null;
var currentPage;
var pageNum = 2;
var selectedMenuItem = null;

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
var Notifications = db.collection("Notifications");


/*=====================================
	Loading appropriate functions
======================================*/
window.onload = function(){
	if (sessionStorage.getItem("selectedQuestion") != null) {
		selectedQuestion = sessionStorage.getItem("selectedQuestion");
	}
	var url = window.location.href.split("/");
	page = url[url.length - 1].trim();

    firebase.auth().onAuthStateChanged(function(user) {
  		if (user) {
    		myEmail = user.email;
    		var emailVerified = user.emailVerified;
    		var isAnonymous = user.isAnonymous;
    		var uid = user.uid;
  		} else {
  			console.log("User is signed out");
  			if (page != "index.html" && page != "" && page != "signup.html") {
  				window.location.href= "../index.html";
  			}
  		}
  		switch(page){
			case "signup.html":
				loadSignUp();
				break;
			case "preview.html":
				loadReading();
				break;
			case "home.html":
				loadQuestionsPage();
				if (sessionStorage.getItem("homeCurrentPage") != null) {
					var menuItem = sessionStorage.getItem("homeCurrentPage");
					if (menuItem != null) {
						openMenuItem(menuItem);
					}
				}
			break;
			case "replies.html":
				loadReplies();
			break;
			case "write_question.html":
				loadWriteQuestion();
			break;
			case "write_reply.html":
				loadPostReply();
			break;
			case "profile.html":
				loadProfile();
			break;
			case "editProfile.html":
				loadEditProfile();
			break;
			case "notifications.html":
				load_notifications();
			break;
			case "user_questions.html":
				load_user_questions();
			break;
			case "user_replies.html":
				load_user_replies();
			break;
			case "user_profile.html":
				load_user_profile();
			break;
			case "manage_interests.html":
				load_user_interests();
			break;
			default:
				loadLogIn();
			break;
		}
	});
}

/*======================================
			Sign Up process
=======================================*/
function loadSignUp(){
	$("#page1").appendTo('.content');
	$('#next_sign_up').on('click', function(){
		console.log(pageNum);
		switch(pageNum){
			case 2:
				createUser();
				$('#step_sign_up').text("Sign-up / Basic Info");
			break;
			case 3:
				console.log("Saving");
				saveInfo();
				$('#step_sign_up').text("Sign-up / Basic Info / Display Pics");
			break;
			case 4:
				saveUserPics();
				$('#step_sign_up').text("Sign-up / Basic Info / Display Pics / Choose Interests");
			break;
			case 5:
				showLoader();
				if (signUpInfo.interests.length < 3) {
					showSnackbar("Please select at least 3 interests");
					return;
				}
				UsersRef.doc(signUpInfo.email).update({interests: signUpInfo.interests}).then(()=>{
					hideLoader();
					window.location.href = "../q_and_a/home.html";
				}).catch((error) =>{
					showSnackbar(error.message);
				});
			break;
		}
	});

	$('#prev_sign_up').on('click', function(){
		if (pageNum > 2) {
			prevPage();
		}
	});

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
	
	$('.page .display-images').on('change', '#coverPic', function(e)
	{
		var selectedImg = e.target.files[0];
		var ImgName = selectedImg.name;
		var fileType = selectedImg.type;
		var validImageTypes = ["image/gif", "image/jpeg", "image/png"];
		if ($.inArray(fileType, validImageTypes) < 0) {
			showSnackbar("Selected file is not an Image");
			return;
		}else{
			viewCover_pic(this);
		}
	});
	
	$('.page .display-images').on('change', '#profilePic', function(e){
		var selectedImg = e.target.files[0];
		var ImgName = selectedImg.name;
		var fileType = selectedImg.type;
		var validImageTypes = ["image/gif", "image/jpeg", "image/png"];
		if ($.inArray(fileType, validImageTypes) < 0) {
			showSnackbar("Selected file is not an Image");
			return;
		}else{
			viewProfile_pic(this);
		}
	});

	$('.continue-btn').on('click', '.subscribe-btn', function(e)
	{
		e.preventDefault();
		e.stopPropagation();
		signUpMethod();
	});
}

function nextPage(){
	$('.content').empty();
	$('#page'+pageNum).appendTo('.content');
	$('#page'+(pageNum - 1)).removeClass("page-active");
	$('#page'+pageNum).addClass("page-active");
	$('#progress_sign_up').css("width", ((pageNum/4) * 100) + "%");
	pageNum++;
}

function prevPage(){
	$('.content').empty();
	$('#page'+(pageNum - 1)).appendTo('.content');
	$('#page'+pageNum).removeClass("page-active");
	$('#page'+(pageNum - 1)).addClass("page-active");
	$('#progress_sign_up').css("width", (((pageNum - 1)/4) * 100) + "%");
	pageNum--;
}

function createUser(){
	showLoader();
	var email = signUpInfo.email;
	var password = signUpInfo.password;
	if (email != null && password != null) {
		firebase.auth().createUserWithEmailAndPassword(email, password)
		.then(function(){
			nextPage();
			hideLoader();
		}).catch((error) => {
			showSignUpError(error.message);
			hideLoader();
		});
	}else{
		showSignUpError("Please fill up all the fields");
		hideLoader();
	}
}

function saveInfo(){
	var email = signUpInfo.email;
	showLoader();
	UsersRef.doc(email).set({
		fullName: signUpInfo.fullname,
		dateOfBirth: signUpInfo.birthDate,
		course: signUpInfo.course,
		affiliation: signUpInfo.affiliation,
		university: signUpInfo.university,
		gender: signUpInfo.gender,
		uID: email,
	}).then(function(){
		console.log("Saved");
		hideLoader();
		nextPage();
	}).catch((error) =>{
		console.log("Not Saved");
		showSnackbar(error.message);
		hideLoader();
	});
}

function saveUserPics(){
	var email = signUpInfo.email;
	showLoader();
	var id = email;
	var pic = "profilePics/"+id+" Profile pic.jpg";
	var file = signUpInfo.profile_img;
	//upload new pic
	var uploadTask = storage.ref(pic).put(signUpInfo.profile_img);
	uploadTask.on('state_changed', function(snapshot){
		var progress = (+(snapshot.bytesTransferred) / +(snapshot.totalBytes)) * 100;
		$('#progress').text((progress).toFixed(2) + " %");
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
		return false;
	}, function() {
		uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
			var id = email;
			UsersRef.doc(id).update({profileUrl: downloadURL});
			var pic = "Cover Pics/"+id+" Cover.jpg";
			var file = signUpInfo.cover_img;
			//upload new pic
			var uploadTask = storage.ref(pic).put(file);
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
				return false;
			}, function() {
				uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
					UsersRef.doc(email).update({coverUrl: downloadURL});
					hideLoader();
					nextPage();
				});
			}).catch(function(error) {
				// Uh-oh, an error occurred!
				console.log("Error while uploading image");
				hideLoader();
			});				
		});
	});
}

function viewCover_pic(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            $('.display-images').find(".cover-image").children().first().attr('src', e.target.result);
			signUpInfo.cover_img = input.files[0];
		}
        reader.readAsDataURL(input.files[0]);
    }
}

function viewProfile_pic(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            $('.display-images').find(".profile-pic").children().first().attr('src', e.target.result);
			signUpInfo.profile_img = input.files[0];

		}
        reader.readAsDataURL(input.files[0]);
    }
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

	if(firstname.length >= 3 && lastname.length >= 3){
		basicInfoErrorDisplay("");
		return true;
	}else
	{
		basicInfoErrorDisplay("Name and surname should be at least 3 letters each");
		return false;		
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
	var index = pilotStudents.findIndex((e) => e.studentNumber == studentNo);
	if (index == -1) {
		alert("Sorry this pilot is only focused on accounring level 2 and level 3 students."+
			" \n If you are part of the above mentioned please contact OpenSesyme at info@opensesyme.com");
		firebase.auth().signOut().then(function(){
			window.location.href = "../index.html";
		});
		return;
	}
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
	signUpInfo.interests = arrayInterest;
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

/*======================================
			Questions Home Page
=======================================*/
function loadQuestionsPage(){
	showLoader();
	$('#navbar_menu').on('click', 'li', function(){
		var menuItem = $(this).find('h3').text().trim();
		console.log(menuItem);
		openMenuItem(menuItem);
	});
	UsersRef.doc(myEmail).onSnapshot(function(user)
	{
		var html = '';
		myInterests = [];
		$('#interestsNavContents').empty();
		$('#interestsNavContents').append('<a class="interests-nav-link" aria-selected="true" href="home.html">All</a>');
		myInterests = user.data().interests;
		myInterests.forEach(function(interest)
		{		
			 html = '<a class="interests-nav-link">'+interest+'</a>';
			 $('#interestsNavContents').append(html);
		});
		$('#nav-profile-pic img').attr('src', user.data().profileUrl);
	});
    users = [];
	$('.questions').empty();
    UsersRef.get().then(function(usersDocs){
    	usersDocs.forEach((userDoc) =>{
    		var user = userDoc.data();
			user.uID = userDoc.id;
			addUserToArray(users, user);
    	});
    	fetchQuestions();
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
				QuestionsCollection.doc(id).get()
				.then(function(_document)
				{
					if(myEmail !== _document.get("author"))
					{
						var text = "liked your question: "+_document.get("author");
						var type = "Question";
						saveNotification(_document.get("author"), type, likeId, text);
					}
				});
				console.log("Liked");
			});
		}
    });

    $('.questions').on('click', '#options_btn', function(e){
		e.stopPropagation();
		console.log("check");
		
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

    $('#interestsNav').on('click', '.interests-nav-link', function(){
    	var id_for = $(this).text();
			console.log(id_for);
			if(id_for === "All")
			{
				window.location.href = 'home.html';
			}
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

    $('#search_home').on('keyup', function(e){
    	var searchText = $(this).val().trim().toLowerCase();
    	var questions = $('.questions').children();
    	for (var i = questions.length - 1; i >= 0; i--) {
    		var question = questions[i];
    		var title = $(question).find('.quest-header h2').text();
    		var description = $(question).find('.quest-discription p').text();
    		var fullText = (title + description).toLowerCase();
    		if (!fullText.includes(searchText)) {
    			$(question).hide();
    		}else{
    			$(question).show();
    		}
    	}
	});

	$('#q_and_a .questions').on('click', '.avatar', function(e)
	{
		e.stopPropagation();
		var id = $(this).closest('.author-details').find('.this-id')[0].innerHTML;
		if(myEmail !== id)
		{
			sessionStorage.setItem("other_user", id);
			window.location.href = "../profile/user_profile.html";
		}else
		{
			window.location.href = "../profile/profile.html";
		}
		
	});
	
	$('#q_and_a .questions').on('click', '.name', function(e)
	{
		e.stopPropagation();
		var id = $(this).closest('.author-details').find('.this-id')[0].innerHTML;
		if(myEmail !== id)
		{
			sessionStorage.setItem("other_user", id);
			window.location.href = "../profile/user_profile.html";
		}else
		{
			window.location.href = "../profile/profile.html";
		}
	});

	window.addEventListener("unload", function(event) { 
		if (selectedMenuItem != null) {
			sessionStorage.setItem("homeCurrentPage", selectedMenuItem);
		}
	});
}

function openMenuItem(menuItem){
	$('body').children('section').hide();
	selectedMenuItem = menuItem;
	sessionStorage.setItem("homeCurrentPage", selectedMenuItem);
	console.log(menuItem);
	if (menuItem == "Home") {
		$('#q_and_a').show();
		$('.bottom-nav').show();
		$('.main-nav').addClass('main-nav-wrap');
		$('.main-nav').removeClass('main-nav-wrap2');
	}else{
		$('#'+menuItem.toLowerCase()+'_section').show();
		$('.bottom-nav').hide();
		$('.main-nav').removeClass('main-nav-wrap');
		$('.main-nav').addClass('main-nav-wrap2');
	}
	
	switch(menuItem){
		case "Books":
			loadLibrary();
		break;
		case "Notifications":
			load_notifications();
		break;
		case "Profile":
			loadProfile();
		break;
		default:
			loadQuestionsPage();
	}
}

function fetchQuestions(){
	QuestionsCollection.orderBy("dateTime", "desc").limit(50)
    .onSnapshot(function(querySnapshot) {
        var changes = querySnapshot.docChanges();
        for (var i = changes.length - 1; i >= 0; i--) {
        	var change = changes[i];
        	var question = change.doc.data();
        	question.id = change.doc.id;
			populateQuestions(question);
        }
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
	var style = "width: 100%; height: 300px; margin-bottom: 5px; object-fit: cover;";
	var edit_status = "";
	const interested = category.some(r=> myInterests.includes(r));
	if (!interested && (!category.includes("General") && !category.includes("Student Life"))) {
		return;
	}

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
		var questionHtml = '<div class="quest1" id="'+id+'">\
				<p hidden id="doc_id">'+id+'</p>\
				<div class="author">\
				    <div class="caption">\
						<div class="author-details">\
							<p class="this-id" hidden>'+author+'</p>\
				            <img src='+userImage+' alt="Names profile picture" class="avatar">\
				            <div class="name">'+name+'</div> <span class="edited">'+edited+'</span><br/>\
				            <div class="time"><i class="fa fa-clock-o" style="color: #6400ae;"></i> '+timeToShow+'</div>\
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
				<img class="postImage" src="'+image+'" alt="../img/cover.jpg" style="'+style+'">\
				<div class="quest-footer">\
					<div class="likes-and-replays pb-2">\
						<span><i class="fa fa-heart"></i> '+likes+'</span>\
						<span class="w3-right">'+comments+' Replies</span>\
					</div>\
					<div class="user-action pt-3 pb-3 w3-center">\
						<a id="like_button_home" class="w3-left" style="cursor: pointer;">\
							<i class="fa '+likeClass+'"></i>&nbsp;&nbsp;&nbsp;Like\
						</a>\
						<a id="reply_button_home" style="cursor: pointer;">\
							<i class="fa fa-comment"></i>&nbsp;&nbsp;&nbsp;Replies\
						</a>\
						<a class="w3-right" style="cursor: pointer;">\
							<i class="fa fa-share"></i>&nbsp;&nbsp;&nbsp;Share\
						</a>\
					</div>\
				</div>\
			</div>'
		var index = $('.questions').find('#' + id).index();
		if (index == -1) {
			$('.questions').prepend(questionHtml);
		}else{
			$('.questions > div').eq(index).replaceWith(questionHtml);
		}
		
	});
	hideLoader();
}

/*======================================
			Replies Page
=======================================*/
function loadReplies(){
	if (selectedQuestion == null) {
		console.log("Question not selected");
		return;
	}
	showLoader();
	QuestionsCollection.doc(selectedQuestion).get().then((doc) =>{
		var title = doc.get("title");
		document.title = title;
		var category = doc.get("category");
		var categories = "#" + category.join(" #");
		var author = doc.get("author");
		var description = doc.get("description");
		var likes = doc.get("numLikes");
		var replies = doc.get("numComments");
		var time = doc.get("dateTime").toDate().toLocaleString("en-CA");
		var timeToShow = moment(time, "YYYY-MM-DD, h:mm:ss a").fromNow();
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
				            <div class="time"><i class="fa fa-clock-o" style="color: #6400ae"></i> '+timeToShow+'</div>\
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
			hideLoader();
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
							            <div class="time"><i class="fa fa-clock-o"></i> '+timeToShow+'</div>\
				            			<div class="w3-dropdown-click quest-options-btn">\
				            				<button type="button" class="btn" id="options_btn"><i class="fa fa-chevron-down"></i></button>\
				            				<div id="dropOptions" class="w3-dropdown-content w3-bar-block w3-border">\
				            					<a class="w3-bar-item w3-button" id="optionItem">'+options[0]+'</a>\
				   								<a class="w3-bar-item w3-button" id="optionItem">'+options[1]+'</a>\
				            				</div>\
				            			</div>\
							            <br><span class="reply-type">'+type+'</span>\
						        	</div>\
								</div>\
							</div>\
							<div class="reply-content">\
								<p>'+description+'</p>\
							</div>\
							<img class="postImage" src="'+image+'" alt="This is pdf" style="'+style+'"></image>\
							<div class="reply-footer">\
								<div class="likes-and-replays pb-2">\
									<span><i class="fa fa-heart"></i> '+likes+'</span>\
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
	
				QuestionsCollection.doc(selectedQuestion).get()
				.then(function(_document)
				{
					collection("Replies").doc(id).get().then(function(reply)
					{
						if(myEmail !== reply.get("author"))
						{
							var text = "Liked your reply: "+reply.get("reply");
							var ref = selectedQuestion;
							saveNotification(reply.get("author"), "Like", ref, text);
						}
					});

				});

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
			document.title = "Edit : "+title;
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
		var description = $('#questionDiscription').val();
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
		category: null,
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
		QuestionsCollection.doc(selectedQuestion).get()
		.then(function(_document)
		{
			if(myEmail !== _document.get("author"))
			{
				var text = "";
				if(type == "Answer")
				{
					text = "Answered your question: "+_document.get("title");
				}else if(type == "Comment")
				{
					text = "Commented on your question: "+_document.get("title");
				}
				saveNotification(_document.get("author"), type, ref, text);
			}
		});
		
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
/*=======================================================================================
										PROFILE VIEW
=========================================================================================*/
function loadProfile(){
	showLoader();
	document.title = "My profile";
	UsersRef.doc(myEmail).get().then(function(user)
	{
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
		$('#userProfile').ready(function(){
			$('#userProfile').find('#fullname')[0].innerHTML = data.fullName;
			$('#fb-image-cover').attr("src", cover_pic);
			$('#userProfile').find('.fb-image-profile').attr("src", profile_pic);
			$('#userProfile').find('#course')[0].innerHTML = data.course;
			$('#userProfile').find('#university')[0].innerHTML = data.university;
			$('#userProfile').ready(function(){
				hideLoader();
			});
		});
	});

	$('.logout').on('click', function(){
		firebase.auth().signOut().then(function(){
			sessionStorage.setItem("homeCurrentPage", "Home");
			window.location.href = "../index.html";
		});
	});
}

function load_user_questions()
{

	showLoader();
	document.title = "My questions";
	UsersRef.doc(myEmail).get().then(function(user)
	{
		var data = user.data();
		var profile_pic = null;
		if(data.profileUrl === null)
		{
			profile_pic = "../img/cover.jpg";
		}else
		{
			profile_pic = data.profileUrl;
		}

		var fullname = data.fullName;

		QuestionsCollection.where("author", "==", myEmail)
		.orderBy("dateTime", "desc").get().then(function(questions)
		{
			
			questions.forEach(function(question)
			{
				var time = question.get("dateTime").toDate().toLocaleString("en-CA");
				var timeToShow = moment(time, "YYYY-MM-DD, h:mm:ss a").fromNow();
				var isEdited = "";

				if(question.get("edited") == true)
				{
					isEdited = "Edited";
				}

				var cate = "";
				var category = question.get("category");

				for(var i = 0; i < category.length; i++)
				{
					cate +="<li><a>#"+category[i]+"</a></li>";
				}

				var html = `<div class="quest1">
				<div class="author">
					<div class="caption">
						<div class="author-details">
						<p hidden id="doc_id">${question.id}</p>
							<img src="${profile_pic}" alt="Name's profile picture" class="avatar">  
							<div class="name">${fullname}</div> <span class="edited">${isEdited}</span><br/>
							<div class="time"><i class="fa fa-clock-o"></i> ${timeToShow}</div>
				            <div class="w3-dropdown-click quest-options-btn">
				            	<button type="button" class="btn" id="options_btn"><i class="fa fa-chevron-down"></i></button>
				            	<div id="dropOptions" class="w3-dropdown-content w3-bar-block w3-border">
				            		<a class="w3-bar-item w3-button" id="optionItem">Edit</a>
				   					<a class="w3-bar-item w3-button" id="optionItem"> Delete </a>
				            	</div>
				            </div>
						</div>   
					</div>
				</div>

				<div class="quest-header">
					<h2>${question.get("title")}</h2>
					<ul class="categoryTags">
						${cate}
					</ul>
				</div>

				<div class="quest-discription">
					<p>
						${question.get("description")}
					</p>
				</div>

				<div class="quest-footer">
					<div class="likes-and-replays pb-2">
						<span><i class="fa fa-heart"></i> ${question.get("numLikes")}</span>
						<span class="w3-right">${question.get("numComments")} Replies</span>
					</div>
					<div class="user-action pt-3 pb-3 w3-center">
						<a href="#" class="w3-left">
							<i class="fa fa-heart-o"></i>&nbsp;&nbsp;&nbsp;Like
						</a>
						<a href="../q_and_a/replies.html" >
							<i class="fa fa-comment"></i>&nbsp;&nbsp;&nbsp;Replies
						</a>
						<a href="#" class="w3-right">
							<i class="fa fa-share"></i>&nbsp;&nbsp;&nbsp;Share
						</a>
					</div>
				</div>
			</div>
			`;
				$('#user_questions .questions').append(html);
				hideLoader();
			});
		});

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
		console.log(option);
		
    	var id = $(this).closest('.quest1').find('#doc_id')[0].innerHTML;
		console.log(id);
		
		switch(option){
    		case "Edit":
    			EditOwnPost("Question", id);
    			break;
    		case "Delete":
    			DeletePost(id);
    			break;
    	}
    });
}

function EditOwnPost(type, id){
	if (type == "Question") {
		sessionStorage.setItem("EditQuestion", id);
    	window.location.href = "../q_and_a/write_question.html";
	}else{
		sessionStorage.setItem("EditReply", id);
    	window.location.href = "../q_and_a/write_reply.html";
	}
}


function load_user_replies(){
	showLoader();
	document.title = "My replies";
	UsersRef.doc(myEmail).get().then(function(user)
	{
		var data = user.data();
		var profile_pic = null;
		if(data.profileUrl === null)
		{
			profile_pic = "../img/cover.jpg";
		}else
		{
			profile_pic = data.profileUrl;
		}

		var fullname = data.fullName;

		db.collectionGroup("Replies").where("author", "==", myEmail)
		.where("type", "==", "Answer").orderBy("dateTime", "desc").get().then(function(replies)
		{
			
			replies.forEach(function(reply)
			{
				var time = reply.get("dateTime").toDate().toLocaleString("en-CA");
				var timeToShow = moment(time, "YYYY-MM-DD, h:mm:ss a").fromNow();
				var isEdited = "";

				var html = `<div class="reply1">
				<div class="author">
					<div class="caption">
						<div class="author-details"> 
							<div class="name">${fullname}</div><br/>
							<div class="time"><i class="fa fa-clock-o"></i> ${timeToShow}</div>
							<div class="w3-dropdown-click quest-options-btn">
								<button type="button" class="btn" id="options_btn"><i class="fa fa-chevron-down"></i></button>
								<div id="dropOptions" class="w3-dropdown-content w3-bar-block w3-border">
									<a class="w3-bar-item w3-button" id="optionItem">Edit</a>
								  	<a class="w3-bar-item w3-button" id="optionItem"> Delete </a>
								</div>
							</div>
							<span class="reply-type">${reply.get("type")}</span>
						</div>   
					</div>
				</div>

				<div class="reply-content mx-3">
					<p>
						${reply.get("description")}
					</p>
				</div>

				<div class="reply-footer">
					<div class="likes-and-replays pb-2">
						<span><i class="fa fa-heart"></i> ${reply.get("numLikes")}</span>
						<span class="w3-right">${reply.get("numComments")} Replies</span>
					</div>
					<div class="user-action pt-3 pb-4 w3-center">
						<a class="w3-left">
							<i class="fa fa-heart-o"></i>&nbsp;&nbsp;&nbsp;Like
						</a>
						
						<a class="w3-right">
							<i class="fa fa-share"></i>&nbsp;&nbsp;&nbsp;Share
						</a>
					</div>
				</div>
			</div>
			`;
				$('#user_replies .content .replies').append(html);
				hideLoader();
			});
		});

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
    		case "Edit":
    			EditPost("Reply", ref);
    			break;
    		case "Delete":
    			DeletePost(ref);
    			break;
    	}
    });

}

//Other users profile
function load_user_profile()
{
	var id = sessionStorage.getItem("other_user");
	showLoader();
	UsersRef.doc(id).get().then(function(user)
	{
		var data = user.data();
		var profile_pic = null;
		var cover_pic = null;

		if(data.coverUrl === null)
		{
			cover_pic = "../img/cover.jpg";
		}else
		{
			cover_pic = data.coverUrl;
		}

		if(data.profileUrl === null)
		{
			profile_pic = "../img/profilePic.jpg";
		}else
		{
			profile_pic = data.profileUrl;
		}
		$('#other_user').ready(function()
		{
			$('#other_user').find('#fullname')[0].innerHTML = data.fullName;
			$('#other_user').find('.fb-image-lg').attr("src", cover_pic);
			$('#other_user').find('.fb-image-profile').attr("src", profile_pic);
			$('#other_user').find('#course')[0].innerHTML = data.course;
			$('#other_user').find('#university')[0].innerHTML = data.university;
			$('#other_user').ready(function()
			{
				hideLoader();
			});

			var fullname = data.fullName;
			document.title = fullname+"'s Profile";
			QuestionsCollection.where("author", "==", id)
			.orderBy("dateTime", "desc").get().then(function(questions)
			{
				
				questions.forEach(function(question)
				{
					var time = question.get("dateTime").toDate().toLocaleString("en-CA");
					var timeToShow = moment(time, "YYYY-MM-DD, h:mm:ss a").fromNow();
					var isEdited = "";
	
					if(question.get("edited") == true)
					{
						isEdited = "Edited";
					}
	
					var cate = "";
					var category = question.get("category");
	
					for(var i = 0; i < category.length; i++)
					{
						cate +="<li><a>#"+category[i]+"</a></li>";
					}
	
					var html = `<div class="quest1">
					<div class="author">
						<div class="caption">
							<div class="author-details">
							<p hidden id="doc_id">${question.id}</p>
								<img src="${profile_pic}" alt="Name's profile picture" class="avatar">  
								<div class="name">${fullname}</div> <span class="edited">${isEdited}</span><br/>
								<div class="time"><i class="fa fa-clock-o"></i> ${timeToShow}</div>
								<div class="w3-dropdown-click quest-options-btn">
									<button type="button" class="btn" id="options_btn"><i class="fa fa-chevron-down"></i></button>
									<div id="dropOptions" class="w3-dropdown-content w3-bar-block w3-border">
										<a class="w3-bar-item w3-button" id="optionItem">Hide</a>
										   <a class="w3-bar-item w3-button" id="optionItem"> Report </a>
									</div>
								</div>
							</div>   
						</div>
					</div>
	
					<div class="quest-header">
						<h2>${question.get("title")}</h2>
						<ul class="categoryTags">
							${cate}
						</ul>
					</div>
	
					<div class="quest-discription">
						<p>
							${question.get("description")}
						</p>
					</div>
	
					<div class="quest-footer">
						<div class="likes-and-replays pb-2">
							<span><i class="fa fa-heart"></i> ${question.get("numLikes")}</span>
							<span class="w3-right">${question.get("numComments")} Replies</span>
						</div>
						<div class="user-action pt-3 pb-3 w3-center">
							<a href="#" class="w3-left">
								<i class="fa fa-heart-o"></i>&nbsp;&nbsp;&nbsp;Like
							</a>
							<a href="../q_and_a/replies.html" >
								<i class="fa fa-comment"></i>&nbsp;&nbsp;&nbsp;Replies
							</a>
							<a href="#" class="w3-right">
								<i class="fa fa-share"></i>&nbsp;&nbsp;&nbsp;Share
							</a>
						</div>
					</div>
				</div>
				`;
					$('#other_user .content #other_user_questions').append(html);
					hideLoader();
				});
			});


			db.collectionGroup("Replies").where("author", "==", id)
			.where("type", "==", "Answer").orderBy("dateTime", "desc").get().then(function(replies)
			{
				console.log(replies);
				
				
				replies.forEach(function(reply)
				{
					var time = reply.get("dateTime").toDate().toLocaleString("en-CA");
					var timeToShow = moment(time, "YYYY-MM-DD, h:mm:ss a").fromNow();
					var isEdited = "";
	
					var html = `<div class="reply1">
					<div class="author">
						<div class="caption">
							<div class="author-details"> 
								<div class="name">${fullname}</div><br/>
								<div class="time"><i class="fa fa-clock-o"></i> ${timeToShow}</div>
								<div class="w3-dropdown-click quest-options-btn">
									<button type="button" class="btn" id="options_btn"><i class="fa fa-chevron-down"></i></button>
									<div id="dropOptions" class="w3-dropdown-content w3-bar-block w3-border">
										<a class="w3-bar-item w3-button" id="optionItem">Edit</a>
										  <a class="w3-bar-item w3-button" id="optionItem"> Delete </a>
									</div>
								</div>
								<span class="reply-type">${reply.get("type")}</span>
							</div>   
						</div>
					</div>
	
					<div class="reply-content mx-3">
						<p>
							${reply.get("description")}
						</p>
					</div>
	
					<div class="reply-footer">
						<div class="likes-and-replays pb-2">
							<span><i class="fa fa-heart"></i> ${reply.get("numLikes")}</span>
							<span class="w3-right">${reply.get("numComments")} Replies</span>
						</div>
						<div class="user-action pt-3 pb-4 w3-center">
							<a class="w3-left">
								<i class="fa fa-heart-o"></i>&nbsp;&nbsp;&nbsp;Like
							</a>
							
							<a class="w3-right">
								<i class="fa fa-share"></i>&nbsp;&nbsp;&nbsp;Share
							</a>
						</div>
					</div>
				</div>
				`;
					$('#other_user .content #other_user_replies').append(html);
					hideLoader();
				});
			});
	
		});
	});
}


/*+-+-+-+-+-+-+-+-+--+-+-+-+-+-+-+-+-+--+-+-+-+-+-+-+-+-+--+-+-+-+-+-+-+-+-+--+-+-+-+-+-+-+-+-+--+-+-+-+-+-+-+-+-+-
										PROFILE EDIT VIEW
+-+-+-+-+-+-+-+-+--+-+-+-+-+-+-+-+-+--+-+-+-+-+-+-+-+-+--+-+-+-+-+-+-+-+-+--+-+-+-+-+-+-+-+-+--+-+-+-+-+-+-+-+-+--*/

function loadEditProfile()
{
	showLoader();
	UsersRef.doc(myEmail).get().then(function(user)
	{
		var data = user.data();
		var profile_pic = null;
		var cover_pic = null;
		var gender = data.gender;
		var dob = moment(data.dateOfBirth).format("YYYY-MM");

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


		$('#editProfile').find(".cover-image").children().first().attr('src', cover_pic);
		$('#editProfile').find(".profile-pic").children().first().attr('src', profile_pic);
		$('#editProfile').find(".fb-profile-text").children().first().children().first().attr('value', data.fullName);
		$('#editProfile').find(".fb-profile-text").children().last().children().first().attr('value', data.course);
		$('#editProfile').find(".profile-edit").children('.form-group').find('input').attr('value', dob);
		//gender
		var gen = [];
		gen = $('#editProfile').find(".profile-edit").children('#gender_sign_up').find('option');

		for(var i = 0; i < gen.length; i++)
		{

			if(gender === gen.get(i).text)
			{
				gen.get(i).setAttribute("selected", "");
				gen.get(i).setAttribute("disabled", "");
			}
		}
		//university
		var university = [];
		university = $('#editProfile').find(".profile-edit").children('#university_selector').find('option');

		for(var i = 0; i < university.length; i++)
		{

			if(data.university === university.get(i).text)
			{
				university.get(i).setAttribute("selected", "");
				university.get(i).setAttribute("disabled", "");
			}
		}

		//affiliation
		var affiliate = [];
		var affiliate  = $('#editProfile').find(".profile-edit").children('#affiliation_selector').find('option');

		for(var i = 0; i < affiliate.length; i++)
		{

			if(data.affiliation === affiliate.get(i).text)
			{
				affiliate.get(i).setAttribute("selected", "");
				affiliate.get(i).setAttribute("disabled", "");
			}
		}



		hideLoader();
	}).catch(function(error)
	{
		console.log(error);
	});


}

var cover_img = null;
function readCover_pic(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            $('#editProfile').find(".cover-image").children().first().attr('src', e.target.result);
			cover_img = input.files[0];
		}
        reader.readAsDataURL(input.files[0]);
    }
}

var profile_img = null;
function readProfile_pic(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            $('#editProfile').find(".profile-pic").children().first().attr('src', e.target.result);
			profile_img = input.files[0];
		}
        reader.readAsDataURL(input.files[0]);
    }
}

$('#coverPic').on('change', function(e)
{
	var selectedImg = e.target.files[0];
	var ImgName = selectedImg.name;
	var fileType = selectedImg.type;
	var validImageTypes = ["image/gif", "image/jpeg", "image/png"];
	if ($.inArray(fileType, validImageTypes) < 0) {
		showSnackbar("Selected file is not an Image");
		return;
	}else
	{
		readCover_pic(this);
	}
});

$('#profilePic').on('change', function(e)
{
	var selectedImg = e.target.files[0];
	var ImgName = selectedImg.name;
	var fileType = selectedImg.type;
	var validImageTypes = ["image/gif", "image/jpeg", "image/png"];
	if ($.inArray(fileType, validImageTypes) < 0) {
		showSnackbar("Selected file is not an Image");
		return;
	}else
	{
	readProfile_pic(this);
	}
});

$('.profile-edit #university_selector').on('change', function(e)
{
	e.stopPropagation();
	var university = $('#university_selector').val();
	UsersRef.doc(myEmail).update(
	{
		university: university,
	}).then(function()
	{
		console.log("edited");
		
	})
	.catch(function(error)
	{
		console.log(error);
	});
});

$('.profile-edit #datepicker_sign_up').on('change', function(e)
{
	e.stopPropagation();
	var dob = $('#datepicker_sign_up').val();
	UsersRef.doc(myEmail).update({dateOfBirth: dob})
	.then(function()
	{
		console.log("edited");
	})
	.catch(function(error)
	{
		console.log(error);
	});
});

$('.profile-edit #gender_sign_up').on('change', function(e)
{
	e.stopPropagation();
	var gender = $('#gender_sign_up').val();
	UsersRef.doc(myEmail).update({gender: gender})
	.then(function()
	{
		console.log("edited");
	})
	.catch(function(error)
	{
		console.log(error);
	});
});

$('.profile-edit #affiliation_selector').on('change', function(e)
{
	e.stopPropagation();
	var affiliation = $('#affiliation_selector').val();
	UsersRef.doc(myEmail).update({affiliation: affiliation})
	.then(function()
	{
		console.log("edited");
	})
	.catch(function(error)
	{
		console.log(error);
	});
});


$("#save_edit_changes").on('click', function(e)
{
	var fullname = $('#edit_fullname').val();
	var course_name = $('#courseName').val();
	var dob = $('#datepicker_sign_up').val();
	var gender = $('#gender_sign_up').val();
	var university = $('#university_selector').val();
	
	var affiliation = $('#affiliation_selector').val();
	var p_img = profile_img;
	var c_img = cover_img;
	var id = myEmail;

	if(fullname != "" && course_name != "" && dob != "" && gender != "" && university != "" && affiliation != "")
	{
		showLoader();
		UsersRef.doc(id).update(
		{
			fullName: fullname,
			course: course_name,
		}).then(function()
		{
			if(p_img == null && c_img == null)
			{
				setTimeout(function(){hideLoader();window.location.href="profile.html"},5000);
			}
		})
		.catch(function(error)
		{
			console.log(error);

		});
		if(p_img != null)
		{
			updateImage(id, p_img, "profile_pic");
		}

		if(c_img != null)
		{
			updateImage(id, c_img, "cover_pic");
		}
	}
});

function updateImage(id, file, upload_type)
{
	if(upload_type === "profile_pic")
	{
		showLoader();
		//delete old pic
		var pic = storage.ref("profilePics/"+id+" Profile pic.jpg");
			// File deleted successfully
		//upload new pic
		var uploadTask = storage.ref("profilePics/"+id+" Profile pic.jpg").put(file);
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
				  UsersRef.doc(id).update({profileUrl: downloadURL});
				  hideLoader();
			  });
		});
	}

	if(upload_type === "cover_pic")
	{
		//pic to be deleted
		showLoader();
		var pic = storage.ref("Cover Pics/"+id+" Cover.jpg");
			// File deleted successfully

			//upload new pic
			var uploadTask = storage.ref("Cover Pics/"+id+" Cover.jpg").put(file);
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
					UsersRef.doc(id).update({coverUrl: downloadURL});
					hideLoader();
				});
			});
	}
}


//========================================= MANAGE INTERESTS ===========================================

function load_user_interests()
{
	showLoader();
	var arr = [];
	var kids = $('#select_interests .row').children();
	var id = myEmail;
	UsersRef.doc(id).get()
	.then(function(user)
	{
		var interests = user.data().interests;
		arr = interests;

		for(var i = 0; i < kids.length; i++)
		{
			if(interests.includes($(kids[i]).find('p').text()))
			{
				$(kids[i]).find('input')[0].setAttribute("checked", "");
				hideLoader();
			}
			
		}
		$('#select_interests').on('click', '.img-fluid', function(e)
		{
			e.stopPropagation();
			var interest = $(this).closest('.custom-control').find('p').text();
			if(arr.includes(interest))
			{
				arr.splice(arr.indexOf(interest), 1);
				
			}else
			{
				arr.push(interest);
				
			}
			
		});

		$('#save_interests').on('click', function(e)
		{
			e.preventDefault();
			if(arr.length >= 3)
			{
				UsersRef.doc(id).update({interests: arr})
				.then(function()
				{
					showSnackbar("Interests updated");
					var delay = setTimeout(function(){history.back(-1);},2000);
				});
			}else
			{
				showSnackbar("Interests should be at least 3");
			}
		});
	});
}

/*=========================================================================================================
          							NOTIFICATION PAGE
===============================================================================================*/
/*+-+-+-+-+-+-+-+-+--+-+-+-+-+-+-+-+-+--+-+-+-+-+-+-+-+-+--+-+-+-+-+-+-+-+-+--+-+-+-+-+-+-+-+-+--+-+-+-+-+-+-+-+-+--
											NOTIFICATIONS VIEW
+-+-+-+-+-+-+-+-+--+-+-+-+-+-+-+-+-+--+-+-+-+-+-+-+-+-+--+-+-+-+-+-+-+-+-+--+-+-+-+-+-+-+-+-+--+-+-+-+-+-+-+-+-+--*/
var notification_id = null;
function load_notifications()
{
	showLoader();
	Notifications.where("receiver", "==", myEmail).orderBy("time", "desc")
	.onSnapshot(function(doc)
	{


		doc.forEach(function(notification)
		{
			notification_id = notification.id;
			UsersRef.doc(notification.get("sender")).get().
			then(function(user)
			{

				var profile_img = user.get("profileUrl");
				var img_show = "";
				
				if(profile_img === null)
				{
					img_show = "../img/profilePic.jpg";
				}else
				{
					img_show = profile_img;
				}
				var n_date = notification.get("time").toDate().toLocaleString("en-CA");

				var str = null;
				var text_notif = notification.get("notificationText");
				
				if(text_notif.length > 40)
				{
					 str = text_notif.slice(0, 100) +"...";
				}else
				{
					str = text_notif;
				}

				if(notification.get("seen") == 1)
				{
					$('.notification').addClass('bg-white');
				}
				
				var html = `<div class="notification row">
								<p hidden>${notification.get("elementRef")}</p>
								<div class="col-1 profile-pic">
									<img src="${img_show}" alt="User Profile Picture" width="35" height="40">
								</div>
								
								<div class="col-9 notif-message">
									<p><span class="name">${user.get("fullName")}</span> ${str}</p>
								</div>
								<div class="col-2 notif-options">
									<a><i class="fa fa-chevron-down"></i></a><br>
									<small>${moment(n_date, "YYYY-MM-DD, h:mm:ss a").fromNow()}</small>
								</div>
							</div>`;
				$('#notifications .content').append(html);
				$('#notifications .content').ready(function()
				{
					hideLoader();
				});

			});
		});
	});
}

$('#notifications .content').on('click', '.notification', function(e)
{
	e.stopPropagation();
	var a = $(this).children().first().text();
	
	if(a.includes('/'))
	{
		var array = a.split('/');
		selectedQuestion = array[1];
	}else
	{
		selectedQuestion = a;
	}

	Notifications.doc(notification_id).set({seen: 1}).then(function()
	{
		sessionStorage.setItem("selectedQuestion", selectedQuestion);
		window.location.href = "../q_and_a/replies.html";
	});
});


/*===============================================================================================
										FEEDBACK
===============================================================================================*/

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
		show_feedback_status("Your report description should be at least 10 letters long");
	}else
	{
		show_feedback_status(null);
	}
});

$('.feedback-submit').on('click', function(e){
	var report = $('#report').val().trim();
	var description = $('#report_description').val().trim();

	if(validate_feedBack(report, description)){
		sendEmail();
	}else{
		validate_feedBack(report, description);
	}
});

function validate_feedBack(report, description){
	var error = null;
	if(report.length < 5)
	{
		error = "Report should be at least 6 letters";
	}else if(description.length < 8)
	{
		error = "Report should be at least 9 letters";
	}else{
		error = null;
	}

	show_feedback_status(error);
	if(error != null){
		return false;
	}else{
			return true;
	}
}

function show_feedback_status(error){
		if(error != null){
			$('.feedback_status').html(`<div class="text-danger">${error}</div>`);
		}else{
			$('.feedback_status').html("");
		}
}

function sendEmail(){
	var report = $('#report').val().trim();
	var description = $('#report_description').val().trim();
	var fullname = "";
	UsersRef.doc(myEmail).get()
	.then(function(data){
		$('.feedback-submit').addClass('disabled');
		$.ajax({
			url: '../includes/email.php',
			method: 'POST',
			data: {report: report, description: description, fullname:data.get("fullName"),  email: myEmail}
		}).then(function(data){
			var report = $('#report').val("");
			var description = $('#report_description').val("");
			$('.feedback-submit').addClass('disabled');
			
		}).catch(function(error){
			console.log(error);
		});
	});
}

function composeTidy(){
	$('#report').val('');
	$('#report_description').val('');
	$('.feedback_status').html("<div>Email sent</div>");
	$('.feedback-submit').removeClass('disabled');
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
		showLoader();
		firebase.auth().signInWithEmailAndPassword(email, password)
		.then(function(){
		    hideLoader();
		    UsersRef.doc(email).get().then((user) => {
		    	var studentNo = user.data().studentNumber;
		    	if (studentNo == null) {
		    		var number = prompt("Please enter your Student Number", "");
					if (number != null) {
		    			var index = pilotStudents.findIndex((e) => e.studentNumber == number);
		    			if (index == null || index == -1) {
							alert("Sorry this pilot is only focused on accounring level 2 and level 3 students."+
								" \n If you are part of the above mentioned please contact OpenSesyme at info@opensesyme.com");
							firebase.auth().signOut().then(function(){
								window.location.href = "index.html";
							});
							return;
						}else{
							UsersRef.doc(email).update({studentNumber: number}).then(()=>{
								window.location.href = "q_and_a/home.html";
							});
						}
						
					}else{
						number = prompt("Please enter your Student Number", "");
					}
		    	}else{
		    		var index = pilotStudents.findIndex((e) => e.studentNumber == studentNo);
		    		if (index == null || index == -1) {
						alert("Sorry this pilot is only focused on accounring level 2 and level 3 students."+
							" \n If you are part of the above mentioned please contact OpenSesyme at info@opensesyme.com");
						firebase.auth().signOut().then(function(){
							window.location.href = "index.html";
						});
						return;
					}else{
						window.location.href = "q_and_a/home.html";
					}
		    	}
		    	
				
		    });
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

/*=======================================================
					Library
========================================================*/

function loadLibrary(){
	var booksList = [
		"../ebooks/framework.epub",
		"../ebooks/IAS1.epub",
		"../ebooks/IAS10.epub",
		"../ebooks/IAS2.epub",
		"../ebooks/IAS12.epub",
		"../ebooks/IAS27.epub",
		"../ebooks/IAS32.epub",
		"../ebooks/IAS36.epub",
		"../ebooks/IAS37.epub",
		"../ebooks/IAS38.epub",
		"../ebooks/IAS8.epub",
		"../ebooks/IFRS1.epub",
		"../ebooks/IFRS10.epub",
		"../ebooks/IFRS3.epub",
		"../ebooks/IFRS5.epub",
		"../ebooks/IFRS6.epub",
		"../ebooks/IFRS7.epub",
		"../ebooks/IFRS8.epub",
		"../ebooks/IFRS9.epub",
		"../ebooks/IFRS11.epub",
		"../ebooks/IFRS12.epub",
		"../ebooks/IFRS13.epub",
		"../ebooks/IFRS14.epub",
		"../ebooks/IFRS15.epub",
		"../ebooks/IFRS16.epub"];
	$('#library_div').empty();

	$('#library_div').on('click', '.book', function(){
		var bookUrl = $(this).find('p').text();
		sessionStorage.setItem("BookUrl", bookUrl);
		window.location.href="../books/preview.html";
	});
	
	$('#search_home').on('keyup', function(){
		var search = $(this).val().toLowerCase();
		var books = $('#library_div').children();
		var found = 0;
		for (var i = books.length - 1; i >= 0; i--) {
			var book = books[i];
			var title = $(book).find('h4').text().toLowerCase();
			if (!title.includes(search)) {
				$(book).hide();
			}else{
				$(book).show();
				found++;
			}
			if(found == 0){
			    $('#no_books_found').show();
			}else{
			    $('#no_books_found').hide();
			}
		}
	});
	
	booksList.forEach((bookUrl) =>{
		var book = ePub(bookUrl);
		console.log(bookUrl);
		console.log(book);
        book.coverUrl().then((url) => {
            console.log(url);
            book.loaded.metadata.then((metadata) => {
                var title = metadata.title;
                var bookHtml = '<div class="col-3">\
    							    <div class="book">\
    							        <h4 hidden>'+title+'</h4>\
    								    <p hidden>'+bookUrl+'</p>\
    								    <a><img src='+url+' alt="Cover"></a>\
    							    </div>\
    						    </div>';
    			$('#library_div').append(bookHtml);
            });
        }).catch(function(){
            book.loaded.metadata.then((metadata) => {
                var title = metadata.title;
                var bookHtml = '<div class="col-3">\
    							    <div class="book" style="position: relative;">\
    							        <h4 class="w3-center" style="position: absolute; top: 10px; width: 80px; color: #fff; padding: 10px;">'+title+'</h4>\
    								    <p hidden>'+bookUrl+'</p>\
    								    <a><img src="../img/fallback_book_cover.jpg" alt="Cover"></a>\
    							    </div>\
    						    </div>';
    			$('#library_div').append(bookHtml);
            });
        });
	});
}

function loadReading(){
    var bookUrl = sessionStorage.getItem("BookUrl");
    var params = URLSearchParams && new URLSearchParams(document.location.search.substring(1));
    var url = params && params.get("url") && decodeURIComponent(params.get("url"));
    var currentSectionIndex = (params && params.get("loc")) ? params.get("loc") : undefined;
    var bar = document.getElementById("myProgress");
    var pageTimeout = null;
    var currentCfi;
    var bookId;
    
    $('#full_screen').on('click', function(){
        var text = $(this).find('p').text();
        if(text == "Full Screen"){
            openFullScreen(document.documentElement);
            $(this).find('p').text("Exit Full Screen");
            $('#fullscreen_img').attr("src", "../img/compress.png");
            // $('#viewer').removeClass("viewerNormalScreen");
        }else{
            closeFullscreen();
            $(this).find('p').text("Full Screen");
            $('#fullscreen_img').attr("src", "../img/fullscreen.png");
            // $('#viewer').addClass("viewerNormalScreen");
        }
    });

    // Load the opf
    var book = ePub(bookUrl);
    var rendition = book.renderTo("viewer", {
      width: "100%",
      height: 600,
      spread: "always"
    });

    rendition.display(currentSectionIndex);

    book.ready.then(() => {
        book.locations.generate();
        $('#search_book').on('change', function(){
            var searchText = $(this).val();
            if(searchText != null && searchText != ''){
                doSearch(searchText).then((results) =>{
                    var index = 0;
                    if(results.length > 0){
                        var oldIndex = -1;
                        displayResult(results, oldIndex, index);
                        $('.searchBtn').show();
                    }else{
                        $('.searchBtn').hide();
                    }
                    $('#next_search').on('click', function(){
                        if(index < (results.length - 1)){
                            index++;
                            var oldIndex = index - 1;
                            displayResult(results, oldIndex, index);
                            
                        }
                    });
                    $('#previous_search').on('click', function(){
                        if(index > 0){
                            index--;
                            var oldIndex = index + 1;
                            displayResult(results, oldIndex, index);
                        }
                    });
                });
            }
        });
        var next = document.getElementById("next");
        book.loaded.metadata.then((metadata) => {
            var title = metadata.title;
            bookId = metadata.identifier;
          	if (localStorage.getItem("highlights" + bookId) != null) {
        		savedHighlights = JSON.parse(localStorage.getItem("highlights" + bookId));
        	}
        	savedHighlights.forEach((cfiRange) => {
                rendition.annotations.highlight(cfiRange);
                book.getRange(cfiRange).then(function (range) {
                    var li = document.createElement('li');
                    var a = document.createElement('a');
                    var remove = document.createElement('a');
                    var text;
                    saveHighlight(cfiRange);
                    
                    localStorage.setItem("highlights" + bookId, JSON.stringify(savedHighlights));
            
                    if (range) {
                      text = range.toString();
            
                      a.textContent = text;
                      a.href = "#" + cfiRange;
                      a.onclick = function () {
                        rendition.display(cfiRange);
                      };
            
                      remove.textContent = "remove";
                      remove.href = "#" + cfiRange;
                      remove.onclick = function () {
                        rendition.annotations.remove(cfiRange);
                        $(this).closest('li').remove();
                        return false;
                      };
            
                      li.appendChild(a);
                      li.appendChild(remove);
                      highlights.appendChild(li);
                    }
                });
            });
            rendition.display(localStorage.getItem('cfi'+bookId));
            $('.book-title-on-preview').text(title);
        });
        
        next.addEventListener("click", function(e){
            book.package.metadata.direction === "rtl" ? rendition.prev() : rendition.next();
            e.preventDefault();
        }, false);

        var prev = document.getElementById("prev");
        prev.addEventListener("click", function(e){
            book.package.metadata.direction === "rtl" ? rendition.next() : rendition.prev();
            e.preventDefault();
        }, false);
        
        var keyListener = function(e){
            // Left Key
            if ((e.keyCode || e.which) == 37) {
              book.package.metadata.direction === "rtl" ? rendition.next() : rendition.prev();
            }
    
            // Right Key
            if ((e.keyCode || e.which) == 39) {
              book.package.metadata.direction === "rtl" ? rendition.prev() : rendition.next();
            }
        };

        rendition.on("keyup", keyListener);
        document.addEventListener("keyup", keyListener, false);
        $(window).on( "swipeleft", function( event ) {
            rendition.next();
        });
        
        $(window).on( "swiperight", function( event ) {
            rendition.prev();
        });
    });

    var title = document.getElementById("title");
    
    rendition.on("displayed", event => {
        let start = null;
        let end = null;
        const el = event.document.documentElement;

        el.addEventListener('touchstart', event => {
            start = event.changedTouches[0];
        });
        el.addEventListener('touchend', event => {
            end = event.changedTouches[0];

            let hr = (end.screenX - start.screenX) / el.getBoundingClientRect().width;
            let vr = (end.screenY - start.screenY) / el.getBoundingClientRect().height;

            if (hr > vr && hr > 0.25) return rendition.prev();
            if (hr < vr && hr < -0.25) return rendition.next();
            if (vr > hr && vr > 0.25) return;
            if (vr < hr && vr < -0.25) return;
        });
    });

    rendition.on("rendered", function(section){
      var current = book.navigation && book.navigation.get(section.href);

      if (current) {
        var $select = document.getElementById("toc");
        var $selected = $select.querySelector("option[selected]");
        if ($selected) {
          $selected.removeAttribute("selected");
        }

        var $options = $select.querySelectorAll("option");
        for (var i = 0; i < $options.length; ++i) {
          let selected = $options[i].getAttribute("ref") === current.href;
          if (selected) {
            $options[i].setAttribute("selected", "");
          }
        }
      }
    });

    rendition.on("relocated", function(location){
        currentCfi = location.start.cfi;
        var progress = ((book.locations.percentageFromCfi(currentCfi)) * 100).toFixed(2);
        console.log(progress);
        setProgress(progress);
        if(pageTimeout != null){
            clearTimeout(pageTimeout);
        }
        checkPageRead(currentCfi);
        var next = book.package.metadata.direction === "rtl" ?  document.getElementById("prev") : document.getElementById("next");
        var prev = book.package.metadata.direction === "rtl" ?  document.getElementById("next") : document.getElementById("prev");
        
        if (location.atEnd) {
        next.style.visibility = "hidden";
        } else {
        next.style.visibility = "visible";
        }
        
        if (location.atStart) {
        prev.style.visibility = "hidden";
        } else {
        prev.style.visibility = "visible";
        }
    });

    rendition.on("layout", function(layout) {
      let viewer = document.getElementById("viewer");
      if (layout.spread) {
        viewer.classList.remove('single');
      } else {
        viewer.classList.add('single');
      }
    });

    book.loaded.navigation.then(function(toc){
		var $select = document.getElementById("toc"),
		docfrag = document.createDocumentFragment();

		toc.forEach(function(chapter) {
		    if(!(chapter.href).includes(".pdf")){
		        var option = document.createElement("li");
    			option.textContent = chapter.label;
    			option.setAttribute("ref", chapter.href);
    
    			docfrag.appendChild(option);
		    }
		});

		$('#toc').append(docfrag);

		$('#toc').on('click', 'li', function(){
			url = $(this).attr("ref");
			console.log(url);
			rendition.display(url);
			return false;
		});
	});

    rendition.themes.default({
      '::selection': {
        'background': 'rgba(255,255,0, 0.3)'
      },
      '.epubjs-hl' : {
        'fill': 'blue', 'fill-opacity': '0.3', 'mix-blend-mode': 'multiply'
      }
    });

    // Illustration of how to get text from a saved cfiRange
    var highlights = document.getElementById('highlights');
    
    rendition.on("selected", function(cfiRange) {
      book.getRange(cfiRange).then(function (range) {
        var li = document.createElement('li');
        var a = document.createElement('a');
        var remove = document.createElement('a');
        var text;
        saveHighlight(cfiRange);
        rendition.annotations.add("highlight", cfiRange);
        
        localStorage.setItem("highlights" + bookId, JSON.stringify(savedHighlights));

        if (range) {
          text = range.toString();

          a.textContent = text;
          a.href = "#" + cfiRange;
          a.onclick = function () {
            rendition.display(cfiRange);
          };

          remove.textContent = "remove";
          remove.href = "#" + cfiRange;
          remove.onclick = function () {
            rendition.annotations.remove(cfiRange);
            $(this).closest('li').remove();
            return false;
          };

          li.appendChild(a);
          li.appendChild(remove);
          highlights.appendChild(li);
        }
      });
    });

    window.addEventListener("unload", function () {
        console.log("unloading");
        localStorage.setItem('cfi'+bookId, currentCfi);
        this.book.destroy();
    });
    
    function doSearch(q) {
        return Promise.all(
            book.spine.spineItems.map(item => item.load(book.load.bind(book)).then(item.find.bind(item, q)).finally(item.unload.bind(item)))
        ).then(results => Promise.resolve([].concat.apply([], results)));
    };
    
    function saveHighlight(range){
        var index = savedHighlights.indexOf(range);
        if (index == -1){
            savedHighlights.push(range);
        }
    }
    
    function displayResult(results, oldIndex, index){
        var resultNum = index + 1;
        $('#results_search').text(resultNum + "/" + results.length);
        $('#results_search').show();
        if(oldIndex > -1){
            var oldResult = results[oldIndex];
            var cfiRange = oldResult.cfi;
            rendition.annotations.remove(cfiRange);
        }
        if(index < results.length){
            var newResult = results[index];
            var cfi = newResult.cfi;
            rendition.display(cfi);
            rendition.annotations.add("highlight", cfi, {}, (e) => {console.log("highlight clicked", e.target);} , "hl", {"fill": "blue", "fill-opacity": "0.3", "mix-blend-mode": "multiply"});
       }
    }
    
    function checkPageRead(cfi){
        pageTimeout = setTimeout(function(){ 
            var stats;
            UsersRef.doc(myEmail).get().then((user) =>{
                stats = user.get("pagesRead");
                if(stats == null){
                    stats = [];
                }
                var time = new Date().getTime();
                var newEntry = {date: time, page: cfi}
                stats.push(newEntry);
                UsersRef.doc(myEmail).update({pagesRead: stats}).then(function(){
                    console.log("Stats Saved");
                });
            }).catch((error) =>{
                console.log(error);
            });
        }, (1.5 * 60 * 1000));
    }
    
	function setProgress(percent){
	    bar.style.width = percent + "%";

	    if (percent > 90)
	        bar.className = "bar bar-success";
	    else if (percent > 50)
	        bar.className = "bar bar-warning";
	}
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
	}else{
		$('#snackbar').text(text);
	}

	var x = document.getElementById("snackbar");

	x.className = "show";

	setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
}

function saveNotification(receiver, type, elementRef, text){
	var parts = elementRef.split("/");
	const id = myEmail + type + parts[parts.length - 1];
	const ref = db.collection("Notifications").doc(id);
	ref.get().then((docSnapshot) =>{
		if (docSnapshot.exists) {
			console.log(id + " Already exists");
		}else{
			ref.set({
				elementRef: elementRef,
				notificationText: text,
				receiver: receiver,
				seen: 0,
				sender: myEmail,
				time: firebase.firestore.FieldValue.serverTimestamp(),
				type: type
			});
		}
	});
}

function openFullScreen(elem) {
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.mozRequestFullScreen) { /* Firefox */
    elem.mozRequestFullScreen();
  } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) { /* IE/Edge */
    elem.msRequestFullscreen();
  }
}

function closeFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.mozCancelFullScreen) { /* Firefox */
    document.mozCancelFullScreen();
  } else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) { /* IE/Edge */
    document.msExitFullscreen();
  }
}

var pilotStudents = [{firsName: "Ntlakanipho", lastName: "Mvanyashe", studentNumber: 219501572},
	{firsName: "Qhama", lastName: "Macothoza", studentNumber: 219502153},
	{firsName: "Inga", lastName: "Nodwengu", studentNumber: 219414122},
	{firsName: "Allen", lastName: "Mqadi", studentNumber: 219137382},
	{firsName: "Lucky", lastName: "Moyikwa", studentNumber: 219152446},
	{firsName: "Khanyisa", lastName: "Rawu", studentNumber: 218199090},
	{firsName: "Siviwe", lastName: "Mntengwane", studentNumber: 211133019},
	{firsName: "Sisipo", lastName: "Madulini", studentNumber: 217292542},
	{firsName: "Sibulele", lastName: "Novukela", studentNumber: 217293115},
	{firsName: "Onelisa", lastName: "Mbimi", studentNumber: 216198194},
	{firsName: "Ntombenhle", lastName: "Maduna", studentNumber: 216102995},
	{firsName: "Sinovuyo", lastName: "Maphupha", studentNumber: 219244766},
	{firsName: "Nikile Gwiba", lastName: "Madikane", studentNumber: 216045649},
	{firsName: "Anathi", lastName: "Hem", studentNumber: 218269447},
	{firsName: "Athandiwe", lastName: "Myalwa", studentNumber: 219077657},
	{firsName: "Sinikelo", lastName: "Mpendu", studentNumber: 217147151},
	{firsName: "Asemahle", lastName: "Nobeleza", studentNumber: 217146554},
	{firsName: "Abenathi", lastName: "Mzimvubu", studentNumber: 218280467},
	{firsName: "Loyiso", lastName: "Nontshe", studentNumber: 219399859},
	{firsName: "Lulama", lastName: "Basin", studentNumber: 219008507},
	{firsName: "Khanya", lastName: "Mvo", studentNumber: 219500029},
	{firsName: "Lonwabo", lastName: "Mniki", studentNumber: 217237967},
	{firsName: "Mpilo", lastName: "Maduya", studentNumber:219432325},
	{firsName: "Amanda", lastName: "Jacobs", studentNumber: 219371946},
	{firsName: "Yoxolo", lastName: "Nondabula", studentNumber: 218265182},
	{firsName: "Zimkhitha", lastName: "Nokhamatye", studentNumber: 217269303},
	{firsName: "Thandiwe", lastName: "Ngwenya", studentNumber: 217246567},
	{firsName: "Zuko", lastName: "Bhadulana", studentNumber: 219413827},
	{firsName: "Dikonyela", lastName: "Mokotla", studentNumber: 219242852},
	{firsName: "Yandisa", lastName: "Mkhonyo", studentNumber: 219502196},
	{firsName: "Mlomuli", lastName: "Mkhothu", studentNumber: 217215335},
	{firsName: "Nkubeko", lastName: "Tengo", studentNumber: 219418411},
	{firsName: "Aphelele", lastName: "Magugwana", studentNumber: 219285691},
	{firsName: "Luyanda", lastName: "Skisazana", studentNumber: 219501394},
	{firsName: "Yamkela", lastName: "Gcilitshana", studentNumber: 216221986},
	{firsName: "Pindisiwe", lastName: "Buyeye", studentNumber: 217252834},
	{firsName: "Pumlani", lastName: "Marasha", studentNumber: 218025815},
    {firsName: "Nangomso", lastName: "Ntlango", studentNumber: 218273541},
	{firsName: "Mzondeleli", lastName: "Mntonga", studentNumber: 218280513},
	{firsName: "Ntokozo", lastName: "Hlophe", studentNumber: 217279759},
	{firsName: "Luvo", lastName: "Nogo", studentNumber: 214134369},
	{firsName: "Luvuyo", lastName: "Bungane", studentNumber: 216039320},
	{firsName: "Phumlani", lastName: "Nomvangayi", studentNumber: 217189997},
	{firsName: "Sive", lastName: "Johnson", studentNumber: 217252117},
	{firsName: "Niko", lastName: "Mbokwana", studentNumber: 217253059},
	{firsName: "Ziyanda", lastName: "Koyana", studentNumber: 217238238},
	{firsName: "Mesuli", lastName: "Diko", studentNumber: 217252826},
	{firsName: "Phatheka", lastName: "Sikatele", studentNumber: 215173155},
	{firsName: "Xolisile", lastName: "Ntamo", studentNumber: 209198796},
	{firsName: "Lutlutlo", lastName: "Nleatle", studentNumber: 219421269},
	{firsName: "Nonyameko", lastName: "Mefonya", studentNumber: 217253040},
	{firsName: "Asiphe", lastName: "Khwatha", studentNumber: 217252893},
	{firsName: "Nonopha", lastName: "Maqathu", studentNumber: 217097324},
	{firsName: "Noma-Afrika", lastName: "Msindo", studentNumber: 216263603},
	{firsName: "Nonjabulo N.N", lastName: "Biyela", studentNumber: 218010311},
	{firsName: "Nosisi", lastName: "Mbokwana", studentNumber: 218170912},
	{firsName: "Rearabetsoe", lastName: "Mphafi", studentNumber: 218287291},
	{firsName: "Siphokazi", lastName: "Ntuli", studentNumber: 218184697},
	{firsName: "Fanele", lastName: "Makhathini", studentNumber: 218280440},
	{firsName: "Lebohang", lastName: "Muse", studentNumber: 218255349},
	{firsName: "Zodwa", lastName: "Mhlekwa", studentNumber: 218194153},
	{firsName: "Asiphe", lastName: "Makaula", studentNumber: 218269749},
	{firsName: "Axola", lastName: "Tdhegfu", studentNumber: 217246397},
	{firsName: "Masizakhe", lastName: "Soqashe", studentNumber: 218286309},
	{firsName: "Zosuliwe", lastName: "Shushu", studentNumber: 218281560},
	{firsName: "Sisanda", lastName: "Mngqongwa", studentNumber: 217051375},
	{firsName: "Siyamthanda", lastName: "Mtekelana", studentNumber: 217056318},
	{firsName: "Sinamandla", lastName: "Konzana", studentNumber: 217000533},
	{firsName: "Amahle", lastName: "Madukuda", studentNumber: 218174330},
	{firsName: "Lihle", lastName: "Ngwadla", studentNumber: 217241328},
	{firsName: "Nkosikhona L", lastName: "Vuke", studentNumber: 218104502},
	{firsName: "Lukanyo", lastName: "Manqaba", studentNumber: 217107486},
	{firsName: "Uviwe", lastName: "Kunana", studentNumber: 218180101},
	{firsName: "Atalanta", lastName: "Magile", studentNumber: 218184921},
	{firsName: "Imibongo", lastName: "Ntshana", studentNumber: 218185111},
	{firsName: "Khanide", lastName: "Kulani", studentNumber: 217152958},
	{firsName: "Nelisiwe", lastName: "Kunene", studentNumber: 218281692},
	{firsName: "Sizipiwe", lastName: "Mlindelwa", studentNumber: 218172311},
	{firsName: "Tarollo", lastName: "Lehanya", studentNumber: 217275524},
	{firsName: "Nicole", lastName: "Moshesh", studentNumber: 216070142},
	{firsName: "Tabile", lastName: "Mpini", studentNumber: 217192181},
	{firsName: "Luntu", lastName: "Notswayi", studentNumber: 218187238},
	{firsName: "Mihlali", lastName: "Mtati", studentNumber: 218105924},
	{firsName: "Bulelani", lastName: "Mbele", studentNumber: 218255411},
	{firsName: "Amanda", lastName: "Mdudi", studentNumber: 217001963},
	{firsName: "Zisipo", lastName: "Masentse", studentNumber: 217280625},
	{firsName: "Netha", lastName: "Mketwa", studentNumber: 217279724},
	{firsName: "Asanda", lastName: "Blayi", studentNumber: 215184300},
	{firsName: "Yamkela Z", lastName: "Mjali", studentNumber: 216045614},
	{firsName: "Nosiniko", lastName: "Xhanti", studentNumber: 218154755},
	{firsName: "Thina", lastName: "Phuka", studentNumber: 218172753},
 	{firsName: "Esethu", lastName: "Jali", studentNumber: 216045754},
	{firsName: "Noluthando", lastName: "Njokwana", studentNumber: 216045754},
	{firsName: "Simangele", lastName: "Mbatha", studentNumber: 215131886},
	{firsName: "Yamkela", lastName: "Mke", studentNumber: 218280718},
	{firsName: "Inalise", lastName: "Qaliyana", studentNumber: 217253881},
	{firsName: "Zenande", lastName: "Mvana", studentNumber: 217253725},
	{firsName: "Someleze", lastName: "Simunca", studentNumber: 217255981},
	{firsName: "Lihle", lastName: "Mbelesi", studentNumber: 217026834},
	{firsName: "Mbuyiselo", lastName: "Mpayipeli", studentNumber: 216256194},
	{firsName: "Athi", lastName: "Nanto", studentNumber: 216003857},
	{firsName: "Vuyolwethu", lastName: "Kaleni", studentNumber: 2172522966},
	{firsName: "Mazewu", lastName: "Zingisa", studentNumber: 216126703},
	{firsName: "Yamkela", lastName: "Lengimbo", studentNumber: 218280424},
	{firsName: "Sisa", lastName: "Mxhelwana", studentNumber: 218180357},
	{firsName: "Lindiswa", lastName: "Zibobo", studentNumber: 218002130},
	{firsName: "Khanya B", lastName: "Bana", studentNumber: 217003044},
	{firsName: "Awongile Y", lastName: "Gwantshu", studentNumber: 217193552},
	{firsName: "Siphesihle", lastName: "Qhabalaka", studentNumber: 216001277},
	{firsName: "Siphumle", lastName: "Khuphelo", studentNumber: 217073948},
	{firsName: "Aviwe S", lastName: "Mhlauli", studentNumber: 216264146},
	{firsName: "Tabiso", lastName: "Bana", studentNumber: 218278052},
	{firsName: "Indiphile", lastName: "Siroqo", studentNumber: 217254608},
	{firsName: "Kanyo", lastName: "Nompozolo", studentNumber: 217236103},
	{firsName: "Akhona", lastName: "Wayise", studentNumber: 218279078},
	{firsName: "Bevan", lastName: "Mondweni", studentNumber: 215199502},
	{firsName: "Lwandile", lastName: "Qulo-Qolo", studentNumber: 218185294},
	{firsName: "Nondumiso", lastName: "Lurwengu", studentNumber: 215214641}];