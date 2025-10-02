const SheetName = "Form Responses 1";
const baseDirId = "1Ao6TFeqg-MR5d10XaYM4_cw85a9cBh-q4amHX0lWNklmXvkWtaIkD_FdrDrOz-KlL2VEhibH";

/**
 * This function is called for each submitted image from 'testRenameFiles'
 * It renames the file to 'newName' (see below) and then calls 'moveFiles' to
 * create a shortcut/symlink into destination folder.
 * 
 * @param {String} CCGN - string with CCG membership number
 * @param {String} imgCat - category of an image (as submitted in the form)
 * @param {String} imgTitle - human friendly image name
 * @param {String} imgUrl - unfriendly image name (to get ID from it)
 * @return {null}
 */
const renameAndMoveImage = (CCGN, imgCat, imgTitle, imgUrl) => {
  const getImageId = (imageURL) => { return (`${imageURL}`.match(/id=(.+)$/)||[])[1] };
  if (!imgUrl || !CCGN) { return };
  const imgId = getImageId(imgUrl);
  if (!imgId) { return };
  const file = DriveApp.getFileById(imgId);
  if (!file) { return };
  const oldName = file.getName();
  const extension = oldName.match(/\.([^.]+)$/)[1];
  const newName = `CCG${CCGN}_${imgTitle}_${imgCat}.${extension}`;
  if (oldName != newName) {
    Logger.log(`Renaming file ${imgId} from "${oldName}" to "${newName}"`);
    file.setName(newName);
  }
  moveFile(file, imgCat);
  
}

/**
 * The function goes through submitted responses, normalizes CCG number then calls
 * a function to rename and link submitted images into appropriate directories
 */

function testRenameFiles() {
  const getNumber = (str) => { return (`${str}`.match(/[0-9]+/)||[])[0] };
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SheetName);
  if (!sheet) {
    throw new Error(`The sheet '${SheetName}' does not exist. Please check the name.`);
  }
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    const CCGN = `${getNumber(data[i][2])}`.padStart(3, 0); // CCG Number in 'C' column
    for (let j = 4; j <= 13; j += 3) {
      // col e    - col f - col g
      // category - name  - link
      renameAndMoveImage(CCGN, data[i][j] || "Projected", data[i][j + 1], data[i][j + 2])
    }

  }
}

/**
 * @param {DriveApp.Folder} - parent directory where child exists or created
 * @param {String} - name of the child directory
 * @return {DriveApp.Folder} - created or existing directory
 */

const testOrCreate = (parent, childName) => {
  let iter = parent.getFoldersByName(childName);
  if (!iter.hasNext()) {
    Logger.log(`No directory for ${childName}, creating it.`);
    return parent.createFolder(childName)
  } else {
    return iter.next()
  }
}

/**
 * Doesn't really move files but creates shortcuts/symlinks for them
 * Uses "baseDir" to create per month folders, per category folders
 * and then move images into there.
 * baseDir -> YYYY.MM -> category -> image
 * The image itself stays in the upload directory
 * 
 * @param {DriveApp.File} - image file to move
 * @param {String} - image category as seen in the form
 * @return {null}
 */

function moveFile(img, imgCat ) {
  // baseDirId defined at the top of the file
  const baseDir = DriveApp.getFolderById(baseDirId);
  if (!baseDir) {
    throw new Error("Preconfigured directory for file results doesn't exist. Please, check.")
  }
  const curDate = new Date();
  const dateDirName = `${curDate.getFullYear()}-${curDate.getMonth()+1}`;
  let dateDir = testOrCreate(baseDir, dateDirName);
  let catDir = testOrCreate(dateDir, imgCat);
  let files = catDir.getFiles();
  const imgId = img.getId();
  while(files.hasNext()) {
    let file = files.next();
    if (file.getTargetId() === imgId) {
      Logger.log(`Shortcut for ${img.getName()} exists in "${dateDirName}/${imgCat}"`);
      return;
    }
  }
  Logger.log(`Creating shortcut for ${img.getName()} in "${dateDirName}/${imgCat}"`);
  DriveApp.createShortcut(img.getId()).moveTo(catDir);
}

