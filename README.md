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
1. Go to renameAndCopy.js, make sure baseDirId is correct: this is a directory where ‘yyyy-mm’ directories are created. Open the directory in Drive, the ID is the last part of the URL.

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


