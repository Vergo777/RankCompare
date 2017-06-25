/**
 * Created by Varun on 2017/06/25.
 */

// create XML file on the fly using JS - https://stackoverflow.com/a/27284736
export const createAndDownloadXMLFile = function(xml) {
    uri = 'data:Application/octet-stream,' + encodeURIComponent(xml);
    link = document.createElement("a");
    link.download = "scores.xml";
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    // Cleanup the DOM
    document.body.removeChild(link);
    delete link;
};