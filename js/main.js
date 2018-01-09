var backgroundList = [
	{address: "img/11-Mid-Night.png", dark: true},
	{address: "img/12-Late-Night.png", dark: true},
	{address: "img/12-Late-Night.png", dark: true}, // for better timing
	{address: "img/01-Early-Morning.png", dark: true},
	{address: "img/02-Mid-Morning.png", dark: false},
	{address: "img/03-Late-Morning.png", dark: false},
	{address: "img/04-Early-Afternoon.png", dark: false},
	{address: "img/05-Mid-Afternoon.png", dark: false},
	{address: "img/06-Late-Afternoon.png", dark: false},
	{address: "img/07-Early-Evening.png", dark: false},
	{address: "img/08-Mid-Evening.png", dark: true},
	{address: "img/09-Late-Evening.png", dark: true},
	{address: "img/10-Early-Night.png", dark: true},
	{address: "img/10-Early-Night.png", dark: true} // for better timing
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

		var index = Math.floor(total / period);
		setBackground(index);
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

function setBackgroundByTime(hours, mins) {
	var total = (hours * 60) + mins;

	var period = (24 / backgroundList.length) * 60; // in minutes

	var index = Math.floor(total / period);
	setBackground(index);
}

function removeFromArray(arr, index) {
	var newArr = [];
	arr.forEach(function (item, i) {
		if (i != index)
			newArr.push(item);
	});

	return newArr;
}

function addToArray(arr, itemToAdd, index) {
	if (index == arr.length) {
		arr.push(item);
		return arr;
	}

	var newArr = [];
	arr.forEach(function (item, i) {
		if (i == index)
			newArr.push(itemToAdd);

		newArr.push(item);
	});

	return newArr;
}

function disableLink(e) {
	e.preventDefault();
}
