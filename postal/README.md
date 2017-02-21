# Postal

The Postal extension is being designed to allow developers to more quickly search through and visualize their projects. 
Postal creates a visualization of the users project directory in an Electron window that shows files and subcomponents of those files as nodes and the links between them.

Postal is currently under heavy active development.
Expect new releases often within the following months of release.

Our final goal of the project is to allow users to easily tune the visualization of their project through the use of the grammars.json file.
We also plan to add functionality to display user-defined errors within the visualization window.

## Features

### Current Features:
* Generate a visualization of the users project directory
* Generate subcomponents of files based on parsing behaviors defined in the user editable file grammars.json
* Current options include tagged projects (i.e. HTML) and links (hrefs within HTML)

Notes: 
* This is an early release of Postal (alpha build)
* Several features are not yet complete and we expect buggy behavior 
* (Use at your own risk, and/or frustration)
* We're just a humble group of wannabe college programmers, all feed-back and critisism welcome!

## Requirements

* browser-window    ^0.4.0 
* child process     ^1.0.2
* cwd               ^0.10.0
* electron          ^1.4.14
* file-system       ^2.2.1
* open              0.0.5
* vis               ^4.17.0

## Installation
You may need to run `npm install` in the following directories provided they exist. 
* `$extensionDirectory/Postal/postal/`
* `$extensionDirectory/Postal/postal/lib/app`

## Usage
* Launch Postal by running Postal in the command pallette, this will parse the project directory you have open in VSCode. This will also open a UI.
* Double-click a node in the UI to expand a subcomponents of that node, by default this will only work for HTML and PHP files. Specifically divs and body tags.

## Known Issues

* Parsing on large projects (thousands of files) takes a while, but will (probably) finish around 30 seconds

## Release Notes

### 0.1.0
* Initial Release (have fun!)







