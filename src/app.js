// Firebase App (the core Firebase SDK) is always required and must be listed first
import * as firebase from "firebase/app";
import style from './style.scss';
import $ from 'jquery';
import "bootstrap";
import Handlebars from 'handlebars';
// Add the Firebase products that you want to use
import "firebase/auth";
import "firebase/firestore";

// Your web app's Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyBOO5aTPNCxap1FIBnJZgGDRFzIvOPQ2mY",
    authDomain: "test-project-fe52d.firebaseapp.com",
    databaseURL: "https://test-project-fe52d.firebaseio.com",
    projectId: "test-project-fe52d",
    storageBucket: "test-project-fe52d.appspot.com",
    messagingSenderId: "645637240503",
    appId: "1:645637240503:web:842fc313790c08d3c33f32"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

var db = firebase.firestore();

const getMessages = (roomId) => {
    return db.collection("messages").where("room", "==", roomId).orderBy("date").get();
}

const printRooms = () => {
    $(".room-list ul").html("");
    db.collection("rooms").get().then(e => {
        var source = document.getElementById("room-template").innerHTML;
        var template = Handlebars.compile(source);
        e.forEach((room) => {
            var context = { name: room.data().name, id: room.id };
            var html = template(context);
            $(".room-list ul").append(html);
        });
    })
}

const printMessages = e => {
    var source = document.getElementById("message-template").innerHTML;
    var template = Handlebars.compile(source);
    $(".message-list").html("");
    e.forEach((msg) => {
        console.log(msg.data())
        $(".message-list").append(template(msg.data()));
    });
    $('.message-list').animate({ scrollTop: 9999 }, 'slow');
}

//Authentication
var currentUser;

$("form").on("submit", function (e) {
    e.preventDefault();

    var email = $("#exampleInputEmail1").val();
    var password = $("#exampleInputPassword1").val();

    firebase.auth().signInWithEmailAndPassword(email, password)
        .catch(function (error) {
            console.log("Error code: ", error.code);
            console.log("Error message:", error.message);
            alert("Nombre de usuario o contraseña no válido.");
        });
});

firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        db.collection("users").doc(user.uid).get().then((e) => {
            currentUser = e.data().username;
            $(".login").hide();
            $(".container-fluid").show();
        })
    } else {
        $(".container-fluid").hide();
        alert("Nombre de usuario o contraseña no válido.");
    }
});


$(document).ready(printRooms);

$(".add-room").on("keypress", (e) => {
    if (e.which == 13) {
        db.collection("rooms").add({
            name: $(e.currentTarget).val()
        })
            .then(function (docRef) {
                console.log("Document written with ID: ", docRef.id);
                $(e.currentTarget).val("");
                printRooms();
            })
            .catch(function (error) {
                console.error("Error adding document: ", error);
            });
    }
})

$(".add-message").on("keypress", (e) => {
    if (e.which == 13) {
        db.collection("messages").add({
            message: $(e.currentTarget).val(),
            sender: currentUser,
            room: $(e.currentTarget).attr("room-id"),
            date: Date.now()
        })
            .then(function (docRef) {
                console.log("Document written with ID: ", docRef.id);
                $(e.currentTarget).val("");
                getMessages($(e.currentTarget).attr("room-id")).then(printMessages);
            })
            .catch(function (error) {
                console.error("Error adding document: ", error);
            });
    }
})

$(".room-list ul").on("click", "li", function () {
    $(".active").removeClass("active");
    $(this).addClass("active");
    var id = $(this).attr("room-id");
    $(".add-message").attr("room-id", id);
    getMessages(id).then(printMessages)
})