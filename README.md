# Insurance Code Lookup Microservice #

## Summary ##
A microservice for looking up codes from a PDF with information on insurance class codes, such as [this one](http://www.fastcomp.com/downloads/fastcompclasscodecrossreferenceguide.pdf). It uses the PDF2JSON library to get text and formatting data from the PDF.

To run:
```
npm install
npm start # (default port: 3000)
```

The service focuses on fetching rows by NCCI, NAICS, and CA WCIRB codes so use the ```/ncci```, ```/naics```, ```/ca_wc``` along with the value of that field to fetch the corresponding rows.

For example, use ```/ncci/1748``` to get rows with an NCCI code of 1748.

The output is also specified within the RAML file.

## Problems regarding PDF parsing ##
The PDF2JSON library reads text left-to-right, bottom-to-top and puts read text blocks into an array per page. Since it's a flat array, there's no information on how the columns on the left (ISO Description, ISO CGL) correspond to those on the right (NCCI, NAICS, ...). In order to relate these two column sections, it involves checking if both column sections are within the horizontal lines that surround the table row. Unfortunaely, since the PDF2JSON doesn't seem to output the most accurate positional data, relating these column sections isn't currently working and would likely require more tweaking of the parsing parameters in the config folder.

## Concerns ##
Since I'd been running short on time, there were some major parts of the service that I couldn't get to. This is mainly the use of some RDBMS to allow for faster code lookups and joining the general and specific codes together. This also would have included some module to take in new PDFs and update the models with them. Currently, the application has all the rows in memory and searches through them in linear time and on the main thread of execution, which could hurt performance and responsiveness.

A type enforcement system like TypeScript would have helped with working on large data objects and across multiple levels of those objects.