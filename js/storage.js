'use strict';
function saveUrlsLocally(windowId) {
    var nameOfSesion = new Date().toJSON().slice(0,10).replace(/-/g,'/');
    // prompt("Please name your session", "My session");
    if (nameOfSesion !== null) {
        let saveIcon = document.getElementById(windowId).getElementsByClassName('savelocally');
        saveIcon[0].setAttribute('src', 'img/loading.gif');
        var selectedTabs = getSelectedTabs(true);
        chrome.windows.get(Number(windowId), { populate: true }, function (tab) {
            const uuid = guid();
            let setObj = [];
            try {
                setObj[uuid] = tab.tabs;
                if (selectedTabs[1].length > 0) {
                    setObj[uuid].forEach(function (tab) {
                        if (!selectedTabs[1].includes(tab.id.toString())) {
                            setObj[uuid] = remove(setObj[uuid], tab);
                        }
                    })
                }
            } catch (err) {
                throw new Error(err);
            } finally {
                var arrayToObject = Object.assign({}, setObj);
                chrome.storage.local.set(arrayToObject, function () {
                    chrome.storage.local.get(["sessionNamePairs"], function (sessions) {
                        if (Object.entries(sessions).length !== 0) {
                            let currentSession = sessions.sessionNamePairs;
                            currentSession[uuid] = nameOfSesion;
                            chrome.storage.local.set({ "sessionNamePairs": currentSession });
                        } else {
                            chrome.storage.local.set({ "sessionNamePairs": { [uuid]: nameOfSesion } });
                        }
                        setTimeout(function () {
                            saveIcon[0].setAttribute('src', 'img/save.png')
                        }, 800);

                    })
                });
            }
        })
    }
}
// remove element from the array
function remove(array, element) {
    return array.filter(e => e !== element);
}
// generate random uuid
function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

// generates new window for saved links
function generateSavedListWindow(allKeys) {
    let numberOfKeys = allKeys.filter(k => k !== 'darkModeIs' && k !== 'sessionNamePairs').length;
    let savedList = document.getElementById('cbListSaved');
    savedList.style.display = '';
    try {
        if (allKeys.length > 2) {
            // empty DOM (this is equal to innerHTML = '', however, faster)
            while (savedList.firstChild) savedList.removeChild(savedList.firstChild);
            let count = 0;
            allKeys.map(function (key) {
                if (key !== 'darkModeIs' && key !== 'sessionNamePairs') {
                    chrome.storage.local.get(key, function (tabsObj) {
                        count ++;
                        if (tabsObj[key].length > 0) {
                            let color = getRandomColor();

                            let sessionHeaderDiv = document.createElement('div');
                            let actionSetDiv = document.createElement('div');
                            let sessionNameDiv = document.createElement('div');

                            let trashLocallyImg = document.createElement('img');
                            let sessionName = document.createElement('label');
                            let selectAll = document.createElement('img');

                            sessionName.style.display = 'inline-block';
                            sessionName.setAttribute('contenteditable', 'true');
                            sessionName.setAttribute('spellcheck', 'false');
                            sessionName.style.cursor = 'auto';
                            sessionName.style.fontWeight = 'bold';
                            sessionName.addEventListener('keydown', function (e) {
                                if (e.keyCode === 13) {
                                    e.preventDefault();
                                    let newNameOfSesion = e.srcElement.innerText;
                                    let windowId = e.srcElement.parentElement.parentElement.parentElement.id;
                                    chrome.storage.local.get(["sessionNamePairs"], function (sessions) {
                                        let currentSession = sessions.sessionNamePairs;
                                        currentSession[windowId] = newNameOfSesion;
                                        chrome.storage.local.set({ "sessionNamePairs": currentSession });
                                        e.srcElement.blur();
                                    })
                                }
                            })
                            chrome.storage.local.get(["sessionNamePairs"], function (sessions) {
                                sessionName.innerText = sessions.sessionNamePairs[key];
                            });

                            trashLocallyImg.setAttribute('src', "img/trash.png");
                            trashLocallyImg.style.width = "16px";
                            trashLocallyImg.style.height = "16px";
                            trashLocallyImg.className = "trashlocally";
                            trashLocallyImg.title = "Remove from the session"
                            trashLocallyImg.addEventListener('click', function (e) {
                                var lists = getSelectedTabs();
                                if (lists[0].length > 0) {
                                    // some tabs selected so remove these ones 
                                    var windowId = e.target.parentElement.parentElement.parentElement.id;
                                    removeSelectedTabLocally(lists[1], windowId);
                                } else {
                                    var result = confirm("This will remove entire window, proceed?");
                                    if (result) {
                                        removeWindow(e.target.parentElement.parentElement.parentElement.id);
                                    }
                                }

                            });
                            selectAll.setAttribute('src', "img/checkbox_outline.png");
                            selectAll.style.width = "20px";
                            selectAll.style.height = "20px";
                            selectAll.className = "selectAll";
                            selectAll.style.marginBottom = "-3px";
                            selectAll.style.marginRight = "0.3em";
                            selectAll.title = "Select all tabs in this window";
                            selectAll.addEventListener('click', function (e) {
                                let checkboxImg = 'img/checkbox.png';
                                if (e.target.getAttribute('src') === 'img/checkbox.png') {
                                  checkboxImg = 'img/checkbox_outline.png';
                                }
                                e.target.setAttribute('src', checkboxImg);
                                let savedListDOM = e.target.parentNode.parentNode.parentNode.lastChild;
                                let lp = savedListDOM.childNodes;
                                for (var i = 0; i < lp.length; i++) {
                                    lp[i].firstChild.click();
                                }
                            });

                            let list = document.createElement("div");
                            list.classList.add("listMain")
                            list.id = key;
                            sessionHeaderDiv.style.backgroundColor = "white";
                            sessionHeaderDiv.classList.add('session-header')
                            sessionHeaderDiv.setAttribute('style', 'display: grid; grid-template-columns: 2fr 2fr;')
                            actionSetDiv.style.textAlign = 'right';
                            sessionNameDiv.style.marginLeft = '0.4em';

                            actionSetDiv.appendChild(selectAll);
                            actionSetDiv.appendChild(trashLocallyImg);
                            sessionNameDiv.appendChild(sessionName);
                            sessionHeaderDiv.appendChild(sessionNameDiv);
                            sessionHeaderDiv.appendChild(actionSetDiv);
                            list.appendChild(sessionHeaderDiv);
                            cbListSaved.appendChild(list);

                            let ul = document.createElement("ul");
                            ul.setAttribute('id', "list");
                            list.setAttribute('style', 'border-left: 8px solid ' + color + '!important;')
                            list.appendChild(ul);

                            for (const key of Object.keys(tabsObj)) {
                                tabsObj[key].forEach(tab => {
                                    let li = document.createElement("li");
                                    let urlText = document.createElement("span");
                                    let icon = document.createElement("img");
                                    let close = document.createElement("input");
                                    let checkbox = document.createElement("input");
                                    li.setAttribute("draggable", "true");
                                    li.setAttribute("class", "listItem");
                                    close.setAttribute('class', 'trashLocalTab');
                                    close.value = 'x';
                                    close.type = 'button';
                                    close.style.fontWeight = 'bold';
                                    close.id = tab.id;
                                    li.id = tab.index;
                                    close.addEventListener('click', function (event) {
                                        removeTabLocally(event);
                                    })
                                    if (tab.favIconUrl !== undefined) {
                                        icon.setAttribute("src", tab.favIconUrl);
                                    } else {
                                        icon.setAttribute("src", "img/default_favicon.png");
                                    }
                                    icon.setAttribute("width", "16");
                                    icon.setAttribute("height", "16");
                                    icon.setAttribute("class", "urlIcon")
                                    urlText.setAttribute("class", "saveditem");
                                    urlText.textContent = tab.title.substring(0, 33);
                                    urlText.title = tab.url;
                                    urlText.addEventListener('click', function (e) {
                                        openNewTab(e.target.previousSibling.previousSibling.value);
                                    });
                                    checkbox.setAttribute("type", "checkbox");
                                    checkbox.setAttribute("name", "urlcb");
                                    checkbox.setAttribute("class", "cb");
                                    checkbox.value = tab.url;
                                    li.appendChild(checkbox);
                                    li.appendChild(icon);
                                    li.appendChild(urlText);
                                    li.appendChild(close);
                                    ul.appendChild(li);
                                });
                            }
                        }
                        // check if dark mode is on
                        chrome.storage.local.get(['darkModeIs'], function (result) {
                            switchToDarkMode(result.darkModeIs);
                        })

                        if (count === numberOfKeys) {
                            if (savedList.children.length === 0) {
                                savedList.innerHTML = Sanitizer.escapeHTML`<center><p style="background-color:#e74132; color:white; font-wieght:600;">such a lonely session page, save some tabs</p></center>`;
                            }
                        }
                    })
                } 
            })

        } else {
            savedList.innerHTML = Sanitizer.escapeHTML`<center><p style="background-color:#e74132; color:white; font-wieght:600;">such a lonely session page, save some tabs</p></center>`;
        }
    } catch (error) {
        throw new Error(error);
    } 
}
function removeTabLocally(event) {
    let itemClicked = event.target.parentElement.getAttribute("id");
    let windowClicked = event.target.parentElement.parentElement.parentElement.getAttribute("id")
    chrome.storage.local.get(windowClicked, function (resultObj) {
        let resultTabs = resultObj[windowClicked];
        for (var i = 0; i < resultTabs.length; i++) {
            if (resultTabs[i].index == itemClicked) {
                resultTabs.splice(i, 1);
                break;
            }
        }
        var freshWindow = resultTabs;
        chrome.storage.local.remove(windowClicked);
        if (freshWindow.length === 0) {
            document.getElementById(windowClicked).parentNode.removeChild(windowDOM);
        } else {
            let saveObj = {};
            saveObj[windowClicked] = freshWindow;
            chrome.storage.local.set(saveObj);
        }
    });
    let windowDOM = document.getElementById(windowClicked);
    let tabDOM = event.target.parentElement;
    windowDOM.lastChild.removeChild(tabDOM);
}

// remove selected tabs from Session page
function removeSelectedTabLocally(listOfTabIds, windowId) {
    var saveObj = {};
    chrome.storage.local.get(windowId, function (resultObj) {
        let resultTabs = resultObj[windowId];
        listOfTabIds.forEach(function (tabId) {
            for (var i = 0; i < resultTabs.length; i++) {
                if (resultTabs[i].id == tabId) {
                    resultTabs.splice(i, 1);
                }
            }
            if (resultTabs.length === 0) {
                document.getElementById(windowId).remove();
            } else {
                document.getElementById(windowId).querySelectorAll('.trashLocalTab')
                    .forEach(el => {
                        if (el.id === tabId) el.parentElement.remove()
                    })
                saveObj[windowId] = resultTabs;
            }
        })
    });
    chrome.storage.local.remove(windowId, function () {
        chrome.storage.local.set(saveObj);
    });

}

// remove a session
function removeWindow(key) {
    chrome.storage.local.remove(key, function () {
        $("#" + key).remove();
        chrome.storage.local.get(["sessionNamePairs"], function (sessions) {
                let currentSession = sessions.sessionNamePairs;
                delete currentSession[key];
                chrome.storage.local.set({ "sessionNamePairs": currentSession });
        })
    });
}
