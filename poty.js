const SheetName = "Form Responses 1";
const isTest=false;
const totalRounds = 6;
const PAD = 2;

function calculateScores() {
  let replies = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SheetName);
  let setup = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("setup");
  const judges = setup.getRange('F1').getDataRegion().getValues().flat().slice(1);
  
  let scorecards = [];

  for (const j of judges) {
    // there should be very little data in these tables
    // it's faster to just get it in here rather than go into spreadsheetsapp
    scorecards.push(SpreadsheetApp.getActiveSpreadsheet().getSheetByName(`${j} Scorecards`).getDataRange().getValues());
  }
  
  let submittedData = replies.getDataRange().getValues();
  submittedData = submittedData.slice(1)
  submittedData.sort((r1,r2) => 0 - ( - getNumber(r1[colByLetter('C')])) + ( - getNumber(r2[colByLetter('C')]) ))
  
  const competitors = submittedData.map((r) => `${parseInt(getNumber(r[colByLetter('C')]))}`.padStart(PAD, 0))
  Logger.log(competitors)
  const totalRounds = 6;
  
  const scores = createOrFlushSheet("Total Scores")
  scores.appendRow(["Name", "Comp ID", "Grade", "Rounds", "", "", "", "", "", "Total5", "Total6"])
  scores.appendRow(["", "", "", "A", "B", "C", "D", "E", "F", "", ""])
  scores.getRange(1,1,2,3).mergeVertically() 
  scores.getRange(1,4,1,6).mergeAcross()
  scores.getRange(1,10,2,2).mergeVertically()
  makeItHeader([scores])

  for(const c of competitors) {
    let c_setup = findSetupByCCG(setup, c)
    const name = c_setup[0]
    const grade = c_setup[1]
    const CCGN = c_setup[2]
    let my_assigned_scores = [];
    let my_accum = []
    my_accum.length = totalRounds;
    my_accum.fill(0)
    for(const s of scorecards) {
      my_assigned_scores.push(s.filter((r)=>r[1] == c?true:false).map((r) => r[4]))
    }
    const my_calculated_scores = my_assigned_scores.reduce((accum, row) => accum.map((v, i) =>v+row[i]) , my_accum)
    const my_total6 = my_calculated_scores.reduce((a,s) => a+s, 0)
    const my_min = Math.min(...my_calculated_scores)
    const my_total5 = my_total6 - my_min

    scores.appendRow([name, CCGN, grade, ...my_calculated_scores, my_total5, my_total6])
  }
scores.getRange(3,1, scores.getLastRow()-2 ,5+totalRounds ).sort({'column':10,'ascending':false}).sort({'column':3,'ascending':true})
}

/**  
  run this on new competitions entries
  This renames files "properly" keeping them in place
*/
function renameFiles() {
  const getNumber = (str) => { return (`${str}`.match(/[0-9]+/)||[])[0] };
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SheetName);
  if (!sheet) {
    throw new Error(`The sheet '${SheetName}' does not exist. Please check the name.`);
  }
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    const CCGN = `${getNumber(data[i][colByLetter('C')])}`.padStart(PAD, 0); // CCG Number in 'C' column
    for (let j = colByLetter('D'); j <= colByLetter('N'); j += 2) { 
      // col d    - col e 
      // name  - link
      let round = String.fromCharCode('A'.charCodeAt() + (( j - colByLetter('D')  )/2))
      renameImage(CCGN, round, (data[i][j]).trim(), data[i][j+1])
    }
  }
}

/**
 * run this after you have all submissions
 * This looks for column F in the "setup" sheet, grabs a list of judges and builds
 * scorecards for each judge and round.
 * Scorecard sheets should be then renamed removing the "REMOVETHIS_" part to avoid
 * accidental mangling of scores.
 */
function prepareScoreCard() {
  let replies = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SheetName);
  let setup = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("setup");
  const judges = setup.getRange('F1').getDataRegion().getValues().flat().slice(1);
  let scorecards = [];

  for (const j of judges) {
    const prefix = isTest?"":"REMOVETHIS_"
    scorecards.push(createOrFlushSheet(`${prefix}${j} Scorecards`));
  }
  
  let submittedData = replies.getDataRange().getValues();
  submittedData = submittedData.slice(1)
  submittedData.sort((r1,r2) => 0 - ( - getNumber(r1[colByLetter('C')])) + ( - getNumber(r2[colByLetter('C')]) ))
  

  
  for ( let round = 0; round < totalRounds; round += 1) {
    roundName = String.fromCharCode('A'.charCodeAt() +  round )

    const roundPrintSheet = createOrFlushSheet(`Round ${roundName} print`) 
    const roundSheets = [...scorecards, roundPrintSheet] 
    appendRow(roundSheets, [`Round ${roundName}`]);
    mergeLastRowCells(roundSheets, 5);
    appendEmptyRow(roundSheets); // can't append an empty row. Can only insert it between non-empty ones
    appendRow(roundSheets, [`Round`, `CCG Number`, `Image name`, `Image preview`, `Assigned score`]);
    
    makeItHeader(roundSheets);
    
    for (let entry = 0; entry < submittedData.length; entry += 1) { 
      const CCGN = `${getNumber(submittedData[entry][colByLetter('C')])}`.padStart(PAD, 0);
      const imgName = submittedData[entry][colByLetter('D') + round * 2]
      const imgThumb = `=IMAGE("${getThumbUrl(submittedData[entry][colByLetter('D') + round * 2 + 1])}")`
      appendRow(roundSheets, [round, CCGN, imgName, imgThumb].concat(isTest?[(entry + 1)*(round + 1)]:[]))
    }

    drawBorders(roundSheets);
    finalTouches([roundPrintSheet]);
  }

  finalTouches(scorecards);
}
/*********************************************
 *
 *  all sorts of helper functions below here 
 *
 *********************************************/

const findSetupByCCG = (sheet, c) => {
  const rows = sheet.getRange('A1').getDataRegion().getValues()
  Logger.log(c)
  for(r of rows) {
    if ( r[2] == `CCG${c}` ) {
      return r
    }
  }
}

const appendRow = (tables, row) => {
  for (const t of tables) {
    t.appendRow(row)
  }
}

const mergeLastRowCells = (tables, numOfCells) => {
    for (const t of tables) {
      const lastRow = t.getLastRow();
      const r = t.getRange(lastRow,1,1,numOfCells)
      r.merge();
    }
}

const makeItHeader = (tables) => { 
  for (const t of tables) {
    const lastRow = t.getLastRow();
    const r1 = t.getRange(lastRow,1,1,1)
    const r = r1.getDataRegion()
    r.setFontWeight('bold')
    r.setBackground('#c6efce')

  }
}
const drawBorders = (tables) => {
    for(const t of tables) {
      const lastRow = t.getLastRow();
      const r = t.getRange(lastRow,1,1,1).getDataRegion()
      r.setBorder(true,true,true,true,true,true)
    }
      
}
const finalTouches = (tables) => {
  for(const t of tables){
    t.autoResizeColumns(1,4);
    t.setRowHeights(1, t.getLastRow(), 100);
    t.hideColumns(1,2);
  }
}

const appendEmptyRow = (tables) => {for (const t of tables) {t.insertRows(t.getLastRow())}}
const getNumber = (str) => {return (`${str}`.match(/[0-9]+/)||[])[0] };
const colByLetter = (letter) => { return  (letter.toLowerCase().charCodeAt() - 'a'.charCodeAt() ) }
const getImageId = (imageURL) => { return (`${imageURL}`.match(/id=(.+)$/)||[])[1] };
const getThumbUrl = (imageUrl) => { return `https://drive.google.com/thumbnail?id=${getImageId(imageUrl)}`};
const getCCGNByRowNum = (sheet, row) => {return sheet.getSheetValues(row, colByLetter('C')+1,1,1).flat()[0]}

const createOrFlushSheet = (sheetName) => {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName) || SpreadsheetApp.getActiveSpreadsheet().insertSheet(sheetName);
  sheet.clear();
  sheet.showColumns(1, sheet.getMaxColumns());
  return sheet; 
}

/**
 * @param {String} CCGN - string with CCG membership number
 * @param {String} imgCat - category of an image (as submitted in the form)
 * @param {String} imgTitle - human friendly image name
 * @param {String} imgUrl - unfriendly image name (to get ID from it)
 * @return {null}
 */
const renameImage = (CCGN, round, imgTitle, imgUrl) => {
  const getImageId = (imageURL) => { return (`${imageURL}`.match(/id=(.+)$/)||[])[1] };
  if (!imgUrl || !CCGN) { Logger.log(`no CCGN or imgUrl, returning`); return };
  const imgId = getImageId(imgUrl);
  if (!imgId) { Logger.log(`There is imgUrl but can't get imgId out of it`); return };
  const file = DriveApp.getFileById(imgId);
  if (!file) { return };
  const oldName = file.getName();
  const extension = oldName.match(/\.([^.]+)$/)[1];
  const newName = `CCG${CCGN}_${imgTitle}_round${round}.${extension}`;
  if (oldName != newName) {
    Logger.log(`Renaming file ${imgId} from "${oldName}" to "${newName}"`);
    file.setName(newName);
  }
  
}


