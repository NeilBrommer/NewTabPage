// use this when making changes so that there is no need to parse the page
var bookmarkList;

$(document).ready(function () {
	calcBackground();
	loadBookmarks();

	$("#importExportModal").on("shown.bs.modal", function () {
		var data = getListString();
		if (data != null)
			$("#exportText").text(data);
		else
			$("#exportText").text("[]");
	});

	$("#newBookmarkModal").on("shown.bs.modal", function () {
		var combo = $("#newBookmarkGroup");
		var data = getList();
		for (var i = 0; i < data.length; i++) {
			combo.append($("<option>").attr({ "value": i }).text(data[i].title));
		}


		// TODO: complete adding bookmarks
		window.alert("Adding bookmarks is still incomplete");
		$("#newBookmarkModal").modal("hide");
	});

	$("#btnEdit").click(function (e) { window.alert("Editing is currently not implemented"); });

	$("#btnImport").click(importBookmarks);
	$("#exportText").click(function () {
		$("#exportText").select();
	});
});

function importBookmarks() {
	try {
		var newData = $.parseJSON($("#importText").val());
	} catch (err) {
		console.error("Import failed: " + err.message);
		window.alert("Invalid Format");
		return;
	}

	if (verifyBookmarks(newData)) {
		setList(newData);

		$("#importExportModal").modal("hide");
	} else {
		window.alert("Invalid Format");
	}
}

function loadBookmarks() {
	$("#cardList").empty();
	var openDBRequest = window.indexedDB.open("bookmarks");

	openDBRequest.onsuccess = function (dbEvt) {
		console.log("Opened database");
		db = dbEvt.target.result;
		bookmarkList = [];

		db.transaction(["groupIndexes"], "readonly")
			.objectStore("groupIndexes")
			.getAll()
			.onsuccess = function (indexEvt) {
				var indexes = indexEvt.target.result;

				// use a placholder because getting the group info is async
				// and groups could finish loading in a different order
				var cardList = $("#cardList");
				for (var i = 0; i < indexes.length; i++) {
					var placeholder = $("<div>").attr("id", "group-" + i).appendTo(cardList);
					buildGroup(indexes[i], placeholder);
				}

				db.close();
			}
		;
	}

	openDBRequest.onerror = function (e) { console.log(e); }

	openDBRequest.onupgradeneeded = function (e) {
		// the database doesn't exist
		console.log("Creating database");
		db = e.target.result;

		var data = window.localStorage.getItem("bookmarks");
		if (data != null) {
			console.log("Importing data from old version");
			data = JSON.parse(data);
			db.close();
			setList(data);
			window.localStorage.removeItem("bookmarks");
		} else {
			var groupStore = initDB(db);

			// add example bookmarks
			var exBookmarks = db.createObjectStore("Examples");
			exBookmarks.createIndex("name", "name", { unique: false });
			exBookmarks.createIndex("address", "address", { unique: false });
			groupStore.add({ "title": "Examples", "groupIndex": 0 });

			exBookmarks.add({ "name": "Github", "address": "https://github.com/" }, 0);
			exBookmarks.add({ "name": "This project on Github", "address": "https://github.com/NeilBrommer/NewTabPage" }, 1);
			exBookmarks.add({ "name": "Hacker News", "address": "https://news.ycombinator.com/" }, 2);
			exBookmarks.add({ "name": "reddit", "address": "https://www.reddit.com/" }, 3);
		}
	}
}

function buildGroup(groupInfo, placeholder) {
	var groupTransaction = db.transaction([groupInfo.title], "readonly");
	var groupStore = groupTransaction.objectStore(groupInfo.title);
	var groupRequest = groupStore.getAll();
	groupRequest.onsuccess = function (e) {
		var bookmarks = e.target.result;

		bookmarkList[groupInfo.groupIndex] = { "title": groupInfo.title, "bookmarks": bookmarks };

		buildCard(groupInfo.title, bookmarks).appendTo(placeholder);
	}
}

function buildCard(title, itemList) {
	var card = $(document.createElement("div"));
	card.attr({ "id": "group-" + title, "class": "card bookmarkGroup" });

	var cardHead = $(document.createElement("div"));
	cardHead.attr({ "class": "card-header" });
	cardHead.text(title);
	card.append(cardHead);

	var cardList = $(document.createElement("div"));
	cardList.attr({ "class": "list-group list-group-flush" });
	card.append(cardList);

	for (var i = 0; i < itemList.length; i++) {
		var item = itemList[i];
		var link = $(document.createElement("a"));
		link.attr({
			"class": "list-group-item list-group-item-action",
			"href": item.address
		});
		link.text(item.name);

		cardList.append(link);
	}

	return card;
}

function selectGroupChanged(value) {
	if (value == "-")
		$("#createGroup").show();
	else
		$("#createGroup").hide();
}

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
	if (dark)
		$(".btn-light").removeClass("btn-light").addClass("btn-dark");
	else
		$(".btn-dark").removeClass("btn-dark").addClass("btn-light");
}

function getListString() {
	return JSON.stringify(bookmarkList, null, 4);
}

function setList(data) {
	// empty the DB and fill it with the new data
	bookmarkList = data;

	try {
		indexedDB.deleteDatabase("bookmarks");
	} catch (err) {
		// it's OK if the DB doesn't exist
		if (err.name != "NotFoundError") {
			console.error(err);
			return;
		}
	}
	var openDBRequest = window.indexedDB.open("bookmarks", 1);

	openDBRequest.onsuccess = function (e) {
		db.close();
		loadBookmarks();
	}

	openDBRequest.onerror = function (err) { console.error(err); }

	openDBRequest.onupgradeneeded = function (e) {
		console.log("filling db");
		db = e.target.result;

		var groupStore = initDB(db);

		// create the object stores
		for (var i = 0; i < data.length; i++) {
			addGroup(data[i], groupStore, i);
		}
	}
}

function initDB(db) {
	// use a table to keep track of the order of groups
	var groupStore = db.createObjectStore("groupIndexes", { keyPath: "title" });
	groupStore.createIndex("title", "groupName", { unique: true });
	groupStore.createIndex("groupIndex", "groupIndex", { unique: true });
	return groupStore;
}

function addGroup(group, groupStore, index) {
	var objStore = db.createObjectStore(group.title);
	objStore.createIndex("name", "name", { unique: false });
	objStore.createIndex("address", "address", { unique: false });
	groupStore.add({ "title": group.title, "groupIndex": index });

	var bookmarks = group.bookmarks;
	for (var i = 0; i < bookmarks.length; i++) {
		var bkmk = bookmarks[i];
		objStore.add({ "name": bkmk.name, "address": bkmk.address }, i);
	}
}

function verifyBookmarks(bookmarks) {
	if (!Array.isArray(bookmarks))
		return false;

	for (var i = 0; i < bookmarks.length; i++) {
		var item = bookmarks[i];

		if (item == null || typeof item != "object")
			return false;

		if (item.title == null || typeof item.title != "string")
			return false;

		for (var j = 0; j < item.bookmarks.length; j++) {
			var bkmk = item.bookmarks[j];

			if (bkmk == null || typeof bkmk != "object")
				return false;

			if (bkmk.name == null || typeof bkmk.name != "string")
				return false;

			if (bkmk.address == null || typeof bkmk.address != "string")
				return false;
		}
	}

	return true;
}
