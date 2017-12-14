$(document).ready(function () {
	$("#btnEdit").click(toggleEditing);
});

function toggleEditing (e) {
	var btnEdit = $("#btnEdit");
	if (btnEdit.hasClass("btn-warning")) {
		btnEdit.removeClass("btn-warning");
		$("#btnImport").prop("disabled", false);
		$("#btnAdd").prop("disabled", false);

		if ($("#btnAbout").hasClass("btn-light")) {
			btnEdit.addClass("btn-light");
		} else {
			btnEdit.addClass("btn-dark");
		}

		$(".btnDel").hide(200);
		$(".btnDelGroup").hide(200);
		$(".bookmark").off("click", disableLink);
		$(".btnDel").off("click", deleteBookmark);
		$(".btnDelGroup").off("click", deleteGroup);
	} else {
		btnEdit.removeClass("btn-light btn-dark").addClass("btn-warning");
		$("#btnImport").prop("disabled", true);
		$("#btnAdd").prop("disabled", true);

		$(".btnDel").show(200);
		$(".btnDelGroup").show(200);
		$(".bookmark").click(disableLink);
		$(".btnDel").click(deleteBookmark);
		$(".btnDelGroup").click(deleteGroup);
	}
}

function deleteBookmark(e) {
	var item = $(this);
	var group = item.data("group");
	var key =  item.data("key");

	var openDBRequest = window.indexedDB.open("bookmarks");

	openDBRequest.onsuccess = function (e) {
		var db = e.target.result;
		var deleteRequest = db.transaction(group, "readwrite").objectStore(group).delete(key);
		deleteRequest.onsuccess = function (evt) {
			$("#" + group + "-" + key).remove();
		}
	}

	openDBRequest.onerror = function (evt) {
		console.log("Error", evt);
	}
}

function deleteGroup(e) {
	var group = $(this); // the delete group button
	var groupName = group.data("group");

	var openDBRequest = window.indexedDB.open("bookmarks", dbVersion + 1);

	openDBRequest.onupgradeneeded = function (e) {
		var db = e.target.result;
		dbVersion++;

		var deleteRequest = db.deleteObjectStore(groupName);
	}

	openDBRequest.onsuccess = function (e) {
		var db = e.target.result;

		var indexStore = db.transaction("groupIndexes", "readwrite").objectStore("groupIndexes");
		indexStore.delete(groupName).onsuccess = function (evt) {
			$("#group-" + groupName.replace(" ", "-")).parent().remove();
		};
	}

	openDBRequest.onerror = function (e) {
		console.error(e);
	}
}

function disableLink(e) {
	e.preventDefault();
}
