// use this when making changes so that there is no need to parse the page
var bookmarkList;
var dbVersion;

$(document).ready(function () {
	calcBackground();
});

function calcBackground() {
	var now = new Date();
	var hours = now.getHours();
	var mins = now.getMinutes();
	var total = (hours * 60) + mins;

	// 24*60 = 1440
	// 2:40 between each step
	if (total > 300 && total < 460) // 5:00 - 7:40
		setBackground(1, false);
	else if (total > 460 && total < 620)
		setBackground(2, false);
	else if (total > 620 && total < 780)
		setBackground(3, false);
	else if (total > 780 && total < 940)
		setBackground(4, false);
	else if (total > 940 && total < 1100)
		setBackground(5, false);
	else if (total > 1100 && total < 1260)
		setBackground(6, true);
	else if (total > 1260 && total < 1420)
		setBackground(7, true);
	else
		setBackground(8, true);
}

function setBackground(num, dark) {
	$("body").css("background-image", "url(img/" + num + ".png)");
	if (dark) {
		$(".btn-light").removeClass("btn-light").addClass("btn-dark");
		$(".navbar").removeClass("navbar-light").addClass("navbar-dark");
	} else {
		$(".btn-dark").removeClass("btn-dark").addClass("btn-light");
		$(".navbar").removeClass("navbar-dark").addClass("navbar-light");
	}
}

function initDB(db) {
	// use a table to keep track of the order of groups
	var groupStore = db.createObjectStore("groupIndexes", { keyPath: "title" });
	groupStore.createIndex("title", "groupName", { unique: true });
	groupStore.createIndex("groupIndex", "groupIndex", { unique: true });
	return groupStore;
}
