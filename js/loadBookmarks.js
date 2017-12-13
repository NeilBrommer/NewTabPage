$(document).ready(function () {
	loadBookmarks();
});

function loadBookmarks() {
	$("#cardList").empty();
	var openDBRequest = window.indexedDB.open("bookmarks");

	openDBRequest.onsuccess = function (dbEvt) {
		db = dbEvt.target.result;
		dbVersion = db.version;
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
					$("<div>").attr("id", "group-" + i).appendTo(cardList);
				}

				for (let item of indexes) {
					buildGroup(item, $("#group-" + item.groupIndex));
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
			var exBookmarks = db.createObjectStore("Examples", { autoIncrement: true });
			exBookmarks.createIndex("name", "name", { unique: false });
			exBookmarks.createIndex("address", "address", { unique: false });
			groupStore.add({ "title": "Examples", "groupIndex": 0 });

			exBookmarks.add({
				"name": "Github",
				"address": "https://github.com/"
			});
			exBookmarks.add({
				"name": "This project on Github",
				"address": "https://github.com/NeilBrommer/NewTabPage"
			});
			exBookmarks.add({
				"name": "Hacker News",
				"address": "https://news.ycombinator.com/"
			});
			exBookmarks.add({
				"name": "reddit",
				"address": "https://www.reddit.com/"
			});

			$("#aboutModal").modal("show");
		}
	}
}

function buildGroup(groupInfo, placeholder) {
	var groupTransaction = db.transaction([groupInfo.title], "readonly");
	var groupStore = groupTransaction.objectStore(groupInfo.title);
	var groupRequest = groupStore.getAll();
	groupRequest.onsuccess = function (e) {
		var bookmarks = e.target.result;

		bookmarkList[groupInfo.groupIndex] = {
			"title": groupInfo.title,
			"bookmarks": bookmarks
		};

		buildCard(groupInfo.title, bookmarks).appendTo(placeholder);
	}
}

function buildCard(title, itemList) {
	var card = $(document.createElement("div"));
	card.attr({
		"id": "group-" + title,
		"class": "card bookmarkGroup"
	});

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

function addGroup(group, groupStore, db, index) {
	var objStore = db.createObjectStore(group.title, { autoIncrement: true });
	objStore.createIndex("name", "name", { unique: false });
	objStore.createIndex("address", "address", { unique: false });
	groupStore.add({ "title": group.title, "groupIndex": index });

	var bookmarks = group.bookmarks;
	for (var i = 0; i < bookmarks.length; i++) {
		var bkmk = bookmarks[i];
		objStore.add({ "name": bkmk.name, "address": bkmk.address }, i);
	}
}
