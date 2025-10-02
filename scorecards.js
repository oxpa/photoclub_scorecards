function prepareScoreCard() {
  let replies = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Form Responses 1");
  const cats = categories(replies)
  Logger.log(`Current categories are ${cats}`);
  for(let i = 0; i < cats.length; i++) {
    const curCategory = cats[i];
    const scores = createOrFlushSheet(cats[i]);

    for (let j = 0; j < categoryCols.length; j++) {
      const curCol = categoryCols[j]
      const colCats = categoriesInCol(replies, curCol).flat()

      for(let k = 0; k < colCats.length; k++) {
        if (colCats[k] == curCategory) {
          copyImageToScoreCard(replies, scores, colByLetter(curCol) + 1, k+2)
        }
      }
    }
    scores.getDataRange().sort({'column':2,'ascending':true}).sort({'column':1,'ascending':true})
    scores.autoResizeColumns(1,3);
    scores.setRowHeights(1,scores.getLastRow(), 100);

  }

}

const getImageId = (imageURL) => { return (`${imageURL}`.match(/id=(.+)$/)||[])[1] };
const getThumbUrl = (imageUrl) => { return `https://drive.google.com/thumbnail?id=${getImageId(imageUrl)}`};
const getCCGNByRowNum = (sheet, row) => {return sheet.getSheetValues(row, colByLetter('C'),1,1).flat()[0]}

const createOrFlushSheet = (sheetName) => {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName) || SpreadsheetApp.getActiveSpreadsheet().insertSheet(sheetName);
  sheet.clear();
  return sheet; 
}

const colByLetter = (letter) => { return  (letter.toLowerCase().charCodeAt() - 'a'.charCodeAt() + 1 ) }

const categoryCols = ['E', 'H', 'K']

const categoriesInCol = (sheet, col) => { 
  return sheet.getSheetValues(2, colByLetter(col), sheet.getLastRow() - 1, 1);
}
const categories = (sheet) => { 
  let cats = [];
  for (let i = 0; i < categoryCols.length; i++) {
    cats = cats.concat(categoriesInCol(sheet, categoryCols[i]).flat())
  }
  return [... new Set(cats)].filter((v) => v)
}

const copyImageToScoreCard = (replies, scores, curCol, curLine) => {
  const getNumber = (str) => { return (`${str}`.match(/[0-9]+/)||[])[0] };
  const CCGN = `${getNumber(getCCGNByRowNum(replies, curLine))}`.padStart(3, 0); // CCG Number in 'B' column
  const rowData = replies.getSheetValues(curLine, curCol, 1, 2).flat();
  scores.appendRow([`CCG${CCGN}`, rowData[0], `=IMAGE("${getThumbUrl(rowData[1])}")`]);
}


