This week I finally got the GUI to launch from the extension pragmatically! this took quite a bit longer than I thought it would (it shold not have been this hard...) I didn't actually need to use the process bridge to get it to launch. Instead I found the electron has an executable buried way, way down in its npm package directory. I can launch that from a new node thread and everything seems to work. It also works on the three OSs we're concerned about. 

The process bridge wasn't a loss as we'll probably need it for communications between the two node processes.