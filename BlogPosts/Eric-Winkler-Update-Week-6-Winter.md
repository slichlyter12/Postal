This week we began the process of of refactoring all of postal. It actually turned into a complete redesign and rebuild from scratch. I mostly headed the redesign while Sam became our Code-driver. As a result there are now clear Interfaces between our Parser, Controller and UI and all of our code is of a much higher quality. I will be doing a design document update to reflect these changes, they are a little too numerous to mention in a blog post. At a high level the extension now works like this:
The user luanches the Postal extension.
Our extension calls our controller which then:
   Finds all files and directories recursively.
   Calls the parser to parse each file. This returns an array of standardized Tokens.
   The controller turns those tokens into our JSON File and calls the UI.
   The UI reads the JSON and launches.
