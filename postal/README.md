# Postal

The Postal extension is being designed to allow developers to more quickly search through and visualize their projects. 
Postal creates a visualization of the users project directory in an Electron window that shows files and subcomponents of those files as nodes and the links between them.

Postal is currently under heavy active development.
Expect new releases often within the following months of release.

Our final goal of the project is to allow users to easily tune the visualization of their project through the use of the grammars.json file.
We also plan to add functionality to display user-defined errors within the visualization window.

![File Map Example](./images/fileMap.png "File Map Example")

## Features
* Generate a visualization of the users project directory
* Generate subcomponents of files based on parsing behaviors defined in the user editable file grammars.json
* Current options include tagged projects (i.e. HTML) and links (hrefs within HTML)

###Notes: 
* This is an early release of Postal (alpha build)
* Several features are not yet complete and we expect buggy behavior 
* (Use at your own risk, and/or frustration)
* We're just a humble group of wannabe college programmers, all feed-back and critisism welcome!

## Requirements
* [NodeJS](https://nodejs.org/en/) (Version 6.10.0 or higher)

## Installation
You may need to run `npm install` in Terminal or PowerShell in the following directories:

* `~/.vscode/extensions/postal-team.postal-$version/`
* `~/.vscode/extensions/postal-team.postal-$version/lib/app`

## Usage
* Launch Postal by running Postal in the command pallette, this will parse the project directory you have open in VSCode. This will also open a UI.
* Double-click a node in the UI to expand a subcomponents of that node, by default this will only work for HTML and PHP files. Specifically divs and body tags.

## Known Issues

* Parsing on large projects (thousands of files) takes a while, but will (probably) finish around 30 seconds

## Release Notes

### 0.1.3
* It now works if you run it more than once!

### 0.1.2
* Fixed installation errors

### 0.1.0
* Initial Release (have fun!)
