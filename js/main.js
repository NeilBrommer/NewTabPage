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
			combo.append($("<option></option>").attr({ "value": i }).text(data[i].title));
		}


		// TODO complete adding bookmarks
		window.alert("Adding bookmarks is still incomplete");
		$("#newBookmarkModal").modal("hide");
	});

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
		window.alert("Failed to import");
		return;
	}

	setList(newData);

	$(".bookmarkGroup").remove();
	loadBookmarks();
	$("#importExportModal").modal("hide");
}

function loadBookmarks() {
	var groups = getList();

	if (groups != null) {
		for (var i = 0; i < groups.length; i++) {
			var item = groups[i];
			buildCard(item.title, item.bookmarks);
		}
	} else {
		$("#aboutModal").modal("show");
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

	$("#cardList").append(card);
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

function getList() {
	return $.parseJSON(window.localStorage.getItem("bookmarks"));
}

function getListString() {
	return window.localStorage.getItem("bookmarks");
}

function setList(list) {
	if (typeof list == "string") {
		window.localStorage.setItem("bookmarks", list);
	} else {
		var stringified = JSON.stringify(list, null, 4);
		window.localStorage.setItem("bookmarks", stringified);
	}
}
