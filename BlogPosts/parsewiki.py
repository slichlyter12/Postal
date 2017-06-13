import sys

termArray = ['Fall','Winter','Spring']
nameArray = ['Cramer-Smith','Sam-Lichlyter','Zach-Schneider','Eric-Winkler']
weekArray = [1,2,3,4,5,6,7,8,9,10]
weekArray = map(str, weekArray) #literally too lazy to type out strings

outputfile = open('BlogPosts.txt', 'a')

for termIndex, term in enumerate(termArray, start=0):
    for weekIndex, week in enumerate(weekArray, start=0):
        for nameIndex, name in enumerate(nameArray, start=0):
            fileString = "%s-Update-Week-%s-%s.md" % (nameArray[nameIndex], weekArray[weekIndex], termArray[termIndex])
            try:
                inputfile = open(fileString, 'r')
                
                outputfile.write("\\subsubsection{Week %s: %s}" % (weekArray[weekIndex], nameArray[nameIndex].replace('-', ' ')))
                outputfile.write('\r\n')
                inputtext = inputfile.read().replace('# ', '').replace('#', '').replace('*', '').replace('\n', '\r\n')
                outputfile.write(inputtext)
                outputfile.write(' \\\\ \r\n ')
                
                inputfile.close()
            except IOError:
                print("File doesn't exist")
outputfile.close()




