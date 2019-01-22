'use strict';
// drag and drop using HTML5 
// https://www.html5rocks.com/en/tutorials/dnd/basics/

var dragSrcEl = null;
var movingToWindowId,currentWindowId = null
function handleDragStart(e) {
    // Target (this) element is the source node.
    dragSrcEl = this;

    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.outerHTML);

    this.classList.add('dragElem');
}
function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault(); 
    }
    this.classList.add('over');

    e.dataTransfer.dropEffect = 'move'; 

    return false;
}

function handleDragEnter(e) {
    // this / e.target is the current hover target.
}

function handleDragLeave(e) {
    this.classList.remove('over');  // this / e.target is previous target element.
}

function handleDrop(e) {
    // this/e.target is current target element.
    if (e.stopPropagation) {
        e.stopPropagation(); 
    }
    // Don't do anything if dropping the same column we're dragging.
    if (dragSrcEl != this) {
        movingToWindowId = this.parentNode.parentNode.id;
        currentWindowId = dragSrcEl.parentNode.parentNode.id;

        if(currentWindowId==movingToWindowId){
            this.parentNode.removeChild(dragSrcEl);
        } else{
            dragSrcEl.parentNode.removeChild(dragSrcEl);
        }
        var dropHTML = e.dataTransfer.getData('text/html');
        this.insertAdjacentHTML('beforebegin', dropHTML);
        var dropElem = this.previousSibling;
        addDnDHandlers(dropElem);

    }
    this.classList.remove('over');
    return false;
}

function handleDragEnd(e) {
    // this/e.target is the source node.
    this.classList.remove('over');
    let elements = $("#"+movingToWindowId).find('li');
    elements.map(function(element){
        elements[element].id=element;
        let tabId = elements[element].lastChild.id;
        chrome.tabs.move(Number(tabId),{windowId:Number(movingToWindowId),index:element})
        $('meta').remove();
        // binds listeners to the elements
        BindListenersToElements();
    });
}

function addDnDHandlers(elem) {
    elem.addEventListener('dragstart', handleDragStart, false);
    elem.addEventListener('dragenter', handleDragEnter, false)
    elem.addEventListener('dragover', handleDragOver, false);
    elem.addEventListener('dragleave', handleDragLeave, false);
    elem.addEventListener('drop', handleDrop, false);
    elem.addEventListener('dragend', handleDragEnd, false);

}



