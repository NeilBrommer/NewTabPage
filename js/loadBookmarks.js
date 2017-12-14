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
				indexes.sort(function (a, b) {
					return a.groupIndex - b.groupIndex;
				});

				// use a placholder because getting the group info is async
				// and groups could finish loading in a different order
				var cardList = $("#cardList");
				for (var i = 0; i < indexes.length; i++) {
					$("<div>").attr("id", "group-" + indexes[i].groupIndex).appendTo(cardList);
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
		var keyRequest = groupStore.getAllKeys();
		keyRequest.onsuccess = function (evt) {
			var keys = evt.target.result;
			for (var i = 0; i < bookmarks.length; i++) {
				bookmarks[i].key = keys[i];
			}

		bookmarkList[groupInfo.groupIndex] = {
			"title": groupInfo.title,
			"bookmarks": bookmarks
		};

		buildCard(groupInfo.title, bookmarks).appendTo(placeholder);
	}
}
}

function buildCard(title, itemList) {
	var card = $("<div>");
	card.attr({
		"id": "group-" + title.replace(" ", "-"),
		"class": "card"
	});

	var cardHead = $("<div>");
	cardHead.addClass("card-header");
	cardHead.text(title);
	var btnDel = $("<span>")
		.attr("data-group", title)
		.addClass("btnDelGroup far fa-trash-alt float-right mt-1 start-hidden text-danger clickable");
	btnDel.appendTo(cardHead);
	card.append(cardHead);

	var cardList = $("<div>");
	cardList.addClass("list-group list-group-flush bookmarkGroup").attr("data-group", title);
	card.append(cardList);

	for (var i = 0; i < itemList.length; i++) {
		var item = itemList[i];

		var del = $("<span>")
			.attr({"data-group": title, "data-key": item.key})
			.addClass("btnDel far fa-trash-alt float-right mt-1 start-hidden text-danger");
		del.css("cursor: pointer;");

		$("<a>")
			.attr({
				"id": title + "-" + item.key,
				"class": "list-group-item list-group-item-action bookmark",
				"href": item.address,
			})
			.text(item.name)
			.append(del)
			.appendTo(cardList);
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
