// use this when making changes so that there is no need to parse the page
var backgroundList = [
	{address: "img/1.png", dark: false},
	{address: "img/2.png", dark: false},
	{address: "img/3.png", dark: false},
	{address: "img/4.png", dark: false},
	{address: "img/5.png", dark: false},
	{address: "img/6.png", dark: true},
	{address: "img/7.png", dark: true},
	{address: "img/8.png", dark: true}
];

$(document).ready(function () {
	calcBackground();
	setInterval(calcBackground, 60000); // run every minute
});

function calcBackground() {
	if (navigator.onLine) {
		var now = new Date();
		var hours = now.getHours();
		var mins = now.getMinutes();
		var total = (hours * 60) + mins;

		var period = (24 / backgroundList.length) * 60; // in minutes

		var background = backgroundList[Math.floor(total / period)];
		setBackground(background.address, background.dark);
	}
}

function setBackground(num) {
	// dark is a boolean that indicates the brightness of the background
	$("body").css("background-image", "url(" + backgroundList[num].address + ")");

	if (backgroundList[num].dark) {
		$(".navbar").removeClass("navbar-dark").addClass("navbar-light");
		$(".navbar-toggler").removeClass("toggler-bg-dark btn-dark").addClass("toggler-bg-light btn-light");
	} else {
		$(".navbar").removeClass("navbar-light").addClass("navbar-dark");
		$(".navbar-toggler").removeClass("toggler-bg-light btn-light").addClass("toggler-bg-dark btn-dark");
	}
}
