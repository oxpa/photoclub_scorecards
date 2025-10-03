# Reusable form to submit images for a competition 
The competition form outputs responses into a spreadsheet.

The form also has a google app script attached to it.

The script is executed on form submit, goes through the list of submitted responses.

Sources can be viewed from the sheet: Extensions -> Apps script. It will probably tell you that it’s redirecting incorrectly, so go to https://script.google.com/home , sign in as the competitions account and select the project.


The script renames every uploaded photo and links it into the appropriate directory (YYYY-MM). The directory can be shared with a judge, downloaded and made into a PPT for the competition night.
## Initial setup
1. Create a directory for the form to work
1. Create a form: email, id number, (category-name-image)x3
1. Configure the form to output replies into a spreadsheet
1. In the spreadsheet go to ‘Extensions -> App Script’ and start a project for the sheet
1. Copy contents from this drive into two separate files. One is used on submission, another for scorecard creation.
1. In the menu on the left go to “triggers”, create a trigger for “testRenameFiles” to run on form submission.
1. Go to settings of the script, enable appscript.json in code editor
1. Paste the json to allow drive requests (needed to move files around)
1. Go to `renameAndCopy.js`, make sure baseDirId is correct: this is a directory where ‘yyyy-mm’ directories are created. Open the directory in Drive, the ID is the last part of the URL.

## Before the competition night: 
1. make sure there are no problems with the per submit script. Check that all the data looks consistent. Check all B&W images are B&W and colour are colour.
1. Go to apps script and execute the “prepare scorecard” function. It will create additional sheets that can be printed for reference and used by a judge to score photos.
1. Rename newly created sheets so that scores wouldn’t be mangled accidentally
1. Download per category directories of photos, create a presentation, add photos into it: Insert -> Media -> Photo Album
1. Make sure in the scoring spreadsheet all members are added into the reference and scoring sheets

## On the night:
1. Bring printed scorecards to help arrange prints in proper order (in the 1. presentation order).
1. The judge will use the club laptop to score images. So bring your own to show the presentation. If you don’t have a laptop - print scorecards for the judge and use the laptop to project images.
1. After scoring - copy scores into a separate competition scoring sheet stored in a specific year folder

## Monthly actions:
1. Change form header (The month), the deadline and the topic
1. Remove all responses from the form
1. Remove all response rows from the spreadsheet (delete rows, not just contents)
1. Send out the same link

## Yearly maintenance:
1. Create a directory for all uploaded images in a specific year folder. 
1. Move all images from 3 upload directories there. 
1. Move all monthly directories into a year folder as well. Monthly folders use shortcuts so don’t store images themselves. They will still work after all the moves.
1. Go to https://script.google.com/home , note when the “Rename files in sheets” project was last modified.
1. Copy the sheet with all the scores into a year folder
1. Go to https://script.google.com/home , and rename newly created “Rename files in sheets” project to avoid confusion in future
1. Copy overall scoring Spreadsheet from the old to the new year.
1. In the copy drop all monthly scores
1. Add new members into the scoring sheet configuration.
1. Look through formulas, make sure none are mangled


# Photographer of the year script
The scripts processes form submissions (renames and moves files), build scorecards and final scoring for all photos.

## Form
The form needs email, CCG number, (Image Name, Image upload)x6. Email is added to the form by enabling "collecting emails" via user input.

The order of fields is important, the number of rounds should be 6 or otherwise you have to edit code.

## Spreadsheet setup
Spreadsheet should have one sheet for the form, and one sheet for setup. The setup sheet has the first row dedicated to a header and then should have Name-Grade-CCG Number in columns A, B and C. And Column F should have judges names.

## Code setup
Code needs access to drive and spreadsheets. So the manifest from this repo should be applied to `poty.js` project too.

`renameFiles` can be scheduled to be called on every form submit but can also be run once when it's time to prepare scorecards.

## How it all works
### In preparation for competition
Setup the form, make sure answers are collected properly

### Before the night
1. Just in case - copy the form, uploads and the spreadsheet into a separate directory as a backup
1. Run `renameFiles`, if it wasn't scheduled for per-submit execution. The function renames them in-place. The upload folder can be shared with judges for review.
1. Run `prepareScoreCard`. It will create per-round scorecards as well as per-judge overall scorecards. Per-round cards are helpful for arranging printed copies. Per-judge cards are used by judges to actually score photos.
1. Prepare per-round or overall powerpoint presentation using the "insert album" trick.

### On the night
1. bring printed per-round scorecards to help arrange photos properly
2. bring laptops for each judge. Just in case - also bring per-judge copy of the scorecard.
3. wait through the scoring process
4. make a backup of the sheet, just in case
5. look through the scores. Make sure there are no typos, stray symbols, etc.
6. run `calculateScores`, pray for no typos:), look through the resulting score table. Make sure there are no gaps, scores over the possible range and so on.
7. Announce the winner.