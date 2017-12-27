// use this when making changes so that there is no need to parse the page
var bookmarkList;
var backgroundList = ["img/1.png", "img/2.png", "img/3.png", "img/4.png",
	"img/5.png", "img/6.png", "img/7.png", "img/8.png"];

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

		// 24*60 = 1440
		// 2:40 between each step
		if (total > 300 && total < 460) // 5:00 - 7:40
			setBackground(0, false);
		else if (total > 460 && total < 620)
			setBackground(1, false);
		else if (total > 620 && total < 780)
			setBackground(2, false);
		else if (total > 780 && total < 940)
			setBackground(3, false);
		else if (total > 940 && total < 1100)
			setBackground(4, false);
		else if (total > 1100 && total < 1260)
			setBackground(5, true);
		else if (total > 1260 && total < 1420)
			setBackground(6, true);
		else
			setBackground(7, true);
	}
}

function setBackground(num, dark) {
	// dark is a boolean that indicates the brightness of the background
	$("body").css("background-image", "url(" + backgroundList[num] + ")");

	if (dark) {
		$(".navbar").removeClass("navbar-dark").addClass("navbar-light");
		$(".navbar-toggler").removeClass("toggler-bg-dark btn-dark").addClass("toggler-bg-light btn-light");
	} else {
		$(".navbar").removeClass("navbar-light").addClass("navbar-dark");
		$(".navbar-toggler").removeClass("toggler-bg-light btn-light").addClass("toggler-bg-dark btn-dark");
	}
}

function initDB(db) {
	// use a table to keep track of the order of groups
	var groupStore = db.createObjectStore("groupIndexes", { keyPath: "title" });
	groupStore.createIndex("title", "groupName", { unique: true });
	groupStore.createIndex("groupIndex", "groupIndex", { unique: true });
	return groupStore;
}
